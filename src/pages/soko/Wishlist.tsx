import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WishlistService } from "@/lib/services";
import { toast } from "sonner";

const Wishlist = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = () => WishlistService.list().then(setItems);
  useEffect(() => { load(); }, []);

  const remove = async (pid: string) => {
    await WishlistService.remove(pid); toast.success("Removed"); load();
  };

  return (
    <WealthPageShell title="Wishlist & Alerts" subtitle="Save & track price drops" Icon={Heart} back="/dashboard/sokoplace">
      <div className="space-y-3">
        {items.map((i: any) => (
          <div key={i.id} className="glass-card p-4 flex items-center gap-3">
            <Heart className="w-5 h-5 text-accent fill-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{i.product?.name || "Product"}</p>
              <span className="text-sm text-primary font-bold">ꠄ {Number(i.product?.price || 0).toLocaleString()}</span>
            </div>
            <button onClick={() => remove(i.product_id)} className="text-[10px] text-destructive">Remove</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">Your wishlist is empty</p>}
      </div>
    </WealthPageShell>
  );
};
export default Wishlist;
