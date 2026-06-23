import { Shield, Lock, TrendingUp, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GoalsService } from "@/lib/services";
import { toast } from "sonner";

const WaidVault = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [locked, setLocked] = useState(0);
  const [topUpId, setTopUpId] = useState<string | null>(null);
  const [topUpAmt, setTopUpAmt] = useState("");

  const refresh = () => { if (!user) return; supabase.from("savings_goals").select("*").eq("user_id", user.id).eq("status","active").then(({data})=>setGoals(data||[])); };

  useEffect(() => {
    if (!user) return;
    refresh();
    supabase.from("wallets").select("locked_balance").eq("user_id", user.id).maybeSingle().then(({ data }) => setLocked(Number(data?.locked_balance || 0)));
  }, [user]);

  const submitTopUp = async (goalId: string) => {
    const amt = Number(topUpAmt); if (!amt) return;
    try {
      await supabase.rpc("process_wallet_movement", { _user_id: user!.id, _direction: "debit", _amount: amt, _category: "goal_contribution", _description: "Goal top-up", _reference_type: "savings_goals", _reference_id: goalId });
      await GoalsService.contribute(goalId, amt);
      toast.success("Topped up"); setTopUpId(null); setTopUpAmt(""); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const totalSaved = goals.reduce((a, g) => a + Number(g.current_amount), 0);

  return (
    <MiniAppContainer title="WaidVault" subtitle="Savings & Security">
      <div className="glass-card p-5 mb-5 border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">Total Secured</span>
        </div>
        <p className="text-3xl font-bold font-display text-foreground mb-1">ꠄ {(totalSaved + locked).toLocaleString()}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">{goals.length} goals · ꠄ {locked.toLocaleString()} locked</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display font-semibold text-foreground">Your Goals</h3>
        <button onClick={() => navigate("/dashboard/wealth/goals")} className="text-[10px] text-primary flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> New Goal
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {goals.map(v => {
          const pct = Math.round((Number(v.current_amount) / Number(v.target_amount)) * 100);
          return (
            <div key={v.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{v.name}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">ꠄ {Number(v.current_amount).toLocaleString()} / {Number(v.target_amount).toLocaleString()}</span>
                <span className="text-xs font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              {topUpId === v.id ? (
                <div className="mt-2 flex gap-1.5">
                  <input autoFocus type="number" placeholder="Amount" value={topUpAmt} onChange={e=>setTopUpAmt(e.target.value)} className="flex-1 px-2 py-1 rounded-md bg-secondary border border-border text-[11px]" />
                  <button onClick={()=>submitTopUp(v.id)} className="px-2 rounded-md gradient-primary text-primary-foreground text-[10px] font-semibold">Add</button>
                  <button onClick={()=>{setTopUpId(null); setTopUpAmt("");}} className="px-2 rounded-md bg-secondary text-[10px]">×</button>
                </div>
              ) : (
                <button onClick={()=>setTopUpId(v.id)} className="mt-2 text-[10px] text-primary">+ Top up</button>
              )}
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No goals yet — create one</p>}
      </div>

      <div className="glass-card p-4 border-primary/10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">WaidesPruf Protected</p>
            <p className="text-[10px] text-muted-foreground">Your funds are secured with cryptographic verification</p>
          </div>
        </div>
      </div>
    </MiniAppContainer>
  );
};

export default WaidVault;
