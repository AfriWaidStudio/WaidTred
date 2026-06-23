import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Ticket, Plus, Search, Ban, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmaiPinService, type SmaiPin } from "@/lib/services/smai-pin-service";
import { smaiPinStatusColors } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const AdminSmaiPins = () => {
  const { toast } = useToast();
  const [pins, setPins] = useState<SmaiPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newValue, setNewValue] = useState("500");

  const fetchPins = async () => {
    setLoading(true);
    const { data } = await SmaiPinService.getAllPins();
    setPins(data);
    setLoading(false);
  };

  useEffect(() => { fetchPins(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      toast({ title: "Invalid value", variant: "destructive" });
      setCreating(false);
      return;
    }
    const { data, error } = await SmaiPinService.createPin(value, null);
    if (error) {
      toast({ title: "Failed to create pin", description: String(error), variant: "destructive" });
    } else if (data) {
      setPins([data, ...pins]);
      toast({ title: "SmaiPin created", description: `Pin: ${data.pin_code} • Value: ꠄ ${data.value}` });
    }
    setCreating(false);
  };

  const handleRevoke = async (pinId: string) => {
    const { error } = await SmaiPinService.revokePin(pinId);
    if (!error) {
      setPins(pins.map(p => p.id === pinId ? { ...p, status: "revoked" as const } : p));
      toast({ title: "Pin revoked" });
    }
  };

  const filtered = pins.filter(p =>
    p.pin_code.toLowerCase().includes(search.toLowerCase()) ||
    p.status.includes(search.toLowerCase())
  );

  const stats = {
    total: pins.length,
    active: pins.filter(p => p.status === "active").length,
    redeemed: pins.filter(p => p.status === "redeemed").length,
    totalValue: pins.filter(p => p.status === "active").reduce((s, p) => s + p.value, 0),
  };

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Total Pins</p>
          <p className="text-xl font-bold font-display text-foreground">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Active</p>
          <p className="text-xl font-bold font-display text-primary">{stats.active}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Redeemed</p>
          <p className="text-xl font-bold font-display text-accent">{stats.redeemed}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-muted-foreground">Active Value</p>
          <p className="text-xl font-bold font-display text-foreground">ꠄ {stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Create + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search pins..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-24 bg-secondary/50"
          />
          <Button variant="hero" size="sm" onClick={handleCreate} disabled={creating}>
            <Plus className="w-4 h-4 mr-1" /> {creating ? "..." : "Generate Pin"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csv = "pin_code,value,status,created_at,redeemed_at\n" + pins.map(p => `${p.pin_code},${p.value},${p.status},${p.created_at || ""},${p.redeemed_at || ""}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob); const a = document.createElement("a");
            a.href = url; a.download = `smaipins-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
            toast({ title: "Exported CSV" });
          }}>Export CSV</Button>
        </div>
      </div>

      {/* Pins Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading pins...</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 text-xs text-muted-foreground font-medium">Pin Code</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Value</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Created</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Redeemed</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pin) => (
                  <tr key={pin.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-mono text-xs font-bold text-foreground">{pin.pin_code}</td>
                    <td className="p-3 font-semibold text-foreground">ꠄ {pin.value.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${smaiPinStatusColors[pin.status]}`}>
                        {pin.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                      {pin.created_at ? new Date(pin.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {pin.redeemed_at ? new Date(pin.redeemed_at).toLocaleString() : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {pin.status === "active" && (
                          <button onClick={() => handleRevoke(pin.id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Revoke">
                            <Ban className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {pins.length === 0 ? "No pins created yet. Generate your first SmaiPin above." : "No pins match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSmaiPins;
