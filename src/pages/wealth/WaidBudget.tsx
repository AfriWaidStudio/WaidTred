import { useEffect, useState } from "react";
import { PieChart } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { BudgetService } from "@/lib/services";
import { toast } from "sonner";

const DEFAULT_CATS = ["Food","Transport","Bills","Entertainment","Savings"];

const WaidBudget = () => {
  const [budget, setBudget] = useState<any>(null);
  const [total, setTotal] = useState(""); const [cats, setCats] = useState<{category:string;allocated:number}[]>(DEFAULT_CATS.map(c=>({category:c,allocated:0})));
  const load = () => BudgetService.current().then(b => { setBudget(b); if (b) { setTotal(String(b.total_budget)); if (b.categories?.length) setCats(b.categories.map((c:any)=>({category:c.category,allocated:Number(c.allocated)}))); }});
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!total) return;
    try { await BudgetService.create(Number(total), cats); toast.success("Budget saved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="WaidBudget" subtitle="Monthly budget tracker" Icon={PieChart} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">This month spent</p>
        <p className="text-2xl font-bold font-display">ꠄ {Number(budget?.total_spent ?? 0).toLocaleString()} <span className="text-sm text-muted-foreground">/ ꠄ{Number(budget?.total_budget ?? 0).toLocaleString()}</span></p>
      </div>
      <div className="glass-card p-4 space-y-2">
        <p className="text-sm font-semibold">Set budget</p>
        <input type="number" placeholder="Total budget" value={total} onChange={e=>setTotal(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        {cats.map((c,i) => (
          <div key={c.category} className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-24">{c.category}</span>
            <input type="number" value={c.allocated} onChange={e=>{const next=[...cats]; next[i].allocated=Number(e.target.value); setCats(next);}} className="flex-1 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          </div>
        ))}
        <button onClick={save} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Save Budget</button>
      </div>
    </WealthPageShell>
  );
};
export default WaidBudget;
