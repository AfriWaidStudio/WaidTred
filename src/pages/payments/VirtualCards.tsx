import { useEffect, useState } from "react";
import { CreditCard, Plus, Snowflake } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { VirtualCardsService } from "@/lib/services";
import { toast } from "sonner";

const VirtualCards = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [nick, setNick] = useState(""); const [limit, setLimit] = useState("");
  const load = () => VirtualCardsService.list().then(setCards);
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!nick || !limit) return;
    try { await VirtualCardsService.create({ nickname: nick, spend_limit: Number(limit) }); toast.success("Card issued"); setShow(false); setNick(""); setLimit(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="Virtual Cards" subtitle="Disposable spending cards" Icon={CreditCard} back="/dashboard">
      <button onClick={()=>setShow(!show)} className="w-full mb-3 py-2.5 rounded-xl bg-secondary/60 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Issue card</button>
      {show && (
        <div className="glass-card p-4 mb-4 space-y-2">
          <input placeholder="Nickname (e.g. Netflix)" value={nick} onChange={e=>setNick(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <input type="number" placeholder="Spend limit" value={limit} onChange={e=>setLimit(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
          <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Issue</button>
        </div>
      )}
      <div className="space-y-2">
        {cards.map(c => (
          <div key={c.id} className="glass-card p-4">
            <div className="flex justify-between mb-2"><p className="text-sm font-semibold">{c.nickname}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status==='active'?'bg-primary/20 text-primary':'bg-muted/40 text-muted-foreground'}`}>{c.status}</span></div>
            <p className="text-xs font-mono text-muted-foreground mb-2">•••• •••• •••• {c.card_number_last4}</p>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground">ꠄ{Number(c.current_spend)} / ꠄ{Number(c.spend_limit)}</p>
              <button onClick={async()=>{await VirtualCardsService.toggleFreeze(c.id, c.status==='active'); load();}} className="text-[10px] flex items-center gap-1 text-accent"><Snowflake className="w-3 h-3"/>{c.status==='active'?'Freeze':'Unfreeze'}</button>
            </div>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default VirtualCards;
