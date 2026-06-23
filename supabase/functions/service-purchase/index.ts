import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type RecordValue = Record<string, unknown>;
const origins = (Deno.env.get("APP_ALLOWED_ORIGINS") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
const cors = (req: Request) => ({ "Access-Control-Allow-Origin": origins.includes(req.headers.get("origin") ?? "") ? req.headers.get("origin")! : origins[0] ?? "null", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" });
const reply = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
const pathValue = (value: unknown, path: string): unknown => path.split(".").filter(Boolean).reduce<unknown>((current, key) => current && typeof current === "object" ? (current as RecordValue)[key] : undefined, value);
const renderText = (template: string, context: RecordValue) => template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, path: string) => { const value = pathValue(context, path); if (value === undefined || value === null) throw new Error(`Missing template value: ${path}`); return String(value); });
const render = (value: unknown, context: RecordValue): unknown => typeof value === "string" ? renderText(value, context) : Array.isArray(value) ? value.map((item) => render(item, context)) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value as RecordValue).map(([key, item]) => [key, render(item, context)])) : value;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const authHeader = req.headers.get("authorization") ?? "";
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const service = createClient(url, serviceKey);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return reply(req, { error: "Unauthorized" }, 401);
    const input = await req.json() as RecordValue;
    const serviceKind = String(input.service_kind ?? "");
    if (!["airtime", "data", "bill", "electricity", "cable", "education"].includes(serviceKind)) return reply(req, { error: "Unsupported service" }, 400);
    const countryCode = String(input.country_code ?? "").toUpperCase();
    const amount = Number(input.amount);
    const recipient = String(input.recipient ?? "").trim();
    const productCode = String(input.product_code ?? "").trim();
    const idempotency = req.headers.get("idempotency-key") ?? "";
    if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotency) || !/^[A-Z]{2}$/.test(countryCode) || !Number.isFinite(amount) || amount <= 0 || !recipient) return reply(req, { error: "Invalid purchase request" }, 400);

    const { data: providerTxId, error: initiateError } = await userClient.rpc("initiate_service_purchase", { _service: serviceKind, _country_code: countryCode, _amount: amount, _recipient: recipient, _product_code: productCode, _idempotency_key: idempotency });
    if (initiateError || !providerTxId) return reply(req, { error: initiateError?.message ?? "Purchase could not be initiated" }, 422);
    const { data: providerTx } = await service.from("provider_transactions").select("*").eq("id", providerTxId).single();
    if (!providerTx) return reply(req, { error: "Purchase state unavailable" }, 500);
    if (["successful", "failed"].includes(providerTx.status)) return reply(req, { transaction_id: providerTx.internal_transaction_id, status: providerTx.status, reused: true });
    if (["processing", "requires_review"].includes(providerTx.status)) return reply(req, { transaction_id: providerTx.internal_transaction_id, status: providerTx.status, reused: true }, 202);
    const { data: profile } = await service.from("profiles").select("id,full_name,email,phone").eq("id", user.id).single();
    const { data: routes } = await service.rpc("resolve_provider", { _service: serviceKind, _country: countryCode });
    if (!routes?.length) {
      await service.rpc("finalize_service_purchase", { _provider_transaction_id: providerTx.id, _status: "failed", _provider_reference: null, _response: { error: "No provider route available" } });
      return reply(req, { error: "No provider route available" }, 503);
    }

    let explicitlyFailed = false;
    for (const route of routes) {
      const { data: provider } = await service.from("providers").select("id,code,base_url,config,is_sandbox,status").eq("id", route.provider_id).single();
      const operation = provider ? pathValue(provider.config, `operations.${serviceKind}`) as RecordValue | undefined : undefined;
      if (!provider?.base_url || provider.status !== "active" || !operation) continue;
      const { data: rows } = await service.from("provider_credentials").select("key_name,env_var").eq("provider_id", provider.id).eq("is_sandbox", provider.is_sandbox);
      const credentials: RecordValue = {};
      for (const row of rows ?? []) { const secret = Deno.env.get(row.env_var); if (secret) credentials[row.key_name] = secret; }
      const context: RecordValue = { user: profile, input, transaction: providerTx, credentials };
      const started = Date.now();
      try {
        const base = new URL(provider.base_url);
        if (base.protocol !== "https:") throw new Error("Provider URL must use HTTPS");
        const endpoint = new URL(renderText(String(operation.path ?? ""), context), base);
        if (endpoint.origin !== base.origin) throw new Error("Provider origin mismatch");
        await service.from("provider_transactions").update({ provider_id: provider.id, status: "processing" }).eq("id", providerTx.id);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20_000);
        const providerResponse = await fetch(endpoint, { method: String(operation.method ?? "POST").toUpperCase(), headers: { "Content-Type": "application/json", ...(render(operation.headers ?? {}, context) as Record<string, string>) }, body: JSON.stringify(render(operation.body ?? {}, context)), signal: controller.signal });
        clearTimeout(timer);
        const body = await providerResponse.json().catch(() => ({}));
        const mapping = (operation.response_mapping ?? {}) as RecordValue;
        const providerReference = String(pathValue(body, String(mapping.provider_reference ?? "")) ?? "") || null;
        const providerStatus = String(pathValue(body, String(mapping.status ?? "")) ?? "").toLowerCase();
        const successful = Array.isArray(operation.successful_statuses) ? operation.successful_statuses.map(String) : ["success", "successful", "completed"];
        const failed = Array.isArray(operation.failed_statuses) ? operation.failed_statuses.map(String) : ["failed", "failure"];
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: serviceKind, direction: "outbound", endpoint: endpoint.pathname, method: String(operation.method ?? "POST").toUpperCase(), status_code: providerResponse.status, latency_ms: Date.now() - started, success: providerResponse.ok, user_id: user.id, reference: providerTx.client_reference, response_payload: body });
        if (providerResponse.ok && successful.includes(providerStatus)) {
          const { error } = await service.rpc("finalize_service_purchase", { _provider_transaction_id: providerTx.id, _status: "successful", _provider_reference: providerReference, _response: body });
          if (error) throw error;
          return reply(req, { transaction_id: providerTx.internal_transaction_id, status: "successful" });
        }
        if (providerResponse.ok && !failed.includes(providerStatus)) {
          await service.from("provider_transactions").update({ status: "processing", provider_reference: providerReference, response_payload: body }).eq("id", providerTx.id);
          return reply(req, { transaction_id: providerTx.internal_transaction_id, status: "processing" }, 202);
        }
        explicitlyFailed = true;
        if (operation.safe_failover !== true) break;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Provider request failed";
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: serviceKind, direction: "outbound", latency_ms: Date.now() - started, success: false, error: message, user_id: user.id, reference: providerTx.client_reference });
        await service.from("provider_transactions").update({ status: "requires_review", error_message: message }).eq("id", providerTx.id);
        return reply(req, { transaction_id: providerTx.internal_transaction_id, status: "requires_review" }, 202);
      }
    }
    if (explicitlyFailed) {
      const { error } = await service.rpc("finalize_service_purchase", { _provider_transaction_id: providerTx.id, _status: "failed", _provider_reference: null, _response: {} });
      if (error) throw error;
      return reply(req, { transaction_id: providerTx.internal_transaction_id, status: "failed" }, 502);
    }
    await service.rpc("finalize_service_purchase", { _provider_transaction_id: providerTx.id, _status: "failed", _provider_reference: null, _response: { error: "No configured provider adapter" } });
    return reply(req, { error: "No configured provider adapter" }, 503);
  } catch (error) {
    console.error("service-purchase", error);
    return reply(req, { error: "Service purchase could not be completed" }, 500);
  }
});
