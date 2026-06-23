import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { SmaiStakingService } from "@/lib/services";
import { toast } from "sonner";

const SmaiStaking = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const load = () => { SmaiStakingService.plans().then(setPlans); SmaiStakingService.myPositions().then(setPositions); };
  useEffect(() => { load(); }, []);

  const stake = async (id: string, min: number) => {
    const amt = Number(prompt(`Stake amount (min ◈${min})`, String(min)) || 0);
    if (!amt) return;
    try { await SmaiStakingService.open(id, amt); toast.success("Position opened"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="SmaiStaking" subtitle="Lock your sika, earn yield" Icon={Zap}>
      <h2 className="text-sm font-semibold text-foreground mb-2">Plans</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {plans.map(p => (
          <div key={p.id} className="glass-card p-4">
            <p className="text-sm font-semibold text-foreground">{p.name}</p>
            <p className="text-[11px] text-muted-foreground">{p.term_days} days · min ◈{p.min_amount}</p>
            <p className="text-2xl font-bold text-primary mt-2">{p.apy}%<span className="text-[10px] text-muted-foreground"> APY</span></p>
            <button onClick={()=>stake(p.id, p.min_amount)} className="mt-3 w-full px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs">Stake</button>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-semibold text-foreground mb-2">My positions</h2>
      <div className="space-y-2">
        {positions.map(pos => (
          <div key={pos.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{pos.plan?.name}</p>
              <p className="text-[10px] text-muted-foreground">Matures {new Date(pos.matures_at).toLocaleDateString()} · {pos.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">◈{Number(pos.principal).toLocaleString()}</p>
              <p className="text-[10px] text-primary">+◈{Number(pos.yield_earned).toFixed(2)} yield</p>
            </div>
          </div>
        ))}
        {!positions.length && <p className="text-xs text-muted-foreground text-center py-6">No positions</p>}
      </div>
    </WealthPageShell>
  );
};
export default SmaiStaking;
