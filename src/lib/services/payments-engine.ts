import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const SplitBillsService = {
  list: async () => (await supabase.from("split_bills").select("*, participants:split_participants(*)").order("created_at",{ascending:false})).data ?? [],
  create: async (b: { title: string; total_amount: number }, participants: { contact_name: string; share: number }[]) => {
    const creator_id = await uid(); if (!creator_id) throw new Error("Auth required");
    const { data: bill } = await supabase.from("split_bills").insert({ ...b, creator_id }).select().single();
    if (bill) await supabase.from("split_participants").insert(participants.map(p => ({ ...p, bill_id: bill.id })));
    return bill;
  },
  markPaid: async (id: string) => supabase.from("split_participants").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", id),
};

export const RequestMoneyService = {
  list: async () => (await supabase.from("payment_requests").select("*").order("created_at",{ascending:false})).data ?? [],
  create: async (r: { payer_contact: string; amount: number; reason?: string }) => {
    const requester_id = await uid(); if (!requester_id) throw new Error("Auth required");
    return supabase.from("payment_requests").insert({ ...r, requester_id });
  },
  respond: async (id: string, status: "approved" | "declined") => supabase.from("payment_requests").update({ status }).eq("id", id),
};

export const SubscriptionsService = {
  list: async () => (await supabase.from("subscriptions").select("*").order("next_charge")).data ?? [],
  create: async (s: { merchant_name: string; amount: number; frequency: string; next_charge: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("subscriptions").insert({ ...s, user_id });
  },
  cancel: async (id: string) => supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", id),
};

export const EscrowService = {
  list: async () => (await supabase.from("escrow_deals").select("*").order("created_at",{ascending:false})).data ?? [],
  open: async (d: { seller_id: string; amount: number; description: string }) => {
    const buyer_id = await uid(); if (!buyer_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: buyer_id, _direction: "debit", _amount: d.amount, _category: "escrow_hold", _description: d.description });
    return supabase.from("escrow_deals").insert({ ...d, buyer_id });
  },
  confirm: async (id: string, side: "buyer" | "seller") => {
    const patch = side === "buyer" ? { buyer_confirmed: true } : { seller_confirmed: true };
    return supabase.from("escrow_deals").update(patch).eq("id", id);
  },
};

export const PayrollService = {
  runs: async () => (await supabase.from("payroll_runs").select("*").order("created_at",{ascending:false})).data ?? [],
  employees: async () => (await supabase.from("payroll_employees").select("*").is("run_id", null)).data ?? [],
  addEmployee: async (e: { employee_name: string; role: string; salary: number }) => {
    const employer_id = await uid(); if (!employer_id) throw new Error("Auth required");
    return supabase.from("payroll_employees").insert({ ...e, employer_id });
  },
  run: async (period: string) => {
    const employer_id = await uid(); if (!employer_id) throw new Error("Auth required");
    const { data: emps } = await supabase.from("payroll_employees").select("*").eq("employer_id", employer_id).is("run_id", null);
    const total = (emps ?? []).reduce((a, e: any) => a + Number(e.salary), 0);
    const { data: run } = await supabase.from("payroll_runs").insert({ employer_id, period, total_amount: total, status: "completed" }).select().single();
    if (run && emps?.length) {
      await supabase.from("payroll_employees").update({ run_id: run.id, paid: true }).in("id", emps.map((e: any) => e.id));
      await supabase.rpc("process_wallet_movement", { _user_id: employer_id, _direction: "debit", _amount: total, _category: "payroll", _description: `Payroll ${period}` });
    }
    return run;
  },
};

export const TipJarService = {
  myJar: async () => (await supabase.from("tip_jars").select("*").maybeSingle()).data,
  create: async (j: { slug: string; display_name: string; message?: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("tip_jars").upsert({ ...j, user_id }, { onConflict: "user_id" });
  },
};

export const VirtualCardsService = {
  list: async () => (await supabase.from("virtual_cards").select("*").order("created_at",{ascending:false})).data ?? [],
  create: async (c: { nickname: string; spend_limit: number }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const card_number_last4 = Math.floor(1000 + Math.random() * 9000).toString();
    return supabase.from("virtual_cards").insert({ ...c, user_id, card_number_last4 });
  },
  toggleFreeze: async (id: string, frozen: boolean) => supabase.from("virtual_cards").update({ status: frozen ? "frozen" : "active" }).eq("id", id),
};

export const BillPayService = {
  list: async () => (await supabase.from("bill_payments").select("*").order("created_at",{ascending:false})).data ?? [],
  pay: async (b: { biller: string; account_number: string; amount: number }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "debit", _amount: b.amount, _category: "bill", _description: `${b.biller} bill` });
    return supabase.from("bill_payments").insert({ ...b, user_id, status: "completed" });
  },
};
