import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const StorefrontService = {
  list: async () => (await supabase.from("storefronts").select("*").eq("status","active")).data ?? [],
  myStore: async () => (await supabase.from("storefronts").select("*").maybeSingle()).data,
  create: async (s: { name: string; slug: string; description?: string }) => {
    const owner_id = await uid(); if (!owner_id) throw new Error("Auth required");
    return supabase.from("storefronts").insert({ ...s, owner_id });
  },
};

export const ReviewService = {
  forProduct: async (product_id: string) => (await supabase.from("product_reviews").select("*, author:profiles!product_reviews_user_id_fkey(full_name, avatar_url)").eq("product_id", product_id).order("created_at",{ascending:false})).data ?? [],
  myAll: async () => (await supabase.from("product_reviews").select("*").order("created_at",{ascending:false})).data ?? [],
  add: async (r: { product_id: string; rating: number; title?: string; body?: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("product_reviews").insert({ ...r, user_id });
  },
};

export const WishlistService = {
  list: async () => (await supabase.from("wishlists").select("*, product:sokoplace_inventory!wishlists_product_id_fkey(*)").order("created_at",{ascending:false})).data ?? [],
  add: async (product_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("wishlists").upsert({ user_id, product_id }, { onConflict: "user_id,product_id" });
  },
  remove: async (product_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("wishlists").delete().eq("user_id", user_id).eq("product_id", product_id);
  },
};

export const FlashDealService = {
  active: async () => (await supabase.from("flash_deals").select("*, product:sokoplace_inventory!flash_deals_product_id_fkey(*)").eq("is_active", true).gte("ends_at", new Date().toISOString()).order("ends_at")).data ?? [],
};

export const ShipmentsService = {
  list: async () => (await supabase.from("shipments").select("*").order("created_at",{ascending:false})).data ?? [],
  create: async (s: { order_id?: string; carrier: string; tracking_code: string; eta?: string }) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("shipments").insert({ ...s, user_id });
  },
};
