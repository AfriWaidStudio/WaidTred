import { Truck, MapPin, Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { ShipmentsService } from "@/lib/services";

const Logistics = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  useEffect(() => { ShipmentsService.list().then(setShipments); }, []);
  return (
    <WealthPageShell title="Delivery Tracking" subtitle="Live courier updates" Icon={Truck} back="/dashboard/sokoplace/orders">
      <div className="space-y-3">
        {shipments.map(s => (
          <div key={s.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{s.carrier || "Courier"}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === "delivered" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{s.status}</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Tracking: {s.tracking_code || "—"}</p>
            {s.eta && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />ETA {s.eta}</p>}
          </div>
        ))}
        {shipments.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No shipments</p>}
      </div>
    </WealthPageShell>
  );
};
export default Logistics;
