import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const quickReplies = [
  "What's my balance?",
  "Remind me to pay rent at 6pm tonight",
  "Send 100 to Kwame",
  "Show recent transactions",
];

type Msg = { role: "user" | "assistant"; content: string };

const LiveChat = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm KonsAI. I can check your balance, send money, schedule reminders, and more. Try: *\"At 6pm tonight remind Kwame to send me 200\"*." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!user) { setMessages(m => [...m, { role: "assistant", content: "Please sign in to chat with KonsAI." }]); return; }
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("konsai-chat", {
        body: { conversation_id: convId, message: text },
      });
      if (error) throw error;
      if (data?.conversation_id) setConvId(data.conversation_id);
      setMessages(m => [...m, { role: "assistant", content: data?.reply ?? "(no reply)" }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `Sorry, something went wrong: ${e?.message ?? e}` }]);
    } finally { setLoading(false); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
    </button>
  );

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 h-[28rem] bg-card border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden">
      <div className="gradient-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <div>
            <p className="text-sm font-semibold text-primary-foreground">KonsAI</p>
            <p className="text-[10px] text-primary-foreground/70">Powered by Konsmik Civilization</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-primary-foreground" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap ${m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-secondary px-3 py-2 rounded-xl"><Loader2 className="w-3 h-3 animate-spin text-muted-foreground" /></div></div>}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
          {quickReplies.map(q => (
            <button key={q} onClick={() => send(q)} className="px-2 py-1 rounded-lg bg-secondary/50 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary">{q}</button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-border flex gap-2">
        <input placeholder="Ask KonsAI anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} className="flex-1 px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        <button onClick={() => send(input)} disabled={loading} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50">
          <Send className="w-3 h-3 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
