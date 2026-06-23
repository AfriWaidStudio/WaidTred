import { ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { FxService } from "@/lib/services";

const SmaiTredEx = () => {
  const [pairs, setPairs] = useState<any[]>([]);
  const [from, setFrom] = useState(""); const [selected, setSelected] = useState<any>(null);
  useEffect(() => { FxService.list().then(d => { setPairs(d); setSelected(d[0]); }); }, []);
  const result = selected && from ? (Number(from) * Number(selected.rate)).toFixed(2) : "0.00";

  return (
    <MiniAppContainer title="SmaiTredEx" subtitle="Exchange Platform">
      <div className="glass-card p-5 mb-5 border-primary/10">
        <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" /> Quick Exchange
        </h3>
        <div className="space-y-3">
          <div className="bg-secondary/60 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">You send (SMK)</p>
            <input value={from} onChange={e=>setFrom(e.target.value)} type="number" placeholder="0.00" className="bg-transparent text-lg font-bold text-foreground w-full outline-none" />
          </div>
          <div className="bg-secondary/60 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">You receive ({selected?.quote ?? "—"})</p>
            <p className="text-lg font-bold text-foreground">{result}</p>
          </div>
        </div>
      </div>
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Live Pairs</h3>
      <div className="space-y-2">
        {pairs.map(p => (
          <button key={p.id} onClick={()=>setSelected(p)} className={`glass-card p-3 w-full flex justify-between items-center ${selected?.id===p.id ? "border-primary/40" : ""}`}>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">{p.base}/{p.quote}</p>
              <p className="text-[10px] text-muted-foreground">Vol ꠄ{Number(p.volume_24h).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">{Number(p.rate).toLocaleString()}</p>
              <p className={`text-[10px] ${Number(p.change_24h) >= 0 ? "text-primary" : "text-destructive"}`}>{Number(p.change_24h) >= 0 ? "+" : ""}{p.change_24h}%</p>
            </div>
          </button>
        ))}
      </div>
    </MiniAppContainer>
  );
};

export default SmaiTredEx;
