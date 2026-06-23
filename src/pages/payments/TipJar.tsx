import { useEffect, useState } from "react";
import { Heart, Copy } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { TipJarService } from "@/lib/services";
import { toast } from "sonner";

const TipJar = () => {
  const [jar, setJar] = useState<any>(null);
  const [slug, setSlug] = useState(""); const [name, setName] = useState(""); const [msg, setMsg] = useState("");
  const load = () => TipJarService.myJar().then(j => { setJar(j); if (j) { setSlug(j.slug); setName(j.display_name); setMsg(j.message ?? ""); } });
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!slug || !name) return;
    try { await TipJarService.create({ slug, display_name: name, message: msg }); toast.success("Tip jar saved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const link = jar ? `${window.location.origin}/tip/${jar.slug}` : "";
  return (
    <WealthPageShell title="Tip Jar" subtitle="Public tip page" Icon={Heart} back="/dashboard">
      {jar && (
        <div className="glass-card p-5 mb-4 border-primary/10">
          <p className="text-xs text-muted-foreground">Total received</p>
          <p className="text-2xl font-bold font-display">ꠄ {Number(jar.total_received).toLocaleString()}</p>
          <button onClick={()=>{navigator.clipboard.writeText(link); toast.success("Link copied");}} className="mt-2 text-[10px] flex items-center gap-1 text-primary"><Copy className="w-3 h-3"/>{link}</button>
        </div>
      )}
      <div className="glass-card p-4 space-y-2">
        <input placeholder="Slug (e.g. yourname)" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input placeholder="Display name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <textarea placeholder="Thank you message" value={msg} onChange={e=>setMsg(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" rows={2}/>
        <button onClick={save} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Save</button>
      </div>
    </WealthPageShell>
  );
};
export default TipJar;
