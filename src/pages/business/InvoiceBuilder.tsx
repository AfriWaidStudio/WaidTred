import { FileText, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { InvoiceService } from "@/lib/services";
import { toast } from "sonner";

const InvoiceBuilder = () => {
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
  const [list, setList] = useState<any[]>([]);
  const total = items.reduce((a, i) => a + i.quantity * i.unit_price, 0);
  const load = () => InvoiceService.list().then(setList);
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!client) return toast.error("Client name required");
    try { await InvoiceService.create({ client_name: client, client_email: email }, items); toast.success("Invoice created"); setClient(""); setEmail(""); setItems([{ description: "", quantity: 1, unit_price: 0 }]); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Invoice Builder" subtitle="Create & send branded invoices" Icon={FileText} back="/dashboard">
      <div className="glass-card p-4 mb-4">
        <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client name" className="w-full mb-2 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Client email" className="w-full mb-3 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm" />
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2">
            <input value={it.description} onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} placeholder="Description" className="col-span-6 px-2 py-2 rounded-lg bg-secondary/60 text-xs" />
            <input type="number" value={it.quantity} onChange={e => { const n = [...items]; n[i].quantity = +e.target.value; setItems(n); }} className="col-span-2 px-2 py-2 rounded-lg bg-secondary/60 text-xs" />
            <input type="number" value={it.unit_price} onChange={e => { const n = [...items]; n[i].unit_price = +e.target.value; setItems(n); }} placeholder="ꠄ" className="col-span-4 px-2 py-2 rounded-lg bg-secondary/60 text-xs" />
          </div>
        ))}
        <button onClick={() => setItems([...items, { description: "", quantity: 1, unit_price: 0 }])} className="w-full py-2 rounded-lg border border-dashed border-primary/30 text-xs text-primary flex items-center justify-center gap-1 mb-3"><Plus className="w-3 h-3" />Add line</button>
        <div className="flex justify-between text-sm font-semibold border-t border-border pt-3">
          <span>Total</span>
          <span className="text-primary">ꠄ {total.toFixed(2)}</span>
        </div>
      </div>
      <button onClick={send} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 mb-5">
        <Send className="w-4 h-4" />Create Invoice
      </button>
      <h3 className="text-sm font-semibold mb-2">My invoices</h3>
      <div className="space-y-2">
        {list.map(i => (
          <div key={i.id} className="glass-card p-3 flex items-center gap-3">
            <FileText className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">{i.invoice_number} · {i.client_name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{i.status}</p>
            </div>
            <p className="text-sm font-bold text-primary">ꠄ {Number(i.total).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </WealthPageShell>
  );
};
export default InvoiceBuilder;
