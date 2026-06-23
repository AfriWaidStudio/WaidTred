import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const ScheduledActionsService = {
  list: async () => (await supabase.from("scheduled_actions").select("*").order("scheduled_for")).data ?? [],
  create: async (a: { action_type: string; scheduled_for: string; message?: string; target_contact?: string; target_user_id?: string; amount?: number }) => {
    const { data, error } = await supabase.rpc("create_scheduled_action", {
      _action_type: a.action_type, _scheduled_for: a.scheduled_for, _message: a.message ?? null,
      _target_contact: a.target_contact ?? null, _target_user_id: a.target_user_id ?? null, _amount: a.amount ?? null,
    });
    if (error) throw error; return data;
  },
  cancel: async (id: string) => supabase.from("scheduled_actions").update({ status: "cancelled" }).eq("id", id),
};

export const NewsService = {
  list: async () => (await supabase.from("news_articles").select("*").order("published_at", { ascending: false }).limit(50)).data ?? [],
};

export const TradeService = {
  history: async () => (await supabase.from("trade_orders").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  place: async (o: { side: "buy" | "sell"; asset_symbol: string; quantity: number; price: number }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const total = o.quantity * o.price;
    if (o.side === "buy") await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "debit", _amount: total, _category: "trade_buy", _description: `Buy ${o.quantity} ${o.asset_symbol}` });
    else await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "credit", _amount: total, _category: "trade_sell", _description: `Sell ${o.quantity} ${o.asset_symbol}` });
    return supabase.from("trade_orders").insert({ user_id, ...o });
  },
  cancel: async (id: string) => supabase.from("trade_orders").update({ status: "cancelled" }).eq("id", id),
};

export const FxService = {
  list: async () => (await supabase.from("fx_quotes").select("*").order("base")).data ?? [],
};

export const PosService = {
  list: async () => (await supabase.from("pos_sales").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  charge: async (amount: number, method = "qr") => {
    const merchant_id = await uid(); if (!merchant_id) throw new Error("Auth required");
    return supabase.from("pos_sales").insert({ merchant_id, amount, method });
  },
};

export const AkademiProgressService = {
  myEnrollments: async () => (await supabase.from("enrollments").select("*, course:courses(*)").order("enrolled_at", { ascending: false })).data ?? [],
  enroll: async (course_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("enrollments").insert({ user_id, course_id });
  },
  updateProgress: async (id: string, progress_pct: number) => supabase.from("enrollments").update({ progress_pct, completed_at: progress_pct >= 100 ? new Date().toISOString() : null }).eq("id", id),
};
