import { Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { MissionsService } from "@/lib/services";
import { toast } from "sonner";

const Missions = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const load = () => MissionsService.list().then(setMissions);
  useEffect(() => { load(); }, []);

  const claim = async (id: string, reward: number) => {
    try { await MissionsService.claim(id, reward); toast.success(`+ꠄ ${reward} credited`); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Missions / Quests" subtitle="Earn ꠄ rewards" Icon={Target} back="/dashboard">
      <div className="space-y-3">
        {missions.map(m => {
          const my = m.my?.[0];
          const done = my?.completed;
          return (
            <div key={m.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${done ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-semibold">{m.title}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">{m.goal_type}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{m.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary font-semibold text-sm">ꠄ {m.reward_amount}</span>
                {done ? <span className="text-[11px] text-muted-foreground">Claimed</span> : (
                  <button onClick={() => claim(m.id, Number(m.reward_amount))} className="text-[11px] px-3 py-1 rounded-lg gradient-primary text-primary-foreground">Claim</button>
                )}
              </div>
            </div>
          );
        })}
        {missions.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No missions available</p>}
      </div>
    </WealthPageShell>
  );
};
export default Missions;
