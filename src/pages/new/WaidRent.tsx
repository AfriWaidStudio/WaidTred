import { useEffect, useState } from "react";
import { Key, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidRentService } from "@/lib/services";
import { toast } from "sonner";

const WaidRent = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState<"browse"|"bookings"|"new">("browse");
  const [form, setForm] = useState({ title:"", description:"", category:"", daily_rate:50, deposit:0, location:"" });

  const load = () => { WaidRentService.list().then(setRentals); WaidRentService.myBookings().then(setBookings); };
  useEffect(() => { load(); }, []);

  const book = async (id: string) => {
    const s = prompt("Start date (YYYY-MM-DD)?", new Date().toISOString().slice(0,10));
    const e = prompt("End date (YYYY-MM-DD)?", new Date(Date.now()+86400000).toISOString().slice(0,10));
    if (!s || !e) return;
    try { await WaidRentService.book(id, s, e); toast.success("Booked"); load(); }
    catch (err: any) { toast.error(err.message); }
  };
  const list = async () => {
    try { await WaidRentService.create(form); toast.success("Listed"); setTab("browse"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidRent" subtitle="Rent anything, anywhere" Icon={Key}>
      <div className="flex gap-2 mb-4">
        {(["browse","bookings","new"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs ${tab===t?"gradient-primary text-primary-foreground":"bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab==="browse" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rentals.map(r => (
            <div key={r.id} className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="text-[11px] text-muted-foreground">{r.location} · {r.category}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-primary">◈{Number(r.daily_rate)}/day</span>
                <button onClick={()=>book(r.id)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs">Book</button>
              </div>
            </div>
          ))}
          {!rentals.length && <p className="text-xs text-muted-foreground col-span-full text-center py-6">No listings</p>}
        </div>
      )}
      {tab==="bookings" && (
        <div className="space-y-2">
          {bookings.map(b => (
            <div key={b.id} className="glass-card p-4">
              <p className="text-sm text-foreground">{b.rental?.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.start_date} → {b.end_date} · ◈{Number(b.total_amount)}</p>
            </div>
          ))}
          {!bookings.length && <p className="text-xs text-muted-foreground text-center py-6">No bookings</p>}
        </div>
      )}
      {tab==="new" && (
        <div className="glass-card p-4 space-y-2 max-w-md">
          {(["title","description","category","location"] as const).map(k => (
            <input key={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          ))}
          <input type="number" value={form.daily_rate} onChange={e=>setForm({...form,daily_rate:Number(e.target.value)})} placeholder="Daily rate" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="number" value={form.deposit} onChange={e=>setForm({...form,deposit:Number(e.target.value)})} placeholder="Deposit" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <button onClick={list} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> List item</button>
        </div>
      )}
    </WealthPageShell>
  );
};
export default WaidRent;
