import AdminLayout from "@/components/admin/AdminLayout";
import { Globe, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const countryData = [
  { country: "Ghana", flag: "🇬🇭", users: 4200, volume: 1800000, status: "active" },
  { country: "Nigeria", flag: "🇳🇬", users: 3800, volume: 1200000, status: "active" },
  { country: "Kenya", flag: "🇰🇪", users: 2100, volume: 680000, status: "active" },
  { country: "UK", flag: "🇬🇧", users: 890, volume: 520000, status: "active" },
  { country: "India", flag: "🇮🇳", users: 650, volume: 340000, status: "active" },
  { country: "South Africa", flag: "🇿🇦", users: 420, volume: 180000, status: "active" },
  { country: "Senegal", flag: "🇸🇳", users: 280, volume: 95000, status: "pending" },
  { country: "Germany", flag: "🇩🇪", users: 150, volume: 72000, status: "pending" },
];

const chartData = countryData.map(c => ({ name: c.flag + " " + c.country.slice(0, 3), volume: Math.round(c.volume / 1000) }));

const AdminGlobal = () => {
  return (
    <AdminLayout>
      <div className="glass-card p-4 mb-6">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4">Transaction Volume by Country (ꠄ thousands)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222 40% 10%)", border: "1px solid hsl(222 30% 22%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="volume" fill="hsl(152, 100%, 41%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Country</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Users</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Volume</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {countryData.map((c) => (
                <tr key={c.country} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-medium text-foreground">{c.flag} {c.country}</td>
                  <td className="p-3 text-muted-foreground">{c.users.toLocaleString()}</td>
                  <td className="p-3 text-foreground font-medium">ꠄ {c.volume.toLocaleString()}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${c.status === "active" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGlobal;
