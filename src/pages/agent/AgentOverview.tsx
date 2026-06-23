import { DollarSign, MessageSquare, CheckCircle, Clock } from "lucide-react";
import AgentLayout from "@/components/agent/AgentLayout";

const stats = [
  { label: "Pending Requests", value: 8, icon: Clock, color: "text-accent" },
  { label: "Completed Today", value: 12, icon: CheckCircle, color: "text-primary" },
  { label: "Active Chats", value: 3, icon: MessageSquare, color: "text-primary" },
  { label: "Total Funded", value: "ꠄ 45,200", icon: DollarSign, color: "text-primary" },
];

const recentActivity = [
  { time: "2 min ago", event: "Confirmed funding ꠄ 4,166 for Kwame Asante", type: "confirm" },
  { time: "15 min ago", event: "Responded to Amina Bello's chat", type: "chat" },
  { time: "1 hr ago", event: "Confirmed funding ꠄ 2,500 for Sarah Mills", type: "confirm" },
  { time: "2 hr ago", event: "Marked payment received from John Kamau", type: "received" },
  { time: "3 hr ago", event: "Assigned to new user Priya Sharma", type: "assign" },
];

const AgentOverview = () => (
  <AgentLayout>
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
      <h3 className="font-display font-semibold text-foreground text-sm mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentActivity.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
            <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{item.time}</span>
            <span className="text-sm text-foreground flex-1">{item.event}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
              item.type === "confirm" ? "bg-primary/10 text-primary" :
              item.type === "chat" ? "bg-accent/10 text-accent" :
              "bg-secondary text-muted-foreground"
            }`}>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  </AgentLayout>
);

export default AgentOverview;
