import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Phone, Wifi, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const networks = ["MTN", "Vodafone", "AirtelTigo", "Glo"];
const dataPlans = [
  { label: "1GB - 7 days", value: 5 },
  { label: "3GB - 30 days", value: 12 },
  { label: "5GB - 30 days", value: 18 },
  { label: "10GB - 30 days", value: 30 },
  { label: "20GB - 30 days", value: 50 },
];
const airtimeAmounts = [5, 10, 20, 50, 100, 200];

const AirtimeData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"airtime" | "data">("airtime");
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const handleBuy = () => {
    setDone(true);
    toast({ title: `${tab === "airtime" ? "Airtime" : "Data"} Sent!`, description: `ꠄ ${amount} to ${phone}` });
  };

  if (done) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4 text-center py-20">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Successful!</h2>
        <p className="text-sm text-muted-foreground mb-6">ꠄ {amount} {tab} sent to {phone}</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Done</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold text-foreground mb-6">Airtime & Data</h1>

        <div className="flex gap-2 mb-6">
          {(["airtime", "data"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setAmount(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>
              {t === "airtime" ? <Phone className="w-4 h-4" /> : <Wifi className="w-4 h-4" />} {t === "airtime" ? "Airtime" : "Data"}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {networks.map(n => (
              <button key={n} onClick={() => setNetwork(n)}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${network === n ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>{n}</button>
            ))}
          </div>

          <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />

          {tab === "airtime" ? (
            <div className="grid grid-cols-3 gap-2">
              {airtimeAmounts.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  className={`py-3 rounded-xl text-sm font-medium ${amount === a ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>ꠄ {a}</button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {dataPlans.map(p => (
                <button key={p.label} onClick={() => setAmount(p.value)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm ${amount === p.value ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>
                  <span>{p.label}</span><span className="font-bold">ꠄ {p.value}</span>
                </button>
              ))}
            </div>
          )}

          <button onClick={handleBuy} disabled={!network || !phone || !amount}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">Buy ꠄ {amount || 0}</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AirtimeData;
