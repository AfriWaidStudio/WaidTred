import { Home, Send, BarChart3, User, LayoutGrid, Wallet, ShoppingBag, Bell, MessageSquare, Settings, Globe, Sparkles, Heart, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const mainNav = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Send, label: "Send", path: "/dashboard/send" },
  { icon: LayoutGrid, label: "Hubs", path: "/dashboard/hubs" },
  { icon: Globe, label: "Civilization", path: "/dashboard/civ" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const desktopExtra = [
  { icon: Wallet, label: "Wallet", path: "/dashboard/fund" },
  { icon: Building2, label: "Treasuries", path: "/dashboard/civ/treasuries" },
  { icon: Sparkles, label: "TredBeings", path: "/dashboard/civ/tredbeings" },
  { icon: Heart, label: "Prosperity", path: "/dashboard/civ/prosperity" },
  { icon: ShoppingBag, label: "SokoPlace", path: "/dashboard/sokoplace" },
  { icon: MessageSquare, label: "Chat", path: "/dashboard/new/chat" },
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface DashboardLayoutProps { children: React.ReactNode; }

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname === p;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-40 border-r border-border bg-card/60 backdrop-blur-xl">
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center font-bold text-primary-foreground">W</div>
          <span className="font-display text-lg font-bold text-foreground">WaidTred</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {[...mainNav, ...desktopExtra].map(it => (
            <button key={it.path} onClick={() => navigate(it.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(it.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
              <it.icon className="w-4 h-4" />
              {it.label}
            </button>
          ))}
        </nav>
        <div className="p-3 text-[10px] text-muted-foreground">Powered by Konsmik Civilization</div>
      </aside>

      <div className="flex-1 lg:pl-60 flex flex-col">
        <main className="flex-1 pb-20 lg:pb-6 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border lg:hidden">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            {mainNav.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive(item.path) && <div className="w-1 h-1 rounded-full gradient-primary" />}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
