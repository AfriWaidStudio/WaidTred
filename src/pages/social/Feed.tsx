import { Activity, Send, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { FeedService } from "@/lib/services";
import { toast } from "sonner";

const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const load = () => FeedService.list().then(setPosts);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!body.trim()) return;
    try { await FeedService.post(body); setBody(""); toast.success("Posted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const like = async (id: string) => { try { await FeedService.like(id); load(); } catch {} };

  return (
    <WealthPageShell title="WaidFeed" subtitle="Community pulse" Icon={Activity} back="/dashboard">
      <div className="glass-card p-3 mb-4 flex gap-2">
        <input value={body} onChange={e => setBody(e.target.value)} placeholder="Share something..." className="flex-1 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <button onClick={submit} className="px-3 rounded-lg gradient-primary text-primary-foreground"><Send className="w-4 h-4" /></button>
      </div>
      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="glass-card p-3">
            <p className="text-xs font-semibold">{p.author?.full_name || "User"}</p>
            <p className="text-sm mt-1">{p.body}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
              <button onClick={() => like(p.id)} className="flex items-center gap-1 hover:text-primary"><Heart className="w-3 h-3" />{p.like_count}</button>
              <span>{new Date(p.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No posts yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default Feed;
