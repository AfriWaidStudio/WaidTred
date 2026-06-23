import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, ArrowUpRight, Filter } from "lucide-react";
import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const ModeratorDisputes = () => {
  const [filter, setFilter] = useState<"all" | "open" | "investigating" | "escalated" | "resolved">("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setRows(await AdminService.listDisputes(filter)); setLoading(false); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const resolve = async (id: string) => {
    const note = prompt("Resolution note?"); if (!note) return;
    const { error } = await AdminService.setDisputeStatus(id, "resolved", note);
    if (error) return toast.error(error.message);
    toast.success("Resolved"); load();
  };
  const escalate = async (id: string) => {
    const { error } = await AdminService.setDisputeStatus(id, "escalated");
    if (error) return toast.error(error.message);
    toast.success("Escalated"); load();
  };

  return (
    <ModeratorLayout>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "open", "investigating", "escalated", "resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}
        {!loading && rows.length === 0 && <p className="text-center text-muted-foreground py-8">No disputes</p>}
        {rows.map(d => (
          <div key={d.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{d.reason}</p>
                <p className="text-[11px] text-muted-foreground">{d.profile?.full_name || d.user_id?.slice(0, 8)}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                d.status === "open" ? "bg-accent/10 text-accent" :
                d.status === "investigating" ? "bg-primary/10 text-primary" :
                d.status === "escalated" ? "bg-destructive/10 text-destructive" :
                "bg-secondary text-muted-foreground"
              }`}>{d.status}</span>
            </div>
            {d.description && <p className="text-xs text-muted-foreground mb-2">{d.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {new Date(d.created_at).toLocaleString()}</span>
              {d.status !== "resolved" && (
                <div className="flex gap-1">
                  <button onClick={() => resolve(d.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Resolve"><CheckCircle className="w-3.5 h-3.5" /></button>
                  {d.status !== "escalated" && (
                    <button onClick={() => escalate(d.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Escalate"><ArrowUpRight className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ModeratorLayout>
  );
};

export default ModeratorDisputes;
