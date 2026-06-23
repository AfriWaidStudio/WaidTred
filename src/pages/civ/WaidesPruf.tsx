import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ProofService } from "@/lib/services/civilization-service";
import { ShieldCheck } from "lucide-react";

export default function WaidesPruf() {
  const [proofs, setProofs] = useState<any[]>([]);
  useEffect(() => { ProofService.listMine().then(({ data }) => setProofs(data)); }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-display font-bold mb-1">WaidesPruf</h1>
        <p className="text-xs text-muted-foreground mb-6">Immutable proofs of payments, ownership, contracts, treasury states</p>

        <div className="space-y-2">
          {proofs.map(p => (
            <div key={p.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize">{p.subject_type.replace(/_/g, " ")}</p>
                  <p className="text-[10px] text-muted-foreground font-mono break-all">{p.proof_hash}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {proofs.length === 0 && <p className="text-sm text-muted-foreground">No proofs yet. They'll be auto-issued as you transact.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
