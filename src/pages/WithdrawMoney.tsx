import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, CheckCircle, Loader2, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Beneficiary { id: string; bank_name: string; bank_code: string | null; account_number: string; account_name: string; currency_code: string; country_code: string; is_verified: boolean }
interface Withdrawal { id: string; amount: number; currency_code: string; status: string; created_at: string }

const WithdrawMoney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [market, setMarket] = useState<{ code: string; currency_code: string } | null>(null);
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ bank_name: "", bank_code: "", account_number: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("country").eq("id", user.id).single();
    const { data: country } = await supabase.from("countries").select("code,currency_code").eq("code", profile?.country ?? "GH").eq("status", "active").maybeSingle();
    const { data: beneficiaryRows } = await supabase.from("bank_beneficiaries" as never).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const { data: withdrawalRows } = await supabase.from("withdrawal_requests" as never).select("id,amount,currency_code,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setMarket(country);
    setBeneficiaries((beneficiaryRows ?? []) as unknown as Beneficiary[]);
    setWithdrawals((withdrawalRows ?? []) as unknown as Withdrawal[]);
  };
  useEffect(() => { void load(); }, [user]);

  const addBeneficiary = async () => {
    if (!market || !form.bank_name.trim() || !form.account_number.trim()) return toast({ title: "Complete the bank details", variant: "destructive" });
    setBusy(true);
    const { data, error } = await supabase.from("bank_beneficiaries" as never).insert({ user_id: user!.id, country_code: market.code, currency_code: market.currency_code, bank_name: form.bank_name.trim(), bank_code: form.bank_code.trim() || null, account_number: form.account_number.trim(), account_name: "Pending verification" } as never).select("id").single();
    if (error || !data) { setBusy(false); return toast({ title: "Could not add beneficiary", description: error?.message, variant: "destructive" }); }
    const beneficiaryId = (data as { id: string }).id;
    const verification = await supabase.functions.invoke("beneficiary-orchestrator", { body: { beneficiary_id: beneficiaryId } });
    setBusy(false);
    if (verification.error || verification.data?.error) return toast({ title: "Bank account could not be verified", description: verification.data?.error || verification.error?.message, variant: "destructive" });
    setAdding(false); setForm({ bank_name: "", bank_code: "", account_number: "" });
    toast({ title: "Beneficiary verified" });
    await load();
  };

  const requestWithdrawal = async () => {
    const value = Number(amount);
    if (!selected || !Number.isFinite(value) || value <= 0) return toast({ title: "Select a beneficiary and enter an amount", variant: "destructive" });
    setBusy(true);
    const { error } = await supabase.rpc("request_withdrawal" as never, { _beneficiary_id: selected, _amount: value } as never);
    setBusy(false);
    if (error) return toast({ title: "Withdrawal request failed", description: error.message, variant: "destructive" });
    setAmount(""); toast({ title: "Withdrawal submitted", description: "Funds are held safely while operations review the payout." }); await load();
  };

  return <DashboardLayout><div className="max-w-lg mx-auto p-4">
    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><ArrowLeft className="w-4 h-4" />Back</button>
    <div className="flex justify-between items-start mb-6"><div><h1 className="font-display text-xl font-bold">Withdraw Money</h1><p className="text-xs text-muted-foreground">Provider payout to a verified bank beneficiary</p></div><Button size="sm" variant="outline" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Beneficiary</Button></div>
    {adding && <div className="glass-card p-4 space-y-3 mb-5"><Input placeholder="Bank name" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} /><Input placeholder="Bank code (if applicable)" value={form.bank_code} onChange={e => setForm({ ...form, bank_code: e.target.value })} /><Input placeholder="Account number" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} /><Button onClick={addBeneficiary} disabled={busy || !market}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Verify with provider</Button></div>}
    <div className="glass-card p-5 space-y-4 mb-6">
      <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm"><option value="">Select verified beneficiary</option>{beneficiaries.filter(b => b.is_verified).map(b => <option key={b.id} value={b.id}>{b.account_name} · {b.bank_name} · {b.account_number}</option>)}</select>
      <Input type="number" min="0" step="0.01" placeholder={`Amount (${market?.currency_code || "SMK"})`} value={amount} onChange={e => setAmount(e.target.value)} />
      <Button className="w-full" onClick={requestWithdrawal} disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Request withdrawal</Button>
    </div>
    <p className="text-xs text-muted-foreground mb-2">Withdrawal history</p><div className="space-y-2">{withdrawals.map(w => <div key={w.id} className="glass-card p-3 flex items-center gap-3"><Building2 className="w-4 h-4 text-primary" /><div className="flex-1"><p className="text-sm font-medium">{w.currency_code} {Number(w.amount).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleString("en-GB")}</p></div><span className="text-[10px] capitalize">{w.status === "successful" && <CheckCircle className="inline w-3 h-3 text-primary mr-1" />}{w.status}</span></div>)}</div>
  </div></DashboardLayout>;
};

export default WithdrawMoney;
