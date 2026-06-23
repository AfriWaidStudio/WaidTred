import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type RecordValue = Record<string, unknown>;
const pathValue = (value: unknown, path: string): unknown => path.split(".").filter(Boolean).reduce<unknown>((current, key) => current && typeof current === "object" ? (current as RecordValue)[key] : undefined, value);
const renderText = (template: string, context: RecordValue) => template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, path: string) => {
  const value = pathValue(context, path);
  if (value === undefined || value === null) throw new Error(`Missing template value: ${path}`);
  return String(value);
});
const render = (value: unknown, context: RecordValue): unknown => {
  if (typeof value === "string") return renderText(value, context);
  if (Array.isArray(value)) return value.map((item) => render(item, context));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as RecordValue).map(([key, item]) => [key, render(item, context)]));
  return value;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  const configured = Deno.env.get("PROVIDER_PROCESSOR_CRON_SECRET");
  if (!configured || req.headers.get("x-cron-secret") !== configured) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: claimed, error: claimError } = await service.rpc("claim_provider_transactions", { _limit: 25 });
  if (claimError) return new Response(JSON.stringify({ error: "Unable to claim provider transactions" }), { status: 500, headers: { "Content-Type": "application/json" } });
  const results: RecordValue[] = [];

  for (const transaction of claimed ?? []) {
    try {
      if (transaction.service_kind !== "payout") throw new Error("Unsupported outbound service kind");
      const { data: withdrawal } = await service.from("withdrawal_requests").select("*,beneficiary:bank_beneficiaries(*)").eq("provider_transaction_id", transaction.id).single();
      const { data: provider } = await service.from("providers").select("id,code,base_url,config,is_sandbox,status").eq("id", transaction.provider_id).single();
      const operation = provider ? pathValue(provider.config, "operations.payout") as RecordValue | undefined : undefined;
      if (!withdrawal?.beneficiary || !provider?.base_url || provider.status !== "active" || !operation) throw new Error("Payout adapter is unavailable");
      const { data: rows } = await service.from("provider_credentials").select("key_name,env_var").eq("provider_id", provider.id).eq("is_sandbox", provider.is_sandbox);
      const credentials: RecordValue = {};
      for (const row of rows ?? []) { const secret = Deno.env.get(row.env_var); if (secret) credentials[row.key_name] = secret; }
      const context: RecordValue = { transaction, withdrawal, beneficiary: withdrawal.beneficiary, credentials };
      const base = new URL(provider.base_url);
      if (base.protocol !== "https:") throw new Error("Provider URL must use HTTPS");
      const endpoint = new URL(renderText(String(operation.path ?? ""), context), base);
      if (endpoint.origin !== base.origin) throw new Error("Provider origin mismatch");
      const method = String(operation.method ?? "POST").toUpperCase();
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20_000);
      const providerResponse = await fetch(endpoint, { method, headers: { "Content-Type": "application/json", ...(render(operation.headers ?? {}, context) as Record<string, string>) }, body: JSON.stringify(render(operation.body ?? {}, context)), signal: controller.signal });
      clearTimeout(timer);
      const body = await providerResponse.json().catch(() => ({}));
      const mapping = (operation.response_mapping ?? {}) as RecordValue;
      const providerReference = String(pathValue(body, String(mapping.provider_reference ?? "")) ?? "") || null;
      const providerStatus = String(pathValue(body, String(mapping.status ?? "")) ?? "").toLowerCase();
      const successStatuses = Array.isArray(operation.successful_statuses) ? operation.successful_statuses.map(String) : ["success", "successful", "completed"];
      const failedStatuses = Array.isArray(operation.failed_statuses) ? operation.failed_statuses.map(String) : ["failed", "failure"];
      await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: "payout", direction: "outbound", endpoint: endpoint.pathname, method, status_code: providerResponse.status, latency_ms: Date.now() - started, success: providerResponse.ok, user_id: transaction.user_id, reference: transaction.client_reference, response_payload: body });

      if (!providerResponse.ok) {
        await service.from("provider_transactions").update({ status: "requires_review", response_payload: body, error_code: `HTTP_${providerResponse.status}`, error_message: "Provider returned a non-success response" }).eq("id", transaction.id);
      } else if (successStatuses.includes(providerStatus)) {
        const { error } = await service.rpc("settle_provider_transaction", { _provider_transaction_id: transaction.id, _provider_reference: providerReference, _status: "successful", _response: body });
        if (error) throw error;
      } else if (failedStatuses.includes(providerStatus)) {
        const { error } = await service.rpc("settle_provider_transaction", { _provider_transaction_id: transaction.id, _provider_reference: providerReference, _status: "failed", _response: body });
        if (error) throw error;
      } else {
        await service.from("provider_transactions").update({ status: "processing", provider_reference: providerReference, response_payload: body }).eq("id", transaction.id);
        await service.from("withdrawal_requests").update({ status: "processing" }).eq("id", withdrawal.id);
      }
      results.push({ id: transaction.id, processed: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Provider processing failed";
      await service.from("provider_transactions").update({ status: "requires_review", error_message: message }).eq("id", transaction.id);
      results.push({ id: transaction.id, processed: false });
    }
  }
  return new Response(JSON.stringify({ claimed: claimed?.length ?? 0, results }), { headers: { "Content-Type": "application/json" } });
});
