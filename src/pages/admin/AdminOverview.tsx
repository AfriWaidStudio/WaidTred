import { useEffect, useState } from "react";
import { Users, Wallet, ArrowLeftRight, Globe, Bell, TrendingUp, TrendingDown, Activity } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const statCards = [
  { label: "Total Users", value: "12,847", change: "+342 this week", icon: Users, trend: "up" as const },
  { label: "Total Volume", value: "ꠄ 4.2M", change: "+18% vs last month", icon: ArrowLeftRight, trend: "up" as const },
  { label: "Wallet Value", value: "ꠄ 8.7M", change: "Smai Sika + fiat", icon: Wallet, trend: "up" as const },
  { label: "Active Countries", value: "23", change: "3 pending launch", icon: Globe, trend: "up" as const },
];

const liveFeed = [
  { time: "Just now", event: "Transfer ꠄ 500 → Ghana", type: "transfer", status: "completed" },
  { time: "2m ago", event: "Airtime ꠄ 50 MTN Nigeria", type: "recharge", status: "completed" },
  { time: "5m ago", event: "New user signup • Kenya", type: "user", status: "new" },
  { time: "8m ago", event: "Transfer ꠄ 3,200 → UK", type: "transfer", status: "flagged" },
  { time: "12m ago", event: "Bill payment ꠄ 120 ECG", type: "bill", status: "completed" },
  { time: "15m ago", event: "QR Payment ꠄ 85 Shoprite", type: "payment", status: "completed" },
  { time: "18m ago", event: "Transfer ꠄ 15,000 → India", type: "transfer", status: "flagged" },
  { time: "22m ago", event: "Data 5GB Safaricom Kenya", type: "recharge", status: "completed" },
];

const AdminOverview = () => {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { count } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("resolved", false);
      setAlertCount(count || 0);
    };
    fetchAlerts();
  }, []);

  return (
    <AdminLayout>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-5 h-5 text-primary" />
              {card.trend === "up" ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{card.value}</p>
            <p className="text-[11px] text-muted-foreground">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">Live Transaction Feed</h3>
            <div className="ml-auto w-2 h-2 rounded-full gradient-primary animate-pulse" />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {liveFeed.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{item.time}</span>
                <span className="text-sm text-foreground flex-1">{item.event}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                  item.status === "completed" ? "bg-primary/10 text-primary" :
                  item.status === "flagged" ? "bg-destructive/10 text-destructive" :
                  "bg-accent/10 text-accent"
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Summary */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground text-sm">Active Alerts</h3>
            <span className="ml-auto text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">{alertCount}</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Critical", count: 1, color: "bg-destructive" },
              { label: "High", count: 3, color: "bg-accent" },
              { label: "Medium", count: 1, color: "bg-primary" },
              { label: "Low", count: 0, color: "bg-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-sm text-foreground flex-1">{s.label}</span>
                <span className="text-sm font-semibold text-foreground">{s.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs text-muted-foreground mb-3">Quick Metrics</h4>
            {[
              { label: "Success Rate", value: "98.2%" },
              { label: "Avg Response", value: "1.2s" },
              { label: "Active Sessions", value: "1,847" },
            ].map((m) => (
              <div key={m.label} className="flex justify-between py-1.5">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className="text-xs font-semibold text-foreground">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
