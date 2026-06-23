import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const MerchantService = {
  get: async () => (await supabase.from("merchants").select("*").maybeSingle()).data,
  apply: async (m: { business_name: string; category: string; registration_number?: string }) => {
    const owner_id = await uid(); if (!owner_id) throw new Error("Auth required");
    return supabase.from("merchants").upsert({ ...m, owner_id }, { onConflict: "owner_id" });
  },
};

export const InvoiceService = {
  list: async () => (await supabase.from("invoices").select("*, items:invoice_items(*)").order("created_at",{ascending:false})).data ?? [],
  create: async (i: { client_name: string; client_email?: string; due_date?: string }, items: { description: string; quantity: number; unit_price: number }[]) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const total = items.reduce((a, x) => a + x.quantity * x.unit_price, 0);
    const invoice_number = "INV-" + Date.now().toString().slice(-6);
    const { data: inv } = await supabase.from("invoices").insert({ ...i, user_id, invoice_number, total }).select().single();
    if (inv) await supabase.from("invoice_items").insert(items.map(x => ({ ...x, invoice_id: inv.id, user_id })));
    return inv;
  },
};

export const ApiKeyService = {
  list: async () => (await supabase.from("api_keys").select("id, name, key_prefix, scopes, last_used_at, status, created_at").order("created_at",{ascending:false})).data ?? [],
  create: async (name: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const raw = "sk_" + crypto.randomUUID().replace(/-/g, "");
    const key_prefix = raw.slice(0, 8);
    const enc = new TextEncoder().encode(raw);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const key_hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    await supabase.from("api_keys").insert({ user_id, name, key_prefix, key_hash });
    return raw;
  },
  revoke: async (id: string) => supabase.from("api_keys").update({ status: "revoked" }).eq("id", id),
};
