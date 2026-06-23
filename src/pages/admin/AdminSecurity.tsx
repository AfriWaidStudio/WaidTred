import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, Eye, Lock, AlertTriangle, KeyRound, Fingerprint } from "lucide-react";

const securityMetrics = [
  { label: "Failed Logins (24h)", value: "23", icon: Lock, color: "text-accent" },
  { label: "Blocked IPs", value: "7", icon: Shield, color: "text-destructive" },
  { label: "Active Sessions", value: "1,847", icon: Eye, color: "text-primary" },
  { label: "SmaiPin Resets (7d)", value: "12", icon: KeyRound, color: "text-muted-foreground" },
];

const suspiciousActivity = [
  { time: "2h ago", event: "5 failed login attempts", target: "amina@example.com", ip: "41.58.23.xxx", severity: "high" },
  { time: "4h ago", event: "SmaiPin changed after password reset", target: "john@example.com", ip: "196.207.xxx.xxx", severity: "medium" },
  { time: "6h ago", event: "Login from new country (FR)", target: "kwame@example.com", ip: "82.64.xxx.xxx", severity: "medium" },
  { time: "12h ago", event: "Multiple device logins simultaneously", target: "sarah@example.com", ip: "86.22.xxx.xxx", severity: "low" },
];

const AdminSecurity = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {securityMetrics.map((m) => (
          <div key={m.label} className="glass-card p-4">
            <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
            <p className="text-2xl font-bold font-display text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 mb-6 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">SmaiPin Security Rules</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { rule: "Minimum 4-digit PIN", status: "enforced" },
            { rule: "Max 3 failed attempts → lock", status: "enforced" },
            { rule: "PIN change requires email verification", status: "enforced" },
            { rule: "Biometric fallback enabled", status: "optional" },
          ].map((r) => (
            <div key={r.rule} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
              <div className={`w-2 h-2 rounded-full ${r.status === "enforced" ? "bg-primary" : "bg-accent"}`} />
              <span className="text-xs text-foreground flex-1">{r.rule}</span>
              <span className="text-[10px] text-muted-foreground">{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-display font-semibold text-foreground text-sm mb-3">Suspicious Activity Log</h3>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Time</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Event</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">User</th>
                <th className="p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">IP</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousActivity.map((a, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 text-xs text-muted-foreground">{a.time}</td>
                  <td className="p-3 text-foreground">{a.event}</td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{a.target}</td>
                  <td className="p-3 text-xs text-muted-foreground font-mono hidden lg:table-cell">{a.ip}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                    a.severity === "high" ? "bg-accent/10 text-accent" : a.severity === "medium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{a.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
