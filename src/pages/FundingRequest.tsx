import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Copy, Loader2, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VirtualAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  bank_code: string | null;
  country_code: string;
  currency_code: string;
  status: string;
}

const FundingRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [country, setCountry] = useState<{ code: string; currency_code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: profile } = await supabase.from("profiles").select("country").eq("id", user.id).single();
    const { data: market } = await supabase.from("countries").select("code,currency_code").eq("code", profile?.country ?? "GH").eq("status", "active").maybeSingle();
    const { data } = await supabase.from("virtual_accounts" as never).select("id,account_name,account_number,bank_name,bank_code,country_code,currency_code,status").eq("user_id", user.id).in("status", ["pending", "active"]);
    setCountry(market);
    setAccounts((data ?? []) as unknown as VirtualAccount[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [user]);

  const createAccount = async () => {
    if (!country) return toast({ title: "Your country is not enabled for bank funding", variant: "destructive" });
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("provider-orchestrator", {
      body: { operation: "create_virtual_account", country_code: country.code, currency_code: country.currency_code },
    });
    setCreating(false);
    if (error || data?.error) return toast({ title: "Account creation failed", description: data?.error || error?.message, variant: "destructive" });
    toast({ title: data?.reused ? "Existing account loaded" : "Virtual account created" });
    await load();
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast({ title: "Account number copied" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" />Back</button>
        <h1 className="font-display text-xl font-bold mb-2">Fund Wallet</h1>
        <p className="text-xs text-muted-foreground mb-6">Transfer only to your provider-issued dedicated account. WaidTred does not hold deposits directly.</p>

        {loading && <Loader2 className="w-6 h-6 animate-spin mx-auto my-12" />}
        {!loading && accounts.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="font-semibold mb-2">Create a dedicated account</h2>
            <p className="text-xs text-muted-foreground mb-5">Tier 2 KYC and an active provider route are required.</p>
            <Button onClick={createAccount} disabled={creating || !country}>{creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Create Account</Button>
          </div>
        )}

        <div className="space-y-3">
          {accounts.map(account => (
            <div key={account.id} className="glass-card rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center justify-between mb-4"><div><p className="text-xs text-muted-foreground">{account.bank_name || "Provider bank"}</p><p className="font-semibold">{account.currency_code} dedicated account</p></div><ShieldCheck className="w-5 h-5 text-primary" /></div>
              <p className="text-xs text-muted-foreground">Account number</p>
              <div className="flex items-center justify-between mb-3"><p className="font-mono text-2xl font-bold tracking-wide">{account.account_number}</p><button onClick={() => copy(account.account_number)} aria-label="Copy account number"><Copy className="w-4 h-4 text-primary" /></button></div>
              <p className="text-xs text-muted-foreground">Account name</p><p className="text-sm font-medium">{account.account_name}</p>
              <p className="text-[10px] text-muted-foreground mt-4">Deposits are credited only after a signed provider notification is verified and reconciled.</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FundingRequest;
