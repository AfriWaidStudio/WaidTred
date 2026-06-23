import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FamilyService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";

export default function FamilyEconomy() {
  const [families, setFamilies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"savings"|"insurance"|"investments">("savings");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => { const { data } = await FamilyService.listMine(); setFamilies(data); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return;
    const { error } = await FamilyService.create(name);
    if (error) toast.error(error.message); else { toast.success("Family created"); setName(""); load(); }
  };
  const contribute = async () => {
    if (!selectedId) return toast.error("Select a family");
    const { error } = await FamilyService.contribute(selectedId, Number(amount), category);
    if (error) toast.error(error.message); else { toast.success("Contributed"); setAmount(""); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Family Economy</h1>
        <p className="text-xs text-muted-foreground mb-6">Shared family treasury, savings, insurance, investments</p>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Create family</h2>
          <div className="flex gap-2">
            <Input placeholder="Family name" value={name} onChange={e => setName(e.target.value)} />
            <Button onClick={create}>Create</Button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {families.map((f: any) => (
            <div key={f.id} onClick={() => setSelectedId(f.id)} className={`glass-card p-4 cursor-pointer ${selectedId === f.id ? "border-primary" : ""}`}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">Balance ◈ {Number(f.family_treasuries?.[0]?.balance ?? 0).toLocaleString()} · Savings {Number(f.family_treasuries?.[0]?.shared_savings ?? 0).toLocaleString()} · Insurance {Number(f.family_treasuries?.[0]?.shared_insurance ?? 0).toLocaleString()} · Investments {Number(f.family_treasuries?.[0]?.shared_investments ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {families.length === 0 && <p className="text-sm text-muted-foreground">No families yet.</p>}
        </div>

        {selectedId && (
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3">Contribute</h2>
            <div className="grid md:grid-cols-3 gap-2">
              <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="savings">Savings</option>
                <option value="insurance">Insurance</option>
                <option value="investments">Investments</option>
              </select>
              <Button onClick={contribute}>Contribute</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
