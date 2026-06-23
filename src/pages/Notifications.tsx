import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Bell, Check } from "lucide-react";
import { NotificationService } from "@/lib/services";

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const load = () => NotificationService.list().then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : items.filter(n => filter === "unread" ? !n.read : n.type === filter);
  const unread = items.filter(n => !n.read).length;

  const markAll = async () => { await NotificationService.markAllRead(); load(); };
  const markOne = async (id: string) => { await NotificationService.markRead(id); load(); };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
          {unread > 0 && <button onClick={markAll} className="text-xs text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Mark all read</button>}
        </div>
        <h1 className="font-display text-xl font-bold mb-4">Notifications {unread > 0 && <span className="text-sm text-primary">({unread})</span>}</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["all", "unread", "tx", "security", "info"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === f ? "gradient-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(n => (
            <button key={n.id} onClick={() => { markOne(n.id); if (n.link) navigate(n.link); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left ${n.read ? "border-border bg-card/50" : "border-primary/20 bg-primary/5"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${n.read ? "bg-secondary" : "bg-primary/10"}`}>
                <Bell className={`w-4 h-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-16">No notifications</p>}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
