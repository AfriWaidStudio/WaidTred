import { useEffect, useState } from "react";
import { Target, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { GoalsService } from "@/lib/services";
import { toast } from "sonner";

const WaidGoals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState(""); const [target, setTarget] = useState(""); const [deadline, setDeadline] = useState("");

  const load = () => GoalsService.list().then(setGoals);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!name || !target) return toast.error("Name and target required");
    try { await GoalsService.create({ name, target_amount: Number(target), deadline: deadline || null }); toast.success("Goal created"); setShow(false); setName(""); setTarget(""); setDeadline(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Waid Goals" subtitle="Save for what matters" Icon={Target} back="/dashboard">
      <button onClick={() => setShow(!show)} className="w-full mb-3 py-2.5 rounded-xl bg-secondary/60 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>New Goal</button>
      {show && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input placeholder="Goal name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input type="number" placeholder="Target (ꠄ)" value={target} onChange={e=>setTarget(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <button onClick={submit} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Create</button>
        </div>
      )}
      <div className="space-y-2">
        {goals.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">No goals yet. Create your first one!</p> :
          goals.map(g => {
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            return (
              <div key={g.id} className="glass-card p-4">
                <div className="flex justify-between mb-2"><p className="text-sm font-semibold">{g.name}</p><p className="text-xs text-primary">{pct.toFixed(0)}%</p></div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2"><div className="h-full gradient-primary" style={{width:`${pct}%`}}/></div>
                <p className="text-[10px] text-muted-foreground">ꠄ {Number(g.current_amount).toLocaleString()} / ꠄ {Number(g.target_amount).toLocaleString()}{g.deadline && ` · by ${g.deadline}`}</p>
              </div>
            );
          })}
      </div>
    </WealthPageShell>
  );
};
export default WaidGoals;
