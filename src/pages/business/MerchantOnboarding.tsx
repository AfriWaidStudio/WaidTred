import { Store, Check } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { MerchantService } from "@/lib/services";
import { toast } from "sonner";

const MerchantOnboarding = () => {
  const [m, setM] = useState<any>(null);
  const [bn, setBn] = useState("");
  const [cat, setCat] = useState("");
  const [reg, setReg] = useState("");

  useEffect(() => {
    MerchantService.get().then(d => {
      setM(d);
      if (d) { setBn(d.business_name); setCat(d.category || ""); setReg(d.registration_number || ""); }
    });
  }, []);

  const submit = async () => {
    if (!bn || !cat) return toast.error("Business name & category required");
    try { await MerchantService.apply({ business_name: bn, category: cat, registration_number: reg }); toast.success("Application submitted"); MerchantService.get().then(setM); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Merchant Portal" subtitle="Become a verified seller" Icon={Store} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">KYB Status</p>
        <p className="text-2xl font-bold font-display capitalize">{m?.kyb_status || "Not started"}</p>
      </div>
      <div className="glass-card p-4 space-y-2">
        <input value={bn} onChange={e => setBn(e.target.value)} placeholder="Business name" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Category" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <input value={reg} onChange={e => setReg(e.target.value)} placeholder="Registration number" className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm" />
        <button onClick={submit} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />{m ? "Update Application" : "Submit Application"}
        </button>
      </div>
    </WealthPageShell>
  );
};
export default MerchantOnboarding;
