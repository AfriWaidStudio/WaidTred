import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Check, Smartphone, Wifi, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countries, providers, dataPlans, type Country } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { WalletService, TransactionService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Tab = "airtime" | "data";

const Recharge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("airtime");
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountries, setShowCountries] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [success, setSuccess] = useState(false);
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) WalletService.getMyWallet().then(({ data }) => setAvailable(Number(data?.available_balance || 0))); }, [user]);

  const countryProviders = providers[selectedCountry.code] || [];

  const handleRecharge = async () => {
    const cost = tab === "airtime" ? parseFloat(amount) : dataPlans.find(p => p.id === selectedPlan)?.price || 0;
    if (!phoneNumber.trim() || !selectedProvider || cost <= 0) return toast({ title: "Please fill all fields", variant: "destructive" });
    if (cost > available) return toast({ title: "Insufficient balance", variant: "destructive" });
    if (!user) return;
    setLoading(true);
    const title = tab === "airtime" ? `Airtime ${selectedProvider}` : `Data ${selectedProvider}`;
    const { data: tx } = await TransactionService.createTransaction({
      user_id: user.id, type: tab, title, amount: cost, recipient: phoneNumber, sender_country: selectedCountry.code,
    });
    const { error } = await supabase.rpc("process_wallet_movement", {
      _user_id: user.id, _direction: "debit", _amount: cost, _category: tab,
      _description: `${title} → ${phoneNumber}`, _reference_type: "transaction", _reference_id: tx?.id ?? null,
    });
    if (!error && tx) await supabase.from("transactions").update({ status: "completed" }).eq("id", tx.id);
    setLoading(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setSuccess(true);
    WalletService.getMyWallet().then(({ data }) => setAvailable(Number(data?.available_balance || 0)));
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {tab === "airtime" ? "Airtime" : "Data"} Recharge Successful!
          </h2>
          <p className="text-muted-foreground mb-1">{selectedCountry.flag} {phoneNumber}</p>
          <p className="text-sm text-muted-foreground mb-8">{selectedProvider}</p>
          <div className="space-y-3">
            <Button variant="hero" className="w-full py-6" onClick={() => navigate("/dashboard")}>Back to Home</Button>
            <Button variant="hero-outline" className="w-full py-6" onClick={() => { setSuccess(false); setPhoneNumber(""); setAmount(""); setSelectedPlan(""); }}>Recharge Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Recharge</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "airtime" as Tab, icon: Smartphone, label: "Airtime" },
            { key: "data" as Tab, icon: Wifi, label: "Data" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Country Selector */}
        <button onClick={() => setShowCountries(!showCountries)} className="glass-card w-full p-3 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm text-foreground">{selectedCountry.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCountries ? "rotate-180" : ""}`} />
        </button>
        {showCountries && (
          <div className="glass-card p-2 mb-3 max-h-48 overflow-y-auto space-y-0.5">
            {countries.map((c) => (
              <button key={c.code} onClick={() => { setSelectedCountry(c); setShowCountries(false); setSelectedProvider(""); }}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-colors ${c.code === selectedCountry.code ? "bg-primary/10" : "hover:bg-secondary"}`}>
                <span>{c.flag}</span>
                <span className="text-sm text-foreground">{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phone Number */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Phone Number</label>
          <div className="flex gap-2">
            <div className="glass-card px-3 flex items-center text-sm text-muted-foreground shrink-0">
              {selectedCountry.phonePrefix}
            </div>
            <Input
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-secondary/50 border-border h-12"
            />
          </div>
        </div>

        {/* Provider */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Provider</label>
          <div className="grid grid-cols-3 gap-2">
            {countryProviders.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                  selectedProvider === p ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Airtime Amount or Data Plans */}
        {tab === "airtime" ? (
          <div className="mb-6">
            <label className="text-xs text-muted-foreground mb-1.5 block">Amount (Smai Sika)</label>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">ꠄ</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary/50 border-border h-12 pl-10 text-lg font-semibold"
              />
            </div>
            <div className="flex gap-2">
              {[20, 50, 100, 200].map((v) => (
                <button key={v} onClick={() => setAmount(v.toString())} className="flex-1 py-2 rounded-lg bg-secondary/50 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  ꠄ {v}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="text-xs text-muted-foreground mb-1.5 block">Select Data Plan</label>
            <div className="space-y-2">
              {dataPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`glass-card w-full p-3 flex items-center justify-between transition-all ${
                    selectedPlan === plan.id ? "border-primary/50" : ""
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    <p className="text-[11px] text-muted-foreground">{plan.validity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">ꠄ {plan.price}</span>
                    {selectedPlan === plan.id && <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button variant="hero" className="w-full py-6" onClick={handleRecharge} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Recharge Now
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Available: ꠄ {available.toLocaleString()}</p>
      </div>
    </DashboardLayout>
  );
};

export default Recharge;
