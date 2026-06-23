import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, AlertTriangle, Upload, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DisputeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [txId, setTxId] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "Dispute Filed", description: "Our team will review within 24-48 hours." });
  };

  if (submitted) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4 text-center py-20">
        <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Dispute Submitted</h2>
        <p className="text-sm text-muted-foreground mb-1">Reference: DSP-{Date.now().toString().slice(-6)}</p>
        <p className="text-xs text-muted-foreground mb-6">We'll investigate and respond within 24-48 hours.</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Back to Dashboard</button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>

        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-accent" />
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">File a Dispute</h1>
            <p className="text-xs text-muted-foreground">Report a transaction issue</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
          <input placeholder="Transaction ID (e.g. TXN-001)" value={txId} onChange={e => setTxId(e.target.value)}
            className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />

          <select value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">Select Reason</option>
            <option value="wrong_amount">Wrong Amount</option>
            <option value="not_received">Payment Not Received</option>
            <option value="unauthorized">Unauthorized Transaction</option>
            <option value="duplicate">Duplicate Charge</option>
            <option value="other">Other</option>
          </select>

          <textarea placeholder="Describe the issue in detail..." value={details} onChange={e => setDetails(e.target.value)} rows={4}
            className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />

          <button onClick={() => setProofUploaded(true)}
            className={`w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 ${proofUploaded ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            {proofUploaded ? <CheckCircle className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{proofUploaded ? "Evidence uploaded" : "Upload evidence (optional)"}</span>
          </button>

          <button onClick={handleSubmit} disabled={!txId || !reason || !details}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">Submit Dispute</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DisputeForm;
