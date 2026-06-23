import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => { setLoading(true); const { data } = await supabase.from("withdrawal_requests" as any).select("*,profile:profiles!withdrawal_requests_user_id_fkey(full_name,email),beneficiary:bank_beneficiaries(account_name,account_number,bank_name)").order("created_at", { ascending: false }); setRows(data ?? []); setLoading(false); };
  useEffect(() => { void load(); }, []);
  const review = async (id: string, approve: boolean) => { const reason = approve ? null : prompt("Rejection reason"); if (!approve && !reason) return; setBusy(id); const { error } = await supabase.rpc("admin_review_withdrawal" as any, { _withdrawal_id: id, _approve: approve, _reason: reason }); setBusy(null); if (error) return toast({ title: "Review failed", description: error.message, variant: "destructive" }); toast({ title: approve ? "Withdrawal approved" : "Withdrawal rejected" }); await load(); };
  return <AdminLayout><div className="mb-5"><h1 className="text-xl font-bold">Withdrawal Operations</h1><p className="text-xs text-muted-foreground">Review held-fund payout requests before provider processing.</p></div><div className="glass-card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b border-border"><th className="p-3">User</th><th className="p-3">Beneficiary</th><th className="p-3">Amount</th><th className="p-3">Risk</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{loading && <tr><td colSpan={6} className="p-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>}{rows.map(row => <tr key={row.id} className="border-b border-border/50"><td className="p-3"><p>{row.profile?.full_name}</p><p className="text-[10px] text-muted-foreground">{row.profile?.email}</p></td><td className="p-3"><p>{row.beneficiary?.account_name}</p><p className="text-[10px] text-muted-foreground">{row.beneficiary?.bank_name} · {row.beneficiary?.account_number}</p></td><td className="p-3 font-semibold">{row.currency_code} {Number(row.amount).toLocaleString()}</td><td className="p-3 text-xs">{row.risk_score ?? "Not scored"}</td><td className="p-3 text-xs capitalize">{row.status}</td><td className="p-3">{row.status === "pending" && <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy === row.id} onClick={() => review(row.id, false)}><XCircle className="w-3 h-3 mr-1" />Reject</Button><Button size="sm" disabled={busy === row.id} onClick={() => review(row.id, true)}><CheckCircle className="w-3 h-3 mr-1" />Approve</Button></div>}</td></tr>)}</tbody></table></div></AdminLayout>;
};

export default AdminWithdrawals;
