import { Flame, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { FlashDealService } from "@/lib/services";
import { toast } from "sonner";

const FlashDeals = () => {
  const [deals, setDeals] = useState<any[]>([]);
  useEffect(() => { FlashDealService.active().then(setDeals); }, []);
  return (
    <WealthPageShell title="Flash Deals" subtitle="Time-boxed value" Icon={Flame} back="/dashboard/sokoplace">
      <div className="space-y-3">
        {deals.map((d: any) => {
          const ends = new Date(d.ends_at);
          return (
            <div key={d.id} className="glass-card p-4 border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-destructive" />
                <p className="text-sm font-semibold flex-1">{d.product?.name || "Deal"}</p>
                <span className="text-[10px] text-accent flex items-center gap-1"><Clock className="w-3 h-3" />{ends.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">−{d.discount_pct}%</span>
                <button onClick={() => toast.success("Added to cart")} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Buy</button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{d.stock_left} left</p>
            </div>
          );
        })}
        {deals.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No active deals</p>}
      </div>
    </WealthPageShell>
  );
};
export default FlashDeals;
