import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { InsuranceService } from "@/lib/services";
import { toast } from "sonner";

const PLANS = [
  { type: "Health", coverage: 5000, premium: 25 },
  { type: "Life", coverage: 25000, premium: 50 },
  { type: "Device", coverage: 1000, premium: 8 },
  { type: "Travel", coverage: 10000, premium: 15 },
];

const WaidInsure = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const load = () => InsuranceService.list().then(setPolicies);
  useEffect(() => { load(); }, []);
  const buy = async (p: typeof PLANS[number]) => {
    try { await InsuranceService.buy({ policy_type: p.type, coverage_amount: p.coverage, monthly_premium: p.premium }); toast.success(`${p.type} policy active`); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="WaidInsure" subtitle="Protect what matters" Icon={Shield} back="/dashboard">
      <h3 className="text-sm font-display font-semibold mb-2">Available plans</h3>
      <div className="space-y-2 mb-4">
        {PLANS.map(p => (
          <div key={p.type} className="glass-card p-3 flex items-center justify-between">
            <div><p className="text-sm font-semibold">{p.type}</p><p className="text-[10px] text-muted-foreground">Cover ꠄ{p.coverage.toLocaleString()}</p></div>
            <button onClick={()=>buy(p)} className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground">ꠄ{p.premium}/mo</button>
          </div>
        ))}
      </div>
      <h3 className="text-sm font-display font-semibold mb-2">My policies</h3>
      <div className="space-y-2">
        {policies.length===0 ? <p className="text-xs text-muted-foreground text-center py-6">No policies</p> :
          policies.map(p => (
            <div key={p.id} className="glass-card p-3 flex justify-between"><div><p className="text-sm font-semibold">{p.policy_type}</p><p className="text-[10px] text-muted-foreground">Cover ꠄ{Number(p.coverage_amount).toLocaleString()}</p></div><p className="text-xs text-primary">ꠄ{Number(p.monthly_premium)}/mo</p></div>
          ))}
      </div>
    </WealthPageShell>
  );
};
export default WaidInsure;
