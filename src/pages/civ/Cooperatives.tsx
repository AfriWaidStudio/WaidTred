import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CooperativeService } from "@/lib/services/civilization-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Plus, Vote } from "lucide-react";

export default function Cooperatives() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<any>("community");
  const [selected, setSelected] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [votes, setVotes] = useState<any[]>([]);
  const [voteTitle, setVoteTitle] = useState("");

  const load = async () => { const { data } = await CooperativeService.list(); setList(data); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return;
    const { error } = await CooperativeService.create(name, kind);
    if (error) toast.error(error.message); else { toast.success("Created"); setName(""); load(); }
  };
  const join = async (id: string) => {
    const { error } = await CooperativeService.join(id);
    if (error) toast.error(error.message); else toast.success("Joined");
  };
  const contribute = async () => {
    const { error } = await CooperativeService.contribute(selected.id, Number(amount));
    if (error) toast.error(error.message); else { toast.success("Contributed"); setAmount(""); load(); }
  };
  const openCoop = async (c: any) => {
    setSelected(c);
    const { data } = await CooperativeService.listVotes(c.id);
    setVotes(data);
  };
  const createVote = async () => {
    if (!voteTitle) return;
    const { error } = await CooperativeService.createVote(selected.id, voteTitle);
    if (error) toast.error(error.message); else { toast.success("Vote created"); setVoteTitle(""); openCoop(selected); }
  };
  const cast = async (vid: string, choice: any) => {
    const { error } = await CooperativeService.castVote(vid, choice);
    if (error) toast.error(error.message); else toast.success("Voted");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">Cooperatives</h1>
        <p className="text-xs text-muted-foreground mb-6">Villages · Schools · Churches · Associations · Communities</p>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Create</h2>
          <div className="grid md:grid-cols-3 gap-2">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <select className="bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm" value={kind} onChange={e => setKind(e.target.value)}>
              <option value="village">Village</option>
              <option value="association">Association</option>
              <option value="school">School</option>
              <option value="church">Church</option>
              <option value="community">Community</option>
              <option value="cooperative">Cooperative</option>
            </select>
            <Button onClick={create}>Create</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {list.map((c: any) => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{c.kind}</p>
                    <p className="text-xs text-primary">◈ {Number(c.cooperative_treasuries?.[0]?.balance ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="outline" onClick={() => join(c.id)}>Join</Button>
                    <Button size="sm" onClick={() => openCoop(c)}>Open</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="glass-card p-5">
              <h2 className="text-lg font-display font-bold mb-2">{selected.name}</h2>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Contribute amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                <Button onClick={contribute}>Contribute</Button>
              </div>

              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1"><Vote className="w-3.5 h-3.5" /> Governance</h3>
              <div className="flex gap-2 mb-3">
                <Input placeholder="Vote title" value={voteTitle} onChange={e => setVoteTitle(e.target.value)} />
                <Button size="sm" onClick={createVote}>Open</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {votes.map((v: any) => (
                  <div key={v.id} className="p-3 rounded-lg border border-border/40">
                    <p className="text-sm font-semibold">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground">{v.status}</p>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" onClick={() => cast(v.id, "yes")}>Yes</Button>
                      <Button size="sm" variant="outline" onClick={() => cast(v.id, "no")}>No</Button>
                      <Button size="sm" variant="ghost" onClick={() => cast(v.id, "abstain")}>Abstain</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
