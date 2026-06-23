import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Shield, Bell, Globe, Lock, Fingerprint, ChevronRight, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/auth"); };
  const handleDelete = async () => {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
    toast.info("Deletion request submitted — our team will process within 24h");
    await signOut(); navigate("/auth");
  };
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [txNotif, setTxNotif] = useState(true);
  const [currency, setCurrency] = useState("SMK");
  const [language, setLanguage] = useState("en");

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`w-10 h-6 rounded-full transition-all ${on ? "bg-primary" : "bg-secondary"} relative`}>
      <div className={`w-4 h-4 rounded-full bg-foreground absolute top-1 transition-all ${on ? "right-1" : "left-1"}`} />
    </button>
  );

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold text-foreground mb-6">Settings</h1>

        {/* Security */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-2"><Shield className="w-3 h-3" /> Security</p>
          <div className="glass-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3"><Lock className="w-4 h-4 text-primary" /><span className="text-sm text-foreground">Two-Factor Auth</span></div>
              <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3"><Fingerprint className="w-4 h-4 text-primary" /><span className="text-sm text-foreground">Biometric Login</span></div>
              <Toggle on={biometric} onToggle={() => setBiometric(!biometric)} />
            </div>
            <button onClick={() => navigate("/reset-password")} className="flex items-center justify-between p-4 w-full">
              <div className="flex items-center gap-3"><Lock className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">Change Password</span></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-2"><Bell className="w-3 h-3" /> Notifications</p>
          <div className="glass-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-foreground">Push Notifications</span>
              <Toggle on={pushNotif} onToggle={() => setPushNotif(!pushNotif)} />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-foreground">Transaction Alerts</span>
              <Toggle on={txNotif} onToggle={() => setTxNotif(!txNotif)} />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Preferences</p>
          <div className="glass-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-foreground">Currency</span>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-xs text-foreground">
                <option value="SMK">ꠄ Smai Sika</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="GHS">₵ GHS</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-foreground">Language</span>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-xs text-foreground">
                <option value="en">English</option><option value="fr">Français</option><option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger */}
        <div className="space-y-2">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/30">
            <LogOut className="w-4 h-4 text-muted-foreground" /> Sign Out
          </button>
          <button onClick={handleDelete} className="w-full flex items-center gap-3 p-4 rounded-xl border border-destructive/30 text-sm text-destructive hover:bg-destructive/5">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
