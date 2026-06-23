import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { YieldService } from "@/lib/services";
import { toast } from "sonner";

const SmaiYield = () => {
  const [stakes, setStakes] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const load = () => YieldService.list().then(setStakes);
  useEffect(() => { load(); }, []);
  const stake = async () => {
    if (!amount) return;
    try { await YieldService.stake(Number(amount)); toast.success("Staked at 8% APY"); setAmount(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const total = stakes.reduce((a, s) => a + Number(s.principal) + Number(s.accrued), 0);
  return (
    <WealthPageShell title="Smai Yield" subtitle="Earn 8% APY on idle Sika" Icon={Sparkles} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Total staked + accrued</p>
        <p className="text-2xl font-bold font-display">ꠄ {total.toFixed(2)}</p>
        <p className="text-[11px] text-primary mt-1">{stakes.length} active stakes</p>
      </div>
      <div className="glass-card p-4 mb-4">
        <p className="text-sm font-semibold mb-2">New stake</p>
        <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={stake} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Stake</button>
      </div>
      <div className="space-y-2">
        {stakes.map(s => (
          <div key={s.id} className="glass-card p-3 flex justify-between items-center">
            <div><p className="text-sm font-semibold">ꠄ {Number(s.principal).toFixed(2)}</p><p className="text-[10px] text-muted-foreground">{s.apy}% APY · since {new Date(s.started_at).toLocaleDateString()}</p></div>
            <button onClick={async()=>{await YieldService.unstake(s.id, Number(s.principal), Number(s.accrued)); toast.success("Unstaked"); load();}} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/60">Unstake</button>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default SmaiYield;
