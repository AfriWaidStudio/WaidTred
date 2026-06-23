import AdminLayout from "@/components/admin/AdminLayout";
import { Search, ArrowUpRight, ArrowDownLeft, RotateCcw, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { txStatusColors } from "@/lib/constants";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const filters = ["all", "transfers", "recharge", "bills", "flagged"];

const AdminTransactions = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await AdminService.listTransactions(filter));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const filtered = rows.filter(tx =>
    (tx.profile?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    tx.id.toLowerCase().includes(search.toLowerCase())
  );

  const setStatus = async (id: string, status: string) => {
    const { error } = await AdminService.setTxStatus(id, status);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); load();
  };
  const flag = async (id: string) => {
    const reason = prompt("Reason for flagging?"); if (!reason) return;
    const { error } = await AdminService.flagTx(id, reason);
    if (error) return toast.error(error.message);
    toast.success("Flagged"); load();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or TX ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">TX ID</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">User</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Amount</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Recipient</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No transactions</td></tr>}
              {filtered.map(tx => (
                <tr key={tx.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${tx.status === "flagged" ? "bg-destructive/5" : ""}`}>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{tx.id.slice(0, 8)}</td>
                  <td className="p-3 text-foreground font-medium">{tx.profile?.full_name || "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground capitalize">{tx.type}</td>
                  <td className={`p-3 font-semibold ${tx.type === "received" ? "text-primary" : "text-foreground"}`}>ꠄ {Number(tx.amount).toLocaleString()}</td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{tx.recipient || "—"}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${txStatusColors[tx.status] || ""}`}>{tx.status}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {tx.status === "flagged" && <button onClick={() => setStatus(tx.id, "completed")} className="p-1.5 rounded-lg hover:bg-primary/10" title="Approve"><ArrowUpRight className="w-3.5 h-3.5 text-primary" /></button>}
                      {tx.status === "flagged" && <button onClick={() => setStatus(tx.id, "failed")} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Decline"><ArrowDownLeft className="w-3.5 h-3.5 text-destructive" /></button>}
                      {tx.status === "completed" && <button onClick={() => setStatus(tx.id, "reversed")} className="p-1.5 rounded-lg hover:bg-secondary" title="Reverse"><RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                      {tx.status !== "flagged" && <button onClick={() => flag(tx.id)} className="p-1.5 rounded-lg hover:bg-secondary" title="Flag"><Flag className="w-3.5 h-3.5 text-muted-foreground" /></button>}
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

export default AdminTransactions;
