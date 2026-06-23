import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Filter } from "lucide-react";

type AuditLog = {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  before_state: any;
  after_state: any;
  metadata: any;
  created_at: string | null;
};

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
      setLogs((data as AuditLog[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-2">No audit logs yet</h3>
          <p className="text-sm text-muted-foreground">Admin actions will be recorded here automatically.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 text-xs text-muted-foreground font-medium">Time</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Action</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Target</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 text-xs text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                    <td className="p-3 text-foreground font-medium">{log.action_type}</td>
                    <td className="p-3 text-xs text-muted-foreground">{log.target_type} {log.target_id ? `#${log.target_id.slice(0, 8)}` : ""}</td>
                    <td className="p-3 text-xs text-muted-foreground">{JSON.stringify(log.metadata)?.slice(0, 60)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAuditLog;
