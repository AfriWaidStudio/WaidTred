import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type JsonRecord = Record<string, unknown>;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function readPath(value: unknown, path?: string): unknown {
  if (!path) return undefined;
  return path.split(".").filter(Boolean).reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as JsonRecord)[key];
  }, value);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function safeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left.trim());
  const b = new TextEncoder().encode(right.trim());
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

async function hmac(secret: string, body: Uint8Array, algorithm: "SHA-256" | "SHA-512", encoding: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: algorithm }, false, ["sign"]);
  const signed = new Uint8Array(await crypto.subtle.sign("HMAC", key, body));
  return encoding === "base64" ? bytesToBase64(signed) : bytesToHex(signed);
}

async function sha256(body: Uint8Array) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", body)));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);
  const providerCode = new URL(req.url).searchParams.get("provider")?.toLowerCase();
  if (!providerCode || !/^[a-z0-9_-]{2,40}$/.test(providerCode)) return response({ error: "Unknown provider" }, 404);
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > 1_048_576) return response({ error: "Payload too large" }, 413);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return response({ error: "Unavailable" }, 503);
  const service = createClient(supabaseUrl, serviceKey);
  const { data: provider } = await service.from("providers").select("id,code,status,is_sandbox,config").eq("code", providerCode).single();
  if (!provider || provider.status !== "active") return response({ error: "Unknown provider" }, 404);
  const webhook = readPath(provider.config, "webhook") as JsonRecord | undefined;
  if (!webhook) return response({ error: "Webhook not configured" }, 503);

  const raw = new Uint8Array(await req.arrayBuffer());
  if (raw.byteLength > 1_048_576) return response({ error: "Payload too large" }, 413);
  const rawText = new TextDecoder().decode(raw);
  let payload: JsonRecord;
  try { payload = JSON.parse(rawText) as JsonRecord; }
  catch { return response({ error: "Invalid JSON" }, 400); }

  const signatureHeader = String(webhook.signature_header ?? "x-webhook-signature").toLowerCase();
  const suppliedSignature = req.headers.get(signatureHeader) ?? "";
  const secretKeyName = String(webhook.secret_key_name ?? "webhook_secret");
  const { data: credential } = await service.from("provider_credentials").select("env_var").eq("provider_id", provider.id).eq("key_name", secretKeyName).eq("is_sandbox", provider.is_sandbox).maybeSingle();
  const secret = credential?.env_var ? Deno.env.get(credential.env_var) : undefined;
  if (!secret) return response({ error: "Webhook configuration unavailable" }, 503);

  const algorithm = String(webhook.algorithm ?? "hmac-sha256").toLowerCase();
  const encoding = String(webhook.encoding ?? "hex").toLowerCase();
  let expectedSignature = secret;
  if (algorithm === "hmac-sha256") expectedSignature = await hmac(secret, raw, "SHA-256", encoding);
  else if (algorithm === "hmac-sha512") expectedSignature = await hmac(secret, raw, "SHA-512", encoding);
  else if (algorithm !== "exact") return response({ error: "Unsupported signature configuration" }, 503);
  const signatureValid = safeEqual(suppliedSignature, expectedSignature);

  const eventId = String(readPath(payload, String(webhook.event_id_path ?? "")) ?? await sha256(raw));
  const idempotencyKey = `${provider.code}:${eventId}`;
  const normalized: JsonRecord = {
    event_id: eventId,
    event_type: readPath(payload, String(webhook.event_type_path ?? "event")),
    provider_reference: readPath(payload, String(webhook.provider_reference_path ?? "data.reference")),
    status: String(readPath(payload, String(webhook.status_path ?? "data.status")) ?? "").toLowerCase(),
    amount: Number(readPath(payload, String(webhook.amount_path ?? "data.amount")) ?? 0),
    currency: String(readPath(payload, String(webhook.currency_path ?? "data.currency")) ?? "").toUpperCase(),
    account_number: readPath(payload, String(webhook.account_number_path ?? "data.account_number")),
  };
  const { data: webhookRow, error: insertError } = await service.from("provider_webhooks").insert({
    provider_id: provider.id,
    provider_code: provider.code,
    event_type: String(normalized.event_type ?? "unknown"),
    idempotency_key: idempotencyKey,
    signature: suppliedSignature.slice(0, 512),
    signature_valid: signatureValid,
    payload,
    normalized_event: normalized,
    headers: { [signatureHeader]: suppliedSignature.slice(0, 512), "content-type": req.headers.get("content-type") },
    status: signatureValid ? "processing" : "ignored",
    attempts: 1,
  }).select("id").single();
  if (insertError?.code === "23505") return response({ received: true, duplicate: true });
  if (insertError || !webhookRow) return response({ error: "Webhook persistence failed" }, 500);
  if (!signatureValid) return response({ error: "Invalid signature" }, 401);

  try {
    const providerReference = normalized.provider_reference ? String(normalized.provider_reference) : null;
    let { data: providerTx } = providerReference
      ? await service.from("provider_transactions").select("id,user_id,status,service_kind").eq("provider_id", provider.id).eq("provider_reference", providerReference).maybeSingle()
      : { data: null };

    if (!providerTx && normalized.account_number && normalized.amount && normalized.currency) {
      const { data: account } = await service.from("virtual_accounts").select("user_id,country_code,currency_code").eq("provider_id", provider.id).eq("account_number", String(normalized.account_number)).eq("status", "active").maybeSingle();
      if (account && account.currency_code === normalized.currency) {
        const { data: market } = await service.from("countries").select("fx_to_smk").eq("code", account.country_code).single();
        const fxRate = Number(market?.fx_to_smk ?? 0);
        const walletAmount = Math.round(Number(normalized.amount) * fxRate * 100) / 100;
        if (fxRate <= 0 || walletAmount <= 0) throw new Error("Currency conversion is unavailable");
        const { data: created } = await service.from("provider_transactions").insert({
          user_id: account.user_id,
          provider_id: provider.id,
          service_kind: "deposit",
          direction: "inbound",
          amount: normalized.amount,
          wallet_amount: walletAmount,
          fx_rate: fxRate,
          currency_code: account.currency_code,
          country_code: account.country_code,
          idempotency_key: idempotencyKey,
          provider_reference: providerReference ?? eventId,
          client_reference: `DEP-${eventId}`,
          status: "processing",
          response_payload: payload,
        }).select("id,user_id,status,service_kind").single();
        providerTx = created;
      }
    }

    if (!providerTx) throw new Error("No provider transaction or virtual-account mapping");
    const successfulValues = Array.isArray(webhook.successful_statuses) ? webhook.successful_statuses.map(String) : ["success", "successful", "completed"];
    const failedValues = Array.isArray(webhook.failed_statuses) ? webhook.failed_statuses.map(String) : ["failed", "failure", "reversed"];
    const normalizedStatus = String(normalized.status);
    const settlementStatus = successfulValues.includes(normalizedStatus) ? "successful" : failedValues.includes(normalizedStatus) ? "failed" : null;
    if (!settlementStatus) throw new Error(`Unmapped provider status: ${normalizedStatus || "empty"}`);

    if (webhook.trust_signed_webhook_for_settlement === true) {
      const { error: settlementError } = await service.rpc("settle_provider_transaction", {
        _provider_transaction_id: providerTx.id,
        _provider_reference: providerReference,
        _status: settlementStatus,
        _response: payload,
      });
      if (settlementError) throw settlementError;
      await service.from("provider_webhooks").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", webhookRow.id);
    } else {
      await service.from("provider_transactions").update({ status: "requires_review", response_payload: payload }).eq("id", providerTx.id);
      await service.from("provider_webhooks").update({ status: "processed", processed_at: new Date().toISOString(), error: "Awaiting provider API verification" }).eq("id", webhookRow.id);
    }
    return response({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    await service.from("provider_webhooks").update({ status: "failed", error: message }).eq("id", webhookRow.id);
    await service.from("webhook_dead_letters").upsert({ webhook_id: webhookRow.id, provider_id: provider.id, reason: "processing_failed", last_error: message, attempts: 1, next_retry_at: new Date(Date.now() + 300_000).toISOString() }, { onConflict: "webhook_id" });
    return response({ received: true }, 202);
  }
});
