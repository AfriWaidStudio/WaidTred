import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Package, Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockInventory, inventoryStatusColors, assetCategoryLabels } from "@/lib/mock-sokoplace";
import type { InventoryItem } from "@/lib/services/sokoplace-service";
import { useToast } from "@/hooks/use-toast";

const AdminSokoPlace = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = items.filter(i => {
    const matchType = filterType === "all" || i.asset_type === filterType;
    const matchSearch = i.asset_name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: items.length,
    available: items.filter(i => i.status === "available").length,
    low: items.filter(i => i.status === "low").length,
    totalValue: items.reduce((s, i) => s + i.price_in_sika * i.quantity, 0),
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Total Products</p>
          <p className="text-xl font-bold font-display text-foreground">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Available</p>
          <p className="text-xl font-bold font-display text-primary">{stats.available}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Low Stock</p>
          <p className="text-xl font-bold font-display text-accent">{stats.low}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Inventory Value</p>
          <p className="text-xl font-bold font-display text-foreground">ꠄ {stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "token", "crypto", "giftcard", "smaipin"].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {t === "all" ? "All" : assetCategoryLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Asset</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Price (ꠄ)</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Qty</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-semibold text-foreground">{item.asset_name}</td>
                  <td className="p-3 text-xs text-muted-foreground capitalize">{item.asset_type}</td>
                  <td className="p-3 font-semibold text-primary">ꠄ {item.price_in_sika.toLocaleString()}</td>
                  <td className="p-3 text-foreground">{item.quantity.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${inventoryStatusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-secondary" title="Edit">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-destructive/10" title="Delete" onClick={() => {
                        setItems(items.filter(i => i.id !== item.id));
                        toast({ title: "Item removed" });
                      }}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
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

export default AdminSokoPlace;
