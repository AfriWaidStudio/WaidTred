import { supabase } from "@/integrations/supabase/client";

const uid = async () => (await supabase.auth.getUser()).data.user?.id ?? null;

export const OnyixService = {
  async listReserves() {
    const { data, error } = await supabase.from("onyix_reserves").select("*").order("name");
    return { data: data || [], error };
  },
  async listMovements(limit = 100) {
    const { data, error } = await supabase.from("onyix_movements").select("*").order("created_at", { ascending: false }).limit(limit);
    return { data: data || [], error };
  },
  async allocate(reserveId: string, entityId: string, amount: number, reason?: string) {
    return await supabase.rpc("onyix_allocate", { _reserve_id: reserveId, _entity_id: entityId, _amount: amount, _reason: reason ?? null });
  },
  async consume(reserveId: string, entityId: string, amount: number, reason?: string) {
    return await supabase.rpc("onyix_consume", { _reserve_id: reserveId, _entity_id: entityId, _amount: amount, _reason: reason ?? null });
  },
  async burn(reserveId: string, amount: number, reason?: string) {
    return await supabase.rpc("onyix_burn", { _reserve_id: reserveId, _amount: amount, _reason: reason ?? null });
  },
};

export const EntityService = {
  async listEntities() {
    const { data, error } = await supabase.from("konsmik_entities").select("*").order("is_core", { ascending: false }).order("name");
    return { data: data || [], error };
  },
  async listCoreEntities() {
    const { data, error } = await supabase.from("konsmik_entities").select("*").eq("is_core", true).order("name");
    return { data: data || [], error };
  },
  async getTreasury(entityId: string) {
    const { data, error } = await supabase.from("entity_treasuries").select("*").eq("entity_id", entityId).maybeSingle();
    return { data, error };
  },
  async listTreasuries() {
    const { data, error } = await supabase.from("entity_treasuries").select("*, konsmik_entities(name, slug, kind, is_core)").order("balance", { ascending: false });
    return { data: data || [], error };
  },
  async treasuryMovements(entityId: string, limit = 50) {
    const { data, error } = await supabase.from("entity_treasury_movements").select("*").eq("entity_id", entityId).order("created_at", { ascending: false }).limit(limit);
    return { data: data || [], error };
  },
  async move(entityId: string, direction: "credit"|"debit", amount: number, category: string, description?: string) {
    return await supabase.rpc("entity_treasury_move", { _entity_id: entityId, _direction: direction, _amount: amount, _category: category, _description: description ?? null });
  },
};

export const TredBeingService = {
  async listMine() {
    const u = await uid(); if (!u) return { data: [], error: null };
    const { data, error } = await supabase.from("tredbeings").select("*, konsmik_entities(*, entity_treasuries(*))").eq("user_id", u).order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async create(name: string, kind: "saving"|"investment"|"trading"|"merchant", goals: any[] = []) {
    return await supabase.rpc("create_tredbeing", { _name: name, _kind: kind, _goals: goals as any });
  },
};

export const FamilyService = {
  async listMine() {
    const u = await uid(); if (!u) return { data: [], error: null };
    const { data, error } = await supabase.from("family_members").select("families(*, family_treasuries(*))").eq("user_id", u);
    return { data: (data || []).map((r: any) => r.families).filter(Boolean), error };
  },
  async create(name: string) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    const { data: fam, error } = await supabase.from("families").insert({ name, head_id: u }).select().single();
    if (error || !fam) return { data: null, error };
    await supabase.from("family_treasuries").insert({ family_id: fam.id });
    await supabase.from("family_members").insert({ family_id: fam.id, user_id: u, role: "head" });
    return { data: fam, error: null };
  },
  async addMember(familyId: string, userId: string, role: "parent"|"child"|"guardian"|"member" = "member") {
    return await supabase.from("family_members").insert({ family_id: familyId, user_id: userId, role });
  },
  async members(familyId: string) {
    const { data, error } = await supabase.from("family_members").select("*, profiles:user_id(full_name, email, avatar_url)").eq("family_id", familyId);
    return { data: data || [], error };
  },
  async contribute(familyId: string, amount: number, category: "savings"|"insurance"|"investments" = "savings") {
    return await supabase.rpc("family_contribute", { _family_id: familyId, _amount: amount, _category: category });
  },
};

export const CooperativeService = {
  async list() {
    const { data, error } = await supabase.from("cooperatives").select("*, cooperative_treasuries(*)").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async create(name: string, kind: "village"|"association"|"school"|"church"|"community"|"cooperative", description?: string) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    const { data: coop, error } = await supabase.from("cooperatives").insert({ name, kind, description, founder_id: u }).select().single();
    if (error || !coop) return { data: null, error };
    await supabase.from("cooperative_treasuries").insert({ coop_id: coop.id });
    await supabase.from("cooperative_members").insert({ coop_id: coop.id, user_id: u, role: "admin" });
    return { data: coop, error: null };
  },
  async join(coopId: string) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    return await supabase.from("cooperative_members").insert({ coop_id: coopId, user_id: u, role: "member" });
  },
  async contribute(coopId: string, amount: number) {
    return await supabase.rpc("cooperative_contribute", { _coop_id: coopId, _amount: amount });
  },
  async listVotes(coopId: string) {
    const { data, error } = await supabase.from("cooperative_votes").select("*").eq("coop_id", coopId).order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async createVote(coopId: string, title: string, description?: string, closesAt?: string) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    return await supabase.from("cooperative_votes").insert({ coop_id: coopId, title, description, closes_at: closesAt, created_by: u }).select().single();
  },
  async castVote(voteId: string, choice: "yes"|"no"|"abstain") {
    const u = await uid(); if (!u) throw new Error("Auth required");
    return await supabase.from("cooperative_vote_choices").insert({ vote_id: voteId, user_id: u, choice });
  },
};

export const ProsperityService = {
  async getPool() {
    const { data, error } = await supabase.from("prosperity_pool").select("*").maybeSingle();
    return { data, error };
  },
  async listAllocations() {
    const { data, error } = await supabase.from("prosperity_allocations").select("*").order("created_at", { ascending: false }).limit(100);
    return { data: data || [], error };
  },
  async request(amount: number, category: "emergency"|"community"|"poverty"|"education"|"health", reason?: string) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    return await supabase.from("prosperity_allocations").insert({ recipient_id: u, recipient_kind: "user", amount, category, reason });
  },
};

export const MissionService = {
  async list() {
    const { data, error } = await supabase.from("economic_missions").select("*").eq("status", "open").order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async create(title: string, description: string, reward: number, category: string, maxClaims = 1) {
    const u = await uid(); if (!u) throw new Error("Auth required");
    return await supabase.from("economic_missions").insert({ creator_id: u, title, description, reward, category, max_claims: maxClaims }).select().single();
  },
  async claim(missionId: string, proof: Record<string, unknown> = {}) {
    return await supabase.rpc("claim_mission", { _mission_id: missionId, _proof: proof as any });
  },
  async listMyClaims() {
    const u = await uid(); if (!u) return { data: [], error: null };
    const { data, error } = await supabase.from("mission_claims").select("*, economic_missions(*)").eq("claimant_id", u).order("created_at", { ascending: false });
    return { data: data || [], error };
  },
  async verify(claimId: string, approve: boolean) {
    return await supabase.rpc("verify_mission_claim", { _claim_id: claimId, _approve: approve });
  },
};

export const ReputationService = {
  async getScore(userId?: string) {
    const u = userId ?? (await uid()); if (!u) return { data: null, error: null };
    const { data, error } = await supabase.from("reputation_scores").select("*").eq("user_id", u).maybeSingle();
    return { data, error };
  },
  async events(userId?: string, limit = 50) {
    const u = userId ?? (await uid()); if (!u) return { data: [], error: null };
    const { data, error } = await supabase.from("reputation_events").select("*").eq("user_id", u).order("created_at", { ascending: false }).limit(limit);
    return { data: data || [], error };
  },
  async leaderboard(limit = 20) {
    const { data, error } = await supabase.from("reputation_scores").select("*, profiles:user_id(full_name, avatar_url)").order("total", { ascending: false }).limit(limit);
    return { data: data || [], error };
  },
  async recompute(userId?: string) {
    const u = userId ?? (await uid()); if (!u) return;
    return await supabase.rpc("recompute_reputation", { _user_id: u });
  },
};

export const ProofService = {
  async listMine(limit = 50) {
    const u = await uid(); if (!u) return { data: [], error: null };
    const { data, error } = await supabase.from("waidespruf_proofs").select("*").or(`owner_id.eq.${u},issued_to.eq.${u}`).order("created_at", { ascending: false }).limit(limit);
    return { data: data || [], error };
  },
  async issue(subjectType: string, subjectId: string, payload: Record<string, unknown>, issuedTo?: string) {
    return await supabase.rpc("issue_waidespruf_proof", { _subject_type: subjectType, _subject_id: subjectId, _payload: payload as any, _issued_to: issuedTo ?? null });
  },
};

export const KonsnetService = {
  async listEdges() {
    const { data, error } = await supabase.from("konsnet_edges").select("*, from:from_entity(name, slug, kind), to:to_entity(name, slug, kind)").limit(500);
    return { data: data || [], error };
  },
};

export const CivilizationMetricsService = {
  async latest() {
    const { data, error } = await supabase.from("civilization_metrics_daily").select("*").order("snapshot_date", { ascending: false }).limit(1).maybeSingle();
    return { data, error };
  },
  async series(days = 30) {
    const { data, error } = await supabase.from("civilization_metrics_daily").select("*").order("snapshot_date", { ascending: false }).limit(days);
    return { data: data || [], error };
  },
  async snapshotNow() {
    return await supabase.rpc("snapshot_civilization_metrics");
  },
};
