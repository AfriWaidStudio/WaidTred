import { Brain, TrendingDown, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SpendingInsights = () => {
  const { user } = useAuth();
  const [byCat, setByCat] = useState<{ category: string; amount: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallet_ledger").select("category, amount").eq("user_id", user.id).eq("direction", "debit").then(({ data }) => {
      const grouped: Record<string, number> = {};
      (data || []).forEach((r: any) => { grouped[r.category] = (grouped[r.category] || 0) + Number(r.amount); });
      setByCat(Object.entries(grouped).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount));
    });
  }, [user]);

  const total = byCat.reduce((a, b) => a + b.amount, 0);

  return (
    <WealthPageShell title="Spending Insights" subtitle="Where your money goes" Icon={Brain} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Total spending tracked</p>
        <p className="text-3xl font-bold font-display text-primary">ꠄ {total.toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground mt-1">Across {byCat.length} categories</p>
      </div>
      <div className="space-y-3">
        {byCat.map(c => (
          <div key={c.category} className="glass-card p-4 flex items-start gap-3">
            <TrendingDown className="w-4 h-4 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold capitalize">{c.category.replace(/_/g, " ")}</p>
              <p className="text-[11px] text-muted-foreground">{((c.amount / total) * 100).toFixed(1)}% of spending</p>
            </div>
            <p className="text-sm font-bold text-primary">ꠄ {c.amount.toLocaleString()}</p>
          </div>
        ))}
        {byCat.length === 0 && <p className="text-center text-xs text-muted-foreground py-8 flex items-center justify-center gap-2"><Lightbulb className="w-4 h-4" />Start spending to see insights</p>}
      </div>
    </WealthPageShell>
  );
};
export default SpendingInsights;
