import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, TrendingUp, Send, ArrowDownLeft,
  Smartphone, CreditCard, QrCode, Receipt, Bell, ChevronRight, Ticket,
  MessageSquare, Bot, Globe, Sparkles, X, ShoppingBag
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { txTypeIcons } from "@/lib/constants";
import { WalletService, NotificationService } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { icon: Send, label: "Send", path: "/dashboard/send", color: "text-primary" },
  { icon: ArrowDownLeft, label: "Withdraw", path: "/dashboard/withdraw", color: "text-accent" },
  { icon: ArrowDownLeft, label: "Receive", path: "/dashboard/fund", color: "text-primary" },
  { icon: Smartphone, label: "Recharge", path: "/dashboard/recharge", color: "text-accent" },
  { icon: ShoppingBag, label: "SokoPlace", path: "/dashboard/sokoplace", color: "text-primary" },
  { icon: Ticket, label: "SmaiPin", path: "/dashboard/smaipin", color: "text-primary" },
  { icon: QrCode, label: "Scan", path: "/dashboard/qrpay", color: "text-primary" },
];

const DashboardHome = () => {
  const [visible, setVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    WalletService.getMyWallet().then(({ data }) => setWallet(data));
    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setRecentTx(data || []));
    NotificationService.unreadCount().then(setUnread);
  }, [user]);

  const total = Number(wallet?.total_balance || 0);
  const available = Number(wallet?.available_balance || 0);
  const locked = Number(wallet?.locked_balance || 0);
  const usd = total / 10;

  return (
    <DashboardLayout>
      <div className="max-w-lg lg:max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-xl font-display font-bold text-foreground">WaidTred</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard/profile")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => navigate("/dashboard/notifications")} className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unread > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full gradient-primary border-2 border-card" />}
            </button>
          </div>
        </div>

        {/* Compact Wallet Card */}
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-accent/10" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/15 blur-3xl -translate-y-1/3 translate-x-1/4" />

          <div className="glass-card relative z-10 p-4 border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-semibold text-foreground">Smai Sika</span>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">Digital Wallet</p>
                </div>
              </div>
              <button onClick={() => setVisible(!visible)} className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground">
                {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Balance</p>
              <p className="text-2xl font-bold font-display text-foreground leading-tight">
                {visible ? `ꠄ ${total.toLocaleString("en", { minimumFractionDigits: 2 })}` : "ꠄ ••••••"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {visible ? `≈ $${usd.toLocaleString("en", { minimumFractionDigits: 2 })} USD` : "≈ ••••"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Available", value: available.toLocaleString(), icon: null },
                { label: "Locked", value: locked.toLocaleString(), icon: null },
                { label: "Growth", value: `+0.0%`, icon: TrendingUp },
              ].map(item => (
                <div key={item.label} className="bg-background/40 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center border border-border/30">
                  <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{item.label}</p>
                  <p className={`text-[11px] font-semibold leading-tight ${item.icon ? "text-primary" : "text-foreground"} flex items-center justify-center gap-0.5 truncate`}>
                    {item.icon && <TrendingUp className="w-2.5 h-2.5" />}
                    {visible ? item.value : "••••"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/20 transition-all duration-200 active:scale-95 group"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <action.icon className={`w-5 h-5 ${action.color} group-hover:text-primary transition-colors`} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* KI Insight */}
        <button onClick={() => navigate("/dashboard/analytics")} className="glass-card p-4 mb-6 border-primary/20 w-full text-left hover:border-primary/40 transition-all group">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary mb-0.5">Waides KI Insight</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your spending is 15% lower this week. You could save ꠄ 200 more by switching your data plan to monthly.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
            <button onClick={() => navigate("/dashboard/history")} className="text-xs text-primary flex items-center gap-0.5 hover:gap-1 transition-all">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentTx.map((tx) => {
              const Icon = (txTypeIcons as any)[tx.type] || Send;
              const isPositive = tx.type === "received";
              const amt = Number(tx.amount);
              return (
                <div key={tx.id} className="glass-card p-3.5 flex items-center gap-3 hover:border-primary/10 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-primary/10" : "bg-secondary"}`}>
                    <Icon className={`w-4 h-4 ${isPositive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{tx.description || tx.recipient}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${isPositive ? "text-primary" : "text-foreground"}`}>
                      {isPositive ? "+" : "-"}ꠄ {amt.toLocaleString()}
                    </p>
                    <p className={`text-[10px] ${tx.status === "completed" ? "text-muted-foreground" : tx.status === "pending" ? "text-accent" : "text-destructive"}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentTx.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No transactions yet</p>}
          </div>
        </div>

        {/* Spacer for chat button */}
        <div className="h-16" />
      </div>

      {false && <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {chatOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageSquare className="w-6 h-6 text-primary-foreground" />}
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-80 glass-card rounded-2xl overflow-hidden shadow-2xl border-primary/10 animate-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">KonsAI</p>
              <p className="text-[10px] text-primary">Online • Ready to help</p>
            </div>
          </div>
          <div className="p-4 h-48 overflow-y-auto space-y-3">
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%]">
                <p className="text-xs text-foreground">Hello! 👋 I'm KonsAI, your WaidTred assistant. How can I help you today?</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Check balance", "Send money", "SmaiPin help", "Talk to agent"].map(q => (
                <button key={q} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground" />
            <button className="p-2 rounded-lg gradient-primary text-primary-foreground">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      </>}
    </DashboardLayout>
  );
};

export default DashboardHome;
