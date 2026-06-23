import { useEffect, useState } from "react";
import { Banknote } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { LoansService } from "@/lib/services";
import { toast } from "sonner";

const WaidLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [principal, setPrincipal] = useState(""); const [term, setTerm] = useState("12"); const [purpose, setPurpose] = useState("");
  const load = () => LoansService.list().then(setLoans);
  useEffect(() => { load(); }, []);
  const apply = async () => {
    if (!principal || !purpose) return toast.error("All fields required");
    try { await LoansService.apply({ principal: Number(principal), term_months: Number(term), purpose }); toast.success("Loan submitted for review"); setPrincipal(""); setPurpose(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="WaidLoans" subtitle="Borrow at 12% p.a." Icon={Banknote} back="/dashboard">
      <div className="glass-card p-4 mb-4 space-y-2">
        <p className="text-sm font-semibold">Apply for a loan</p>
        <input type="number" placeholder="Amount" value={principal} onChange={e=>setPrincipal(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <select value={term} onChange={e=>setTerm(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm">
          <option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option>
        </select>
        <input placeholder="Purpose" value={purpose} onChange={e=>setPurpose(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={apply} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Submit</button>
      </div>
      <h3 className="text-sm font-display font-semibold mb-2">My loans</h3>
      <div className="space-y-2">
        {loans.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No loans yet</p> :
          loans.map(l => (
            <div key={l.id} className="glass-card p-3">
              <div className="flex justify-between"><p className="text-sm font-semibold">ꠄ {Number(l.principal).toLocaleString()}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status==='approved'?'bg-primary/20 text-primary':l.status==='pending'?'bg-accent/20 text-accent':'bg-destructive/20 text-destructive'}`}>{l.status}</span></div>
              <p className="text-[10px] text-muted-foreground">{l.term_months}mo · ꠄ{Number(l.monthly_payment).toFixed(2)}/mo · {l.purpose}</p>
            </div>
          ))}
      </div>
    </WealthPageShell>
  );
};
export default WaidLoans;
