import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Check, Gift, Copy } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { smaiPinStatusColors } from "@/lib/constants";

type Tab = "redeem" | "my-pins";

// Mock redeemed pins for display (until auth is wired)
const mockRedeemedPins = [
  { id: "1", pin_code: "WAID-ABCD-1234", value: 500, status: "redeemed", redeemed_at: "2026-03-28T10:00:00Z" },
  { id: "2", pin_code: "SMAI-EFGH-5678", value: 1000, status: "redeemed", redeemed_at: "2026-03-15T14:30:00Z" },
];

const SmaiPinPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("redeem");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ value: number; code: string } | null>(null);

  const handleRedeem = async () => {
    if (!pinCode.trim() || pinCode.replace(/[-\s]/g, "").length < 12) {
      toast({ title: "Invalid pin code", description: "Please enter a valid SmaiPin code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Mock redemption for now
    setTimeout(() => {
      setSuccess({ value: 500, code: pinCode });
      setLoading(false);
    }, 1500);
  };

  const formatPin = (value: string) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join("-");
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">SmaiPin Redeemed!</h2>
          <p className="text-muted-foreground mb-1">ꠄ {success.value.toLocaleString()} added to your wallet</p>
          <p className="text-xs text-muted-foreground mb-8 font-mono">{success.code}</p>
          <div className="space-y-3">
            <Button variant="hero" className="w-full py-6" onClick={() => navigate("/dashboard")}>Back to Home</Button>
            <Button variant="hero-outline" className="w-full py-6" onClick={() => { setSuccess(null); setPinCode(""); }}>Redeem Another</Button>
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
          <h1 className="text-lg font-display font-bold text-foreground">SmaiPin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "redeem" as Tab, icon: Gift, label: "Redeem" },
            { key: "my-pins" as Tab, icon: Ticket, label: "My Pins" },
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

        {tab === "redeem" && (
          <div className="animate-slide-up">
            {/* Info Card */}
            <div className="glass-card p-4 mb-6 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">What is SmaiPin?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    SmaiPin is a redeemable gift card for WaidTred. Enter your pin code below to add Smai Sika to your wallet instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Pin Input */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground mb-2 block">Enter SmaiPin Code</label>
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={pinCode}
                onChange={(e) => setPinCode(formatPin(e.target.value))}
                className="bg-secondary/50 border-border h-14 text-xl font-mono font-bold text-center tracking-widest text-foreground"
                maxLength={14}
              />
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Found on your gift card. Format: XXXX-XXXX-XXXX
              </p>
            </div>

            <Button
              variant="hero"
              className="w-full py-6"
              disabled={pinCode.replace(/[-\s]/g, "").length < 12 || loading}
              onClick={handleRedeem}
            >
              {loading ? "Redeeming..." : "Redeem SmaiPin"}
            </Button>
          </div>
        )}

        {tab === "my-pins" && (
          <div className="animate-slide-up">
            {mockRedeemedPins.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No redeemed pins yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockRedeemedPins.map((pin) => (
                  <div key={pin.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-foreground">{pin.pin_code}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${smaiPinStatusColors[pin.status] || "bg-muted text-muted-foreground"}`}>
                        {pin.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-display text-primary">ꠄ {pin.value.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(pin.redeemed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmaiPinPage;
