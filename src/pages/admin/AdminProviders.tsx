import { useEffect, useState } from "react";
import { Plus, RefreshCw, Settings, Trash2, Power, ChevronRight, Search, Activity, Network, Globe, Webhook } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProviderService, Provider, ProviderStatus, ProviderServiceKind, PROVIDER_SERVICE_KINDS, PROVIDER_STATUSES } from "@/lib/services/provider-service";

const STATUS_COLORS: Record<ProviderStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  testing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  disabled: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function AdminProviders() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Provider> | null>(null);
  const [detail, setDetail] = useState<Provider | null>(null);

  const refresh = async () => {
    setLoading(true);
    const data = await ProviderService.list();
    setProviders(data ?? []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const filtered = providers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!editing?.code || !editing?.name) return toast({ title: "Code and name required", variant: "destructive" });
    const payload = {
      code: editing.code!,
      name: editing.name!,
      description: editing.description ?? null,
      status: (editing.status ?? "inactive") as ProviderStatus,
      priority: Number(editing.priority ?? 100),
      countries: editing.countries ?? [],
      service_kinds: editing.service_kinds ?? [],
      base_url: editing.base_url ?? null,
      is_sandbox: editing.is_sandbox ?? true,
    };
    const res = editing.id ? await ProviderService.update(editing.id, payload) : await ProviderService.create(payload);
    if ((res as any).error) toast({ title: "Save failed", description: (res as any).error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); setEditing(null); refresh(); }
  };

  const toggleStatus = async (p: Provider) => {
    const next: ProviderStatus = p.status === "active" ? "inactive" : "active";
    await ProviderService.setStatus(p.id, next);
    toast({ title: `${p.name} → ${next}` });
    refresh();
  };

  const remove = async (p: Provider) => {
    if (!confirm(`Delete provider ${p.name}? This removes credentials, services, and routes.`)) return;
    await ProviderService.remove(p.id);
    refresh();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search providers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>
        <Button variant="outline" size="sm" onClick={refresh}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        <Button variant="hero" size="sm" onClick={() => setEditing({ status: "inactive", priority: 100, is_sandbox: true, countries: [], service_kinds: [] })}>
          <Plus className="w-4 h-4 mr-1" />Add Provider
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading providers...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No providers configured.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="glass-card p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">{p.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    {p.is_sandbox && <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">sandbox</span>}
                    <span className="text-[10px] text-muted-foreground">priority {p.priority}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{p.description || "—"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.countries.slice(0,6).map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/70 text-foreground">{c}</span>)}
                    {p.countries.length > 6 && <span className="text-[10px] text-muted-foreground">+{p.countries.length - 6}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.service_kinds.slice(0,8).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{s}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(p)} title="Toggle">
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDetail(p)}>
                    <Settings className="w-3.5 h-3.5 mr-1" />Configure
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p)} className="text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Provider" : "Add Provider"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Code (unique)</label>
                <Input value={editing.code ?? ""} onChange={e => setEditing({ ...editing, code: e.target.value.toLowerCase().replace(/\s+/g,"_") })} disabled={!!editing.id} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Display name</label>
                <Input value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Description</label>
                <Input value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Base URL</label>
                <Input value={editing.base_url ?? ""} onChange={e => setEditing({ ...editing, base_url: e.target.value })} placeholder="https://api.provider.com" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Priority (lower = first)</label>
                <Input type="number" value={editing.priority ?? 100} onChange={e => setEditing({ ...editing, priority: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={editing.status ?? "inactive"} onValueChange={(v: ProviderStatus) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROVIDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={!!editing.is_sandbox} onCheckedChange={(v) => setEditing({ ...editing, is_sandbox: v })} />
                <span className="text-xs text-muted-foreground">Sandbox mode</span>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Countries (comma-separated ISO codes)</label>
                <Input value={(editing.countries ?? []).join(",")} onChange={e => setEditing({ ...editing, countries: e.target.value.split(",").map(s => s.trim().toUpperCase()).filter(Boolean) })} placeholder="NG,GH,KE" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Service kinds</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {PROVIDER_SERVICE_KINDS.map(s => {
                    const on = (editing.service_kinds ?? []).includes(s);
                    return (
                      <button key={s} type="button" onClick={() => {
                        const cur = new Set(editing.service_kinds ?? []);
                        on ? cur.delete(s) : cur.add(s);
                        setEditing({ ...editing, service_kinds: Array.from(cur) as ProviderServiceKind[] });
                      }} className={`text-[10px] px-2 py-1 rounded border ${on ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary/50 text-muted-foreground border-border"}`}>{s}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail / config panel */}
      <Dialog open={!!detail} onOpenChange={o => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.name} · Configuration</DialogTitle></DialogHeader>
          {detail && <ProviderDetail provider={detail} onChanged={refresh} />}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function ProviderDetail({ provider, onChanged }: { provider: Provider; onChanged: () => void }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("credentials");
  const [creds, setCreds] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newCred, setNewCred] = useState({ key_name: "", env_var: "", description: "" });
  const [newRoute, setNewRoute] = useState({ service_kind: "deposit", country: "NG", priority: 100, weight: 1 });

  const load = async () => {
    setCreds(await ProviderService.listCredentials(provider.id));
    setServices(await ProviderService.listServices(provider.id));
    setRoutes(await ProviderService.listRoutes());
    setLogs(await ProviderService.listLogs(provider.id, 50));
    setWebhooks(await ProviderService.listWebhooks(provider.id, 50));
  };
  useEffect(() => { load(); }, [provider.id]);

  const addCred = async () => {
    if (!newCred.key_name || !newCred.env_var) return;
    await ProviderService.upsertCredential({ ...newCred, provider_id: provider.id, is_sandbox: provider.is_sandbox });
    setNewCred({ key_name: "", env_var: "", description: "" });
    load();
    toast({ title: "Credential added — set the env var in Lovable Cloud secrets" });
  };

  const addRoute = async () => {
    await ProviderService.upsertRoute({ ...newRoute, provider_id: provider.id });
    load();
    toast({ title: "Route added" });
  };

  const myRoutes = routes.filter((r: any) => r.provider_id === provider.id);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="credentials"><Settings className="w-3.5 h-3.5 mr-1" />Credentials</TabsTrigger>
        <TabsTrigger value="services"><Activity className="w-3.5 h-3.5 mr-1" />Services</TabsTrigger>
        <TabsTrigger value="routes"><Network className="w-3.5 h-3.5 mr-1" />Routes</TabsTrigger>
        <TabsTrigger value="webhooks"><Webhook className="w-3.5 h-3.5 mr-1" />Webhooks</TabsTrigger>
        <TabsTrigger value="logs"><Globe className="w-3.5 h-3.5 mr-1" />Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="credentials" className="space-y-3 mt-4">
        <div className="text-xs text-muted-foreground">Credentials reference Lovable Cloud secret names. Never paste secret values here — add them as project secrets so edge functions can read them at runtime.</div>
        <div className="space-y-2">
          {creds.map((c: any) => (
            <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border">
              <div className="flex-1">
                <div className="text-sm font-medium">{c.key_name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{c.env_var}</div>
                {c.description && <div className="text-[11px] text-muted-foreground">{c.description}</div>}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.is_sandbox ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{c.is_sandbox ? "sandbox" : "live"}</span>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await ProviderService.deleteCredential(c.id); load(); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border">
          <Input placeholder="key name (e.g. secret_key)" value={newCred.key_name} onChange={e => setNewCred({ ...newCred, key_name: e.target.value })} />
          <Input placeholder="ENV_VAR_NAME" value={newCred.env_var} onChange={e => setNewCred({ ...newCred, env_var: e.target.value.toUpperCase().replace(/\s+/g,"_") })} />
          <Button variant="hero" onClick={addCred}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button>
        </div>
      </TabsContent>

      <TabsContent value="services" className="space-y-2 mt-4">
        {PROVIDER_SERVICE_KINDS.map(k => {
          const existing = services.find((s: any) => s.service_kind === k);
          return (
            <div key={k} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border">
              <div className="flex-1">
                <div className="text-sm font-medium">{k}</div>
                {existing && <div className="text-[11px] text-muted-foreground">fee {existing.fee_percent}% + {existing.fee_flat} flat · min {existing.min_amount}{existing.max_amount ? ` · max ${existing.max_amount}` : ""}</div>}
              </div>
              <Switch
                checked={existing?.enabled ?? false}
                onCheckedChange={async (v) => {
                  if (existing) await ProviderService.toggleService(existing.id, v);
                  else await ProviderService.upsertService({ provider_id: provider.id, service_kind: k, enabled: v, fee_percent: 1.5 });
                  load();
                }}
              />
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="routes" className="space-y-2 mt-4">
        <div className="text-xs text-muted-foreground">Routes map a service in a country to this provider. Lower priority is tried first; multiple providers per (service, country) enables automatic failover.</div>
        {myRoutes.length === 0 && <div className="text-sm text-muted-foreground py-4">No routes yet.</div>}
        {myRoutes.map((r: any) => (
          <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border">
            <div className="flex-1 text-sm">
              <span className="font-medium">{r.service_kind}</span> · <span className="text-muted-foreground">{r.country}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">priority {r.priority} · weight {r.weight}</span>
            </div>
            <Switch checked={r.enabled} onCheckedChange={async (v) => { await ProviderService.toggleRoute(r.id, v); load(); }} />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await ProviderService.deleteRoute(r.id); load(); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border">
          <Select value={newRoute.service_kind} onValueChange={v => setNewRoute({ ...newRoute, service_kind: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROVIDER_SERVICE_KINDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Country (NG)" value={newRoute.country} onChange={e => setNewRoute({ ...newRoute, country: e.target.value.toUpperCase() })} />
          <Input type="number" placeholder="Priority" value={newRoute.priority} onChange={e => setNewRoute({ ...newRoute, priority: Number(e.target.value) })} />
          <Input type="number" placeholder="Weight" value={newRoute.weight} onChange={e => setNewRoute({ ...newRoute, weight: Number(e.target.value) })} />
          <Button variant="hero" onClick={addRoute}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button>
        </div>
      </TabsContent>

      <TabsContent value="webhooks" className="space-y-2 mt-4">
        {webhooks.length === 0 && <div className="text-sm text-muted-foreground py-4">No webhook events yet.</div>}
        {webhooks.map((w: any) => (
          <div key={w.id} className="p-2.5 rounded-lg bg-secondary/40 border border-border text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-muted-foreground">{new Date(w.created_at).toLocaleString()}</span>
              <span className="font-medium">{w.event_type || "(unknown)"}</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${
                w.status === "processed" ? "bg-emerald-500/15 text-emerald-400" :
                w.status === "failed" ? "bg-destructive/15 text-destructive" :
                "bg-amber-500/15 text-amber-400"
              }`}>{w.status}</span>
            </div>
            {w.error && <div className="text-destructive">{w.error}</div>}
          </div>
        ))}
      </TabsContent>

      <TabsContent value="logs" className="space-y-2 mt-4">
        {logs.length === 0 && <div className="text-sm text-muted-foreground py-4">No outbound calls logged yet.</div>}
        {logs.map((l: any) => (
          <div key={l.id} className="p-2.5 rounded-lg bg-secondary/40 border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
              <span className="font-medium">{l.method} {l.endpoint}</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${l.success ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`}>{l.status_code} · {l.latency_ms}ms</span>
            </div>
            {l.error && <div className="text-destructive mt-1">{l.error}</div>}
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
