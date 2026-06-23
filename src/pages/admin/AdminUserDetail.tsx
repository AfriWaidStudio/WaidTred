import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, User, Wallet, ArrowLeftRight, ShieldCheck, Ban, Mail, Phone, Globe, Calendar, Unlock } from "lucide-react";
import { AdminService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminUserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [u, setU] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);

  const load = async () => {
    if (!id) return;
    setU(await AdminService.getUser(id));
    const { data: w } = await supabase.from("wallets").select("*").eq("user_id", id).maybeSingle();
    setWallet(w);
    const { data: t } = await supabase.from("transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20);
    setTxs(t || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (!u) return <AdminLayout><div className="p-8 text-center text-muted-foreground">Loading…</div></AdminLayout>;

  const toggleFreeze = async () => {
    const next = u.account_status === "frozen" ? "active" : "frozen";
    await AdminService.setAccountStatus(u.id, next as any);
    toast.success(`Account ${next}`); load();
  };

  return (
    <AdminLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center"><User className="w-7 h-7 text-muted-foreground" /></div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">{u.full_name || "—"}</h2>
              <p className="text-xs text-muted-foreground">{u.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs mb-4">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3 h-3" /> {u.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" /> {u.phone || "—"}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Globe className="w-3 h-3" /> {u.country}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3 h-3" /> {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
          </div>
          <div className="flex gap-2 mb-3">
            <span className="px-2 py-1 rounded text-[10px] bg-primary/10 text-primary flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> KYC {u.kyc_status}</span>
            <span className="px-2 py-1 rounded text-[10px] bg-primary/10 text-primary">{u.account_status}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleFreeze} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center justify-center gap-1">
              {u.account_status === "frozen" ? <><Unlock className="w-3 h-3" /> Unfreeze</> : <><Ban className="w-3 h-3" /> Freeze</>}
            </button>
            {u.kyc_status !== "verified" && (
              <button onClick={() => navigate("/admin/compliance")} className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" /> Review KYC</button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3 border border-border"><Wallet className="w-4 h-4 text-primary mb-1" /><p className="text-lg font-bold">ꠄ {Number(wallet?.available_balance || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Available</p></div>
            <div className="glass-card rounded-xl p-3 border border-border"><Wallet className="w-4 h-4 text-accent mb-1" /><p className="text-lg font-bold">ꠄ {Number(wallet?.locked_balance || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Locked</p></div>
            <div className="glass-card rounded-xl p-3 border border-border"><ArrowLeftRight className="w-4 h-4 text-primary mb-1" /><p className="text-lg font-bold">{txs.length}</p><p className="text-[10px] text-muted-foreground">Recent Tx</p></div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground text-sm mb-3">Recent Transactions</h3>
            <div className="space-y-2">
              {txs.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No transactions</p>}
              {txs.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-xs font-medium text-foreground">{tx.title}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.id.slice(0, 8)} • {new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === "received" ? "text-primary" : "text-foreground"}`}>
                    {tx.type === "received" ? "+" : "-"}ꠄ {Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
