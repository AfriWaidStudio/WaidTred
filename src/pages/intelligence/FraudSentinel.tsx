import { Shield, AlertTriangle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { FraudService } from "@/lib/services";

const FraudSentinel = () => {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { FraudService.myEvents().then(setEvents); }, []);
  const blocked = events.filter(e => e.action_taken === "blocked").length;

  return (
    <WealthPageShell title="Fraud Sentinel" subtitle="Real-time anomaly detection" Icon={Shield} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Check className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold">Account secured</p>
        </div>
        <p className="text-[11px] text-muted-foreground">{blocked} threats blocked</p>
      </div>
      <h3 className="text-sm font-display font-semibold mb-3">Recent events</h3>
      <div className="space-y-2">
        {events.map(e => (
          <div key={e.id} className="glass-card p-3 flex items-start gap-3">
            <AlertTriangle className={`w-4 h-4 mt-0.5 ${e.severity === "high" ? "text-destructive" : e.severity === "medium" ? "text-accent" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className="text-xs font-semibold capitalize">{e.event_type.replace(/_/g, " ")}</p>
              <p className="text-[11px] text-muted-foreground">{e.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(e.created_at).toLocaleString()}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary capitalize">{e.action_taken}</span>
          </div>
        ))}
        {events.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No fraud events. You're safe.</p>}
      </div>
    </WealthPageShell>
  );
};
export default FraudSentinel;
