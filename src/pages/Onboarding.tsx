import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Send, ShoppingBag, Shield, ArrowRight, Sparkles } from "lucide-react";

const slides = [
  { icon: Wallet, title: "Your Global Wallet", desc: "Manage Smai Sika (ꠄ) — your borderless digital currency powered by Konsmik Civilization", color: "text-primary" },
  { icon: Send, title: "Send Money Anywhere", desc: "Instant transfers to anyone, anywhere in the world. No borders, no limits.", color: "text-accent" },
  { icon: ShoppingBag, title: "SokoPlace Market", desc: "Buy & sell tokens, gift cards, and digital assets directly through WaidTred", color: "text-primary" },
  { icon: Shield, title: "Bank-Grade Security", desc: "WaidesChain verification and WaidesPruf cryptographic signatures protect every transaction", color: "text-accent" },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const isLast = step === slides.length - 1;
  const s = slides[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Skip */}
      <div className="w-full max-w-md flex justify-end mb-8">
        <button onClick={() => navigate("/auth")} className="text-xs text-muted-foreground hover:text-foreground">Skip</button>
      </div>

      {/* Illustration */}
      <div className="w-32 h-32 rounded-3xl bg-secondary/50 flex items-center justify-center mb-8">
        <s.icon className={`w-16 h-16 ${s.color}`} />
      </div>

      {/* Content */}
      <h1 className="font-display text-2xl font-bold text-foreground text-center mb-3">{s.title}</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">{s.desc}</p>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-secondary"}`} />
        ))}
      </div>

      {/* Action */}
      <button onClick={() => isLast ? navigate("/auth") : setStep(step + 1)}
        className="w-full max-w-xs py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
        {isLast ? <><Sparkles className="w-4 h-4" /> Get Started</> : <>Next <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
};

export default Onboarding;
