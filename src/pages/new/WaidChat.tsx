import { useEffect, useState } from "react";
import { MessageSquare, Send, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidChatService } from "@/lib/services";
import { toast } from "sonner";

const WaidChat = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [newUserId, setNewUserId] = useState("");

  useEffect(() => { WaidChatService.myThreads().then(setThreads); }, []);
  useEffect(() => {
    if (!activeId) return;
    WaidChatService.messages(activeId).then(setMessages);
    const ch = WaidChatService.subscribe(activeId, (m) => setMessages(prev => [...prev, m]));
    return () => { (ch as any).unsubscribe?.(); };
  }, [activeId]);

  const send = async () => {
    if (!activeId || !body.trim()) return;
    await WaidChatService.send(activeId, body); setBody("");
  };
  const start = async () => {
    if (!newUserId) return;
    try { const t = await WaidChatService.startDirect(newUserId); setThreads(p => [t, ...p]); setActiveId(t.id); setNewUserId(""); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidChat" subtitle="Talk, send money, share moments" Icon={MessageSquare}>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-card p-3 flex gap-2">
            <input value={newUserId} onChange={e=>setNewUserId(e.target.value)} placeholder="Friend's user id"
              className="flex-1 px-2 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground" />
            <button onClick={start} className="p-1.5 rounded-lg gradient-primary text-primary-foreground"><Plus className="w-4 h-4"/></button>
          </div>
          {threads.map(t => (
            <button key={t.id} onClick={()=>setActiveId(t.id)} className={`glass-card p-3 w-full text-left ${activeId===t.id?"border-primary/40":""}`}>
              <p className="text-sm text-foreground">{t.title || (t.is_group ? "Group" : "Direct chat")}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(t.last_message_at).toLocaleString()}</p>
            </button>
          ))}
          {!threads.length && <p className="text-xs text-muted-foreground text-center py-4">No chats yet</p>}
        </div>
        <div className="lg:col-span-2 glass-card p-3 flex flex-col h-[60vh]">
          {!activeId ? <p className="text-xs text-muted-foreground m-auto">Select a chat</p> : (<>
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {messages.map(m => (
                <div key={m.id} className="bg-secondary/60 rounded-lg px-3 py-2 text-xs text-foreground">
                  <p>{m.body}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
              <button onClick={send} className="p-2 rounded-lg gradient-primary text-primary-foreground"><Send className="w-4 h-4"/></button>
            </div>
          </>)}
        </div>
      </div>
    </WealthPageShell>
  );
};
export default WaidChat;
