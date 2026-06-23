import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { GroupSaveService } from "@/lib/services";
import { toast } from "sonner";

const GroupSave = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [freq, setFreq] = useState("monthly");
  const load = () => GroupSaveService.list().then(setGroups);
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!name || !amount) return;
    try { await GroupSaveService.create({ name, contribution_amount: Number(amount), frequency: freq }); toast.success("Group created"); setShow(false); setName(""); setAmount(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const join = async (id: string) => { try { await GroupSaveService.join(id); toast.success("Joined"); load(); } catch (e: any) { toast.error(e.message); } };
  return (
    <WealthPageShell title="GroupSave" subtitle="Susu / Ajo savings circles" Icon={Users} back="/dashboard">
      <button onClick={()=>setShow(!show)} className="w-full mb-3 py-2.5 rounded-xl bg-secondary/60 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Start a Group</button>
      {show && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input placeholder="Group name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input type="number" placeholder="Contribution amount" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <select value={freq} onChange={e=>setFreq(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm">
            <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select>
          <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Create</button>
        </div>
      )}
      <div className="space-y-2">
        {groups.map(g => (
          <div key={g.id} className="glass-card p-3">
            <div className="flex justify-between mb-1"><p className="text-sm font-semibold">{g.name}</p><button onClick={()=>join(g.id)} className="text-[10px] px-2 py-1 rounded-lg gradient-primary text-primary-foreground">Join</button></div>
            <p className="text-[10px] text-muted-foreground">ꠄ{g.contribution_amount}/{g.frequency} · {g.member_count} members · pool ꠄ{Number(g.pool_balance).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default GroupSave;
