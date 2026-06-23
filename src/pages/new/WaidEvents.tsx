import { useEffect, useState } from "react";
import { Calendar, Plus, Ticket } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidEventsService } from "@/lib/services";
import { toast } from "sonner";

const WaidEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [tab, setTab] = useState<"browse"|"tickets"|"new">("browse");
  const [form, setForm] = useState({ title:"", description:"", venue:"", starts_at:"", price:0, capacity:100 });

  const load = () => { WaidEventsService.list().then(setEvents); WaidEventsService.myTickets().then(setTickets); };
  useEffect(() => { load(); }, []);

  const buy = async (id: string) => {
    try { await WaidEventsService.buy(id); toast.success("Ticket purchased"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const create = async () => {
    try { await WaidEventsService.create(form); toast.success("Event created"); setTab("browse"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidEvents" subtitle="Tickets & gatherings" Icon={Calendar}>
      <div className="flex gap-2 mb-4">
        {(["browse","tickets","new"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs ${tab===t?"gradient-primary text-primary-foreground":"bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab==="browse" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map(e => (
            <div key={e.id} className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground">{e.title}</p>
              <p className="text-[11px] text-muted-foreground">{e.venue}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(e.starts_at).toLocaleString()}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-primary">◈{Number(e.price).toLocaleString()}</span>
                <button onClick={()=>buy(e.id)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs">Buy</button>
              </div>
            </div>
          ))}
          {!events.length && <p className="text-xs text-muted-foreground col-span-full text-center py-6">No events</p>}
        </div>
      )}
      {tab==="tickets" && (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="glass-card p-4 flex items-center gap-3">
              <Ticket className="w-5 h-5 text-primary"/>
              <div className="flex-1">
                <p className="text-sm text-foreground">{t.event?.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{t.ticket_code}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.status==="valid"?"bg-primary/10 text-primary":"bg-secondary text-muted-foreground"}`}>{t.status}</span>
            </div>
          ))}
          {!tickets.length && <p className="text-xs text-muted-foreground text-center py-6">No tickets</p>}
        </div>
      )}
      {tab==="new" && (
        <div className="glass-card p-4 space-y-2 max-w-md">
          {(["title","description","venue"] as const).map(k => (
            <input key={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          ))}
          <input type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} placeholder="Price"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:Number(e.target.value)})} placeholder="Capacity"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <button onClick={create} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5"/> Create event
          </button>
        </div>
      )}
    </WealthPageShell>
  );
};
export default WaidEvents;
