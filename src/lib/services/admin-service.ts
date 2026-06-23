import { supabase } from "@/integrations/supabase/client";

const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const AdminService = {
  // Users / profiles
  listUsers: async (search = "") => {
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    return (await q).data ?? [];
  },
  getUser: async (id: string) => (await supabase.from("profiles").select("*").eq("id", id).maybeSingle()).data,
  setAccountStatus: async (id: string, account_status: "active" | "frozen" | "suspended" | "closed") =>
    supabase.from("profiles").update({ account_status }).eq("id", id),
  setKycStatus: async (id: string, kyc_status: "pending" | "verified" | "rejected") =>
    supabase.from("profiles").update({ kyc_status }).eq("id", id),

  // Wallets
  listWallets: async () =>
    (await supabase.from("wallets").select("*, profile:profiles!wallets_user_id_fkey(full_name,email,country)").order("total_balance", { ascending: false }).limit(200)).data ?? [],

  // Transactions
  listTransactions: async (filter?: string) => {
    let q = supabase.from("transactions").select("*, profile:profiles!transactions_user_id_fkey(full_name)").order("created_at", { ascending: false }).limit(200);
    if (filter === "flagged") q = q.eq("status", "flagged");
    else if (filter === "transfers") q = q.in("type", ["transfer", "received"]);
    else if (filter === "recharge") q = q.in("type", ["airtime", "data"]);
    else if (filter === "bills") q = q.eq("type", "bill");
    return (await q).data ?? [];
  },
  setTxStatus: async (id: string, status: string) => supabase.from("transactions").update({ status: status as any }).eq("id", id),
  flagTx: async (id: string, reason: string) => {
    const reporter_id = await uid();
    await supabase.from("transactions").update({ status: "flagged" }).eq("id", id);
    return supabase.from("flagged_content").insert({ content_type: "transaction", content_id: id, reason, reporter_id });
  },

  // Funding
  listFunding: async (filter?: string) => {
    let q = supabase.from("funding_requests").select("*, profile:profiles!funding_requests_user_id_fkey(full_name,email,country)").order("created_at", { ascending: false });
    if (filter && filter !== "all") q = q.eq("status", filter);
    return (await q).data ?? [];
  },
  confirmFunding: (id: string, approve: boolean, notes?: string) =>
    supabase.rpc("confirm_funding", { _request_id: id, _approve: approve, _notes: notes ?? null }),

  // Merchants
  listMerchants: async () => (await supabase.from("merchants").select("*, profile:profiles!merchants_owner_id_fkey(full_name,country)").order("created_at", { ascending: false })).data ?? [],
  setMerchantStatus: async (id: string, kyb_status: string) => supabase.from("merchants").update({ kyb_status }).eq("id", id),

  // Agents (users with agent role)
  listAgents: async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "agent");
    if (!roles?.length) return [];
    const ids = roles.map((r: any) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
    return profiles ?? [];
  },
  promoteToAgent: async (user_id: string) =>
    supabase.from("user_roles").upsert({ user_id, role: "agent" as const }, { onConflict: "user_id,role" }),
  removeRole: async (user_id: string, role: "agent" | "admin" | "moderator") =>
    supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role),

  // Risk scores
  listRisk: async () =>
    (await supabase.from("risk_scores").select("*, profile:profiles!risk_scores_user_id_fkey(full_name)").order("score", { ascending: true })).data ?? [],

  // Alerts
  bulkResolveAlerts: async (severity?: string) => {
    let q = supabase.from("alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("resolved", false);
    if (severity) q = q.eq("severity", severity as any);
    return q;
  },

  // Pricing
  addPricingRule: async (r: { asset_type: string; asset_name: string; base_price: number; spread_percentage: number; min_price?: number; max_price?: number }) =>
    supabase.from("pricing_rules").insert(r),

  // Integrations
  addIntegration: async (i: { provider_name: string; service_type: string; region?: string; endpoint?: string; api_key_name?: string }) =>
    supabase.from("integrations").insert(i),

  // Disputes & flagged (mod)
  listDisputes: async (filter?: string) => {
    let q = supabase.from("disputes").select("*, profile:profiles!disputes_user_id_fkey(full_name)").order("created_at", { ascending: false });
    if (filter && filter !== "all") q = q.eq("status", filter);
    return (await q).data ?? [];
  },
  setDisputeStatus: async (id: string, status: string, resolution?: string) => {
    const resolved_by = await uid();
    const payload: any = { status };
    if (status === "resolved") { payload.resolution = resolution; payload.resolved_by = resolved_by; payload.resolved_at = new Date().toISOString(); }
    return supabase.from("disputes").update(payload).eq("id", id);
  },
  listFlagged: async (filter?: string) => {
    let q = supabase.from("flagged_content").select("*").order("created_at", { ascending: false });
    if (filter && filter !== "all") q = q.eq("status", filter);
    return (await q).data ?? [];
  },
  setFlagStatus: async (id: string, status: string) => {
    const reviewed_by = await uid();
    return supabase.from("flagged_content").update({ status, reviewed_by }).eq("id", id);
  },

  // Chat (admin/agent reply)
  listConversations: async () =>
    (await supabase.from("chat_conversations").select("*, profile:profiles!chat_conversations_user_id_fkey(full_name,email)").order("updated_at", { ascending: false }).limit(100)).data ?? [],
  listMessages: async (conversation_id: string) =>
    (await supabase.from("chat_messages").select("*").eq("conversation_id", conversation_id).order("created_at")).data ?? [],
  sendAgentReply: async (conversation_id: string, content: string) => {
    const user_id = await uid();
    if (!user_id) throw new Error("Auth required");
    await supabase.from("chat_messages").insert({ conversation_id, user_id, role: "assistant", content });
    return supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation_id);
  },
};
