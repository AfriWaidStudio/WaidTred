import { supabase } from "@/integrations/supabase/client";
const uid = async () => (await supabase.auth.getUser()).data.user?.id;

export const MissionsService = {
  list: async () => (await supabase.from("missions").select("*, my:user_missions(*)").eq("is_active", true)).data ?? [],
  claim: async (mission_id: string, reward: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    await supabase.rpc("process_wallet_movement", { _user_id: user_id, _direction: "credit", _amount: reward, _category: "mission_reward", _description: "Mission reward" });
    return supabase.from("user_missions").upsert({ user_id, mission_id, completed: true, rewarded_at: new Date().toISOString(), progress: 100 }, { onConflict: "user_id,mission_id" });
  },
};

export const CourseService = {
  list: async () => (await supabase.from("courses").select("*, lessons(count), enrolled:enrollments(progress_pct, completed_at)").eq("is_active", true)).data ?? [],
  enroll: async (course_id: string) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("enrollments").upsert({ user_id, course_id }, { onConflict: "user_id,course_id" });
  },
  updateProgress: async (course_id: string, pct: number) => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    return supabase.from("enrollments").update({ progress_pct: pct, completed_at: pct >= 100 ? new Date().toISOString() : null }).eq("user_id", user_id).eq("course_id", course_id);
  },
};

export const AffiliateService = {
  myLink: async () => (await supabase.from("affiliate_links").select("*").maybeSingle()).data,
  create: async () => {
    const user_id = await uid(); if (!user_id) throw new Error("Auth required");
    const code = "aff_" + Math.random().toString(36).slice(2, 10);
    return supabase.from("affiliate_links").upsert({ user_id, code }, { onConflict: "user_id" });
  },
};
