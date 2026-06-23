import { DollarSign, Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    desc: "For personal use",
    features: ["Send & receive ꠄ Sika", "Basic analytics", "SmaiPin redemption", "5 free transfers/month"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "ꠄ 15/mo",
    desc: "For power users",
    features: ["Unlimited transfers", "Priority support", "SokoPlace full access", "Advanced analytics", "Scheduled transfers", "Multi-currency wallet"],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "ꠄ 50/mo",
    desc: "For merchants & teams",
    features: ["Everything in Pro", "API access", "Bulk payments", "Dedicated agent", "Custom integrations", "White-label options"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const PricingSection = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">Choose the plan that fits your needs. No hidden fees.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {tiers.map(t => (
          <div key={t.name} className={`rounded-2xl p-6 border ${t.highlight ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-card"} relative`}>
            {t.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground">POPULAR</div>}
            <h3 className="font-display text-lg font-bold text-foreground">{t.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t.desc}</p>
            <p className="text-3xl font-bold text-foreground mb-6">{t.price}</p>
            <ul className="space-y-2 mb-6">
              {t.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}</li>
              ))}
            </ul>
            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold ${t.highlight ? "gradient-primary text-primary-foreground" : "border border-border text-foreground hover:bg-secondary/30"}`}>
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
