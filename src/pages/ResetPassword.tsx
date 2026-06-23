import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setIsRecovery(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated!" }); navigate("/dashboard"); }
    setLoading(false);
  };

  if (!isRecovery) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center text-muted-foreground">
        <p>Invalid or expired recovery link.</p>
        <button onClick={() => navigate("/auth")} className="text-primary mt-2 hover:underline text-sm">Back to login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-border">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={show ? "text" : "password"} placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full pl-10 pr-10 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={show ? "text" : "password"} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
