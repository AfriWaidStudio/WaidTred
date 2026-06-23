import { supabase } from "@/integrations/supabase/client";

export const NotificationService = {
  async list(limit = 50) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  },
  async unreadCount() {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    return count || 0;
  },
  async markRead(id: string) {
    return supabase.from("notifications").update({ read: true }).eq("id", id);
  },
  async markAllRead() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    return supabase.from("notifications").update({ read: true }).eq("user_id", u.user.id).eq("read", false);
  },
};

export const FundingService = {
  async create(amount: number, method: string, proofUrl?: string, note?: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { error: new Error("Not authenticated") };
    return supabase.from("funding_requests").insert({
      user_id: u.user.id,
      amount,
      method,
      proof_url: proofUrl,
      reference_note: note,
    });
  },
  async listMine() {
    const { data, error } = await supabase
      .from("funding_requests").select("*").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async listPending() {
    const { data, error } = await supabase
      .from("funding_requests").select("*").eq("status", "pending").order("created_at");
    return { data: data || [], error };
  },
  async confirm(id: string, approve: boolean, notes?: string) {
    return supabase.rpc("confirm_funding", { _request_id: id, _approve: approve, _notes: notes ?? null });
  },
};

export const KycService = {
  async submit(input: {
    document_type: string; document_number?: string; full_name?: string;
    date_of_birth?: string; address?: string; document_url?: string;
  }) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { error: new Error("Not authenticated") };
    return supabase.from("kyc_documents").insert({ ...input, user_id: u.user.id });
  },
  async listMine() {
    const { data, error } = await supabase
      .from("kyc_documents").select("*").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
};

export const ContactsService = {
  async list() {
    const { data, error } = await supabase
      .from("contacts").select("*").order("is_favorite", { ascending: false }).order("name");
    return { data: data || [], error };
  },
  async add(input: { name: string; phone?: string; email?: string; contact_user_id?: string }) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { error: new Error("Not authenticated") };
    return supabase.from("contacts").insert({ ...input, user_id: u.user.id });
  },
  async toggleFavorite(id: string, value: boolean) {
    return supabase.from("contacts").update({ is_favorite: value }).eq("id", id);
  },
  async remove(id: string) {
    return supabase.from("contacts").delete().eq("id", id);
  },
};

export const ScheduledService = {
  async list() {
    const { data, error } = await supabase
      .from("scheduled_transfers").select("*").order("next_run");
    return { data: data || [], error };
  },
  async create(input: {
    recipient_name: string; amount: number; frequency: "daily"|"weekly"|"monthly";
    next_run: string; recipient_phone?: string; recipient_user_id?: string;
  }) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { error: new Error("Not authenticated") };
    return supabase.from("scheduled_transfers").insert({ ...input, user_id: u.user.id });
  },
  async toggle(id: string, active: boolean) {
    return supabase.from("scheduled_transfers").update({ active }).eq("id", id);
  },
  async remove(id: string) {
    return supabase.from("scheduled_transfers").delete().eq("id", id);
  },
};

export const ReferralService = {
  async list() {
    const { data, error } = await supabase
      .from("referrals").select("*").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async create(email?: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { error: new Error("Not authenticated") };
    const code = `WT${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return supabase.from("referrals").insert({
      referrer_id: u.user.id, referral_code: code, referred_email: email,
    });
  },
};

export const LockService = {
  async list() {
    const { data, error } = await supabase
      .from("wallet_locks").select("*").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async create(name: string, total: number, daily: number) {
    return supabase.rpc("create_wallet_lock", { _name: name, _total: total, _daily: daily });
  },
  async releases(lockId: string) {
    const { data, error } = await supabase
      .from("wallet_lock_releases").select("*").eq("lock_id", lockId).order("released_at", { ascending: false });
    return { data: data || [], error };
  },
  async processDripsNow() {
    return supabase.rpc("process_drip_releases");
  },
};
