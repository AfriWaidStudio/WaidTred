import { supabase } from "@/integrations/supabase/client";

const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const GoalsService = {
  list: async () => (await supabase.from("savings_goals").select("*").order("created_at",{ascending:false})).data ?? [],
  create: async (g: { name: string; target_amount: number; deadline?: string | null }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return (await supabase.from("savings_goals").insert({ ...g, user_id }).select().single()).data;
  },
  contribute: async (id: string, amount: number) => {
    const { data: g } = await supabase.from("savings_goals").select("current_amount").eq("id", id).single();
    return supabase.from("savings_goals").update({ current_amount: Number(g?.current_amount ?? 0) + amount }).eq("id", id);
  },
};

export const BasketsService = {
  list: async () => (await supabase.from("investment_baskets").select("*").eq("is_active", true)).data ?? [],
  myHoldings: async () => (await supabase.from("user_holdings").select("*, basket:investment_baskets(*)")).data ?? [],
  invest: async (basket_id: string, amount: number, nav: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const units = amount / nav;
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "debit", _amount: amount, _category: "invest", _description: "Basket investment", _reference_type: "investment_baskets", _reference_id: basket_id });
    return supabase.from("user_holdings").insert({ user_id, basket_id, units, avg_cost: nav });
  },
};

export const YieldService = {
  list: async () => (await supabase.from("yield_stakes").select("*").eq("status","active")).data ?? [],
  stake: async (principal: number, apy = 8) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "debit", _amount: principal, _category: "yield_stake", _description: "Smai Yield stake" });
    return supabase.from("yield_stakes").insert({ user_id, principal, apy });
  },
  unstake: async (id: string, principal: number, accrued: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "credit", _amount: principal + accrued, _category: "yield_unstake", _description: "Yield unstake + interest" });
    return supabase.from("yield_stakes").update({ status: "closed", unstaked_at: new Date().toISOString() }).eq("id", id);
  },
};

export const LoansService = {
  list: async () => (await supabase.from("loans").select("*").order("created_at",{ascending:false})).data ?? [],
  apply: async (l: { principal: number; term_months: number; purpose: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const interest_rate = 12; const monthly_payment = (l.principal * (1 + interest_rate / 100)) / l.term_months;
    return supabase.from("loans").insert({ ...l, user_id, interest_rate, balance: l.principal, monthly_payment });
  },
};

export const InsuranceService = {
  list: async () => (await supabase.from("insurance_policies").select("*")).data ?? [],
  buy: async (p: { policy_type: string; coverage_amount: number; monthly_premium: number }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("insurance_policies").insert({ ...p, user_id });
  },
};

export const PensionService = {
  get: async () => (await supabase.from("pensions").select("*").maybeSingle()).data,
  upsert: async (p: { monthly_contribution: number; retirement_age: number; employer_match_pct?: number }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("pensions").upsert({ ...p, user_id }, { onConflict: "user_id" });
  },
};

export const GroupSaveService = {
  list: async () => (await supabase.from("savings_groups").select("*").eq("status","active").order("created_at",{ascending:false})).data ?? [],
  myGroups: async () => {
    const user_id = await uid(); if (!user_id) return [];
    const { data } = await supabase.from("group_members").select("group:savings_groups(*)").eq("user_id", user_id);
    return (data ?? []).map((r: any) => r.group);
  },
  create: async (g: { name: string; description?: string; contribution_amount: number; frequency: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const { data: grp } = await supabase.from("savings_groups").insert({ ...g, created_by: user_id }).select().single();
    if (grp) await supabase.from("group_members").insert({ group_id: grp.id, user_id, role: "creator" });
    return grp;
  },
  join: async (group_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("group_members").insert({ group_id, user_id });
  },
  contribute: async (group_id: string, amount: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "debit", _amount: amount, _category: "group_save", _description: "Group contribution", _reference_type: "savings_groups", _reference_id: group_id });
    return supabase.from("group_contributions").insert({ group_id, user_id, amount });
  },
};

export const BudgetService = {
  current: async () => {
    const month = new Date().toISOString().slice(0, 7) + "-01";
    return (await supabase.from("budgets").select("*, categories:budget_categories(*)").eq("month", month).maybeSingle()).data;
  },
  create: async (total: number, cats: { category: string; allocated: number }[]) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const month = new Date().toISOString().slice(0, 7) + "-01";
    const { data: b } = await supabase.from("budgets").upsert({ user_id, month, total_budget: total }, { onConflict: "user_id,month" }).select().single();
    if (b) {
      await supabase.from("budget_categories").delete().eq("budget_id", b.id);
      await supabase.from("budget_categories").insert(cats.map(c => ({ ...c, budget_id: b.id, user_id })));
    }
    return b;
  },
};

export const TaxVaultService = {
  get: async () => (await supabase.from("tax_setasides").select("*").maybeSingle()).data,
  upsert: async (pct: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("tax_setasides").upsert({ user_id, pct }, { onConflict: "user_id" });
  },
};
