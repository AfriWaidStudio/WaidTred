import { useEffect, useState } from "react";
import { Heart, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidGiveService } from "@/lib/services";
import { toast } from "sonner";

const WaidGive = () => {
  const [causes, setCauses] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", goal_amount: 1000, category: "community" });

  const load = () => WaidGiveService.list().then(setCauses);
  useEffect(() => { load(); }, []);

  const donate = async (id: string) => {
    const amt = Number(prompt("Amount in Smai Sika?", "10") || 0);
    if (!amt) return;
    try { await WaidGiveService.donate(id, amt); toast.success("Donated ◈" + amt); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const create = async () => {
    try { await WaidGiveService.create(form); toast.success("Cause created"); setShowNew(false); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidGive" subtitle="Causes, charity & community" Icon={Heart}>
      <button onClick={()=>setShowNew(!showNew)} className="mb-4 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5"/> New cause
      </button>
      {showNew && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="number" value={form.goal_amount} onChange={e=>setForm({...form, goal_amount:Number(e.target.value)})} placeholder="Goal"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <button onClick={create} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs">Create</button>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {causes.map(c => {
          const pct = Math.min(100, (Number(c.raised_amount) / Number(c.goal_amount)) * 100);
          return (
            <div key={c.id} className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full gradient-primary" style={{width: pct+"%"}}/></div>
              <p className="text-[10px] text-muted-foreground mt-1">◈{Number(c.raised_amount).toLocaleString()} of ◈{Number(c.goal_amount).toLocaleString()}</p>
              <button onClick={()=>donate(c.id)} className="mt-3 w-full px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs">Donate</button>
            </div>
          );
        })}
        {!causes.length && <p className="text-xs text-muted-foreground col-span-full text-center py-6">No causes yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default WaidGive;
