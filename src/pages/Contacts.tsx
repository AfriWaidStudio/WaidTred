import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Plus, Search, Send, Star, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContactsService } from "@/lib/services";

const Contacts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const load = () => ContactsService.list().then(({ data }) => setContacts(data));
  useEffect(() => { load(); }, []);

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search));
  const favs = filtered.filter(c => c.is_favorite);
  const others = filtered.filter(c => !c.is_favorite);

  const add = async () => {
    if (!form.name || (!form.phone && !form.email)) return toast({ title: "Name and phone/email required", variant: "destructive" });
    const { error } = await ContactsService.add(form);
    if (error) return toast({ title: "Failed", variant: "destructive" });
    setForm({ name: "", phone: "", email: "" });
    setShowAdd(false);
    toast({ title: "Contact added" });
    load();
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
          <button onClick={() => setShowAdd(!showAdd)} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"><Plus className="w-4 h-4 text-primary-foreground" /></button>
        </div>
        <h1 className="font-display text-xl font-bold mb-4">Contacts</h1>

        {showAdd && (
          <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <button onClick={add} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Add Contact</button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
        </div>

        {favs.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-2 font-medium">⭐ Favorites</p>
            <div className="space-y-2 mb-4">
              {favs.map(c => <Row key={c.id} c={c} onSend={() => navigate("/dashboard/send")} onFav={async () => { await ContactsService.toggleFavorite(c.id, !c.is_favorite); load(); }} onDel={async () => { await ContactsService.remove(c.id); toast({ title: "Removed" }); load(); }} />)}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground mb-2 font-medium">All Contacts</p>
        <div className="space-y-2">
          {others.map(c => <Row key={c.id} c={c} onSend={() => navigate("/dashboard/send")} onFav={async () => { await ContactsService.toggleFavorite(c.id, !c.is_favorite); load(); }} onDel={async () => { await ContactsService.remove(c.id); toast({ title: "Removed" }); load(); }} />)}
        </div>

        {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-10">No contacts yet</p>}
      </div>
    </DashboardLayout>
  );
};

const Row = ({ c, onSend, onFav, onDel }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{c.name}</p>
      <p className="text-[10px] text-muted-foreground">{c.phone || c.email}</p>
    </div>
    <button onClick={onFav}><Star className={`w-4 h-4 ${c.is_favorite ? "fill-accent text-accent" : "text-muted-foreground"}`} /></button>
    <button onClick={onSend}><Send className="w-4 h-4 text-muted-foreground hover:text-primary" /></button>
    <button onClick={onDel}><Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
  </div>
);

export default Contacts;
