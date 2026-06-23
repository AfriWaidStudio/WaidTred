import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Upload, CheckCircle, Clock, CreditCard, Smartphone, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FundingService } from "@/lib/services";

const methods = [
  { id: "momo", label: "Mobile Money", icon: Smartphone, info: "MTN MoMo: 024 XXX XXXX" },
  { id: "bank", label: "Bank Transfer", icon: Building, info: "GCB Bank: 123-456-7890" },
  { id: "card", label: "Card Payment", icon: CreditCard, info: "Visa / Mastercard" },
];

const FundingRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { FundingService.listMine().then(({ data }) => setHistory(data)); }, [submitted]);

  const handleSubmit = async () => {
    if (!method || !amount || Number(amount) <= 0) return toast({ title: "Fill amount and method", variant: "destructive" });
    setLoading(true);
    const { error } = await FundingService.create(Number(amount), method, proofUploaded ? "uploaded" : undefined, note);
    setLoading(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setSubmitted(true);
    toast({ title: "Funding request submitted", description: "An agent will verify shortly." });
  };

  if (submitted) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4 text-center py-20">
        <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Request Submitted</h2>
        <p className="text-sm text-muted-foreground mb-2">Amount: ꠄ {amount}</p>
        <p className="text-xs text-muted-foreground mb-6">An agent will verify and credit your wallet.</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Back to Dashboard</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold mb-2">Fund Wallet</h1>
        <p className="text-xs text-muted-foreground mb-6">Send payment, upload proof — an agent credits your wallet</p>

        <div className="space-y-3 mb-6">
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border ${method === m.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <m.icon className={`w-6 h-6 ${method === m.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.info}</p>
              </div>
            </button>
          ))}
        </div>

        {method && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <input type="number" placeholder="Amount (ꠄ Sika)" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input placeholder="Reference / note" value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <button onClick={() => setProofUploaded(true)}
              className={`w-full py-10 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 ${proofUploaded ? "border-primary bg-primary/5" : "border-border"}`}>
              {proofUploaded ? <CheckCircle className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{proofUploaded ? "Proof uploaded" : "Upload payment screenshot"}</span>
            </button>
            <button onClick={handleSubmit} disabled={!amount || loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Submit Request
            </button>
          </div>
        )}

        {history.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground font-medium mt-6 mb-2">Your requests</p>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div>
                    <p className="text-sm font-medium">ꠄ {Number(h.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{h.method} · {new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded ${h.status === "approved" ? "bg-primary/10 text-primary" : h.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{h.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FundingRequest;
