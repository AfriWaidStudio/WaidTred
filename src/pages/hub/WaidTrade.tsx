import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { FxService, TradeService } from "@/lib/services";
import { toast } from "sonner";

const WaidTrade = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sym, setSym] = useState(""); const [qty, setQty] = useState(""); const [side, setSide] = useState<"buy"|"sell">("buy");

  const load = async () => { setAssets(await FxService.list()); setOrders(await TradeService.history()); };
  useEffect(() => { load(); }, []);

  const trade = async () => {
    const a = assets.find(x => x.quote === sym); if (!a || !qty) return;
    try { await TradeService.place({ side, asset_symbol: sym, quantity: Number(qty), price: Number(a.rate) }); toast.success(`${side} executed`); setQty(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <MiniAppContainer title="WaidTrade" subtitle="Trade Assets">
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><ArrowUpDown className="w-4 h-4 text-primary" /><h3 className="text-xs font-semibold">Place Order</h3></div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={()=>setSide("buy")} className={`py-2 rounded-lg text-xs font-semibold ${side==="buy"?"gradient-primary text-primary-foreground":"bg-secondary"}`}>Buy</button>
          <button onClick={()=>setSide("sell")} className={`py-2 rounded-lg text-xs font-semibold ${side==="sell"?"gradient-primary text-primary-foreground":"bg-secondary"}`}>Sell</button>
        </div>
        <select value={sym} onChange={e=>setSym(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs mb-2">
          <option value="">Select asset</option>
          {assets.map(a => <option key={a.id} value={a.quote}>{a.quote} @ {a.rate}</option>)}
        </select>
        <input type="number" placeholder="Quantity" value={qty} onChange={e=>setQty(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs mb-2" />
        <button onClick={trade} className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Execute</button>
      </div>

      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Markets</h3>
      <div className="space-y-2 mb-4">
        {assets.map(a => (
          <div key={a.id} className="glass-card p-3 flex justify-between">
            <span className="text-xs font-semibold">{a.quote}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs">{a.rate}</span>
              {Number(a.change_24h) >= 0 ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-display font-semibold text-foreground mb-3">My Orders</h3>
      <div className="space-y-2">
        {orders.map(o => (
          <div key={o.id} className="glass-card p-3 flex justify-between items-center text-xs">
            <span>{o.side.toUpperCase()} {o.quantity} {o.asset_symbol}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@{o.price}</span>
              {o.status === "cancelled" ? <span className="text-[10px] text-destructive">cancelled</span> : (
                <button onClick={async()=>{try{await TradeService.cancel(o.id); toast.success("Cancelled"); load();}catch(e:any){toast.error(e.message);}}} className="text-[10px] px-2 py-0.5 rounded bg-destructive/20 text-destructive">Cancel</button>
              )}
            </div>
          </div>
        ))}
        {!orders.length && <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>}
      </div>
    </MiniAppContainer>
  );
};

export default WaidTrade;
