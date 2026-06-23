import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Gift, Copy, Check, Share2, Users, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReferralService } from "@/lib/services";

const Referral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refs, setRefs] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const load = () => ReferralService.list().then(({ data }) => setRefs(data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { error } = await ReferralService.create(email || undefined);
    if (error) return toast({ title: "Failed", variant: "destructive" });
    setEmail("");
    toast({ title: "Referral code created" });
    load();
  };

  const copy = (code: string) => {
    const link = `${window.location.origin}/auth?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Link copied!" });
  };

  const totalEarned = refs.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
  const joined = refs.filter(r => r.status !== "pending").length;

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>

        <div className="glass-card rounded-2xl p-6 text-center mb-6">
          <Gift className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="font-display text-xl font-bold mb-1">Invite & Earn</h1>
          <p className="text-xs text-muted-foreground mb-4">Earn ꠄ 10 for every friend who joins WaidTred</p>

          <div className="flex gap-2">
            <input placeholder="Friend's email (optional)" value={email} onChange={e => setEmail(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <button onClick={create} className="px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center gap-1"><Plus className="w-4 h-4" /> New</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{joined}</p>
            <p className="text-[10px] text-muted-foreground">Friends Joined</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold">ꠄ {totalEarned}</p>
            <p className="text-[10px] text-muted-foreground">Total Earned</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-medium mb-2">Your codes</p>
        <div className="space-y-2">
          {refs.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-widest text-primary">{r.referral_code}</p>
                <p className="text-[10px] text-muted-foreground">{r.referred_email || "Open invite"} · {r.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copy(r.referral_code)} className="p-2 rounded-lg bg-secondary/50">
                  {copiedId === r.referral_code ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-lg bg-secondary/50"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {refs.length === 0 && <p className="text-center text-muted-foreground text-sm py-10">No referrals yet</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Referral;
