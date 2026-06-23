import { useEffect, useState } from "react";
import { Building2, Globe, Loader2, Plus, Smartphone, ToggleLeft, ToggleRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Country = Database["public"]["Tables"]["countries"]["Row"];

const emptyCountry = {
  code: "",
  name: "",
  currency_code: "",
  phone_prefix: "",
  mobile_money_supported: false,
  banking_supported: true,
};

const AdminCountries = () => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyCountry);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("countries").select("*").order("name");
    setLoading(false);
    if (error) return toast({ title: "Could not load countries", description: error.message, variant: "destructive" });
    setCountries(data ?? []);
  };
  useEffect(() => { void load(); }, []);

  const addCountry = async () => {
    if (!/^[A-Z]{2}$/.test(form.code) || !/^[A-Z]{3}$/.test(form.currency_code) || !form.name.trim()) {
      return toast({ title: "Enter a valid ISO code, name, and currency", variant: "destructive" });
    }
    setSaving(true);
    const { error } = await supabase.from("countries").insert({
      ...form,
      is_enabled: false,
      status: "inactive",
      fx_to_smk: 1,
    });
    setSaving(false);
    if (error) return toast({ title: "Country was not added", description: error.message, variant: "destructive" });
    setAdding(false);
    setForm(emptyCountry);
    await load();
  };

  const toggle = async (country: Country) => {
    const active = country.status !== "active";
    const { error } = await supabase.from("countries").update({ status: active ? "active" : "inactive", is_enabled: active }).eq("id", country.id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    await load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">Country Registry</h3>
          <p className="text-xs text-muted-foreground">Configure markets without deploying application code.</p>
        </div>
        <Button onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-2" />Add Country</Button>
      </div>

      {adding && (
        <div className="glass-card p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input value={form.code} maxLength={2} placeholder="ISO (NG)" onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input value={form.name} placeholder="Country name" onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input value={form.currency_code} maxLength={3} placeholder="Currency (NGN)" onChange={e => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} />
          <Input value={form.phone_prefix} placeholder="Phone prefix (+234)" onChange={e => setForm({ ...form, phone_prefix: e.target.value })} />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.mobile_money_supported} onChange={e => setForm({ ...form, mobile_money_supported: e.target.checked })} />Mobile money</label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.banking_supported} onChange={e => setForm({ ...form, banking_supported: e.target.checked })} />Banking</label>
          <Button onClick={addCountry} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save inactive country</Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4"><p className="text-2xl font-bold">{countries.filter(c => c.status === "active").length}</p><p className="text-[11px] text-muted-foreground">Active countries</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold">{countries.filter(c => c.mobile_money_supported).length}</p><p className="text-[11px] text-muted-foreground">Mobile-money markets</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold">{countries.filter(c => c.banking_supported).length}</p><p className="text-[11px] text-muted-foreground">Banking markets</p></div>
      </div>

      {loading && <Loader2 className="w-6 h-6 animate-spin mx-auto my-12" />}
      {!loading && <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map(country => (
          <div key={country.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2"><Globe className="w-5 h-5 text-primary" /><div><p className="font-semibold text-sm">{country.name}</p><p className="text-[11px] text-muted-foreground">{country.code} · {country.currency_code} · {country.phone_prefix || "No prefix"}</p></div></div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${country.status === "active" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{country.status}</span>
            </div>
            <div className="flex gap-2 mb-3">
              {country.mobile_money_supported && <span className="text-[10px] bg-secondary px-2 py-1 rounded flex items-center gap-1"><Smartphone className="w-3 h-3" />Mobile money</span>}
              {country.banking_supported && <span className="text-[10px] bg-secondary px-2 py-1 rounded flex items-center gap-1"><Building2 className="w-3 h-3" />Banking</span>}
            </div>
            <button onClick={() => toggle(country)} className="w-full flex justify-end pt-2 border-t border-border" aria-label={`${country.status === "active" ? "Disable" : "Enable"} ${country.name}`}>
              {country.status === "active" ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>
        ))}
      </div>}
    </AdminLayout>
  );
};

export default AdminCountries;
