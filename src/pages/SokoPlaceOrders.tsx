import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { mockOrders, orderStatusColors, deliveryStatusColors, assetCategoryIcons } from "@/lib/mock-sokoplace";

const SokoPlaceOrders = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  const filtered = mockOrders.filter(o => filter === "all" || o.order_type === filter);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4 pb-8">
        <button onClick={() => navigate("/dashboard/sokoplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground py-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">My Orders</h1>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(["all", "buy", "sell"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {f === "all" ? "All" : f === "buy" ? "Purchases" : "Sales"}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-2">
          {filtered.map(order => (
            <div key={order.id} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                  {assetCategoryIcons[order.asset_type] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{order.asset_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.order_type === "buy" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {order.order_type}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${orderStatusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${deliveryStatusColors[order.delivery_status]}`}>
                      {order.delivery_status}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">ꠄ {order.total_price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">x{order.quantity}</p>
                </div>
              </div>
              {order.delivery_data?.code && order.delivery_status === "delivered" && (
                <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">Delivery Code</p>
                  <p className="text-xs font-mono font-bold text-primary">{order.delivery_data.code}</p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SokoPlaceOrders;
