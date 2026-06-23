import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EntityService } from "@/lib/services/civilization-service";
import { Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EntityTreasuries() {
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [moves, setMoves] = useState<any[]>([]);
  const [amount, setAmount] = useState("");

  const load = async () => {
    const { data } = await EntityService.listTreasuries();
    setList(data);
  };
  useEffect(() => { load(); }, []);

  const openEntity = async (t: any) => {
    setSelected(t);
    const { data } = await EntityService.treasuryMovements(t.entity_id);
    setMoves(data);
  };

  const credit = async () => {
    const { error } = await EntityService.move(selected.entity_id, "credit", Number(amount), "manual", "Manual credit");
    if (error) toast.error(error.message); else { toast.success("Credited"); setAmount(""); openEntity(selected); load(); }
  };
  const debit = async () => {
    const { error } = await EntityService.move(selected.entity_id, "debit", Number(amount), "manual", "Manual debit");
    if (error) toast.error(error.message); else { toast.success("Debited"); setAmount(""); openEntity(selected); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Entity Treasuries</h1>
        <p className="text-xs text-muted-foreground mb-6">Treasury per Konsmik Entity</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-4 max-h-[600px] overflow-y-auto">
            {list.map(t => (
              <button key={t.id} onClick={() => openEntity(t)} className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-secondary/60 text-left ${selected?.id === t.id ? "bg-secondary/80" : ""}`}>
                <Building2 className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.konsmik_entities?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.konsmik_entities?.kind}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-primary">◈ {Number(t.balance).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="glass-card p-5">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Select an entity to view treasury.</p>
            ) : (
              <>
                <h2 className="text-lg font-display font-bold mb-1">{selected.konsmik_entities?.name}</h2>
                <p className="text-3xl font-display font-bold text-primary mb-3">◈ {Number(selected.balance).toLocaleString()}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div><span className="text-muted-foreground">Revenue</span><p className="font-semibold">{Number(selected.revenue_total).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Expense</span><p className="font-semibold">{Number(selected.expense_total).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground">Onyix</span><p className="font-semibold">{Number(selected.reserve_allocation).toLocaleString()}</p></div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                  <Button size="sm" onClick={credit}>Credit</Button>
                  <Button size="sm" variant="outline" onClick={debit}>Debit</Button>
                </div>
                <p className="text-xs font-semibold mb-2">Recent movements</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {moves.map(m => (
                    <div key={m.id} className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className={m.direction === "credit" ? "text-primary" : "text-destructive"}>{m.direction === "credit" ? "+" : "−"} {Number(m.amount).toLocaleString()}</span>
                      <span className="text-muted-foreground">{m.category}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
