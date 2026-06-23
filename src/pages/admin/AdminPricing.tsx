import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { DollarSign, Plus, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AdminService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

type PricingRule = { id: string; asset_type: string; asset_name: string | null; base_price: number; spread_percentage: number; min_price: number | null; max_price: number | null; is_active: boolean | null; created_at?: string | null; updated_at?: string | null; };

const mockPricing: PricingRule[] = [
  { id: "pr-1", asset_type: "token", asset_name: "Sika", base_price: 1, spread_percentage: 0, min_price: 1, max_price: 1, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-2", asset_type: "token", asset_name: "Maiki", base_price: 0.1, spread_percentage: 5, min_price: 0.08, max_price: 0.15, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-3", asset_type: "token", asset_name: "Onyixki", base_price: 50, spread_percentage: 3, min_price: 45, max_price: 60, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-4", asset_type: "crypto", asset_name: "BTC", base_price: 325000, spread_percentage: 2, min_price: 300000, max_price: 400000, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-5", asset_type: "crypto", asset_name: "USDT", base_price: 5, spread_percentage: 1, min_price: 4.8, max_price: 5.5, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-6", asset_type: "giftcard", asset_name: "Apple Gift Card", base_price: 130, spread_percentage: 4, min_price: 125, max_price: 150, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "pr-7", asset_type: "giftcard", asset_name: "Amazon Gift Card", base_price: 250, spread_percentage: 4, min_price: 240, max_price: 280, is_active: true, created_at: "2026-04-01", updated_at: "2026-04-01" },
];

const AdminPricing = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSpread, setEditSpread] = useState("");
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({ asset_type: "token", asset_name: "", base_price: "0", spread_percentage: "5" });

  const load = async () => {
    const { data } = await supabase.from("pricing_rules").select("*").order("asset_type");
    setRules((data as PricingRule[]) || []);
  };
  useEffect(() => { load(); }, []);

  const handleSaveSpread = async (id: string) => {
    const spread = parseFloat(editSpread);
    if (isNaN(spread) || spread < 0) { toast({ title: "Invalid spread", variant: "destructive" }); return; }
    const { error } = await supabase.from("pricing_rules").update({ spread_percentage: spread, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setEditId(null); toast({ title: "Pricing updated" }); load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("pricing_rules").update({ is_active: !current }).eq("id", id);
    toast({ title: "Status toggled" }); load();
  };

  const addRule = async () => {
    if (!newRule.asset_name) return toast({ title: "Enter asset name", variant: "destructive" });
    const { error } = await AdminService.addPricingRule({
      asset_type: newRule.asset_type, asset_name: newRule.asset_name,
      base_price: parseFloat(newRule.base_price) || 0,
      spread_percentage: parseFloat(newRule.spread_percentage) || 0,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setAdding(false); setNewRule({ asset_type: "token", asset_name: "", base_price: "0", spread_percentage: "5" });
    toast({ title: "Rule added" }); load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-display font-bold text-foreground">Pricing Engine</h1>
        </div>
        <Button variant="hero" size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" /> New Rule</Button>
      </div>
      {adding && (
        <div className="glass-card p-4 mb-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select value={newRule.asset_type} onChange={e => setNewRule({ ...newRule, asset_type: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 text-sm">
            <option value="token">Token</option><option value="crypto">Crypto</option><option value="giftcard">Gift Card</option><option value="fx">FX</option>
          </select>
          <Input placeholder="Name" value={newRule.asset_name} onChange={e => setNewRule({ ...newRule, asset_name: e.target.value })} />
          <Input type="number" placeholder="Base" value={newRule.base_price} onChange={e => setNewRule({ ...newRule, base_price: e.target.value })} />
          <Input type="number" placeholder="Spread %" value={newRule.spread_percentage} onChange={e => setNewRule({ ...newRule, spread_percentage: e.target.value })} />
          <Button onClick={addRule}>Add</Button>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs text-muted-foreground font-medium">Asset</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Base Price</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Spread %</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Final Price</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Min / Max</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => {
                const finalPrice = rule.base_price + rule.base_price * (rule.spread_percentage / 100);
                return (
                  <tr key={rule.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-semibold text-foreground">{rule.asset_name}</td>
                    <td className="p-3 text-xs text-muted-foreground capitalize">{rule.asset_type}</td>
                    <td className="p-3 text-foreground">ꠄ {rule.base_price.toLocaleString()}</td>
                    <td className="p-3">
                      {editId === rule.id ? (
                        <div className="flex items-center gap-1">
                          <Input value={editSpread} onChange={(e) => setEditSpread(e.target.value)} className="w-16 h-7 text-xs bg-secondary/50" />
                          <button onClick={() => handleSaveSpread(rule.id)} className="p-1 hover:bg-primary/10 rounded"><Save className="w-3 h-3 text-primary" /></button>
                          <button onClick={() => setEditId(null)} className="p-1 hover:bg-secondary rounded"><X className="w-3 h-3 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        <span className="text-accent font-medium">{rule.spread_percentage}%</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-primary">ꠄ {finalPrice.toLocaleString()}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {rule.min_price?.toLocaleString()} / {rule.max_price?.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button onClick={() => toggleActive(rule.id, !!rule.is_active)} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${rule.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {rule.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => { setEditId(rule.id); setEditSpread(String(rule.spread_percentage)); }} className="p-1.5 rounded-lg hover:bg-secondary">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
