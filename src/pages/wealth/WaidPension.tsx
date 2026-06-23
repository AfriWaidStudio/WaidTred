import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { PensionService } from "@/lib/services";
import { toast } from "sonner";

const WaidPension = () => {
  const [pension, setPension] = useState<any>(null);
  const [contrib, setContrib] = useState(""); const [age, setAge] = useState("60");
  const load = async () => { const p = await PensionService.get(); setPension(p); if (p) { setContrib(String(p.monthly_contribution)); setAge(String(p.retirement_age)); } };
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await PensionService.upsert({ monthly_contribution: Number(contrib), retirement_age: Number(age) }); toast.success("Pension plan saved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <WealthPageShell title="WaidPension" subtitle="Plan your retirement" Icon={Briefcase} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Pension balance</p>
        <p className="text-2xl font-bold font-display">ꠄ {Number(pension?.balance ?? 0).toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground mt-1">Retire at age {pension?.retirement_age ?? 60}</p>
      </div>
      <div className="glass-card p-4 space-y-2">
        <p className="text-sm font-semibold">Configure plan</p>
        <input type="number" placeholder="Monthly contribution" value={contrib} onChange={e=>setContrib(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Retirement age" value={age} onChange={e=>setAge(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={save} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Save</button>
      </div>
    </WealthPageShell>
  );
};
export default WaidPension;
