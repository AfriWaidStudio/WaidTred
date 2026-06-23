import { useEffect, useState } from "react";
import { Shield, Plus, Trash2 } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { RecoveryService } from "@/lib/services";
import { toast } from "sonner";

const Recovery = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [form, setForm] = useState({ contact_name:"", contact_email:"", contact_phone:"", relationship:"friend", is_heir:false, inheritance_share:0 });

  const load = () => { RecoveryService.myContacts().then(setContacts); RecoveryService.myRequests().then(setRequests); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.contact_name) return toast.error("Name required");
    try { await RecoveryService.add(form); toast.success("Added"); load(); setForm({contact_name:"",contact_email:"",contact_phone:"",relationship:"friend",is_heir:false,inheritance_share:0}); }
    catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => { await RecoveryService.remove(id); load(); };
  const request = async () => {
    const r = prompt("Reason for recovery?") || ""; 
    try { await RecoveryService.requestRecovery(r); toast.success("Recovery requested"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Recovery & Heirs" subtitle="Trusted contacts for account recovery & inheritance" Icon={Shield}>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Add contact</h2>
          <div className="glass-card p-4 space-y-2">
            <input value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} placeholder="Name" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
            <input value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})} placeholder="Email" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
            <input value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})} placeholder="Phone" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
            <input value={form.relationship} onChange={e=>setForm({...form,relationship:e.target.value})} placeholder="Relationship" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.is_heir} onChange={e=>setForm({...form,is_heir:e.target.checked})}/> Mark as heir
            </label>
            {form.is_heir && <input type="number" value={form.inheritance_share} onChange={e=>setForm({...form,inheritance_share:Number(e.target.value)})} placeholder="Share %" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>}
            <button onClick={add} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
          </div>
          <button onClick={request} className="mt-4 w-full px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-xs">Request account recovery</button>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">My contacts ({contacts.length})</h2>
          <div className="space-y-2">
            {contacts.map(c => (
              <div key={c.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{c.contact_name} {c.is_heir && <span className="text-[10px] text-primary">· heir {c.inheritance_share}%</span>}</p>
                  <p className="text-[10px] text-muted-foreground">{c.contact_email || c.contact_phone} · {c.relationship}</p>
                </div>
                <button onClick={()=>remove(c.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
            {!contacts.length && <p className="text-xs text-muted-foreground text-center py-4">No contacts</p>}
          </div>
          {requests.length>0 && (<>
            <h2 className="text-sm font-semibold text-foreground mt-4 mb-2">Requests</h2>
            <div className="space-y-2">
              {requests.map(r => (
                <div key={r.id} className="glass-card p-3 text-xs text-foreground">{r.reason} <span className="text-muted-foreground">— {r.status}</span></div>
              ))}
            </div>
          </>)}
        </div>
      </div>
    </WealthPageShell>
  );
};
export default Recovery;
