import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MissionService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Target } from "lucide-react";

export default function MissionMarketplace() {
  const [missions, setMissions] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [cat, setCat] = useState("");

  const load = async () => {
    const [m, c] = await Promise.all([MissionService.list(), MissionService.listMyClaims()]);
    setMissions(m.data); setClaims(c.data);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title || !reward) return;
    const { error } = await MissionService.create(title, desc, Number(reward), cat || "general");
    if (error) toast.error(error.message); else { toast.success("Mission created"); setTitle(""); setDesc(""); setReward(""); setCat(""); load(); }
  };
  const claim = async (id: string) => {
    const { error } = await MissionService.claim(id);
    if (error) toast.error(error.message); else { toast.success("Claim submitted"); load(); }
  };
  const verify = async (cid: string, ok: boolean) => {
    const { error } = await MissionService.verify(cid, ok);
    if (error) toast.error(error.message); else { toast.success(ok ? "Approved & paid" : "Rejected"); load(); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Economic Mission Marketplace</h1>
        <p className="text-xs text-muted-foreground mb-6">Tasks · rewards · verification · automated payouts</p>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3">Create mission</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Category" value={cat} onChange={e => setCat(e.target.value)} />
            <Input placeholder="Reward ◈" type="number" value={reward} onChange={e => setReward(e.target.value)} />
            <Textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="md:col-span-2" />
          </div>
          <Button className="mt-3" onClick={create}>Post mission</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-display font-semibold mb-3">Open missions</h2>
            <div className="space-y-2">
              {missions.map(m => (
                <div key={m.id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.title}</p>
                      <p className="text-[11px] text-muted-foreground">{m.description}</p>
                      <p className="text-xs text-primary mt-1">◈ {Number(m.reward).toLocaleString()}</p>
                    </div>
                    <Button size="sm" onClick={() => claim(m.id)}>Claim</Button>
                  </div>
                </div>
              ))}
              {missions.length === 0 && <p className="text-sm text-muted-foreground">No open missions.</p>}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-display font-semibold mb-3">My claims</h2>
            <div className="space-y-2">
              {claims.map(c => (
                <div key={c.id} className="glass-card p-4">
                  <p className="text-sm font-semibold">{c.economic_missions?.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{c.status}</p>
                  {c.status === "pending" && (
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" onClick={() => verify(c.id, true)}>Approve & pay</Button>
                      <Button size="sm" variant="outline" onClick={() => verify(c.id, false)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
              {claims.length === 0 && <p className="text-sm text-muted-foreground">No claims yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
