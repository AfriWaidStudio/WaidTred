import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Futuristic background — cyan + purple orbs over grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-sm">
          <span className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
          <span className="text-muted-foreground">Powered by Konsmik Civilization</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Waid</span>
          <span className="gradient-text">Tred</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 font-light">
          Your Financial Operating System
        </p>
        <p className="text-base md:text-lg text-muted-foreground/70 max-w-2xl mx-auto mb-10">
          Send money, pay bills, recharge phones, and access financial services — anywhere in the world, instantly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => navigate("/dashboard")}>
            Get Started <ArrowRight className="ml-1" />
          </Button>
          <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
            Explore Features
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { icon: Globe, label: "Countries", value: "150+" },
            { icon: Zap, label: "Transactions", value: "Instant" },
            { icon: Shield, label: "Security", value: "Bank-grade" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold font-display text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
