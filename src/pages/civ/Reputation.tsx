import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ReputationService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award } from "lucide-react";

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{Number(value).toFixed(0)}</span></div>
    <div className="h-2 bg-secondary/60 rounded-full overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
  </div>
);

export default function Reputation() {
  const [score, setScore] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);

  const load = async () => {
    await ReputationService.recompute();
    const [s, e, b] = await Promise.all([ReputationService.getScore(), ReputationService.events(), ReputationService.leaderboard()]);
    setScore(s.data); setEvents(e.data); setBoard(b.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Civilization Reputation</h1>
        <p className="text-xs text-muted-foreground mb-6">Not just wealth — trust, contributions, reliability, discipline, participation</p>

        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total reputation</p>
              <p className="text-4xl font-display font-bold">{Number(score?.total ?? 50).toFixed(0)}</p>
            </div>
            <Button className="ml-auto" size="sm" variant="outline" onClick={load}>Recompute</Button>
          </div>
          <Bar label="Trust" value={score?.trust ?? 50} />
          <Bar label="Contributions" value={score?.contributions ?? 0} />
          <Bar label="Reliability" value={score?.reliability ?? 50} />
          <Bar label="Discipline" value={score?.discipline ?? 50} />
          <Bar label="Participation" value={score?.participation ?? 0} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3">My reputation events</h2>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {events.map(e => (
                <div key={e.id} className="flex justify-between text-xs py-1.5 border-b border-border/40">
                  <span>{e.reason || e.dimension}</span>
                  <span className={Number(e.delta) > 0 ? "text-primary" : "text-destructive"}>{Number(e.delta) > 0 ? "+" : ""}{e.delta}</span>
                </div>
              ))}
              {events.length === 0 && <p className="text-xs text-muted-foreground">No events.</p>}
            </div>
          </div>
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3">Civilization leaderboard</h2>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {board.map((r: any, i: number) => (
                <div key={r.user_id} className="flex justify-between text-xs py-1.5 border-b border-border/40">
                  <span>{i + 1}. {r.profiles?.full_name || "Anonymous"}</span>
                  <span className="font-semibold text-primary">{Number(r.total).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
