import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      toast({ title: error ? "Error" : "Check your email", description: error?.message || "Password reset link sent", variant: error ? "destructive" : "default" });
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Please check your email to verify your account." });
        setMode("login");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">W</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">WaidTred</h1>
          <p className="text-sm text-muted-foreground mt-1">by Konsmik Civilization</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {mode === "login" ? "Sign in to your WaidTred account" : mode === "signup" ? "Join the global financial ecosystem" : "We'll send you a reset link"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : (
                <>{mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
