import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { WalletService, ContactsService } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";

type Step = "recipient" | "amount" | "confirm" | "success";

const SendMoney = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("recipient");
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<{ id: string; full_name: string; email?: string; phone?: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [available, setAvailable] = useState(0);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const smk = parseFloat(amount) || 0;

  useEffect(() => {
    if (!user) return;
    WalletService.getMyWallet().then(({ data }) => setAvailable(Number(data?.available_balance || 0)));
    ContactsService.list().then(({ data }) => setContacts(data));
  }, [user]);

  const lookup = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const found = await WalletService.findUserByPhoneOrEmail(query.trim());
    setSearching(false);
    if (!found) return toast({ title: "User not found", description: "Check the phone or email and try again.", variant: "destructive" });
    if (found.id === user?.id) return toast({ title: "Cannot send to yourself", variant: "destructive" });
    setRecipient(found);
    setStep("amount");
  };

  const send = async () => {
    if (!recipient) return;
    if (smk <= 0) return toast({ title: "Enter an amount", variant: "destructive" });
    if (smk > available) return toast({ title: "Insufficient balance", variant: "destructive" });
    setSubmitting(true);
    const { error } = await WalletService.sendMoney(recipient.id, smk, note || undefined);
    setSubmitting(false);
    if (error) return toast({ title: "Transfer failed", description: error.message, variant: "destructive" });
    setStep("success");
    WalletService.getMyWallet().then(({ data }) => setAvailable(Number(data?.available_balance || 0)));
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => step === "recipient" ? navigate("/dashboard") : setStep(step === "amount" ? "recipient" : step === "confirm" ? "amount" : "recipient")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-display font-bold">Send Money</h1>
        </div>

        {step === "recipient" && (
          <div className="animate-slide-up space-y-4">
            <p className="text-sm text-muted-foreground">Recipient phone or email</p>
            <div className="flex gap-2">
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="+233... or name@email" className="bg-secondary/50 h-12" />
              <Button onClick={lookup} disabled={searching} variant="hero">{searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find"}</Button>
            </div>
            {contacts.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground mt-4">Your contacts</p>
                <div className="space-y-2">
                  {contacts.map(c => (
                    <button key={c.id} onClick={() => { setQuery(c.phone || c.email || ""); }} className="glass-card w-full p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.phone || c.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === "amount" && recipient && (
          <div className="animate-slide-up space-y-4">
            <div className="glass-card p-3">
              <p className="text-xs text-muted-foreground">Sending to</p>
              <p className="text-sm font-medium">{recipient.full_name || recipient.email}</p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">ꠄ</span>
              <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary/50 h-14 text-2xl font-bold pl-10" />
            </div>
            <p className="text-[11px] text-muted-foreground">Available: ꠄ {available.toLocaleString()}</p>
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="bg-secondary/50 h-12" />
            <Button variant="hero" className="w-full py-6" disabled={smk <= 0} onClick={() => setStep("confirm")}>Continue</Button>
          </div>
        )}

        {step === "confirm" && recipient && (
          <div className="animate-slide-up text-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">You are sending</p>
              <p className="text-4xl font-bold mt-2">ꠄ {smk.toLocaleString("en", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground mt-1">to {recipient.full_name}</p>
            </div>
            <Button variant="hero" className="w-full py-6" onClick={send} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-1" />} Confirm Transfer
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="animate-slide-up text-center py-8">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Transfer Successful!</h2>
            <p className="text-muted-foreground mb-1">ꠄ {smk.toLocaleString("en", { minimumFractionDigits: 2 })} sent to</p>
            <p className="font-semibold mb-8">{recipient?.full_name}</p>
            <div className="space-y-3">
              <Button variant="hero" className="w-full py-6" onClick={() => navigate("/dashboard")}>Back to Home</Button>
              <Button variant="hero-outline" className="w-full py-6" onClick={() => { setStep("recipient"); setQuery(""); setRecipient(null); setAmount(""); setNote(""); }}>Send Again</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SendMoney;
