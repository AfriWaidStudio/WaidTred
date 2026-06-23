import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

// 1. WaidChat — P2P messaging
export const WaidChatService = {
  myThreads: async () => {
    const u = await uid(); if (!u) return [];
    const { data: parts } = await supabase.from("chat_thread_participants").select("thread_id").eq("user_id", u);
    const ids = (parts ?? []).map(p => p.thread_id);
    if (!ids.length) return [];
    const { data } = await supabase.from("chat_threads").select("*").in("id", ids).order("last_message_at", { ascending: false });
    return data ?? [];
  },
  messages: async (thread_id: string) =>
    (await supabase.from("chat_thread_messages").select("*").eq("thread_id", thread_id).order("created_at")).data ?? [],
  send: async (thread_id: string, body: string, attachment_type?: string, attachment_data?: any) => {
    const sender_id = await uid(); if (!sender_id) throw new Error("Auth required");
    await supabase.from("chat_thread_messages").insert({ thread_id, sender_id, body, attachment_type, attachment_data });
    await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id);
  },
  startDirect: async (other_user_id: string) => {
    const me = await uid(); if (!me) throw new Error("Auth required");
    const { data: thread } = await supabase.from("chat_threads").insert({ created_by: me, is_group: false }).select().single();
    if (!thread) throw new Error("Failed");
    await supabase.from("chat_thread_participants").insert([
      { thread_id: thread.id, user_id: me },
      { thread_id: thread.id, user_id: other_user_id },
    ]);
    return thread;
  },
  subscribe: (thread_id: string, cb: (msg: any) => void) =>
    supabase.channel(`thread:${thread_id}`).on("postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_thread_messages", filter: `thread_id=eq.${thread_id}` },
      (p) => cb(p.new)).subscribe(),
};

// 2. WaidGive — Causes & donations
export const WaidGiveService = {
  list: async () => (await supabase.from("causes").select("*").eq("status", "active").order("created_at", { ascending: false })).data ?? [],
  get: async (id: string) => (await supabase.from("causes").select("*").eq("id", id).maybeSingle()).data,
  create: async (c: { title: string; description?: string; goal_amount: number; category?: string; cover_url?: string; ends_at?: string }) => {
    const organizer_id = await uid(); if (!organizer_id) throw new Error("Auth required");
    return supabase.from("causes").insert({ ...c, organizer_id });
  },
  donate: async (cause_id: string, amount: number, anonymous = false, message?: string) => {
    const { data, error } = await supabase.rpc("donate_to_cause", { _cause_id: cause_id, _amount: amount, _anonymous: anonymous, _message: message ?? null });
    if (error) throw error; return data;
  },
  topDonors: async (cause_id: string) =>
    (await supabase.from("donations").select("donor_id, amount, anonymous, message, created_at").eq("cause_id", cause_id).order("amount", { ascending: false }).limit(10)).data ?? [],
};

// 3. WaidEvents
export const WaidEventsService = {
  list: async () => (await supabase.from("events").select("*").eq("status", "published").order("starts_at")).data ?? [],
  myTickets: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("event_tickets").select("*, event:events(*)").eq("buyer_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  create: async (e: { title: string; description?: string; venue?: string; starts_at: string; ends_at?: string; price: number; capacity?: number; cover_url?: string }) => {
    const organizer_id = await uid(); if (!organizer_id) throw new Error("Auth required");
    return supabase.from("events").insert({ ...e, organizer_id });
  },
  buy: async (event_id: string) => {
    const { data, error } = await supabase.rpc("buy_event_ticket", { _event_id: event_id });
    if (error) throw error; return data;
  },
  scan: async (ticket_code: string) => {
    const { data: t, error } = await supabase.from("event_tickets")
      .update({ status: "used", scanned_at: new Date().toISOString() })
      .eq("ticket_code", ticket_code).eq("status", "valid").select().maybeSingle();
    if (error) throw error;
    return t;
  },
};

// 4. WaidJobs
export const WaidJobsService = {
  list: async () => (await supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false })).data ?? [],
  myPosted: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("jobs").select("*").eq("poster_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  myApplications: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("job_applications").select("*, job:jobs(*)").eq("applicant_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  post: async (j: { title: string; description?: string; category?: string; budget: number; deadline?: string }) => {
    const poster_id = await uid(); if (!poster_id) throw new Error("Auth required");
    return supabase.from("jobs").insert({ ...j, poster_id });
  },
  apply: async (job_id: string, cover_note?: string, bid_amount?: number) => {
    const applicant_id = await uid(); if (!applicant_id) throw new Error("Auth required");
    return supabase.from("job_applications").insert({ job_id, applicant_id, cover_note, bid_amount });
  },
  accept: async (application_id: string, job_id: string, applicant_id: string) => {
    await supabase.from("job_applications").update({ status: "accepted" }).eq("id", application_id);
    await supabase.from("jobs").update({ status: "assigned", assigned_to: applicant_id }).eq("id", job_id);
  },
  complete: async (job_id: string) => {
    const { data: job } = await supabase.from("jobs").select("*").eq("id", job_id).single();
    if (!job?.assigned_to) throw new Error("No assignee");
    await supabase.rpc("process_wallet_movement", { _user_id: job.poster_id, _direction: "debit", _amount: job.budget, _category: "job_payout", _description: `Job: ${job.title}`, _reference_type: "job", _reference_id: job_id });
    await supabase.rpc("process_wallet_movement", { _user_id: job.assigned_to, _direction: "credit", _amount: job.budget, _category: "job_earnings", _description: `Job: ${job.title}`, _reference_type: "job", _reference_id: job_id });
    await supabase.from("jobs").update({ status: "completed" }).eq("id", job_id);
  },
};

// 5. WaidRent
export const WaidRentService = {
  list: async () => (await supabase.from("rentals").select("*").eq("is_available", true).order("created_at", { ascending: false })).data ?? [],
  myListings: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("rentals").select("*").eq("owner_id", u)).data ?? [];
  },
  myBookings: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("rental_bookings").select("*, rental:rentals(*)").eq("renter_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  create: async (r: { title: string; description?: string; daily_rate: number; deposit?: number; category?: string; location?: string; cover_url?: string }) => {
    const owner_id = await uid(); if (!owner_id) throw new Error("Auth required");
    return supabase.from("rentals").insert({ ...r, owner_id });
  },
  book: async (rental_id: string, start_date: string, end_date: string) => {
    const renter_id = await uid(); if (!renter_id) throw new Error("Auth required");
    const { data: rental } = await supabase.from("rentals").select("*").eq("id", rental_id).single();
    if (!rental) throw new Error("Rental not found");
    const days = Math.max(1, Math.ceil((+new Date(end_date) - +new Date(start_date)) / 86400000));
    const total = days * Number(rental.daily_rate) + Number(rental.deposit ?? 0);
    await supabase.rpc("process_wallet_movement", { _user_id: renter_id, _direction: "debit", _amount: total, _category: "rental_book", _description: `Rental: ${rental.title}`, _reference_type: "rental", _reference_id: rental_id });
    await supabase.rpc("process_wallet_movement", { _user_id: rental.owner_id, _direction: "credit", _amount: total, _category: "rental_income", _description: `Rental: ${rental.title}`, _reference_type: "rental", _reference_id: rental_id });
    return supabase.from("rental_bookings").insert({ rental_id, renter_id, start_date, end_date, total_amount: total });
  },
};

// 6. SmaiStaking
export const SmaiStakingService = {
  plans: async () => (await supabase.from("staking_plans").select("*").eq("is_active", true).order("term_days")).data ?? [],
  myPositions: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("staking_positions").select("*, plan:staking_plans(*)").eq("user_id", u).order("started_at", { ascending: false })).data ?? [];
  },
  open: async (plan_id: string, amount: number) => {
    const { data, error } = await supabase.rpc("open_staking_position", { _plan_id: plan_id, _amount: amount });
    if (error) throw error; return data;
  },
};

// 7. WaidPredict
export const WaidPredictService = {
  markets: async () => (await supabase.from("prediction_markets").select("*").order("closes_at")).data ?? [],
  myPositions: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("prediction_positions").select("*, market:prediction_markets(*)").eq("user_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  stake: async (market_id: string, side: "yes" | "no", amount: number) => {
    const { data, error } = await supabase.rpc("predict_stake", { _market_id: market_id, _side: side, _amount: amount });
    if (error) throw error; return data;
  },
  create: async (m: { question: string; description?: string; category?: string; closes_at: string }) => {
    const created_by = await uid(); if (!created_by) throw new Error("Auth required");
    return supabase.from("prediction_markets").insert({ ...m, created_by });
  },
};

// 8. Expense Groups
export const ExpenseGroupsService = {
  myGroups: async () => {
    const u = await uid(); if (!u) return [];
    const { data: m } = await supabase.from("expense_group_members").select("group_id").eq("user_id", u);
    const ids = (m ?? []).map(x => x.group_id);
    if (!ids.length) return [];
    return (await supabase.from("expense_groups").select("*").in("id", ids)).data ?? [];
  },
  create: async (name: string) => {
    const me = await uid(); if (!me) throw new Error("Auth required");
    const { data: g } = await supabase.from("expense_groups").insert({ name, created_by: me }).select().single();
    if (g) await supabase.from("expense_group_members").insert({ group_id: g.id, user_id: me });
    return g;
  },
  addMember: async (group_id: string, user_id: string) =>
    supabase.from("expense_group_members").insert({ group_id, user_id }),
  entries: async (group_id: string) =>
    (await supabase.from("expense_entries").select("*").eq("group_id", group_id).order("created_at", { ascending: false })).data ?? [],
  addEntry: async (group_id: string, amount: number, description: string, split_among: string[]) => {
    const paid_by = await uid(); if (!paid_by) throw new Error("Auth required");
    return supabase.from("expense_entries").insert({ group_id, paid_by, amount, description, split_among });
  },
  members: async (group_id: string) =>
    (await supabase.from("expense_group_members").select("*").eq("group_id", group_id)).data ?? [],
};

// 9. Recovery Contacts
export const RecoveryService = {
  myContacts: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("recovery_contacts").select("*").eq("user_id", u).order("created_at", { ascending: false })).data ?? [];
  },
  add: async (c: { contact_name: string; contact_email?: string; contact_phone?: string; relationship?: string; is_heir?: boolean; inheritance_share?: number; contact_user_id?: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("recovery_contacts").insert({ ...c, user_id });
  },
  remove: async (id: string) => supabase.from("recovery_contacts").delete().eq("id", id),
  requestRecovery: async (reason: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("recovery_requests").insert({ user_id, reason });
  },
  myRequests: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("recovery_requests").select("*").eq("user_id", u).order("created_at", { ascending: false })).data ?? [];
  },
};

// 10. Voice Commands (logs; transcription via edge function)
export const VoiceService = {
  log: async (transcript: string, intent?: string, result?: any) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("voice_commands").insert({ user_id, transcript, intent, result });
  },
  history: async () => {
    const u = await uid(); if (!u) return [];
    return (await supabase.from("voice_commands").select("*").eq("user_id", u).order("created_at", { ascending: false }).limit(20)).data ?? [];
  },
};
