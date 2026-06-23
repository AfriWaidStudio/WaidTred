import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, TrendingUp, ChevronRight, Tag } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { mockInventory, assetCategoryLabels, assetCategoryIcons, inventoryStatusColors } from "@/lib/mock-sokoplace";

const categories = ["all", "token", "crypto", "giftcard", "smaipin"] as const;

const SokoPlace = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = mockInventory.filter(item => {
    const matchesCategory = activeCategory === "all" || item.asset_type === activeCategory;
    const matchesSearch = item.asset_name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch && item.status !== "disabled";
  });

  const featured = mockInventory.filter(i => i.status === "available").slice(0, 3);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Header */}
        <div className="pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">SokoPlace</h1>
          </div>
          <p className="text-xs text-muted-foreground">Konsmik Value Interlink Market</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All" : `${assetCategoryIcons[cat]} ${assetCategoryLabels[cat]}`}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        {activeCategory === "all" && !search && (
          <div className="glass-card p-4 mb-6 border-primary/15">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Trending Now</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {featured.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/dashboard/sokoplace/${item.id}`)}
                  className="flex-shrink-0 w-28 bg-secondary/50 rounded-xl p-3 text-center hover:bg-secondary transition-colors"
                >
                  <div className="text-2xl mb-1">{assetCategoryIcons[item.asset_type]}</div>
                  <p className="text-xs font-semibold text-foreground truncate">{item.asset_name}</p>
                  <p className="text-[10px] text-primary font-medium">ꠄ {item.price_in_sika.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="space-y-2">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/sokoplace/${item.id}`)}
              className="glass-card p-4 w-full text-left flex items-center gap-3 hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                {assetCategoryIcons[item.asset_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.asset_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${inventoryStatusColors[item.status]}`}>
                    {item.status === "available" ? "In Stock" : item.status === "low" ? "Low Stock" : "Out of Stock"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Qty: {item.quantity.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">ꠄ {item.price_in_sika.toLocaleString()}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1 group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No assets found</div>
          )}
        </div>

        {/* Orders link */}
        <button
          onClick={() => navigate("/dashboard/sokoplace/orders")}
          className="glass-card p-4 w-full mt-6 flex items-center gap-3 hover:border-primary/20 transition-all group"
        >
          <Tag className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">My Orders</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary" />
        </button>
      </div>
    </DashboardLayout>
  );
};

export default SokoPlace;
