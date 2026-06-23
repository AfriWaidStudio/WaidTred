import { useEffect, useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidPredictService } from "@/lib/services";
import { toast } from "sonner";

const WaidPredict = () => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ question:"", description:"", category:"general", closes_at:"" });

  const load = () => { WaidPredictService.markets().then(setMarkets); WaidPredictService.myPositions().then(setPositions); };
  useEffect(() => { load(); }, []);

  const stake = async (id: string, side: "yes"|"no") => {
    const amt = Number(prompt(`Stake on ${side.toUpperCase()}`, "10") || 0);
    if (!amt) return;
    try { await WaidPredictService.stake(id, side, amt); toast.success("Position taken"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const create = async () => {
    try { await WaidPredictService.create(form); toast.success("Market created"); setShowNew(false); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidPredict" subtitle="Prediction markets" Icon={TrendingUp}>
      <button onClick={()=>setShowNew(!showNew)} className="mb-4 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> New market</button>
      {showNew && (
        <div className="glass-card p-4 mb-4 space-y-2 max-w-md">
          <input value={form.question} onChange={e=>setForm({...form,question:e.target.value})} placeholder="Yes/No question" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Resolution criteria" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="datetime-local" value={form.closes_at} onChange={e=>setForm({...form,closes_at:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <button onClick={create} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs">Create</button>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {markets.map(m => {
          const total = Number(m.yes_pool)+Number(m.no_pool);
          const yesPct = total ? (Number(m.yes_pool)/total)*100 : 50;
          return (
            <div key={m.id} className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground">{m.question}</p>
              <p className="text-[10px] text-muted-foreground">Closes {new Date(m.closes_at).toLocaleString()} · {m.status}</p>
              <div className="mt-3 flex h-2 rounded-full overflow-hidden">
                <div className="bg-primary" style={{width:yesPct+"%"}}/>
                <div className="bg-destructive" style={{width:(100-yesPct)+"%"}}/>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">YES ◈{Number(m.yes_pool).toLocaleString()} · NO ◈{Number(m.no_pool).toLocaleString()}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>stake(m.id,"yes")} className="flex-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs">YES</button>
                <button onClick={()=>stake(m.id,"no")} className="flex-1 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs">NO</button>
              </div>
            </div>
          );
        })}
        {!markets.length && <p className="text-xs text-muted-foreground col-span-full text-center py-6">No markets</p>}
      </div>
      {positions.length > 0 && (<>
        <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">My positions</h2>
        <div className="space-y-2">
          {positions.map(p => (
            <div key={p.id} className="glass-card p-3 text-xs text-foreground">
              {p.market?.question} — <span className="text-primary">{p.side.toUpperCase()}</span> ◈{Number(p.amount)}
            </div>
          ))}
        </div>
      </>)}
    </WealthPageShell>
  );
};
export default WaidPredict;
