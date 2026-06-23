import { useEffect, useState } from "react";
import { Lock, Calendar, AlertTriangle, Plus, Shield, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { LockService, WalletService } from "@/lib/services";

const WaidLock = () => {
  const [amount, setAmount] = useState("");
  const [daily, setDaily] = useState("");
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [locks, setLocks] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    LockService.list().then(({ data }) => setLocks(data));
    WalletService.getMyWallet().then(({ data }) => setWallet(data));
  };
  useEffect(() => { load(); LockService.processDripsNow().then(load); }, []);

  const handleLock = async () => {
    if (!amount || !daily || !name) return toast.error("Fill all fields");
    if (!confirmed) return toast.error("You must confirm — this is irreversible");
    setLoading(true);
    const { error } = await LockService.create(name, Number(amount), Number(daily));
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(`Locked ꠄ ${amount} — ꠄ ${daily}/day will be released`);
    setAmount(""); setDaily(""); setName(""); setConfirmed(false);
    load();
  };

  const totalLocked = locks.filter(l => l.status === "active").reduce((s, l) => s + Number(l.total_amount) - Number(l.released_amount), 0);
  const totalReleased = locks.reduce((s, l) => s + Number(l.released_amount), 0);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="mb-5">
          <h1 className="text-xl font-display font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> WaidLock
          </h1>
          <p className="text-xs text-muted-foreground">Drip wealth — lock now, release daily. Irreversible.</p>
        </div>

        <div className="glass-card p-5 mb-5 border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Currently Locked</p>
          <p className="text-3xl font-bold font-display">ꠄ {totalLocked.toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div><p className="text-[10px] text-muted-foreground">Released</p><p className="text-sm font-semibold text-primary">ꠄ {totalReleased.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Available wallet</p><p className="text-sm font-semibold">ꠄ {Number(wallet?.available_balance || 0).toLocaleString()}</p></div>
          </div>
        </div>

        <div className="glass-card p-5 mb-5">
          <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Create New Lock</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Lock name (e.g. School Fees)" className="w-full mb-2 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm" />
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Total amount to lock (ꠄ)" className="w-full mb-2 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm" />
          <input value={daily} onChange={e => setDaily(e.target.value)} type="number" placeholder="Daily release amount (ꠄ)" className="w-full mb-3 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm" />
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-destructive">Once locked, funds cannot be withdrawn early. They release only on your daily schedule.</p>
          </div>
          <label className="flex items-center gap-2 mb-3">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
            <span className="text-xs text-muted-foreground">I understand this lock is irreversible</span>
          </label>
          <button onClick={handleLock} disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Lock Funds
          </button>
        </div>

        <h3 className="text-sm font-display font-semibold mb-3">Active Locks</h3>
        <div className="space-y-3">
          {locks.map(l => {
            const released = Number(l.released_amount);
            const total = Number(l.total_amount);
            const pct = Math.round((released / total) * 100);
            return (
              <div key={l.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <span className="text-[10px] text-primary flex items-center gap-1"><Calendar className="w-3 h-3" /> {l.status}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>ꠄ {released.toLocaleString()} / {total.toLocaleString()}</span>
                  <span>ꠄ {Number(l.daily_release)}/day</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {locks.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">No locks yet</p>}
        </div>

        <div className="glass-card p-4 mt-5 border-primary/10 flex gap-3 items-center">
          <Shield className="w-5 h-5 text-primary" />
          <p className="text-[11px] text-muted-foreground">Protected by WaidesPruf cryptographic seal</p>
        </div>
        <div className="h-8" />
      </div>
    </DashboardLayout>
  );
};
export default WaidLock;
