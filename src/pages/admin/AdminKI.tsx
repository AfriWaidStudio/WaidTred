import AdminLayout from "@/components/admin/AdminLayout";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Shield, ArrowUpRight } from "lucide-react";

const kiInsights = [
  { type: "fraud" as const, icon: Shield, title: "Potential fraud ring detected", desc: "3 accounts created within 5 minutes from same IP block (41.58.xxx.xxx) with immediate large transfers. Pattern matches known fraud behavior.", action: "Investigate accounts", severity: "critical" },
  { type: "optimization" as const, icon: Lightbulb, title: "Revenue opportunity: Kenya expansion", desc: "Kenya user registrations up 340% this month. Current M-Pesa integration covers only 60% of market. Adding Airtel Money could capture additional ꠄ 120K monthly volume.", action: "View analysis", severity: "info" },
  { type: "trend" as const, icon: TrendingUp, title: "Spending pattern anomaly", desc: "User sarah.mills@example.com shows 800% increase in transfer volume over past 48 hours (ꠄ 34,500 total). Account has been auto-flagged.", action: "Review account", severity: "high" },
  { type: "suggestion" as const, icon: Lightbulb, title: "Optimize recharge margins", desc: "Nigerian airtime recharges have 15% failure rate with current provider. Switching to backup provider could save ꠄ 8,000/month in refunds.", action: "Compare providers", severity: "medium" },
  { type: "fraud" as const, icon: AlertTriangle, title: "Unusual cross-border pattern", desc: "12 micro-transfers (ꠄ 99 each) from Ghana to India within 1 hour. Possible structuring to avoid detection thresholds.", action: "Flag transactions", severity: "high" },
];

const sevColors: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-accent/30 bg-accent/5",
  medium: "border-primary/30 bg-primary/5",
  info: "border-border bg-secondary/30",
};

const AdminKI = () => {
  return (
    <AdminLayout>
      <div className="glass-card p-4 mb-6 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Waides KI Engine</h3>
            <p className="text-xs text-muted-foreground">AI-powered fraud detection, spending analysis, and system optimization</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
            <span className="text-[11px] text-primary font-medium">Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold font-display text-foreground">847</p>
          <p className="text-[10px] text-muted-foreground">Patterns analyzed today</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold font-display text-destructive">3</p>
          <p className="text-[10px] text-muted-foreground">Fraud alerts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold font-display text-primary">98.7%</p>
          <p className="text-[10px] text-muted-foreground">Detection accuracy</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold font-display text-accent">5</p>
          <p className="text-[10px] text-muted-foreground">Optimization suggestions</p>
        </div>
      </div>

      <h3 className="font-display font-semibold text-foreground mb-3">KI Findings & Recommendations</h3>
      <div className="space-y-3">
        {kiInsights.map((insight, i) => (
          <div key={i} className={`glass-card p-4 border ${sevColors[insight.severity]}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <insight.icon className={`w-4 h-4 ${insight.severity === "critical" ? "text-destructive" : insight.severity === "high" ? "text-accent" : "text-primary"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    insight.severity === "critical" ? "bg-destructive/10 text-destructive" :
                    insight.severity === "high" ? "bg-accent/10 text-accent" :
                    insight.severity === "medium" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>{insight.severity}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{insight.desc}</p>
                <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  {insight.action} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminKI;
