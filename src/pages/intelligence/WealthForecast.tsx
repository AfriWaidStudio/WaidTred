import { LineChart } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { WalletService } from "@/lib/services";

const WealthForecast = () => {
  const [total, setTotal] = useState(0);
  useEffect(() => { WalletService.getMyWallet().then(({ data }) => setTotal(Number(data?.total_balance || 0))); }, []);

  const projections = [
    { year: "1 yr", value: total * 1.08 },
    { year: "5 yr", value: total * Math.pow(1.08, 5) },
    { year: "10 yr", value: total * Math.pow(1.08, 10) },
    { year: "20 yr", value: total * Math.pow(1.08, 20) },
  ];

  return (
    <WealthPageShell title="Wealth Forecast" subtitle="Your future net worth" Icon={LineChart} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Today's net worth</p>
        <p className="text-3xl font-bold font-display">ꠄ {total.toLocaleString()}</p>
        <p className="text-[11px] text-primary mt-1">Compounded at 8% APY</p>
      </div>
      <div className="space-y-3">
        {projections.map(p => (
          <div key={p.year} className="glass-card p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">{p.year}</span>
            <span className="text-lg font-bold text-primary">ꠄ {Math.round(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-4">Forecasts assume 8% avg yield. Not financial advice.</p>
    </WealthPageShell>
  );
};
export default WealthForecast;
