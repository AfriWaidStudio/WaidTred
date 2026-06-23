import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Shield, Globe, Bell, HelpCircle,
  LogOut, ChevronRight, Wallet, Settings, FileText
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const menuSections = (nav: (p: string) => void) => [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Info", desc: "Name, email, phone", to: "/dashboard/settings" },
      { icon: Shield, label: "Security & KYC", desc: "Verify identity", to: "/dashboard/kyc" },
      { icon: Wallet, label: "Wallets", desc: "Manage currencies", to: "/dashboard/fund" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Globe, label: "Country & Language", desc: "Localization", to: "/dashboard/settings" },
      { icon: Bell, label: "Notifications", desc: "Push, email, SMS", to: "/dashboard/notifications" },
      { icon: Settings, label: "App Settings", desc: "Theme, display", to: "/dashboard/settings" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", desc: "FAQs & support", to: "/dashboard/disputes/new" },
      { icon: FileText, label: "Terms & Privacy", desc: "Legal documents", to: "/" },
    ],
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut(); toast.success("Signed out"); navigate("/auth");
  };
  const initials = (user?.user_metadata?.full_name || user?.email || "WU").slice(0, 2).toUpperCase();
  const sections = menuSections(navigate);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Profile</h1>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mb-3">
            {initials}
          </div>
          <h2 className="text-lg font-display font-bold text-foreground">{user?.user_metadata?.full_name || "WaidTred User"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 font-medium px-1">{section.title}</p>
            <div className="glass-card overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className={`w-full flex items-center gap-3 p-3.5 hover:bg-secondary/50 transition-colors ${i < section.items.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSignOut} className="w-full glass-card p-3.5 flex items-center gap-3 mb-8 hover:border-destructive/30 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-sm font-medium text-destructive">Log Out</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
