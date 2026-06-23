import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CivilizationMetricsService, OnyixService, EntityService, ProsperityService } from "@/lib/services/civilization-service";
import { Activity, Users, Building2, Coins, TrendingUp, Sparkles, Database, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Card = ({ icon: Icon, label, value, hint }: any) => (
  <div className="glass-card p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

export default function CivilizationDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [reserves, setReserves] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [m, r, e, p] = await Promise.all([
      CivilizationMetricsService.latest(),
      OnyixService.listReserves(),
      EntityService.listCoreEntities(),
      ProsperityService.getPool(),
    ]);
    setMetrics(m.data); setReserves(r.data); setEntities(e.data); setPool(p.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const snapshot = async () => { await CivilizationMetricsService.snapshotNow(); load(); };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Civilization</h1>
            <p className="text-xs text-muted-foreground">National Economic Command Center</p>
          </div>
          <Button size="sm" variant="outline" onClick={snapshot} disabled={loading}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Snapshot now
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card icon={Users} label="Total Users" value={metrics?.total_users ?? "—"} />
          <Card icon={Building2} label="Entities" value={metrics?.total_entities ?? "—"} />
          <Card icon={Database} label="Treasuries" value={metrics?.total_treasuries ?? "—"} />
          <Card icon={Activity} label="Transactions" value={metrics?.total_transactions ?? "—"} />
          <Card icon={Coins} label="Onyix Circulating" value={Number(metrics?.total_onyix ?? 0).toLocaleString()} />
          <Card icon={Coins} label="Smai Sika" value={`◈ ${Number(metrics?.total_smaisika ?? 0).toLocaleString()}`} />
          <Card icon={Sparkles} label="TredBeings" value={metrics?.active_tredbeings ?? "—"} />
          <Card icon={TrendingUp} label="Growth" value={`${metrics?.economic_growth ?? 0}%`} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /> Onyix Reserves</h2>
            {reserves.length === 0 ? <p className="text-xs text-muted-foreground">No reserves yet.</p> : reserves.map(r => (
              <div key={r.id} className="py-2 border-b border-border/40 last:border-0">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="text-primary">{Number(r.circulating).toLocaleString()} / {Number(r.total_supply).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Allocated {Number(r.allocated).toLocaleString()} · Burned {Number(r.burned).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-accent" /> Prosperity Pool</h2>
            <p className="text-3xl font-display font-bold text-foreground">◈ {Number(pool?.balance ?? 0).toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div><span className="text-muted-foreground">Contributed</span><p className="font-semibold text-foreground">{Number(pool?.total_contributed ?? 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Disbursed</span><p className="font-semibold text-foreground">{Number(pool?.total_disbursed ?? 0).toLocaleString()}</p></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-display font-semibold mb-3">Konsmik Core Entities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {entities.map(e => (
              <div key={e.id} className="p-3 rounded-xl border border-border/40 bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">{e.name}</p>
                <p className="text-[10px] text-muted-foreground">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
