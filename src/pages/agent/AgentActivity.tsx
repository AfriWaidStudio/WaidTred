import { Activity, CheckCircle, MessageSquare, UserPlus, DollarSign } from "lucide-react";
import AgentLayout from "@/components/agent/AgentLayout";

const activities = [
  { time: "2026-04-05 10:30", action: "Confirmed funding", detail: "ꠄ 4,166 for Kwame Asante (GHS 5,000)", icon: CheckCircle, color: "text-primary" },
  { time: "2026-04-05 10:16", action: "Sent payment details", detail: "MTN MoMo info to Kwame Asante", icon: MessageSquare, color: "text-accent" },
  { time: "2026-04-05 09:45", action: "Assigned new user", detail: "Amina Bello from Nigeria", icon: UserPlus, color: "text-primary" },
  { time: "2026-04-05 09:00", action: "Confirmed funding", detail: "ꠄ 2,500 for Sarah Mills (£200)", icon: CheckCircle, color: "text-primary" },
  { time: "2026-04-04 18:30", action: "Marked payment received", detail: "John Kamau (KES 28,000)", icon: DollarSign, color: "text-primary" },
  { time: "2026-04-04 16:00", action: "Chat response", detail: "Responded to Priya Sharma's query", icon: MessageSquare, color: "text-accent" },
  { time: "2026-04-04 14:00", action: "Confirmed funding", detail: "ꠄ 1,928 for Priya Sharma (₹16,000)", icon: CheckCircle, color: "text-primary" },
  { time: "2026-04-04 10:00", action: "Started shift", detail: "Logged in to Agent Panel", icon: Activity, color: "text-muted-foreground" },
];

const AgentActivity = () => (
  <AgentLayout>
    <div className="glass-card p-4 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: 4 },
          { label: "This Week", value: 23 },
          { label: "This Month", value: 87 },
          { label: "Avg Response", value: "4 min" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-card p-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-4">Activity Log</h3>
      <div className="space-y-1">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
            <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="text-[11px] text-muted-foreground">{item.detail}</p>
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  </AgentLayout>
);

export default AgentActivity;
