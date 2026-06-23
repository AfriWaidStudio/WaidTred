import { useState } from "react";
import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

const mockActions = [
  { id: "1", moderator: "Sarah K.", action: "Flagged Transaction", target: "TXN-892", reason: "Unusual amount pattern", result: "Under Review", time: "10 min ago" },
  { id: "2", moderator: "James M.", action: "Resolved Dispute", target: "DSP-445", reason: "Payment confirmed", result: "Resolved", time: "1 hour ago" },
  { id: "3", moderator: "Sarah K.", action: "Blocked User", target: "USR-773", reason: "Multiple fraud attempts", result: "Blocked", time: "3 hours ago" },
  { id: "4", moderator: "James M.", action: "Approved KYC", target: "USR-201", reason: "Documents valid", result: "Approved", time: "5 hours ago" },
  { id: "5", moderator: "Sarah K.", action: "Escalated Chat", target: "CHT-112", reason: "Threatening language", result: "Escalated", time: "Yesterday" },
];

const resultIcons: Record<string, any> = {
  "Under Review": Clock,
  "Resolved": CheckCircle,
  "Blocked": XCircle,
  "Approved": CheckCircle,
  "Escalated": AlertTriangle,
};

const resultColors: Record<string, string> = {
  "Under Review": "text-accent bg-accent/10",
  "Resolved": "text-primary bg-primary/10",
  "Blocked": "text-destructive bg-destructive/10",
  "Approved": "text-primary bg-primary/10",
  "Escalated": "text-destructive bg-destructive/10",
};

const ModeratorActionLog = () => {
  const [search, setSearch] = useState("");
  const filtered = mockActions.filter(a => a.action.toLowerCase().includes(search.toLowerCase()) || a.target.toLowerCase().includes(search.toLowerCase()));

  return (
    <ModeratorLayout>
      <h1 className="font-display text-lg font-bold text-foreground mb-4">Moderation Action Log</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input placeholder="Search actions..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const Icon = resultIcons[a.result] || Shield;
          return (
            <div key={a.id} className="glass-card rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.action}</p>
                  <p className="text-[10px] text-muted-foreground">Target: {a.target} • By: {a.moderator}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 ${resultColors[a.result] || "text-muted-foreground bg-muted"}`}>
                  <Icon className="w-3 h-3" /> {a.result}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{a.reason}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{a.time}</p>
            </div>
          );
        })}
      </div>
    </ModeratorLayout>
  );
};

export default ModeratorActionLog;
