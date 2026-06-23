import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Zap, Tv, Droplets, Wifi, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "electricity", label: "Electricity", icon: Zap, providers: ["ECG", "NEDCO", "PDS"] },
  { id: "tv", label: "TV/Cable", icon: Tv, providers: ["DStv", "GOtv", "StarTimes"] },
  { id: "water", label: "Water", icon: Droplets, providers: ["GWCL", "CWSA"] },
  { id: "internet", label: "Internet", icon: Wifi, providers: ["Vodafone", "MTN", "Surfline"] },
];

const BillPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [provider, setProvider] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState(false);

  const cat = categories.find(c => c.id === selected);

  const handlePay = async () => {
    try {
      const { BillPayService } = await import("@/lib/services");
      await BillPayService.pay({ biller: provider, account_number: accountNum, amount: Number(amount) });
      setPaid(true);
      toast({ title: "Bill Paid!", description: `ꠄ ${amount} paid to ${provider}` });
    } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  if (paid) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4 text-center py-20">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Payment Successful</h2>
        <p className="text-sm text-muted-foreground mb-6">ꠄ {amount} paid to {provider}</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Back to Dashboard</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => { if (selected) setSelected(null); else navigate(-1); }} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold text-foreground mb-6">Pay Bills</h1>

        {!selected ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className="glass-card rounded-2xl p-5 border border-border text-center hover:border-primary/50 transition-all">
                <c.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium text-foreground">{c.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
            <h3 className="font-semibold text-foreground text-sm">{cat?.label}</h3>
            <select value={provider} onChange={e => setProvider(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Select Provider</option>
              {cat?.providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Account / Meter Number" value={accountNum} onChange={e => setAccountNum(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <input type="number" placeholder="Amount (ꠄ Sika)" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button onClick={handlePay} disabled={!provider || !accountNum || !amount}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">Pay ꠄ {amount || "0"}</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillPayment;
