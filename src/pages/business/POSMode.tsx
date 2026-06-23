import { Smartphone, QrCode, Nfc } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { useEffect, useState } from "react";
import { PosService } from "@/lib/services";
import { toast } from "sonner";

const POSMode = () => {
  const [amount, setAmount] = useState("");
  const [sales, setSales] = useState<any[]>([]);
  const load = () => PosService.list().then(setSales);
  useEffect(() => { load(); }, []);

  const charge = async (method: string) => {
    if (!amount) return;
    try { await PosService.charge(Number(amount), method); toast.success("Sale recorded"); setAmount(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="POS Mode" subtitle="Phone-as-terminal" Icon={Smartphone} back="/dashboard">
      <div className="glass-card p-5 mb-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Charge amount</p>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full text-center text-3xl font-bold font-display bg-transparent border-0 outline-none placeholder:text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">ꠄ Smai Sika</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={()=>charge("qr")} className="glass-card p-5 flex flex-col items-center gap-2 hover:border-primary/30">
          <QrCode className="w-8 h-8 text-primary" /><span className="text-xs font-semibold">Show QR</span>
        </button>
        <button onClick={()=>charge("nfc")} className="glass-card p-5 flex flex-col items-center gap-2 hover:border-primary/30">
          <Nfc className="w-8 h-8 text-accent" /><span className="text-xs font-semibold">Tap to Pay</span>
        </button>
      </div>
      <h3 className="text-sm font-semibold mb-2">Recent Sales</h3>
      <div className="space-y-2">
        {sales.map(s => (
          <div key={s.id} className="glass-card p-3 flex justify-between text-xs">
            <span>ꠄ{Number(s.amount).toLocaleString()}</span>
            <span className="text-muted-foreground">{s.method} · {new Date(s.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
        {!sales.length && <p className="text-xs text-muted-foreground text-center py-4">No sales yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default POSMode;
