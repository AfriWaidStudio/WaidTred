import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const CountriesService = {
  list: async () => (await supabase.from("countries").select("*").order("name")).data ?? [],
  toggle: async (id: string, is_enabled: boolean) => supabase.from("countries").update({ is_enabled }).eq("id", id),
  updateFx: async (id: string, fx_to_smk: number) => supabase.from("countries").update({ fx_to_smk }).eq("id", id),
};

export const SupportService = {
  myTickets: async () => (await supabase.from("support_tickets").select("*").order("created_at",{ascending:false})).data ?? [],
  allTickets: async () => (await supabase.from("support_tickets").select("*").order("created_at",{ascending:false})).data ?? [],
  open: async (subject: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("support_tickets").insert({ user_id, subject }).select().single();
  },
  messages: async (ticket_id: string) => (await supabase.from("support_messages").select("*").eq("ticket_id", ticket_id).order("created_at")).data ?? [],
  send: async (ticket_id: string, body: string) => {
    const sender_id = await uid(); if (!sender_id) throw new Error("Auth required");
    return supabase.from("support_messages").insert({ ticket_id, sender_id, body });
  },
};

export const DisputeService = {
  list: async () => (await supabase.from("disputes").select("*").order("created_at",{ascending:false})).data ?? [],
  open: async (d: { transaction_id?: string; reason: string; description?: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("disputes").insert({ ...d, user_id });
  },
  resolve: async (id: string, resolution: string) => {
    const resolved_by = await uid();
    return supabase.from("disputes").update({ status: "resolved", resolution, resolved_by, resolved_at: new Date().toISOString() }).eq("id", id);
  },
};

export const FraudService = {
  myEvents: async () => (await supabase.from("fraud_events").select("*").order("created_at",{ascending:false})).data ?? [],
  allEvents: async () => (await supabase.from("fraud_events").select("*").order("created_at",{ascending:false})).data ?? [],
  log: async (e: { user_id: string; severity: string; event_type: string; description?: string; action_taken?: string }) => supabase.from("fraud_events").insert(e),
};

export const RiskService = {
  list: async () => (await supabase.from("risk_scores").select("*, profile:profiles!risk_scores_user_id_fkey(full_name, email)").order("score",{ascending:false})).data ?? [],
  upsert: async (user_id: string, score: number, factors: any) => supabase.from("risk_scores").upsert({ user_id, score, factors, updated_at: new Date().toISOString() }, { onConflict: "user_id" }),
};

export const FlaggedService = {
  list: async () => (await supabase.from("flagged_content").select("*").order("created_at",{ascending:false})).data ?? [],
  flag: async (content_type: string, content_id: string, reason: string) => {
    const reporter_id = await uid();
    return supabase.from("flagged_content").insert({ content_type, content_id, reason, reporter_id });
  },
  resolve: async (id: string, status: "approved" | "removed") => {
    const reviewed_by = await uid();
    return supabase.from("flagged_content").update({ status, reviewed_by }).eq("id", id);
  },
};
