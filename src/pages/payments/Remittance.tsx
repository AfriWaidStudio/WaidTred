import { Globe } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { useEffect, useState } from "react";
import { CountriesService, TransactionService, WalletService } from "@/lib/services";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Remittance = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [to, setTo] = useState(""); const [amount, setAmount] = useState(""); const [recipient, setRecipient] = useState("");
  useEffect(() => { CountriesService.list().then(c => setCountries(c.filter((x:any)=>x.is_enabled))); }, []);
  const country = countries.find(c => c.code === to);
  const localAmount = country && amount ? (Number(amount) / Number(country.fx_to_smk)).toFixed(2) : "0";
  const send = async () => {
    if (!to || !amount || !recipient) return;
    const u = (await supabase.auth.getUser()).data.user; if (!u) return toast.error("Sign in");
    try {
      await supabase.rpc("process_wallet_movement", { _user_id: u.id, _direction: "debit", _amount: Number(amount), _category: "remittance", _description: `Remit to ${recipient} (${to})` });
      await supabase.from("transactions").insert({ user_id: u.id, type: "transfer", title: `Remittance to ${recipient}`, description: `${country?.name}`, amount: Number(amount), receiver_country: to, status: "completed" });
      toast.success("Remittance sent"); setAmount(""); setRecipient("");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Remittance" subtitle="Send money across borders" Icon={Globe} back="/dashboard">
      <div className="glass-card p-4 space-y-2">
        <select value={to} onChange={e=>setTo(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm">
          <option value="">Select country</option>
          {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name} ({c.currency_code})</option>)}
        </select>
        <input placeholder="Recipient name or phone" value={recipient} onChange={e=>setRecipient(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Amount (ꠄ)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        {country && amount && <p className="text-xs text-muted-foreground">Recipient gets ≈ {country.currency_code} {localAmount}</p>}
        <button onClick={send} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Send</button>
      </div>
    </WealthPageShell>
  );
};
export default Remittance;
