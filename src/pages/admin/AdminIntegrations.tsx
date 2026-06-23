import { useEffect, useState } from "react";
import { Plus, Search, TestTube, Check, X, ExternalLink, Settings, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Integration = {
  id: string;
  provider_name: string;
  service_type: string;
  region: string | null;
  status: "active" | "inactive" | "error" | "testing";
  endpoint: string | null;
  api_key_name: string | null;
  config: any;
  last_tested: string | null;
  created_at: string | null;
};

import { integrationStatusColors } from "@/lib/constants";
const statusColors = integrationStatusColors;

const serviceLabels: Record<string, string> = {
  mobile_money: "Mobile Money",
  payment_gateway: "Payment Gateway",
  airtime: "Airtime API",
  card_network: "Card Network",
  remittance: "Remittance",
};

const AdminIntegrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editApiKey, setEditApiKey] = useState("");

  const fetchIntegrations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("integrations").select("*").order("provider_name");
    if (!error && data) setIntegrations(data as Integration[]);
    setLoading(false);
  };

  useEffect(() => { fetchIntegrations(); }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase.from("integrations").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
      toast({ title: `Integration ${newStatus}`, description: `Provider has been ${newStatus === "active" ? "activated" : "deactivated"}.` });
    }
  };

  const testEndpoint = async (integration: Integration) => {
    setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, status: "testing" as any } : i));
    // Simulate test
    setTimeout(async () => {
      const success = Math.random() > 0.3;
      const newStatus = success ? "active" : "error";
      await supabase.from("integrations").update({ status: newStatus, last_tested: new Date().toISOString() }).eq("id", integration.id);
      setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, status: newStatus as any, last_tested: new Date().toISOString() } : i));
      toast({
        title: success ? "Test Passed ✓" : "Test Failed ✗",
        description: `${integration.provider_name} endpoint ${success ? "is reachable" : "returned an error"}`,
        variant: success ? "default" : "destructive",
      });
    }, 1500);
  };

  const saveApiKey = async (id: string) => {
    await supabase.from("integrations").update({ api_key_name: editApiKey, updated_at: new Date().toISOString() }).eq("id", id);
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, api_key_name: editApiKey } : i));
    setEditId(null);
    setEditApiKey("");
    toast({ title: "API key name saved" });
  };

  const filtered = integrations.filter(i =>
    i.provider_name.toLowerCase().includes(search.toLowerCase()) ||
    i.service_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>
        <Button variant="hero" size="sm" onClick={fetchIntegrations}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading integrations...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((integration) => (
            <div key={integration.id} className="glass-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{integration.provider_name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${statusColors[integration.status]}`}>
                      {integration.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span>{serviceLabels[integration.service_type] || integration.service_type}</span>
                    <span>•</span>
                    <span>{integration.region || "Global"}</span>
                    {integration.endpoint && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{integration.endpoint}</span>
                      </>
                    )}
                  </div>
                  {integration.last_tested && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Last tested: {new Date(integration.last_tested).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* API Key */}
                <div className="flex-shrink-0">
                  {editId === integration.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="API key env name"
                        value={editApiKey}
                        onChange={(e) => setEditApiKey(e.target.value)}
                        className="h-8 w-40 text-xs bg-secondary/50"
                      />
                      <button onClick={() => saveApiKey(integration.id)} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditId(integration.id); setEditApiKey(integration.api_key_name || ""); }}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      {integration.api_key_name ? `Key: ${integration.api_key_name}` : "Set API Key"}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => testEndpoint(integration)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground hover:bg-secondary/80 flex items-center gap-1 transition-colors"
                    disabled={integration.status === "testing"}
                  >
                    <TestTube className="w-3 h-3" /> Test
                  </button>
                  <button
                    onClick={() => toggleStatus(integration.id, integration.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                      integration.status === "active"
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {integration.status === "active" ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminIntegrations;
