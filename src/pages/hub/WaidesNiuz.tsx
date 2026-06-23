import { Newspaper, Clock, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { NewsService } from "@/lib/services";

const WaidesNiuz = () => {
  const [news, setNews] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { NewsService.list().then(setNews); }, []);
  const featured = news.find(n => n.is_breaking) ?? news[0];
  const rest = news.filter(n => n.id !== featured?.id);

  return (
    <MiniAppContainer title="Waides Niuz" subtitle="Market News & Updates">
      {featured && (
        <button onClick={()=>setOpenId(openId===featured.id?null:featured.id)} className="glass-card p-5 mb-5 border-primary/10 w-full text-left">
          {featured.is_breaking && <span className="text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">BREAKING</span>}
          <h3 className="text-sm font-display font-semibold text-foreground mt-2 mb-1">{featured.title}</h3>
          <p className="text-[10px] text-muted-foreground flex items-center gap-2">
            <Globe className="w-3 h-3" /> {featured.source} • <Clock className="w-3 h-3" /> {new Date(featured.published_at).toLocaleString()}
          </p>
          {openId===featured.id && featured.body && <p className="text-xs text-muted-foreground mt-3 whitespace-pre-wrap">{featured.body}</p>}
        </button>
      )}
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Latest</h3>
      <div className="space-y-2">
        {rest.map(item => (
          <button key={item.id} onClick={()=>setOpenId(openId===item.id?null:item.id)} className="glass-card p-3.5 w-full flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Newspaper className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.source} · {item.category}</p>
              {openId===item.id && item.body && <p className="text-[11px] text-muted-foreground mt-2 whitespace-pre-wrap">{item.body}</p>}
            </div>
          </button>
        ))}
        {!news.length && <p className="text-xs text-muted-foreground text-center py-8">No news yet</p>}
      </div>
    </MiniAppContainer>
  );
};

export default WaidesNiuz;
