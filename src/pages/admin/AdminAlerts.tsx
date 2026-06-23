import { useEffect, useState } from "react";
import { Search, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Alert = {
  id: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  category: string | null;
  resolved: boolean | null;
  created_at: string | null;
};

const severityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-accent/10 text-accent border-accent/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

const AdminAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from("alerts").select("*").order("created_at", { ascending: false });
      if (filter === "active") query = query.eq("resolved", false);
      if (filter === "resolved") query = query.eq("resolved", true);
      const { data } = await query;
      setAlerts((data as Alert[]) || []);
      setLoading(false);
    };
    fetch();
  }, [filter]);

  const resolveAlert = async (id: string) => {
    await supabase.from("alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Alert resolved" });
  };

  return (
    <AdminLayout>
      <div className="flex gap-2 mb-6 items-center justify-between">
        <div className="flex gap-2">
          {(["active", "all", "resolved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
              {f} {f === "active" && alerts.length > 0 ? `(${alerts.length})` : ""}
            </button>
          ))}
        </div>
        {filter === "active" && alerts.length > 0 && (
          <button onClick={async () => {
            if (!confirm(`Resolve all ${alerts.length} active alerts?`)) return;
            await supabase.from("alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("resolved", false);
            setAlerts([]);
            toast({ title: "All alerts resolved" });
          }} className="px-4 py-2 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
            Bulk Resolve
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">No {filter} alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`glass-card p-4 border ${severityColors[alert.severity]}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === "critical" ? "text-destructive" : alert.severity === "high" ? "text-accent" : "text-primary"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[alert.severity]}`}>{alert.severity}</span>
                    {alert.category && <span className="text-[10px] text-muted-foreground">• {alert.category}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                  {alert.created_at && <p className="text-[10px] text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>}
                </div>
                {!alert.resolved && (
                  <button onClick={() => resolveAlert(alert.id)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex-shrink-0">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAlerts;
