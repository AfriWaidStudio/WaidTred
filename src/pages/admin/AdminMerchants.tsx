import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Eye, Lock, CheckCircle } from "lucide-react";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const AdminMerchants = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setRows(await AdminService.listMerchants()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await AdminService.setMerchantStatus(id, status);
    if (error) return toast.error(error.message);
    toast.success(`Merchant ${status}`); load();
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4"><p className="text-2xl font-bold font-display text-foreground">{rows.length}</p><p className="text-[10px] text-muted-foreground">Total Merchants</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold font-display text-foreground">{rows.filter(r => r.kyb_status === "approved").length}</p><p className="text-[10px] text-muted-foreground">Approved</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold font-display text-foreground">{rows.filter(r => r.kyb_status === "pending").length}</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Merchant</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Category</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Owner</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No merchants registered yet</td></tr>}
              {rows.map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-medium text-foreground">{m.business_name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{m.category || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{m.profile?.full_name || "—"}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                    m.kyb_status === "approved" ? "bg-primary/10 text-primary" : m.kyb_status === "pending" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                  }`}>{m.kyb_status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-secondary" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      {m.kyb_status === "pending" && <button onClick={() => setStatus(m.id, "approved")} className="p-1.5 rounded-lg hover:bg-primary/10" title="Approve"><CheckCircle className="w-3.5 h-3.5 text-primary" /></button>}
                      <button onClick={() => setStatus(m.id, "suspended")} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Suspend"><Lock className="w-3.5 h-3.5 text-destructive" /></button>
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

export default AdminMerchants;
