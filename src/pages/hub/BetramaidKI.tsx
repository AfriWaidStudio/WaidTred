import { Brain, Sparkles, Send, Loader2, Trash2, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const starters = [
  "How can I save more this month?",
  "Show my spending breakdown",
  "Schedule 500 to my landlord on the 1st",
  "Remind me to top up data tomorrow 9am",
];

const BetramaidKI = () => {
  const { user } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I'm Betramaid KI, your financial brain. Ask me about your money or tell me to schedule something." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading || !user) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput(""); setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("konsai-chat", { body: { conversation_id: convId, message: text } });
      if (error) throw error;
      if (data?.conversation_id) setConvId(data.conversation_id);
      setMessages(m => [...m, { role: "assistant", content: data?.reply ?? "" }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `Error: ${e?.message ?? e}` }]);
    } finally { setLoading(false); }
  };

  const clearChat = () => { setMessages([{ role: "assistant", content: "Cleared. How can I help?" }]); setConvId(null); };
  const copyAll = () => { navigator.clipboard.writeText(messages.map(m => `${m.role}: ${m.content}`).join("\n\n")); toast.success("Copied"); };

  return (
    <MiniAppContainer title="Betramaid KI" subtitle="AI Financial Advisor">
      <div className="glass-card p-5 mb-4 border-primary/10 text-center relative">
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={copyAll} title="Copy" className="p-1.5 rounded-md hover:bg-secondary"><Copy className="w-3 h-3 text-muted-foreground"/></button>
          <button onClick={clearChat} title="Clear" className="p-1.5 rounded-md hover:bg-secondary"><Trash2 className="w-3 h-3 text-muted-foreground"/></button>
        </div>
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/20">
          <Brain className="w-7 h-7 text-primary-foreground" />
        </div>
        <p className="text-[10px] text-muted-foreground">Powered by Waides KI · Konsmik Civilization</p>
      </div>

      <div className="glass-card p-3 mb-3 max-h-[24rem] overflow-y-auto space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap ${m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{m.content}</div>
          </div>
        ))}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {starters.map(s => (
            <button key={s} onClick={() => send(s)} className="px-2 py-1 rounded-lg bg-secondary/60 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {s}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card p-3 border-primary/10 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask Betramaid..." className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground" />
        <button onClick={() => send(input)} disabled={loading} className="p-2 rounded-lg gradient-primary text-primary-foreground disabled:opacity-50">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </MiniAppContainer>
  );
};

export default BetramaidKI;
