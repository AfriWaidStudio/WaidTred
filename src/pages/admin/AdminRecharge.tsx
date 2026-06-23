import AdminLayout from "@/components/admin/AdminLayout";
import { Smartphone, Wifi, AlertTriangle, CheckCircle } from "lucide-react";

const rechargeStats = [
  { label: "Today's Recharges", value: "1,247", change: "+12%" },
  { label: "Success Rate", value: "97.8%", change: "+0.3%" },
  { label: "Total Volume", value: "ꠄ 45,200", change: "+8%" },
  { label: "Failed", value: "28", change: "-5%" },
];

const providerStatus = [
  { provider: "MTN Ghana", region: "🇬🇭", airtime: true, data: true, status: "active", success: "99.1%" },
  { provider: "Airtel Nigeria", region: "🇳🇬", airtime: true, data: true, status: "degraded", success: "77.2%" },
  { provider: "Safaricom", region: "🇰🇪", airtime: true, data: true, status: "active", success: "98.5%" },
  { provider: "Vodafone UK", region: "🇬🇧", airtime: true, data: false, status: "active", success: "99.8%" },
  { provider: "Jio India", region: "🇮🇳", airtime: true, data: true, status: "inactive", success: "-" },
];

const AdminRecharge = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {rechargeStats.map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-primary font-medium">{s.change}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-foreground text-sm mb-3">Provider Status</h3>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Provider</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Region</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Airtime</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Data</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Success</th>
              </tr>
            </thead>
            <tbody>
              {providerStatus.map(p => (
                <tr key={p.provider} className={`border-b border-border/50 hover:bg-secondary/30 ${p.status === "degraded" ? "bg-accent/5" : ""}`}>
                  <td className="p-3 font-medium text-foreground">{p.provider}</td>
                  <td className="p-3 text-muted-foreground">{p.region}</td>
                  <td className="p-3">{p.airtime ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-muted-foreground" />}</td>
                  <td className="p-3">{p.data ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-muted-foreground" />}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                    p.status === "active" ? "bg-primary/10 text-primary" : p.status === "degraded" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}>{p.status}</span></td>
                  <td className="p-3 text-xs text-foreground font-medium">{p.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRecharge;
