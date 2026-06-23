import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type RecordValue = Record<string, unknown>;
const origins = (Deno.env.get("APP_ALLOWED_ORIGINS") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
const cors = (req: Request) => ({
  "Access-Control-Allow-Origin": origins.includes(req.headers.get("origin") ?? "") ? req.headers.get("origin")! : origins[0] ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});
const reply = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
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
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const auth = createClient(url, anonKey, { global: { headers: { Authorization: req.headers.get("authorization") ?? "" } } });
    const service = createClient(url, serviceKey);
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return reply(req, { error: "Unauthorized" }, 401);
    const { beneficiary_id } = await req.json();
    const { data: beneficiary } = await service.from("bank_beneficiaries").select("*").eq("id", beneficiary_id).eq("user_id", user.id).single();
    if (!beneficiary) return reply(req, { error: "Beneficiary not found" }, 404);
    if (beneficiary.is_verified) return reply(req, { beneficiary, reused: true });
    const { data: profile } = await service.from("profiles").select("id,email,phone,full_name,kyc_tier,account_status").eq("id", user.id).single();
    if (!profile || profile.account_status !== "active" || Number(profile.kyc_tier) < 2) return reply(req, { error: "Tier 2 KYC is required" }, 403);
    const { data: routes } = await service.rpc("resolve_provider", { _service: "payout", _country: beneficiary.country_code });
    if (!routes?.length) return reply(req, { error: "No payout route is available" }, 503);

    for (const route of routes) {
      const { data: provider } = await service.from("providers").select("id,code,base_url,config,is_sandbox").eq("id", route.provider_id).single();
      const operation = provider ? pathValue(provider.config, "operations.beneficiary_verify") as RecordValue | undefined : undefined;
      if (!provider?.base_url || !operation) continue;
      const { data: rows } = await service.from("provider_credentials").select("key_name,env_var").eq("provider_id", provider.id).eq("is_sandbox", provider.is_sandbox);
      const credentials: RecordValue = {};
      for (const row of rows ?? []) { const secret = Deno.env.get(row.env_var); if (secret) credentials[row.key_name] = secret; }
      const context: RecordValue = { user: profile, beneficiary, credentials, reference: `BEN-${beneficiary.id}` };
      try {
        const base = new URL(provider.base_url);
        if (base.protocol !== "https:") throw new Error("HTTPS required");
        const endpoint = new URL(renderText(String(operation.path ?? ""), context), base);
        if (endpoint.origin !== base.origin) throw new Error("Provider origin mismatch");
        const method = String(operation.method ?? "POST").toUpperCase();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15_000);
        const providerResponse = await fetch(endpoint, { method, headers: { "Content-Type": "application/json", ...(render(operation.headers ?? {}, context) as Record<string, string>) }, body: JSON.stringify(render(operation.body ?? {}, context)), signal: controller.signal });
        clearTimeout(timer);
        const body = await providerResponse.json().catch(() => ({}));
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: "payout", direction: "outbound", endpoint: endpoint.pathname, method, status_code: providerResponse.status, success: providerResponse.ok, user_id: user.id, reference: `BEN-${beneficiary.id}`, response_payload: body });
        if (!providerResponse.ok) continue;
        const mapping = (operation.response_mapping ?? {}) as RecordValue;
        const accountName = String(pathValue(body, String(mapping.account_name ?? "")) ?? "");
        const recipientReference = String(pathValue(body, String(mapping.recipient_reference ?? "")) ?? "");
        if (!accountName) continue;
        const { data: verified, error } = await service.from("bank_beneficiaries").update({ account_name: accountName, provider_recipient_reference: recipientReference || null, is_verified: true }).eq("id", beneficiary.id).select().single();
        if (error) throw error;
        return reply(req, { beneficiary: verified, reused: false });
      } catch (error) {
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: "payout", direction: "outbound", success: false, error: error instanceof Error ? error.message : "Verification failed", user_id: user.id, reference: `BEN-${beneficiary.id}` });
      }
    }
    return reply(req, { error: "All beneficiary-verification providers failed" }, 502);
  } catch (error) {
    console.error("beneficiary-orchestrator", error);
    return reply(req, { error: "Beneficiary verification failed" }, 500);
  }
});
