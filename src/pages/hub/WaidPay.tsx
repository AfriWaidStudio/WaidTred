import { Send, ArrowDownLeft, CreditCard, QrCode, Clock, CheckCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { WalletService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const actions = [
  { icon: Send, label: "Send Money", desc: "Transfer globally", path: "/dashboard/send" },
  { icon: ArrowDownLeft, label: "Receive", desc: "Get paid instantly", path: "/dashboard/fund" },
  { icon: CreditCard, label: "Pay Bills", desc: "Utilities & more", path: "/dashboard/bills" },
  { icon: QrCode, label: "QR Pay", desc: "Scan & pay", path: "/dashboard/qrpay" },
];

const WaidPay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [available, setAvailable] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    WalletService.getMyWallet().then(({ data }) => setAvailable(Number(data?.available_balance || 0)));
    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => setRecent(data || []));
  }, [user]);

  return (
    <MiniAppContainer title="WaidPay" subtitle="Payments & Transfers">
      <div className="glass-card p-5 mb-5 border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">Available Balance</span>
        </div>
        <p className="text-3xl font-bold font-display text-foreground mb-1">
          ꠄ {available.toLocaleString("en", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">≈ ${(available / 10).toLocaleString()} USD</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {actions.map(a => (
          <button key={a.label} onClick={() => navigate(a.path)} className="glass-card p-4 text-left hover:border-primary/20 active:scale-[0.97]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <a.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">{a.label}</p>
            <p className="text-[10px] text-muted-foreground">{a.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-display font-semibold text-foreground mb-3">Recent Payments</h3>
        <div className="space-y-2">
          {recent.map((p) => {
            const incoming = p.type === "received";
            return (
              <div key={p.id} className="glass-card p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${incoming ? "bg-primary/10" : "bg-secondary"}`}>
                  {incoming ? <ArrowDownLeft className="w-4 h-4 text-primary" /> : <Send className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${incoming ? "text-primary" : "text-foreground"}`}>
                    {incoming ? "+" : "-"}ꠄ {Number(p.amount).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-end">
                    <CheckCircle className="w-2.5 h-2.5 text-primary" /> {p.status}
                  </p>
                </div>
              </div>
            );
          })}
          {recent.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No payments yet</p>}
        </div>
      </div>
    </MiniAppContainer>
  );
};

export default WaidPay;
