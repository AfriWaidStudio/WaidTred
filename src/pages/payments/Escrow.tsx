import { useEffect, useState } from "react";
import { Lock, Check, Clock } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { EscrowService } from "@/lib/services";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Escrow = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [seller, setSeller] = useState(""); const [amount, setAmount] = useState(""); const [desc, setDesc] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const load = async () => { setDeals(await EscrowService.list()); const u = (await supabase.auth.getUser()).data.user; setMe(u?.id ?? null); };
  useEffect(() => { load(); }, []);
  const open = async () => {
    if (!seller || !amount || !desc) return;
    try { await EscrowService.open({ seller_id: seller, amount: Number(amount), description: desc }); toast.success("Escrow opened"); setSeller(""); setAmount(""); setDesc(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Escrow" subtitle="Hold funds until both confirm" Icon={Lock} back="/dashboard">
      <div className="glass-card p-4 mb-4 space-y-2">
        <input placeholder="Seller user ID" value={seller} onChange={e=>setSeller(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={open} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Open Escrow</button>
      </div>
      <div className="space-y-2">
        {deals.map(d => {
          const role = d.buyer_id === me ? "buyer" : "seller";
          const myConfirmed = role==="buyer" ? d.buyer_confirmed : d.seller_confirmed;
          return (
            <div key={d.id} className="glass-card p-3">
              <div className="flex justify-between"><p className="text-sm font-semibold">ꠄ{Number(d.amount).toLocaleString()}</p>{d.status==="released"?<Check className="w-4 h-4 text-primary"/>:<Clock className="w-4 h-4 text-accent"/>}</div>
              <p className="text-[10px] text-muted-foreground mb-2">{d.description} · you are {role}</p>
              {!myConfirmed && d.status!=="released" && <button onClick={async()=>{await EscrowService.confirm(d.id, role as any); toast.success("Confirmed"); load();}} className="w-full text-[11px] py-1.5 rounded-lg gradient-primary text-primary-foreground">Confirm</button>}
            </div>
          );
        })}
      </div>
    </WealthPageShell>
  );
};
export default Escrow;
