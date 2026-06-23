import { supabase } from "@/integrations/supabase/client";

export type InventoryItem = {
  id: string;
  asset_type: "token" | "crypto" | "giftcard" | "smaipin";
  asset_name: string;
  description: string | null;
  image_url: string | null;
  value: number;
  price_in_sika: number;
  quantity: number;
  status: "available" | "low" | "out_of_stock" | "disabled";
  metadata: Record<string, any>;
  created_at: string | null;
  updated_at: string | null;
};

export type SokoOrder = {
  id: string;
  user_id: string;
  asset_type: string;
  asset_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_type: "buy" | "sell";
  status: "pending" | "processing" | "completed" | "failed" | "rejected";
  delivery_status: "pending" | "delivered" | "failed";
  delivery_data: Record<string, any>;
  proof_url: string | null;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PricingRule = {
  id: string;
  asset_type: string;
  asset_name: string | null;
  base_price: number;
  spread_percentage: number;
  min_price: number | null;
  max_price: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export const SokoPlaceService = {
  // ── Inventory ──
  async getInventory(assetType?: string) {
    let query = (supabase as any).from("sokoplace_inventory").select("*").order("created_at", { ascending: false });
    if (assetType) query = query.eq("asset_type", assetType);
    const { data, error } = await query;
    return { data: (data || []) as InventoryItem[], error };
  },

  async getAvailableInventory() {
    const { data, error } = await (supabase as any)
      .from("sokoplace_inventory")
      .select("*")
      .neq("status", "disabled")
      .neq("status", "out_of_stock")
      .order("asset_type");
    return { data: (data || []) as InventoryItem[], error };
  },

  async getInventoryItem(id: string) {
    const { data, error } = await (supabase as any)
      .from("sokoplace_inventory")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return { data: data as InventoryItem | null, error };
  },

  async upsertInventory(item: Partial<InventoryItem> & { asset_name: string; asset_type: string }) {
    const { data, error } = await (supabase as any)
      .from("sokoplace_inventory")
      .upsert({ ...item, updated_at: new Date().toISOString() })
      .select()
      .single();
    return { data: data as InventoryItem | null, error };
  },

  async deleteInventoryItem(id: string) {
    return (supabase as any).from("sokoplace_inventory").delete().eq("id", id);
  },

  // ── Orders ──
  async createOrder(order: {
    user_id: string;
    asset_type: string;
    asset_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    order_type: "buy" | "sell";
    proof_url?: string;
  }) {
    const { data, error } = await (supabase as any)
      .from("sokoplace_orders")
      .insert(order)
      .select()
      .single();
    return { data: data as SokoOrder | null, error };
  },

  async getUserOrders(userId: string) {
    const { data, error } = await (supabase as any)
      .from("sokoplace_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data: (data || []) as SokoOrder[], error };
  },

  async getAllOrders() {
    const { data, error } = await (supabase as any)
      .from("sokoplace_orders")
      .select("*")
      .order("created_at", { ascending: false });
    return { data: (data || []) as SokoOrder[], error };
  },

  async updateOrderStatus(orderId: string, status: string, deliveryStatus?: string, deliveryData?: any, adminNotes?: string) {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (deliveryStatus) update.delivery_status = deliveryStatus;
    if (deliveryData) update.delivery_data = deliveryData;
    if (adminNotes) update.admin_notes = adminNotes;
    const { error } = await (supabase as any).from("sokoplace_orders").update(update).eq("id", orderId);
    return { error };
  },

  // ── Pricing ──
  async getPricingRules() {
    const { data, error } = await (supabase as any)
      .from("pricing_rules")
      .select("*")
      .order("asset_type");
    return { data: (data || []) as PricingRule[], error };
  },

  async upsertPricing(rule: Partial<PricingRule> & { asset_type: string }) {
    const { data, error } = await (supabase as any)
      .from("pricing_rules")
      .upsert({ ...rule, updated_at: new Date().toISOString() })
      .select()
      .single();
    return { data: data as PricingRule | null, error };
  },

  async deletePricing(id: string) {
    return (supabase as any).from("pricing_rules").delete().eq("id", id);
  },

  // ── Helpers ──
  calculatePrice(basePrice: number, spreadPct: number) {
    return basePrice + basePrice * (spreadPct / 100);
  },
};
