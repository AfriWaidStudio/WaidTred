import { useEffect, useState } from "react";
import { DollarSign, CheckCircle, XCircle, Eye, Clock, Filter } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const AdminFunding = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await AdminService.listFunding(filter));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const confirm = async (id: string, approve: boolean) => {
    const notes = approve ? undefined : prompt("Reason for rejection?") || "Rejected";
    const { error } = await AdminService.confirmFunding(id, approve, notes);
    if (error) return toast.error(error.message);
    toast.success(approve ? "Funding approved" : "Funding rejected"); load();
  };

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    totalValue: rows.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0),
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: stats.total, icon: DollarSign },
          { label: "Pending", value: stats.pending, icon: Clock },
          { label: "Approved", value: stats.approved, icon: CheckCircle },
          { label: "Total Funded", value: `ꠄ ${stats.totalValue.toLocaleString()}`, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">User</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Method</th>
                <th className="text-right p-3 text-muted-foreground font-medium">ꠄ Amount</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No funding requests</td></tr>}
              {rows.map(req => (
                <tr key={req.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{req.profile?.full_name || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{req.profile?.email}</p>
                  </td>
                  <td className="p-3 text-foreground">{req.method}</td>
                  <td className="p-3 text-right font-semibold text-primary">ꠄ {Number(req.amount).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      req.status === "pending" ? "bg-accent/10 text-accent" :
                      req.status === "approved" ? "bg-primary/10 text-primary" :
                      "bg-destructive/10 text-destructive"
                    }`}>{req.status}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFunding;
