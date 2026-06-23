import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Search, CheckCircle, XCircle, Eye, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockOrders, orderStatusColors, deliveryStatusColors } from "@/lib/mock-sokoplace";
import type { SokoOrder } from "@/lib/services/sokoplace-service";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<SokoOrder[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.order_type === filter || o.status === filter;
    const matchSearch = o.asset_name.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchFilter && matchSearch;
  });

  const handleApprove = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: "completed" as const, delivery_status: "delivered" as const } : o));
    toast({ title: "Order approved & delivered" });
  };

  const handleReject = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: "rejected" as const } : o));
    toast({ title: "Order rejected" });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    sells: orders.filter(o => o.order_type === "sell").length,
    revenue: orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total_price, 0),
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Total Orders</p>
          <p className="text-xl font-bold font-display text-foreground">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Pending</p>
          <p className="text-xl font-bold font-display text-accent">{stats.pending}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Sell Requests</p>
          <p className="text-xl font-bold font-display text-foreground">{stats.sells}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Revenue</p>
          <p className="text-xl font-bold font-display text-primary">ꠄ {stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "buy", "sell", "pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
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
                <th className="p-3 text-xs text-muted-foreground font-medium">Order</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Asset</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Total</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Delivery</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-mono text-xs text-foreground">{order.id.slice(0, 8)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${order.order_type === "buy" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {order.order_type}
                    </span>
                  </td>
                  <td className="p-3 text-foreground">{order.asset_name}</td>
                  <td className="p-3 font-semibold text-primary">ꠄ {order.total_price.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${orderStatusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${deliveryStatusColors[order.delivery_status]}`}>
                      {order.delivery_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {order.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(order.id)} className="p-1.5 rounded-lg hover:bg-primary/10" title="Approve">
                            <CheckCircle className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <button onClick={() => handleReject(order.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Reject">
                            <XCircle className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </>
                      )}
                      {order.proof_url && (
                        <button className="p-1.5 rounded-lg hover:bg-secondary" title="View Proof">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
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

export default AdminOrders;
