import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TredBeingService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Plus } from "lucide-react";

export default function TredBeings() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"saving"|"investment"|"trading"|"merchant">("saving");

  const load = async () => { const { data } = await TredBeingService.listMine(); setList(data); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return toast.error("Name required");
    const { error } = await TredBeingService.create(name, kind);
    if (error) toast.error(error.message); else { toast.success("TredBeing created"); setName(""); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">TredBeings</h1>
        <p className="text-xs text-muted-foreground mb-6">Create autonomous economic beings with their own wallet & treasury</p>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> New TredBeing</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Name (e.g. House Fund)" value={name} onChange={e => setName(e.target.value)} />
            <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={kind} onChange={e => setKind(e.target.value as any)}>
              <option value="saving">Saving</option>
              <option value="investment">Investment</option>
              <option value="trading">Trading</option>
              <option value="merchant">Merchant</option>
            </select>
            <Button onClick={create}>Create</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {list.map((tb: any) => (
            <div key={tb.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{tb.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{tb.kind}</p>
                  <p className="text-lg font-display font-bold text-primary mt-1">◈ {Number(tb.konsmik_entities?.entity_treasuries?.[0]?.balance ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-muted-foreground">No TredBeings yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
