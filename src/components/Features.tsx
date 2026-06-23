import { Globe, Brain, Shield, Coins, ArrowLeftRight, Layers } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Borderless Transfers",
    desc: "Send money across 150+ countries with automatic currency conversion. No barriers, no limits.",
  },
  {
    icon: Coins,
    title: "Smai Sika Currency",
    desc: "A unified digital value backed by Webonyix — real value, not just numbers.",
  },
  {
    icon: ArrowLeftRight,
    title: "Multi-Currency Wallets",
    desc: "Hold, convert, and manage multiple currencies in a single wallet.",
  },
  {
    icon: Brain,
    title: "Waides KI Intelligence",
    desc: "AI-powered spending analysis, smart budgets, and financial growth suggestions.",
  },
  {
    icon: Shield,
    title: "SmaiPin Security",
    desc: "Identity-based authorization with fraud detection and moral transaction governance.",
  },
  {
    icon: Layers,
    title: "Global Services",
    desc: "Airtime, data, bills, subscriptions — access services from any country, anywhere.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_60%)]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Built for the <span className="gradient-text">World</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            25+ core features designed for a truly global financial experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-6 hover:border-primary/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
