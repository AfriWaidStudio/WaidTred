import { useEffect, useState } from "react";
import { MessageSquare, Eye, User, X } from "lucide-react";
import ModeratorLayout from "@/components/moderator/ModeratorLayout";
import { AdminService } from "@/lib/services";

const ModeratorChats = () => {
  const [convs, setConvs] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => { AdminService.listConversations().then(setConvs); }, []);
  useEffect(() => { if (open) AdminService.listMessages(open).then(setMessages); }, [open]);

  return (
    <ModeratorLayout>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 text-center"><p className="text-2xl font-bold font-display">{convs.length}</p><p className="text-[11px] text-muted-foreground">Total Monitored</p></div>
      </div>

      <div className="space-y-3">
        {convs.length === 0 && <p className="text-center text-muted-foreground py-8">No conversations yet</p>}
        {convs.map(c => (
          <div key={c.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.profile?.full_name || c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.profile?.email}</p>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(c.updated_at).toLocaleString()}</span>
            </div>
            <button onClick={() => setOpen(c.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
              <Eye className="w-3.5 h-3.5" /> View Chat
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Conversation</p>
              <button onClick={() => setOpen(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No messages</p>}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModeratorLayout>
  );
};

export default ModeratorChats;
