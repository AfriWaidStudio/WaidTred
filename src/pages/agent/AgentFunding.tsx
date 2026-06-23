import { useEffect, useState } from "react";
import { CheckCircle, Eye, Clock, Filter, XCircle } from "lucide-react";
import AgentLayout from "@/components/agent/AgentLayout";
import { FundingService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AgentFunding = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("funding_requests").select("*, profile:profiles!funding_requests_user_id_fkey(full_name,email,country)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q; setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const confirm = async (id: string, approve: boolean) => {
    const notes = approve ? "Confirmed by agent" : prompt("Reason?") || "Rejected";
    const { error } = await FundingService.confirm(id, approve, notes);
    if (error) return toast.error(error.message);
    toast.success(approve ? "Funded" : "Rejected"); load();
  };

  return (
    <AgentLayout>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}
        {!loading && rows.length === 0 && <p className="text-center text-muted-foreground py-8">No funding requests</p>}
        {rows.map(req => (
          <div key={req.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-foreground">{req.profile?.full_name || "—"}</p>
                <p className="text-[11px] text-muted-foreground">{req.profile?.country} • {req.method}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">ꠄ {Number(req.amount).toLocaleString()}</p>
              </div>
            </div>
            {req.reference_note && <p className="text-xs text-muted-foreground mb-2">Note: {req.reference_note}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                  req.status === "pending" ? "bg-accent/10 text-accent" :
                  req.status === "approved" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}>{req.status}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleString()}</span>
              </div>
              <div className="flex gap-1">
                {req.proof_url && (
                  <a href={req.proof_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground" title="View Proof">
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                )}
                {req.status === "pending" && (
                  <>
                    <button onClick={() => confirm(req.id, true)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20" title="Approve">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => confirm(req.id, false)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Reject">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AgentLayout>
  );
};

export default AgentFunding;
