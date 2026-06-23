import { Users, Copy, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { AffiliateService } from "@/lib/services";
import { toast } from "sonner";

const Affiliate = () => {
  const [link, setLink] = useState<any>(null);
  const load = () => AffiliateService.myLink().then(setLink);
  useEffect(() => { load(); }, []);

  const create = async () => {
    try { await AffiliateService.create(); toast.success("Link generated"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const url = link ? `${window.location.origin}/auth?ref=${link.code}` : "";

  return (
    <WealthPageShell title="Affiliate Program" subtitle="Earn on every referral" Icon={Users} back="/dashboard">
      {!link ? (
        <button onClick={create} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">Generate My Affiliate Link</button>
      ) : (
        <>
          <div className="glass-card p-4 mb-4">
            <p className="text-[10px] text-muted-foreground mb-1">Your link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs px-3 py-2 rounded-lg bg-secondary/60 truncate">{url}</code>
              <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Copied"); }} className="p-2 rounded-lg bg-primary/10"><Copy className="w-3.5 h-3.5 text-primary" /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 text-center"><p className="text-[10px] text-muted-foreground">Clicks</p><p className="text-lg font-bold text-primary">{link.clicks}</p></div>
            <div className="glass-card p-3 text-center"><p className="text-[10px] text-muted-foreground">Conversions</p><p className="text-lg font-bold text-primary">{link.conversions}</p></div>
            <div className="glass-card p-3 text-center"><p className="text-[10px] text-muted-foreground">Earnings</p><p className="text-lg font-bold text-primary">ꠄ {Number(link.earnings).toLocaleString()}</p></div>
          </div>
        </>
      )}
    </WealthPageShell>
  );
};
export default Affiliate;
