import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Plus, Calendar, Repeat, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScheduledService } from "@/lib/services";

const ScheduledTransfers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ to: "", amount: "", phone: "", freq: "monthly" as "daily"|"weekly"|"monthly", date: "" });

  const load = () => ScheduledService.list().then(({ data }) => setTransfers(data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.to || !form.amount || !form.date) return toast({ title: "Fill all fields", variant: "destructive" });
    const { error } = await ScheduledService.create({
      recipient_name: form.to, amount: Number(form.amount), frequency: form.freq, next_run: form.date, recipient_phone: form.phone,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setForm({ to: "", amount: "", phone: "", freq: "monthly", date: "" });
    setShowAdd(false);
    toast({ title: "Scheduled" });
    load();
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
          <button onClick={() => setShowAdd(!showAdd)} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"><Plus className="w-4 h-4 text-primary-foreground" /></button>
        </div>
        <h1 className="font-display text-xl font-bold mb-6">Scheduled Transfers</h1>

        {showAdd && (
          <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
            <input placeholder="Recipient name" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input placeholder="Recipient phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input type="number" placeholder="Amount (ꠄ)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
            <select value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value as any })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm">
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
            <button onClick={add} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Schedule</button>
          </div>
        )}

        <div className="space-y-3">
          {transfers.map(t => (
            <div key={t.id} className={`glass-card rounded-xl p-4 ${!t.active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{t.recipient_name}</p>
                <span className="text-sm font-bold text-primary">ꠄ {Number(t.amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> {t.frequency}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.next_run}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => { await ScheduledService.toggle(t.id, !t.active); load(); }} className={`px-2 py-1 rounded text-[10px] ${t.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {t.active ? "Active" : "Paused"}
                  </button>
                  <button onClick={async () => { await ScheduledService.remove(t.id); toast({ title: "Removed" }); load(); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {transfers.length === 0 && (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No scheduled transfers yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduledTransfers;
