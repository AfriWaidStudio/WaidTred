import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";

const WalletPreview = () => {
  const [visible, setVisible] = useState(true);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Your Global <span className="gradient-text">Wallet</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One wallet. Every currency. Total control.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Wallet Card */}
          <div className="glass-card p-6 relative overflow-hidden animate-float">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    W
                  </div>
                  <span className="text-sm font-medium text-foreground">Smai Sika</span>
                </div>
                <button
                  onClick={() => setVisible(!visible)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="mb-1">
                <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                <p className="text-3xl font-bold font-display text-foreground">
                  {visible ? "ꠄ 24,580.00" : "ꠄ ••••••"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {visible ? "≈ $2,458.00 USD" : "≈ ••••••"}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Available", value: "22,100" },
                  { label: "Locked", value: "2,480" },
                  { label: "Growth", value: "+12.4%", highlight: true },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.highlight ? "text-primary" : "text-foreground"}`}>
                      {item.highlight && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {visible ? item.value : "••••"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletPreview;
