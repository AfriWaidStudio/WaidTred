import { useEffect, useState } from "react";
import { Send, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminService } from "@/lib/services";
import { toast } from "sonner";

const AdminChat = () => {
  const [convs, setConvs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");

  const loadConvs = async () => {
    const c = await AdminService.listConversations();
    setConvs(c);
    if (!selected && c.length) setSelected(c[0].id);
  };
  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (selected) AdminService.listMessages(selected).then(setMessages); }, [selected]);

  const send = async () => {
    if (!selected || !reply.trim()) return;
    try { await AdminService.sendAgentReply(selected, reply); setReply(""); AdminService.listMessages(selected).then(setMessages); }
    catch (e: any) { toast.error(e.message); }
  };

  const filtered = convs.filter(c => (c.profile?.full_name || c.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="glass-card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          <div className="w-72 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && <p className="p-4 text-xs text-center text-muted-foreground">No conversations</p>}
              {filtered.map(c => (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full p-3 flex items-center gap-3 text-left border-b border-border/50 ${selected === c.id ? "bg-primary/5" : "hover:bg-secondary/30"}`}>
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.profile?.full_name || c.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.profile?.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {selected ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === "assistant" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No messages</p>}
                </div>
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Reply as agent…" className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
                  <button onClick={send} className="p-2 rounded-lg gradient-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
