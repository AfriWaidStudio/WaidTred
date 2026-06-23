import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { LeaderboardService } from "@/lib/services";

const Leaderboards = () => {
  const [board, setBoard] = useState<any[]>([]);
  useEffect(() => { LeaderboardService.topSavers().then(setBoard); }, []);
  return (
    <WealthPageShell title="Leaderboards" subtitle="Top of the Konsmik economy" Icon={Trophy} back="/dashboard">
      <div className="space-y-2">
        {board.map((b, i) => (
          <div key={b.user_id} className="glass-card p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i < 3 ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{i + 1}</div>
            <p className="flex-1 text-sm font-semibold">{b.profile?.full_name || "Anonymous"}</p>
            <p className="text-sm font-bold text-primary">ꠄ {Number(b.total_balance).toLocaleString()}</p>
          </div>
        ))}
        {board.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">Loading...</p>}
      </div>
    </WealthPageShell>
  );
};
export default Leaderboards;
