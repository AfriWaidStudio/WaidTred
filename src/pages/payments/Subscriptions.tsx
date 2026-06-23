import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { SubscriptionsService } from "@/lib/services";
import { toast } from "sonner";

const Subscriptions = () => {
  const [subs, setSubs] = useState<any[]>([]);
  const [m, setM] = useState(""); const [a, setA] = useState(""); const [f, setF] = useState("monthly"); const [d, setD] = useState("");
  const load = () => SubscriptionsService.list().then(setSubs);
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!m || !a || !d) return;
    try { await SubscriptionsService.create({ merchant_name: m, amount: Number(a), frequency: f, next_charge: d }); toast.success("Subscription added"); setM(""); setA(""); setD(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Subscriptions" subtitle="Recurring payments" Icon={RefreshCw} back="/dashboard">
      <div className="glass-card p-4 mb-4 space-y-2">
        <p className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4"/>Add subscription</p>
        <input placeholder="Merchant" value={m} onChange={e=>setM(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Amount" value={a} onChange={e=>setA(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <select value={f} onChange={e=>setF(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
        <input type="date" value={d} onChange={e=>setD(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Add</button>
      </div>
      <div className="space-y-2">
        {subs.map(s => (
          <div key={s.id} className="glass-card p-3 flex justify-between items-center">
            <div><p className="text-sm font-semibold">{s.merchant_name}</p><p className="text-[10px] text-muted-foreground">ꠄ{s.amount} · {s.frequency} · next {s.next_charge}</p></div>
            <button onClick={async()=>{await SubscriptionsService.cancel(s.id); toast.success("Cancelled"); load();}} className="text-[10px] px-2 py-1 rounded-lg bg-destructive/20 text-destructive">Cancel</button>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default Subscriptions;
