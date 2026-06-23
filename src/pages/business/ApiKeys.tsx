import { Key, Plus, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { ApiKeyService } from "@/lib/services";
import { toast } from "sonner";

const ApiKeys = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const load = () => ApiKeyService.list().then(setKeys);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return toast.error("Name required");
    try { const raw = await ApiKeyService.create(name); setRevealed(raw); setName(""); toast.success("Key generated — copy it now"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const revoke = async (id: string) => { await ApiKeyService.revoke(id); toast.success("Revoked"); load(); };

  return (
    <WealthPageShell title="API Keys" subtitle="For developers" Icon={Key} back="/dashboard">
      <div className="glass-card p-4 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Key name (e.g. Production)" className="w-full mb-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <button onClick={create} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Generate Key
        </button>
      </div>
      {revealed && (
        <div className="glass-card p-3 mb-4 border-primary/30">
          <p className="text-[10px] text-accent mb-1">⚠ Save this — it won't be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs px-2 py-1.5 rounded bg-secondary/60 break-all">{revealed}</code>
            <button onClick={() => { navigator.clipboard.writeText(revealed); toast.success("Copied"); }}><Copy className="w-3.5 h-3.5 text-primary" /></button>
          </div>
        </div>
      )}
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">Your keys</h3>
      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="glass-card p-3 flex items-center gap-3">
            <Key className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">{k.name}</p>
              <code className="text-[10px] text-muted-foreground">{k.key_prefix}…</code>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${k.status === "active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{k.status}</span>
            {k.status === "active" && <button onClick={() => revoke(k.id)} className="text-[10px] text-destructive">Revoke</button>}
          </div>
        ))}
        {keys.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No keys yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default ApiKeys;
