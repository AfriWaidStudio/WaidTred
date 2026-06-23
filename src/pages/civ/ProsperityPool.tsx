import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProsperityService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export default function ProsperityPool() {
  const [pool, setPool] = useState<any>(null);
  const [allocs, setAllocs] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<any>("emergency");
  const [reason, setReason] = useState("");

  const load = async () => {
    const [p, a] = await Promise.all([ProsperityService.getPool(), ProsperityService.listAllocations()]);
    setPool(p.data); setAllocs(a.data);
  };
  useEffect(() => { load(); }, []);

  const request = async () => {
    const { error } = await ProsperityService.request(Number(amount), category, reason);
    if (error) toast.error(error.message); else { toast.success("Request submitted"); setAmount(""); setReason(""); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Universal Prosperity Pool</h1>
        <p className="text-xs text-muted-foreground mb-6">Poverty reduction & emergency support infrastructure</p>

        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Pool balance</p>
              <p className="text-3xl font-display font-bold">◈ {Number(pool?.balance ?? 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-muted-foreground">Contributed</span><p className="font-semibold">{Number(pool?.total_contributed ?? 0).toLocaleString()}</p></div>
            <div><span className="text-muted-foreground">Disbursed</span><p className="font-semibold">{Number(pool?.total_disbursed ?? 0).toLocaleString()}</p></div>
          </div>
        </div>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3">Request assistance</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="emergency">Emergency</option>
              <option value="community">Community</option>
              <option value="poverty">Poverty</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
            </select>
            <Input placeholder="Reason" className="md:col-span-2" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <Button className="mt-3" onClick={request}>Submit request</Button>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-display font-semibold mb-3">Recent allocations</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allocs.map(a => (
              <div key={a.id} className="flex justify-between text-xs py-2 border-b border-border/40">
                <div>
                  <span className="font-semibold uppercase">{a.category}</span>
                  <span className="text-muted-foreground ml-2">{a.reason}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-primary">{Number(a.amount).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{a.status}</p>
                </div>
              </div>
            ))}
            {allocs.length === 0 && <p className="text-xs text-muted-foreground">No allocations yet.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
