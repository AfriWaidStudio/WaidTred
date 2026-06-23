import { supabase } from "@/integrations/supabase/client";

export type ProviderStatus = "active" | "inactive" | "testing" | "error" | "disabled";
export type ProviderServiceKind =
  | "deposit" | "payout" | "virtual_account" | "transfer"
  | "airtime" | "data" | "bill" | "electricity" | "cable" | "education" | "fx" | "card";

export type Provider = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: ProviderStatus;
  priority: number;
  countries: string[];
  service_kinds: ProviderServiceKind[];
  base_url: string | null;
  logo_url: string | null;
  config: any;
  is_sandbox: boolean;
  created_at: string;
  updated_at: string;
};

export const ProviderService = {
  // Providers
  list: async () => (await supabase.from("providers" as any).select("*").order("priority")).data as unknown as Provider[] | null,
  get: async (id: string) => (await supabase.from("providers" as any).select("*").eq("id", id).maybeSingle()).data as unknown as Provider | null,
  create: (p: Partial<Provider>) => supabase.from("providers" as any).insert(p as any),
  update: (id: string, p: Partial<Provider>) => supabase.from("providers" as any).update(p as any).eq("id", id),
  remove: (id: string) => supabase.from("providers" as any).delete().eq("id", id),
  setStatus: (id: string, status: ProviderStatus) => supabase.from("providers" as any).update({ status }).eq("id", id),
  setPriority: (id: string, priority: number) => supabase.from("providers" as any).update({ priority }).eq("id", id),

  // Credentials
  listCredentials: async (provider_id: string) =>
    (await supabase.from("provider_credentials" as any).select("*").eq("provider_id", provider_id).order("key_name")).data ?? [],
  upsertCredential: (c: { id?: string; provider_id: string; key_name: string; env_var: string; description?: string; is_sandbox?: boolean }) =>
    c.id
      ? supabase.from("provider_credentials" as any).update(c).eq("id", c.id)
      : supabase.from("provider_credentials" as any).insert(c),
  deleteCredential: (id: string) => supabase.from("provider_credentials" as any).delete().eq("id", id),

  // Services
  listServices: async (provider_id: string) =>
    (await supabase.from("provider_services" as any).select("*").eq("provider_id", provider_id).order("service_kind")).data ?? [],
  upsertService: (s: any) =>
    s.id
      ? supabase.from("provider_services" as any).update(s).eq("id", s.id)
      : supabase.from("provider_services" as any).insert(s),
  toggleService: (id: string, enabled: boolean) => supabase.from("provider_services" as any).update({ enabled }).eq("id", id),

  // Routes
  listRoutes: async (filter?: { service_kind?: string; country?: string }) => {
    let q = supabase.from("provider_routes" as any).select("*, provider:providers(code,name,status)").order("priority");
    if (filter?.service_kind) q = q.eq("service_kind", filter.service_kind);
    if (filter?.country) q = q.eq("country", filter.country);
    return (await q).data ?? [];
  },
  upsertRoute: (r: any) =>
    r.id
      ? supabase.from("provider_routes" as any).update(r).eq("id", r.id)
      : supabase.from("provider_routes" as any).insert(r),
  deleteRoute: (id: string) => supabase.from("provider_routes" as any).delete().eq("id", id),
  toggleRoute: (id: string, enabled: boolean) => supabase.from("provider_routes" as any).update({ enabled }).eq("id", id),

  // Logs
  listLogs: async (provider_id?: string, limit = 100) => {
    let q = supabase.from("provider_logs" as any).select("*, provider:providers(code,name)").order("created_at", { ascending: false }).limit(limit);
    if (provider_id) q = q.eq("provider_id", provider_id);
    return (await q).data ?? [];
  },

  // Webhooks
  listWebhooks: async (provider_id?: string, limit = 100) => {
    let q = supabase.from("provider_webhooks" as any).select("*, provider:providers(code,name)").order("created_at", { ascending: false }).limit(limit);
    if (provider_id) q = q.eq("provider_id", provider_id);
    return (await q).data ?? [];
  },

  // Routing resolution (test in admin)
  resolve: async (service_kind: ProviderServiceKind, country: string) =>
    (await supabase.rpc("resolve_provider" as any, { _service: service_kind, _country: country })).data ?? [],
};

export const PROVIDER_SERVICE_KINDS: ProviderServiceKind[] = [
  "deposit","payout","virtual_account","transfer","airtime","data","bill","electricity","cable","education","fx","card"
];

export const PROVIDER_STATUSES: ProviderStatus[] = ["active","inactive","testing","error","disabled"];
