import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type JsonRecord = Record<string, unknown>;

const allowedOrigins = (Deno.env.get("APP_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").filter(Boolean).reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as JsonRecord)[key];
  }, value);
}

function renderString(template: string, context: JsonRecord): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, path: string) => {
    const value = readPath(context, path);
    if (value === undefined || value === null) throw new Error(`Missing provider template value: ${path}`);
    return String(value);
  });
}

function render(value: unknown, context: JsonRecord): unknown {
  if (typeof value === "string") return renderString(value, context);
  if (Array.isArray(value)) return value.map((item) => render(item, context));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, item]) => [key, render(item, context)]));
  }
  return value;
}

function mapped(response: unknown, mapping: JsonRecord, key: string): string | undefined {
  const path = mapping[key];
  if (typeof path !== "string") return undefined;
  const value = readPath(response, path);
  return value === undefined || value === null ? undefined : String(value);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!supabaseUrl || !serviceKey || !anonKey) return json(req, { error: "Service configuration unavailable" }, 503);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const service = createClient(supabaseUrl, serviceKey);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json(req, { error: "Unauthorized" }, 401);

    const input = await req.json() as JsonRecord;
    if (input.operation !== "create_virtual_account") return json(req, { error: "Unsupported operation" }, 400);
    const countryCode = String(input.country_code ?? "").toUpperCase();
    const currencyCode = String(input.currency_code ?? "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode) || !/^[A-Z]{3}$/.test(currencyCode)) return json(req, { error: "Invalid country or currency" }, 400);

    const { data: profile } = await service.from("profiles").select("id,full_name,email,phone,kyc_tier,account_status").eq("id", user.id).single();
    if (!profile || profile.account_status !== "active" || Number(profile.kyc_tier) < 2) {
      return json(req, { error: "Tier 2 KYC is required" }, 403);
    }
    const { data: country } = await service.from("countries").select("code,currency_code,status,banking_supported").eq("code", countryCode).eq("status", "active").single();
    if (!country || !country.banking_supported || country.currency_code !== currencyCode) return json(req, { error: "Country or currency is unavailable" }, 422);

    const { data: existing } = await service.from("virtual_accounts").select("id,account_name,account_number,bank_name,bank_code,country_code,currency_code,status").eq("user_id", user.id).eq("country_code", countryCode).eq("currency_code", currencyCode).in("status", ["pending", "active"]).maybeSingle();
    if (existing) return json(req, { account: existing, reused: true });

    const { data: routes, error: routeError } = await service.rpc("resolve_provider", { _service: "virtual_account", _country: countryCode });
    if (routeError || !routes?.length) return json(req, { error: "No active virtual-account route" }, 503);

    const failures: string[] = [];
    for (const route of routes) {
      const started = Date.now();
      const { data: provider } = await service.from("providers").select("id,code,name,base_url,config,is_sandbox").eq("id", route.provider_id).single();
      if (!provider?.base_url || !provider.config || typeof provider.config !== "object") continue;
      const operation = readPath(provider.config, "operations.virtual_account") as JsonRecord | undefined;
      if (!operation) { failures.push(`${provider.code}: adapter not configured`); continue; }

      const { data: credentialRows } = await service.from("provider_credentials").select("key_name,env_var").eq("provider_id", provider.id).eq("is_sandbox", provider.is_sandbox);
      const credentials: JsonRecord = {};
      for (const row of credentialRows ?? []) {
        const secret = Deno.env.get(row.env_var);
        if (secret) credentials[row.key_name] = secret;
      }
      const reference = `VA-${user.id}-${countryCode}-${crypto.randomUUID()}`;
      const context: JsonRecord = { user: profile, input, country, credentials, reference };

      try {
        const baseUrl = new URL(provider.base_url);
        if (baseUrl.protocol !== "https:") throw new Error("Provider base URL must use HTTPS");
        const path = renderString(String(operation.path ?? ""), context);
        const url = new URL(path, baseUrl);
        if (url.origin !== baseUrl.origin) throw new Error("Provider operation cannot change origin");
        const method = String(operation.method ?? "POST").toUpperCase();
        if (!["POST", "PUT"].includes(method)) throw new Error("Unsupported provider method");
        const headers = { "Content-Type": "application/json", ...(render(operation.headers ?? {}, context) as Record<string, string>) };
        const requestBody = render(operation.body ?? {}, context);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        const response = await fetch(url, { method, headers, body: JSON.stringify(requestBody), signal: controller.signal });
        clearTimeout(timeout);
        const responseBody = await response.json().catch(() => ({}));
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: "virtual_account", direction: "outbound", endpoint: url.pathname, method, status_code: response.status, latency_ms: Date.now() - started, success: response.ok, user_id: user.id, reference, response_payload: responseBody });
        if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);

        const mapping = (operation.response_mapping ?? {}) as JsonRecord;
        const accountNumber = mapped(responseBody, mapping, "account_number");
        const accountName = mapped(responseBody, mapping, "account_name") ?? profile.full_name;
        const providerReference = mapped(responseBody, mapping, "provider_reference") ?? reference;
        if (!accountNumber || !accountName || !providerReference) throw new Error("Provider response mapping is incomplete");
        const { data: account, error: insertError } = await service.from("virtual_accounts").insert({
          user_id: user.id,
          provider_id: provider.id,
          country_code: countryCode,
          currency_code: currencyCode,
          account_name: accountName,
          account_number: accountNumber,
          bank_name: mapped(responseBody, mapping, "bank_name") ?? provider.name,
          bank_code: mapped(responseBody, mapping, "bank_code"),
          provider_customer_reference: mapped(responseBody, mapping, "customer_reference"),
          provider_account_reference: providerReference,
          status: "active",
          metadata: { provider_code: provider.code },
        }).select("id,account_name,account_number,bank_name,bank_code,country_code,currency_code,status").single();
        if (insertError) throw insertError;
        return json(req, { account, reused: false }, 201);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Provider call failed";
        failures.push(`${provider.code}: ${message}`);
        await service.from("provider_logs").insert({ provider_id: provider.id, service_kind: "virtual_account", direction: "outbound", latency_ms: Date.now() - started, success: false, error: message, user_id: user.id, reference });
      }
    }

    return json(req, { error: "All virtual-account providers failed", failures }, 502);
  } catch (error) {
    console.error("provider-orchestrator", error);
    return json(req, { error: "Provider orchestration failed" }, 500);
  }
});
