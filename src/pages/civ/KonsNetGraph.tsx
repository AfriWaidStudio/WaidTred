import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { KonsnetService, EntityService } from "@/lib/services/civilization-service";
import { Network } from "lucide-react";

export default function KonsNetGraph() {
  const [edges, setEdges] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  useEffect(() => {
    KonsnetService.listEdges().then(({ data }) => setEdges(data));
    EntityService.listEntities().then(({ data }) => setEntities(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">KonsNet</h1>
        <p className="text-xs text-muted-foreground mb-6">Economic network — entity relationships, flows, ownership</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3 flex items-center gap-2"><Network className="w-4 h-4 text-primary" /> Entities ({entities.length})</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {entities.map(e => (
                <div key={e.id} className="flex justify-between text-xs py-1.5 border-b border-border/40">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-muted-foreground">{e.kind}{e.is_core ? " · core" : ""}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold mb-3">Edges ({edges.length})</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {edges.map((e: any) => (
                <div key={e.id} className="text-xs py-1.5 border-b border-border/40">
                  <span className="font-medium">{e.from?.name}</span>
                  <span className="text-muted-foreground mx-2">— {e.relationship} →</span>
                  <span className="font-medium">{e.to?.name}</span>
                </div>
              ))}
              {edges.length === 0 && <p className="text-xs text-muted-foreground">No edges yet. Will populate as entities transact.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
