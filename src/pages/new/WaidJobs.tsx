import { useEffect, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WaidJobsService } from "@/lib/services";
import { toast } from "sonner";

const WaidJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [mine, setMine] = useState<any[]>([]);
  const [tab, setTab] = useState<"browse"|"mine"|"new">("browse");
  const [form, setForm] = useState({ title:"", description:"", category:"", budget:100 });

  const load = () => { WaidJobsService.list().then(setJobs); WaidJobsService.myApplications().then(setMine); };
  useEffect(() => { load(); }, []);

  const apply = async (id: string) => {
    const note = prompt("Cover note?") || "";
    try { await WaidJobsService.apply(id, note); toast.success("Applied"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const post = async () => {
    try { await WaidJobsService.post(form); toast.success("Posted"); setTab("browse"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="WaidJobs" subtitle="Gigs, talent & escrow-protected work" Icon={Briefcase}>
      <div className="flex gap-2 mb-4">
        {(["browse","mine","new"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs ${tab===t?"gradient-primary text-primary-foreground":"bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab==="browse" && (
        <div className="grid md:grid-cols-2 gap-3">
          {jobs.map(j => (
            <div key={j.id} className="glass-card p-4">
              <p className="text-sm font-semibold text-foreground">{j.title}</p>
              <p className="text-[11px] text-muted-foreground">{j.category}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{j.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-primary">◈{Number(j.budget).toLocaleString()}</span>
                <button onClick={()=>apply(j.id)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs">Apply</button>
              </div>
            </div>
          ))}
          {!jobs.length && <p className="text-xs text-muted-foreground col-span-full text-center py-6">No open jobs</p>}
        </div>
      )}
      {tab==="mine" && (
        <div className="space-y-2">
          {mine.map(a => (
            <div key={a.id} className="glass-card p-4">
              <p className="text-sm text-foreground">{a.job?.title}</p>
              <p className="text-[10px] text-muted-foreground">Status: {a.status}</p>
            </div>
          ))}
          {!mine.length && <p className="text-xs text-muted-foreground text-center py-6">No applications</p>}
        </div>
      )}
      {tab==="new" && (
        <div className="glass-card p-4 space-y-2 max-w-md">
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <input type="number" value={form.budget} onChange={e=>setForm({...form,budget:Number(e.target.value)})} placeholder="Budget" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground"/>
          <button onClick={post} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Post job</button>
        </div>
      )}
    </WealthPageShell>
  );
};
export default WaidJobs;
