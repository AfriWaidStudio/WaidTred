import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OnyixService, EntityService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Coins, Flame } from "lucide-react";

export default function OnyixCore() {
  const [reserves, setReserves] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [reserveId, setReserveId] = useState("");
  const [entityId, setEntityId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    const [r, m, e] = await Promise.all([OnyixService.listReserves(), OnyixService.listMovements(50), EntityService.listEntities()]);
    setReserves(r.data); setMovements(m.data); setEntities(e.data);
    if (r.data[0]) setReserveId(r.data[0].id);
  };
  useEffect(() => { load(); }, []);

  const act = async (fn: any) => {
    const { error } = await fn();
    if (error) toast.error(error.message); else { toast.success("Done"); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Onyix Core</h1>
        <p className="text-xs text-muted-foreground mb-6">Universal reserve energy layer</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {reserves.map(r => (
            <div key={r.id} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2"><Coins className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">{r.name}</span></div>
              <p className="text-3xl font-display font-bold text-foreground">{Number(r.total_supply).toLocaleString()}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div><span className="text-muted-foreground">Circulating</span><p className="font-semibold">{Number(r.circulating).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Allocated</span><p className="font-semibold">{Number(r.allocated).toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Burned</span><p className="font-semibold text-destructive">{Number(r.burned).toLocaleString()}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3">Admin: Allocate / Consume / Burn</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={reserveId} onChange={e => setReserveId(e.target.value)}>
              {reserves.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={entityId} onChange={e => setEntityId(e.target.value)}>
              <option value="">— select entity —</option>
              {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.kind})</option>)}
            </select>
            <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button size="sm" onClick={() => act(() => OnyixService.allocate(reserveId, entityId, Number(amount), reason))}>Allocate</Button>
            <Button size="sm" variant="outline" onClick={() => act(() => OnyixService.consume(reserveId, entityId, Number(amount), reason))}>Consume</Button>
            <Button size="sm" variant="destructive" onClick={() => act(() => OnyixService.burn(reserveId, Number(amount), reason))}><Flame className="w-3.5 h-3.5 mr-1" />Burn</Button>
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-display font-semibold mb-3">Recent Movements</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {movements.map(m => (
              <div key={m.id} className="flex justify-between text-xs py-2 border-b border-border/40">
                <div>
                  <span className="font-semibold text-foreground uppercase">{m.action}</span>
                  <span className="text-muted-foreground ml-2">{m.reason || "—"}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-primary">{Number(m.amount).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {movements.length === 0 && <p className="text-xs text-muted-foreground">No movements yet.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
