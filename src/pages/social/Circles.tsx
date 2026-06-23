import { Users, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { CirclesService } from "@/lib/services";
import { toast } from "sonner";

const Circles = () => {
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const load = () => CirclesService.list().then(setList);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return toast.error("Name required");
    try { await CirclesService.create({ name, description: desc }); toast.success("Circle created"); setShow(false); setName(""); setDesc(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const join = async (id: string) => {
    try { await CirclesService.join(id); toast.success("Joined"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidCircles" subtitle="Shared communities" Icon={Users} back="/dashboard">
      <button onClick={() => setShow(!show)} className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary flex items-center justify-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Create Circle
      </button>
      {show && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Circle name" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
          <button onClick={create} className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Create</button>
        </div>
      )}
      <div className="space-y-3">
        {list.map(c => (
          <div key={c.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{c.name}</p>
              {c.is_private && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">Private</span>}
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">{c.description}</p>
            <button onClick={() => join(c.id)} className="text-[11px] text-primary">Join</button>
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No circles yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default Circles;
