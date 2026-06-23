import { supabase } from "@/integrations/supabase/client";

export const WalletService = {
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { data, error };
  },

  async getMyWallet() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { data: null, error: new Error("Not authenticated") };
    return this.getWallet(u.user.id);
  },

  async getAllWallets() {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .order("total_balance", { ascending: false });
    return { data: data || [], error };
  },

  async adjustBalance(walletId: string, newAvailable: number, newLocked: number) {
    const total = newAvailable + newLocked;
    const { error } = await supabase
      .from("wallets")
      .update({
        available_balance: newAvailable,
        locked_balance: newLocked,
        total_balance: total,
        last_updated: new Date().toISOString(),
      })
      .eq("id", walletId);
    return { error };
  },

  async getLedger(limit = 50) {
    const { data, error } = await supabase
      .from("wallet_ledger")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  },

  async sendMoney(recipientId: string, amount: number, description?: string) {
    const { data, error } = await supabase.rpc("send_money", {
      _recipient_id: recipientId,
      _amount: amount,
      _description: description ?? null,
    });
    return { data, error };
  },

  async findUserByPhoneOrEmail(query: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, avatar_url")
      .or(`phone.eq.${query},email.eq.${query}`)
      .maybeSingle();
    return data;
  },
};
