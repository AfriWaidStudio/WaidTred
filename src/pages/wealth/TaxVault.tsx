import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { TaxVaultService } from "@/lib/services";
import { toast } from "sonner";

const TaxVault = () => {
  const [v, setV] = useState<any>(null);
  const [pct, setPct] = useState("15");
  const load = () => TaxVaultService.get().then(d => { setV(d); if (d) setPct(String(d.pct)); });
  useEffect(() => { load(); }, []);
  const save = async () => { try { await TaxVaultService.upsert(Number(pct)); toast.success("Auto-skim updated"); load(); } catch (e: any) { toast.error(e.message); } };
  return (
    <WealthPageShell title="TaxVault" subtitle="Auto-skim income for tax" Icon={Receipt} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Tax balance</p>
        <p className="text-2xl font-bold font-display">ꠄ {Number(v?.balance ?? 0).toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{v?.pct ?? 15}% auto-skim active</p>
      </div>
      <div className="glass-card p-4 space-y-2">
        <p className="text-sm font-semibold">Skim percentage</p>
        <input type="number" min="0" max="50" value={pct} onChange={e=>setPct(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={save} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Update</button>
      </div>
    </WealthPageShell>
  );
};
export default TaxVault;
