import { supabase } from "@/integrations/supabase/client";

export const TransactionService = {
  async getUserTransactions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  },

  async getAllTransactions(limit = 100) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  },

  async createTransaction(tx: {
    user_id: string;
    type: "transfer" | "airtime" | "data" | "bill" | "payment" | "received" | "qr-pay";
    title: string;
    amount: number;
    description?: string;
    currency?: string;
    recipient?: string;
    sender_country?: string;
    receiver_country?: string;
  }) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...tx,
        status: "pending",
      })
      .select()
      .single();
    return { data, error };
  },
};
