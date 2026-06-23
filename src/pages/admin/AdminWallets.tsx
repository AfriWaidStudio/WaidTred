import AdminLayout from "@/components/admin/AdminLayout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services";

const AdminWallets = () => {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setRows(await AdminService.listWallets()); setLoading(false); })(); }, []);

  const filtered = rows.filter(w => (w.profile?.full_name || "").toLowerCase().includes(search.toLowerCase()));
  const totalValue = rows.reduce((s, w) => s + Number(w.total_balance || 0), 0);
  const totalLocked = rows.reduce((s, w) => s + Number(w.locked_balance || 0), 0);

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Total Wallet Value</p><p className="text-xl font-bold font-display text-foreground">ꠄ {totalValue.toLocaleString()}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Total Locked</p><p className="text-xl font-bold font-display text-accent">ꠄ {totalLocked.toLocaleString()}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Active Wallets</p><p className="text-xl font-bold font-display text-foreground">{rows.length}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Avg Balance</p><p className="text-xl font-bold font-display text-foreground">ꠄ {rows.length ? Math.round(totalValue / rows.length).toLocaleString() : 0}</p></div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search wallets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">User</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Country</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Total</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Available</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Locked</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No wallets</td></tr>}
              {filtered.map(w => (
                <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-medium text-foreground">{w.profile?.full_name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{w.profile?.country || "—"}</td>
                  <td className="p-3 font-semibold text-foreground">ꠄ {Number(w.total_balance).toLocaleString()}</td>
                  <td className="p-3 text-primary font-medium">ꠄ {Number(w.available_balance).toLocaleString()}</td>
                  <td className={`p-3 font-medium ${Number(w.locked_balance) > 0 ? "text-accent" : "text-muted-foreground"}`}>ꠄ {Number(w.locked_balance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWallets;
