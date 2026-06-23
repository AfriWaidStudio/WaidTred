import { User, Check, Link2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PublicProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile(data); setName(data?.full_name || "");
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const link = `waidtred.app/u/${user?.id?.slice(0, 8) || "you"}`;

  return (
    <WealthPageShell title="Public Profile" subtitle="Your shareable identity" Icon={User} back="/dashboard">
      <div className="glass-card p-5 mb-4 text-center">
        <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-primary-foreground">
          {(profile?.full_name || "U")[0]}
        </div>
        <p className="text-sm font-semibold flex items-center justify-center gap-1">
          {profile?.full_name || "Set your name"} {profile?.kyc_status === "verified" && <Check className="w-3.5 h-3.5 text-primary" />}
        </p>
        <p className="text-[11px] text-muted-foreground">{profile?.email}</p>
      </div>
      <div className="glass-card p-4 mb-3">
        <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" />Your link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs px-3 py-2 rounded-lg bg-secondary/60 truncate">{link}</code>
          <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }} className="p-2 rounded-lg bg-primary/10"><Copy className="w-3.5 h-3.5 text-primary" /></button>
        </div>
      </div>
      <div className="glass-card p-4 space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <button onClick={save} className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Save</button>
      </div>
    </WealthPageShell>
  );
};
export default PublicProfile;
