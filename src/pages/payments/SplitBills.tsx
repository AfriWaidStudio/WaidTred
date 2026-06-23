import { useEffect, useState } from "react";
import { Users, Plus, Check } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { SplitBillsService } from "@/lib/services";
import { toast } from "sonner";

const SplitBills = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(""); const [total, setTotal] = useState(""); const [names, setNames] = useState("");
  const load = () => SplitBillsService.list().then(setBills);
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!title || !total || !names) return;
    const list = names.split(",").map(n => n.trim()).filter(Boolean);
    const share = Number(total) / list.length;
    try { await SplitBillsService.create({ title, total_amount: Number(total) }, list.map(n => ({ contact_name: n, share }))); toast.success("Bill created"); setShow(false); setTitle(""); setTotal(""); setNames(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Split Bills" subtitle="Share expenses fairly" Icon={Users} back="/dashboard">
      <button onClick={()=>setShow(!show)} className="w-full mb-3 py-2.5 rounded-xl bg-secondary/60 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>New Split</button>
      {show && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input placeholder="Title (e.g. Dinner)" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input type="number" placeholder="Total amount" value={total} onChange={e=>setTotal(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input placeholder="Names (comma separated)" value={names} onChange={e=>setNames(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Create</button>
        </div>
      )}
      <div className="space-y-2">
        {bills.map(b => (
          <div key={b.id} className="glass-card p-3">
            <div className="flex justify-between mb-1"><p className="text-sm font-semibold">{b.title}</p><p className="text-xs text-primary">ꠄ{Number(b.total_amount).toLocaleString()}</p></div>
            <div className="space-y-1">{b.participants?.map((p:any)=>(
              <div key={p.id} className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">{p.contact_name} · ꠄ{Number(p.share).toFixed(2)}</span>
                {p.paid ? <Check className="w-3 h-3 text-primary"/> : <button onClick={async()=>{await SplitBillsService.markPaid(p.id); load();}} className="text-[10px] px-2 py-0.5 rounded bg-secondary">Mark paid</button>}
              </div>
            ))}</div>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default SplitBills;
