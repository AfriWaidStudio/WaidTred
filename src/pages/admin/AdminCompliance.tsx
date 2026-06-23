import { useEffect, useState } from "react";
import { CheckCircle, ExternalLink, FileCheck, Loader2, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminService } from "@/lib/services";

interface KycSubmission {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string | null;
  selfie_url: string | null;
  status: string;
  created_at: string;
  profile: { full_name: string | null; email: string | null; country: string | null } | null;
}

const AdminCompliance = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setRows(await AdminService.listKycSubmissions() as KycSubmission[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openEvidence = async (path: string | null) => {
    if (!path) return;
    const url = await AdminService.getKycEvidenceUrl(path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast({ title: "Unable to open evidence", variant: "destructive" });
  };

  const review = async (id: string, approve: boolean) => {
    const notes = window.prompt(approve ? "Approval notes (optional)" : "Rejection reason (required)") ?? "";
    if (!approve && !notes.trim()) return;
    setReviewing(id);
    const { error } = await AdminService.reviewKyc(id, approve, notes);
    setReviewing(null);
    if (error) return toast({ title: "Review failed", description: error.message, variant: "destructive" });
    toast({ title: approve ? "KYC approved" : "KYC rejected" });
    await load();
  };

  const pending = rows.filter((row) => row.status === "pending").length;
  const approved = rows.filter((row) => row.status === "approved").length;
  const rejected = rows.filter((row) => row.status === "rejected").length;

  return (
    <AdminLayout>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" />KYC Review</h1>
        <p className="text-xs text-muted-foreground">Review private identity evidence and record auditable decisions.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Pending</p><p className="text-2xl font-bold text-accent">{pending}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Approved</p><p className="text-2xl font-bold text-primary">{approved}</p></div>
        <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Rejected</p><p className="text-2xl font-bold text-destructive">{rejected}</p></div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40"><tr className="text-[11px] text-muted-foreground"><th className="text-left p-3">User</th><th className="text-left p-3">Document</th><th className="text-left p-3">Submitted</th><th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No KYC submissions</td></tr>}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="p-3"><p className="font-semibold">{row.profile?.full_name || "Unnamed user"}</p><p className="text-[10px] text-muted-foreground">{row.profile?.email}</p></td>
                <td className="p-3"><p>{row.document_type}</p><div className="flex gap-2 mt-1"><button onClick={() => openEvidence(row.document_url)} className="text-[10px] text-primary flex items-center gap-1">ID <ExternalLink className="w-3 h-3" /></button><button onClick={() => openEvidence(row.selfie_url)} className="text-[10px] text-primary flex items-center gap-1">Selfie <ExternalLink className="w-3 h-3" /></button></div></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("en-GB")}</td>
                <td className="p-3 text-xs capitalize">{row.status}</td>
                <td className="p-3"><div className="flex justify-end gap-2">{row.status === "pending" && <><Button size="sm" variant="outline" onClick={() => review(row.id, false)} disabled={reviewing === row.id}><XCircle className="w-3.5 h-3.5 mr-1" />Reject</Button><Button size="sm" onClick={() => review(row.id, true)} disabled={reviewing === row.id}><CheckCircle className="w-3.5 h-3.5 mr-1" />Approve</Button></>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminCompliance;
