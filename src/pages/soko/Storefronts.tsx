import { Store, Star, Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { StorefrontService } from "@/lib/services";
import { toast } from "sonner";

const Storefronts = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const load = () => StorefrontService.list().then(setStores);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name || !slug) return toast.error("Name & slug required");
    try { await StorefrontService.create({ name, slug }); toast.success("Storefront created"); setCreating(false); setName(""); setSlug(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Vendor Storefronts" subtitle="Branded mini-stores" Icon={Store} back="/dashboard/sokoplace">
      <button onClick={() => setCreating(!creating)} className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary flex items-center justify-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Open My Storefront
      </button>
      {creating && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Store name" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
          <input value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())} placeholder="store-slug" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
          <button onClick={handleCreate} className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Create</button>
        </div>
      )}
      <div className="space-y-3">
        {stores.map(s => (
          <div key={s.id} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">{s.name?.[0] || "S"}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Star className="w-3 h-3 text-accent fill-accent" /> {Number(s.rating || 0).toFixed(1)} · <Package className="w-3 h-3" /> {s.product_count || 0} items
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.status}</span>
            </div>
            <button className="w-full py-2 rounded-lg bg-secondary/60 text-xs">Visit Store</button>
          </div>
        ))}
        {stores.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No storefronts yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default Storefronts;
