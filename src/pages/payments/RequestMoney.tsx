import { useEffect, useState } from "react";
import { HandCoins } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { RequestMoneyService } from "@/lib/services";
import { toast } from "sonner";

const RequestMoney = () => {
  const [reqs, setReqs] = useState<any[]>([]);
  const [contact, setContact] = useState(""); const [amount, setAmount] = useState(""); const [reason, setReason] = useState("");
  const load = () => RequestMoneyService.list().then(setReqs);
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!contact || !amount) return;
    try { await RequestMoneyService.create({ payer_contact: contact, amount: Number(amount), reason }); toast.success("Request sent"); setContact(""); setAmount(""); setReason(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Request Money" subtitle="Ask anyone to pay you" Icon={HandCoins} back="/dashboard">
      <div className="glass-card p-4 mb-4 space-y-2">
        <input placeholder="Contact phone or email" value={contact} onChange={e=>setContact(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Amount (ꠄ)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input placeholder="Reason" value={reason} onChange={e=>setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Send Request</button>
      </div>
      <div className="space-y-2">
        {reqs.map(r => (
          <div key={r.id} className="glass-card p-3 flex justify-between">
            <div><p className="text-sm font-semibold">ꠄ{Number(r.amount).toLocaleString()} · {r.payer_contact}</p><p className="text-[10px] text-muted-foreground">{r.reason}</p></div>
            <span className="text-[10px] text-muted-foreground">{r.status}</span>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default RequestMoney;
