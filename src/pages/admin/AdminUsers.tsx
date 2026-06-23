import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Shield, Eye, Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kycStatusColors, accountStatusColors } from "@/lib/constants";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setUsers(await AdminService.listUsers(search));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search]);

  const toggleFreeze = async (u: any) => {
    const next = u.account_status === "frozen" ? "active" : "frozen";
    const { error } = await AdminService.setAccountStatus(u.id, next as any);
    if (error) return toast.error(error.message);
    toast.success(`Account ${next}`); load();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">Total: {users.length}</span>
          <span className="px-3 py-2 rounded-lg bg-accent/10 text-accent font-medium">Pending KYC: {users.filter(u => u.kyc_status === "pending").length}</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">User</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Country</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">KYC</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Joined</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users yet</td></tr>}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{u.full_name || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{u.country}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${kycStatusColors[u.kyc_status] || ""}`}>{u.kyc_status}</span></td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${accountStatusColors[u.account_status] || ""}`}>{u.account_status}</span></td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/admin/users/${u.id}`)} className="p-1.5 rounded-lg hover:bg-secondary" title="View"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => toggleFreeze(u)} className="p-1.5 rounded-lg hover:bg-secondary" title={u.account_status === "frozen" ? "Unfreeze" : "Freeze"}>
                        {u.account_status === "frozen" ? <Unlock className="w-3.5 h-3.5 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {u.kyc_status !== "verified" && (
                        <button onClick={() => navigate("/admin/compliance")} className="p-1.5 rounded-lg hover:bg-secondary" title="Review KYC evidence"><Shield className="w-3.5 h-3.5 text-primary" /></button>
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

export default AdminUsers;
