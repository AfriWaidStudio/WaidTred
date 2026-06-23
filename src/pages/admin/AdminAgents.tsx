import { useEffect, useState } from "react";
import { UserCheck, Plus, Activity, Ban, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminService } from "@/lib/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState("");

  const load = async () => { setLoading(true); setAgents(await AdminService.listAgents()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const promote = async () => {
    if (!email) return toast.error("Enter user email");
    const { data: prof } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!prof) return toast.error("User not found");
    const { error } = await AdminService.promoteToAgent(prof.id);
    if (error) return toast.error(error.message);
    toast.success("Promoted to agent"); setEmail(""); setAdding(false); load();
  };

  const suspend = async (id: string) => {
    if (!confirm("Remove agent role?")) return;
    const { error } = await AdminService.removeRole(id, "agent");
    if (error) return toast.error(error.message);
    toast.success("Agent role removed"); load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">Agent Management</h3>
          <p className="text-xs text-muted-foreground">Promote users to funding agents</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" /> Add Agent</Button>
      </div>

      {adding && (
        <div className="glass-card p-4 mb-4 flex gap-2">
          <Input placeholder="User email to promote" value={email} onChange={e => setEmail(e.target.value)} />
          <Button onClick={promote}>Promote</Button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4"><UserCheck className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-display">{agents.length}</p><p className="text-[11px] text-muted-foreground">Total Agents</p></div>
        <div className="glass-card p-4"><Activity className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold font-display">{agents.filter(a => a.account_status === "active").length}</p><p className="text-[11px] text-muted-foreground">Active</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Agent</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Country</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && agents.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No agents yet — promote a user</td></tr>}
              {agents.map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3"><p className="font-medium text-foreground">{a.full_name || "—"}</p><p className="text-[11px] text-muted-foreground">{a.email}</p></td>
                  <td className="p-3 text-foreground">{a.country}</td>
                  <td className="p-3"><span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${a.account_status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{a.account_status}</span></td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => suspend(a.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20" title="Revoke"><Ban className="w-3.5 h-3.5" /></button>
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

export default AdminAgents;
