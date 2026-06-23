import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

const rates = [
  { from: "SMK", to: "USD", rate: 0.085, change: 2.3 },
  { from: "SMK", to: "EUR", rate: 0.078, change: -0.5 },
  { from: "SMK", to: "GHS", rate: 1.25, change: 1.1 },
  { from: "SMK", to: "NGN", rate: 135.5, change: 0.8 },
];

const ExchangeRateWidget = () => (
  <div className="glass-card rounded-2xl p-4 border border-border">
    <div className="flex items-center gap-2 mb-3">
      <ArrowRightLeft className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">ꠄ Sika Exchange Rates</h3>
    </div>
    <div className="space-y-2">
      {rates.map(r => (
        <div key={r.to} className="flex items-center justify-between py-1.5">
          <span className="text-xs text-muted-foreground">ꠄ 1 → {r.to}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{r.rate}</span>
            <span className={`flex items-center gap-0.5 text-[10px] ${r.change >= 0 ? "text-primary" : "text-destructive"}`}>
              {r.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(r.change)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ExchangeRateWidget;
