import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, AlertTriangle, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const levelOf = (s: number) => s < 40 ? "High" : s < 70 ? "Medium" : "Low";
const colorFor = (l: string) => l === "High" ? "text-destructive bg-destructive/10" : l === "Medium" ? "text-accent bg-accent/10" : "text-primary bg-primary/10";

const AdminRiskScoring = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setRows(await AdminService.listRisk()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const freeze = async (user_id: string) => {
    const { error } = await AdminService.setAccountStatus(user_id, "frozen");
    if (error) return toast.error(error.message);
    toast.success("Account frozen"); load();
  };

  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length) : 0;
  const high = rows.filter(r => r.score < 40).length;

  return (
    <AdminLayout>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Risk Scoring Engine</h1>
        <p className="text-xs text-muted-foreground">Per-user risk profile · manual freeze</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Avg Score</p><p className="text-2xl font-bold">{avg}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">High-risk users</p><p className="text-2xl font-bold text-destructive">{high}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Total scored</p><p className="text-2xl font-bold">{rows.length}</p></div>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40"><tr className="text-[11px] text-muted-foreground"><th className="text-left p-3">User</th><th className="text-left p-3">Score</th><th className="text-left p-3">Level</th><th className="p-3"></th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No risk scores yet</td></tr>}
            {rows.map(u => { const lvl = levelOf(u.score); return (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-semibold">{u.profile?.full_name || u.user_id.slice(0, 8)}</td>
                <td className="p-3">{u.score}</td>
                <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${colorFor(lvl)}`}>{lvl}</span></td>
                <td className="p-3">
                  <button onClick={() => freeze(u.user_id)} className="text-[10px] text-destructive flex items-center gap-1"><Snowflake className="w-3 h-3" />Freeze</button>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminRiskScoring;
