import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { BasketsService } from "@/lib/services";
import { toast } from "sonner";

const WaidVest = () => {
  const [baskets, setBaskets] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [amount, setAmount] = useState("");

  const load = async () => { setBaskets(await BasketsService.list()); setHoldings(await BasketsService.myHoldings()); };
  useEffect(() => { load(); }, []);

  const invest = async () => {
    if (!active || !amount) return;
    try { await BasketsService.invest(active.id, Number(amount), Number(active.nav)); toast.success("Invested"); setActive(null); setAmount(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const portfolioValue = holdings.reduce((a, h) => a + Number(h.units) * Number(h.basket?.nav ?? 0), 0);

  return (
    <WealthPageShell title="WaidVest" subtitle="Investment baskets" Icon={TrendingUp} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Portfolio value</p>
        <p className="text-2xl font-bold font-display">ꠄ {portfolioValue.toFixed(2)}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{holdings.length} positions</p>
      </div>
      <h3 className="text-sm font-display font-semibold mb-3">Available baskets</h3>
      <div className="space-y-2 mb-4">
        {baskets.map(b => (
          <button key={b.id} onClick={()=>setActive(b)} className="w-full glass-card p-4 text-left hover:border-primary/30">
            <div className="flex justify-between"><p className="text-sm font-semibold">{b.name}</p><p className="text-xs text-primary">+{b.ytd_return}% YTD</p></div>
            <p className="text-[10px] text-muted-foreground">{b.description} · {b.risk_level} risk · NAV ꠄ{b.nav}</p>
          </button>
        ))}
      </div>
      {active && (
        <div className="glass-card p-4 border-primary/20">
          <p className="text-sm font-semibold mb-2">Invest in {active.name}</p>
          <input type="number" placeholder="Amount (ꠄ)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <button onClick={invest} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Confirm Investment</button>
        </div>
      )}
    </WealthPageShell>
  );
};
export default WaidVest;
