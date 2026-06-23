import { AlertTriangle, Flag, MessageSquare, Shield, TrendingUp } from "lucide-react";
import ModeratorLayout from "@/components/moderator/ModeratorLayout";

const stats = [
  { label: "Flagged Transactions", value: 7, icon: AlertTriangle, color: "text-destructive" },
  { label: "Open Disputes", value: 3, icon: Flag, color: "text-accent" },
  { label: "Monitored Chats", value: 12, icon: MessageSquare, color: "text-primary" },
  { label: "Resolved Today", value: 5, icon: Shield, color: "text-primary" },
];

const recentFlags = [
  { time: "5 min ago", event: "Large transfer ꠄ 15,000 to India — unusual pattern", severity: "high", user: "Unknown" },
  { time: "18 min ago", event: "Multiple failed login attempts — Kenya IP", severity: "critical", user: "john@test.com" },
  { time: "45 min ago", event: "Duplicate airtime purchase detected", severity: "medium", user: "amina@test.com" },
  { time: "1 hr ago", event: "New account rapid funding ꠄ 50,000", severity: "high", user: "new_user_042" },
  { time: "2 hr ago", event: "SmaiPin bulk generation request", severity: "low", user: "admin@waidtred.com" },
];

const ModeratorOverview = () => (
  <ModeratorLayout>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className="glass-card p-4">
          <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
          <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>

    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="font-display font-semibold text-foreground text-sm">Recent Flags</h3>
      </div>
      <div className="space-y-2">
        {recentFlags.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{item.time}</span>
            <span className="text-sm text-foreground flex-1">{item.event}</span>
            <span className="text-[11px] text-muted-foreground">{item.user}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
              item.severity === "critical" ? "bg-destructive/10 text-destructive" :
              item.severity === "high" ? "bg-accent/10 text-accent" :
              item.severity === "medium" ? "bg-primary/10 text-primary" :
              "bg-secondary text-muted-foreground"
            }`}>{item.severity}</span>
          </div>
        ))}
      </div>
    </div>
  </ModeratorLayout>
);

export default ModeratorOverview;
