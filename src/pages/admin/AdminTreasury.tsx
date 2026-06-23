import AdminLayout from "@/components/admin/AdminLayout";
import { Banknote, TrendingUp, Globe } from "lucide-react";

const countries = [
  { name: "Ghana", float: 1240000, ratio: "1.42" },
  { name: "Nigeria", float: 3800000, ratio: "1.18" },
  { name: "Kenya", float: 920000, ratio: "1.55" },
  { name: "Senegal", float: 540000, ratio: "1.62" },
];

const AdminTreasury = () => (
  <AdminLayout>
    <div className="mb-5">
      <h1 className="text-xl font-display font-bold flex items-center gap-2"><Banknote className="w-5 h-5 text-primary"/>Treasury & Liquidity</h1>
      <p className="text-xs text-muted-foreground">Reserve ratios, ꠄ supply, country float</p>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Total Float</p><p className="text-2xl font-bold">ꠄ 6.5M</p></div>
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">ꠄ Supply</p><p className="text-2xl font-bold">14.2M</p></div>
      <div className="glass-card p-4"><p className="text-[10px] text-muted-foreground">Reserve Ratio</p><p className="text-2xl font-bold text-primary">1.46</p></div>
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40"><tr className="text-[11px] text-muted-foreground"><th className="text-left p-3">Country</th><th className="text-right p-3">Float (ꠄ)</th><th className="text-right p-3">Reserve ratio</th></tr></thead>
        <tbody>
          {countries.map(c => (
            <tr key={c.name} className="border-t border-border">
              <td className="p-3 font-semibold flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-muted-foreground"/>{c.name}</td>
              <td className="p-3 text-right">{c.float.toLocaleString()}</td>
              <td className="p-3 text-right text-primary font-semibold">{c.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminLayout>
);
export default AdminTreasury;
