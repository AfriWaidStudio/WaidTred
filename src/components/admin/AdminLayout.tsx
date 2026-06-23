import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Wallet, ArrowLeftRight, Globe,
  Smartphone, Store, Brain, Shield, Bell, Plug, FileText,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Ticket,
  ShoppingBag, Package, DollarSign, ShieldAlert, Banknote, FileCheck, Network
} from "lucide-react";

const sections = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Wallets", icon: Wallet, path: "/admin/wallets" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/admin/transactions" },
  { label: "Funding (KVI)", icon: Smartphone, path: "/admin/funding" },
  { label: "Withdrawals", icon: Banknote, path: "/admin/withdrawals" },
  { label: "Global Ops", icon: Globe, path: "/admin/global" },
  { label: "Countries", icon: Globe, path: "/admin/countries" },
  { label: "Recharge", icon: Smartphone, path: "/admin/recharge" },
  { label: "Merchants", icon: Store, path: "/admin/merchants" },
  { label: "Agents", icon: Users, path: "/admin/agents" },
  { label: "Chat System", icon: Brain, path: "/admin/chat" },
  { label: "Integrations", icon: Plug, path: "/admin/integrations" },
  { label: "Providers", icon: Network, path: "/admin/providers" },
  { label: "KI Monitor", icon: Brain, path: "/admin/ki" },
  { label: "Security", icon: Shield, path: "/admin/security" },
  { label: "SmaiPin", icon: Ticket, path: "/admin/smaipin" },
  { label: "SokoPlace", icon: ShoppingBag, path: "/admin/sokoplace" },
  { label: "Orders", icon: Package, path: "/admin/orders" },
  { label: "Pricing", icon: DollarSign, path: "/admin/pricing" },
  { label: "Risk Scoring", icon: ShieldAlert, path: "/admin/risk" },
  { label: "Treasury", icon: Banknote, path: "/admin/treasury" },
  { label: "Compliance", icon: FileCheck, path: "/admin/compliance" },
  { label: "Alerts", icon: Bell, path: "/admin/alerts" },
  { label: "Audit Log", icon: FileText, path: "/admin/audit" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 bg-card border-r border-border flex flex-col transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border h-16">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">W</div>
          {!collapsed && <span className="font-display font-bold text-foreground text-sm">WaidTred Admin</span>}
          <button onClick={() => setMobileOpen(false)} className="ml-auto md:hidden text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {sections.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                } ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="p-3 border-t border-border hidden md:flex">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground text-xs">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
          </button>
        </div>

        {/* Back to app */}
        <div className="p-3 border-t border-border">
          <button onClick={() => navigate("/dashboard")} className={`w-full flex items-center gap-2 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors ${collapsed ? "justify-center" : "px-2"}`}>
            <LogOut className="w-4 h-4" />
            {!collapsed && "Back to App"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-56"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border h-14 flex items-center px-4 gap-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-display font-semibold text-foreground text-sm">
            {sections.find(s => s.path === location.pathname)?.label || "Admin"}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
            <span className="text-[11px] text-muted-foreground">System Active</span>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
