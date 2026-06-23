import AdminLayout from "@/components/admin/AdminLayout";
import { FileCheck, Download, AlertTriangle } from "lucide-react";

const reports = [
  { name: "AML Monthly Report — Apr 2026", type: "AML", status: "ready" },
  { name: "SAR Filing #2310", type: "SAR", status: "submitted" },
  { name: "Regulator Pack — Q1 2026", type: "Regulator", status: "ready" },
  { name: "CTF Quarterly Audit", type: "CTF", status: "in-progress" },
];

const AdminCompliance = () => (
  <AdminLayout>
    <div className="mb-5">
      <h1 className="text-xl font-display font-bold flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary"/>Compliance Center</h1>
      <p className="text-xs text-muted-foreground">AML / CTF · SAR filings · regulator exports</p>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Open SARs</p><p className="text-2xl font-bold text-accent">3</p></div>
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Reports ready</p><p className="text-2xl font-bold text-primary">8</p></div>
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Flagged users</p><p className="text-2xl font-bold flex items-center gap-1">12 <AlertTriangle className="w-4 h-4 text-destructive"/></p></div>
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40"><tr className="text-[11px] text-muted-foreground"><th className="text-left p-3">Report</th><th className="text-left p-3">Type</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr></thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.name} className="border-t border-border">
              <td className="p-3 font-semibold">{r.name}</td>
              <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{r.type}</span></td>
              <td className="p-3 text-xs text-muted-foreground">{r.status}</td>
              <td className="p-3"><button className="text-[10px] text-primary flex items-center gap-1"><Download className="w-3 h-3"/>Export</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminLayout>
);
export default AdminCompliance;
