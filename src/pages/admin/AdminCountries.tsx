import { useState } from "react";
import { Globe, Plus, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const mockCountries = [
  { code: "GH", flag: "🇬🇭", name: "Ghana", currency: "GHS", methods: ["Mobile Money", "Bank Transfer"], agents: 3, status: "active" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", currency: "NGN", methods: ["Bank Transfer", "USSD"], agents: 5, status: "active" },
  { code: "KE", flag: "🇰🇪", name: "Kenya", currency: "KES", methods: ["M-Pesa", "Bank Transfer"], agents: 2, status: "active" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", currency: "ZAR", methods: ["Bank Transfer", "EFT"], agents: 1, status: "active" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", currency: "GBP", methods: ["Bank Transfer", "Card"], agents: 2, status: "active" },
  { code: "US", flag: "🇺🇸", name: "United States", currency: "USD", methods: ["ACH", "Wire"], agents: 1, status: "pending" },
  { code: "DE", flag: "🇩🇪", name: "Germany", currency: "EUR", methods: ["SEPA"], agents: 0, status: "pending" },
  { code: "IN", flag: "🇮🇳", name: "India", currency: "INR", methods: ["UPI", "IMPS"], agents: 2, status: "active" },
];

const AdminCountries = () => {
  const [countries] = useState(mockCountries);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">Country & Payment Settings</h3>
          <p className="text-xs text-muted-foreground">Manage supported countries, payment methods, and regional agents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Country
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Countries", value: countries.filter(c => c.status === "active").length },
          { label: "Pending Launch", value: countries.filter(c => c.status === "pending").length },
          { label: "Total Agents", value: countries.reduce((s, c) => s + c.agents, 0) },
          { label: "Payment Methods", value: [...new Set(countries.flatMap(c => c.methods))].length },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Countries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map(country => (
          <div key={country.code} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{country.name}</p>
                  <p className="text-[11px] text-muted-foreground">{country.currency}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                country.status === "active" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
              }`}>{country.status}</span>
            </div>

            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground mb-1">Payment Methods</p>
              <div className="flex flex-wrap gap-1">
                {country.methods.map(m => (
                  <span key={m} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-foreground">{m}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">{country.agents} agents assigned</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
                  {country.status === "active" ? <ToggleRight className="w-3.5 h-3.5 text-primary" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCountries;
