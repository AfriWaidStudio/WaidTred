import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { VoiceService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WaidVoice = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const load = () => VoiceService.history().then(setHistory);
  useEffect(() => { load(); }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          setBusy(true);
          try {
            const { data, error } = await supabase.functions.invoke("voice-transcribe", { body: { audio: base64, mime: "audio/webm" } });
            if (error) throw error;
            const text = data?.transcript || "";
            setTranscript(text);
            await VoiceService.log(text, "voice");
            // Send to KonsAI
            const { data: ai } = await supabase.functions.invoke("konsai-chat", { body: { message: text } });
            if (ai?.reply) toast.success(ai.reply.slice(0, 200));
            load();
          } catch (e: any) { toast.error(e.message || "Transcription failed"); }
          finally { setBusy(false); }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start(); recRef.current = rec; setRecording(true);
    } catch (e: any) { toast.error("Mic access denied"); }
  };
  const stop = () => { recRef.current?.stop(); setRecording(false); };

  return (
    <WealthPageShell title="WaidVoice" subtitle="Talk to KonsAI naturally" Icon={Mic}>
      <div className="flex flex-col items-center py-8">
        <button onClick={recording ? stop : start} disabled={busy}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${recording ? "bg-destructive animate-pulse" : "gradient-primary"} ${busy?"opacity-50":""}`}>
          {recording ? <Square className="w-12 h-12 text-primary-foreground"/> : <Mic className="w-12 h-12 text-primary-foreground"/>}
        </button>
        <p className="mt-4 text-xs text-muted-foreground">{busy ? "Transcribing..." : recording ? "Listening..." : "Tap to talk"}</p>
        {transcript && <div className="glass-card p-4 mt-4 max-w-md text-sm text-foreground">"{transcript}"</div>}
      </div>
      <h2 className="text-sm font-semibold text-foreground mb-2">History</h2>
      <div className="space-y-2">
        {history.map(h => (
          <div key={h.id} className="glass-card p-3">
            <p className="text-sm text-foreground">"{h.transcript}"</p>
            <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
          </div>
        ))}
        {!history.length && <p className="text-xs text-muted-foreground text-center py-4">No commands yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default WaidVoice;
