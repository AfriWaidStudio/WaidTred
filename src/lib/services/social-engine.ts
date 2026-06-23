import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const CirclesService = {
  list: async () => (await supabase.from("circles").select("*, members:circle_members(count)").order("created_at",{ascending:false})).data ?? [],
  create: async (c: { name: string; description?: string; is_private?: boolean }) => {
    const created_by = await uid(); if (!created_by) throw new Error("Auth required");
    const { data: circle } = await supabase.from("circles").insert({ ...c, created_by }).select().single();
    if (circle) await supabase.from("circle_members").insert({ circle_id: circle.id, user_id: created_by });
    return circle;
  },
  join: async (circle_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("circle_members").insert({ circle_id, user_id });
  },
};

export const FeedService = {
  list: async () => (await supabase.from("posts").select("*, author:profiles!posts_user_id_fkey(full_name, avatar_url)").order("created_at",{ascending:false}).limit(50)).data ?? [],
  post: async (body: string, circle_id?: string | null) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("posts").insert({ user_id, body, circle_id: circle_id ?? null });
  },
  like: async (post_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("post_likes").insert({ post_id, user_id });
  },
  comment: async (post_id: string, body: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("post_comments").insert({ post_id, user_id, body });
  },
};

export const LeaderboardService = {
  topSavers: async () => {
    const { data } = await supabase.from("wallets").select("user_id, total_balance, profile:profiles!wallets_user_id_fkey(full_name, avatar_url)").order("total_balance",{ascending:false}).limit(20);
    return data ?? [];
  },
};
