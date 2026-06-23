import { useEffect, useState } from "react";
import { AlertTriangle, Eye, Ban, CheckCircle, Filter } from "lucide-react";
import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const ModeratorFlagged = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "removed">("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setRows(await AdminService.listFlagged(filter)); setLoading(false); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const resolve = async (id: string, status: "approved" | "removed") => {
    const { error } = await AdminService.setFlagStatus(id, status);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); load();
  };

  return (
    <ModeratorLayout>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "pending", "approved", "removed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}
        {!loading && rows.length === 0 && <p className="text-center text-muted-foreground py-8">No flagged items</p>}
        {rows.map(tx => (
          <div key={tx.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-secondary text-muted-foreground">{tx.content_type}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{tx.content_id?.slice(0, 8)}</p>
            <p className="text-xs text-destructive/80 mb-3">{tx.reason}</p>
            {tx.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => resolve(tx.id, "approved")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Clear
                </button>
                <button onClick={() => resolve(tx.id, "removed")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
                  <Ban className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            )}
            {tx.status !== "pending" && <span className="text-[10px] text-muted-foreground">Resolved · {tx.status}</span>}
          </div>
        ))}
      </div>
    </ModeratorLayout>
  );
};

export default ModeratorFlagged;
