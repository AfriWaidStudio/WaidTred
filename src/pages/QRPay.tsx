import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, QrCode, Copy, Check, Scan } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const QRPay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"receive" | "scan">("receive");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanInput, setScanInput] = useState("");

  const payload = `WAIDTRED://pay?to=${user?.id || ""}&amount=${amount || "0"}&currency=SMK`;

  const handleCopy = () => { navigator.clipboard.writeText(payload); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleScanParse = () => {
    try {
      const url = new URL(scanInput.replace("WAIDTRED://", "https://wt/"));
      const to = url.searchParams.get("to");
      const amt = url.searchParams.get("amount");
      if (!to) return;
      navigate(`/dashboard/send?to=${to}&amount=${amt || ""}`);
    } catch { /* ignore */ }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold text-foreground mb-6">QR Pay</h1>

        <div className="flex gap-2 mb-6">
          {(["receive", "scan"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>
              {t === "receive" ? "Receive" : "Scan to Pay"}
            </button>
          ))}
        </div>

        {tab === "receive" ? (
          <div className="glass-card rounded-2xl p-6 border border-border text-center">
            <div className="w-48 h-48 mx-auto bg-foreground/5 rounded-2xl flex items-center justify-center mb-4">
              <img alt="QR code" className="w-full h-full p-2" src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">Set amount (optional)</p>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full text-center text-2xl font-bold bg-transparent text-foreground focus:outline-none mb-4" />
            <p className="text-[10px] text-muted-foreground mb-4 break-all">{payload}</p>
            <button onClick={handleCopy} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-secondary/50 text-sm text-foreground hover:bg-secondary">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />} {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-border">
            <div className="w-full h-48 bg-secondary/30 rounded-2xl flex flex-col items-center justify-center mb-4 relative">
              <Scan className="w-12 h-12 text-primary animate-pulse" />
              <p className="text-[11px] text-muted-foreground mt-2">Camera not available</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Or paste a WaidTred QR payload:</p>
            <input value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="WAIDTRED://pay?to=..." className="w-full px-3 py-2 mb-3 rounded-lg bg-secondary/60 border border-border text-xs" />
            <button onClick={handleScanParse} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Continue to Pay</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QRPay;
