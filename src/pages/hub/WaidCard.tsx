import { CreditCard, Plus, Eye, EyeOff, Lock, Settings, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { VirtualCardsService } from "@/lib/services";
import { toast } from "sonner";

const WaidCard = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const load = () => VirtualCardsService.list().then(setCards);
  useEffect(() => { load(); }, []);

  const freeze = async (card: any) => {
    const frozen = card.status !== "frozen";
    const { error } = await VirtualCardsService.toggleFreeze(card.id, frozen);
    if (error) return toast.error(error.message);
    toast.success(frozen ? "Card frozen" : "Card unfrozen"); load();
  };
  const activeCard = cards[0];

  return (
    <MiniAppContainer title="WaidCard" subtitle="Virtual & Physical Cards">
      <div className="space-y-4 mb-6">
        {cards.map((card) => (
          <div key={card.id} className={`relative rounded-2xl p-5 overflow-hidden ${card.status === "frozen" ? "bg-gradient-to-br from-muted to-secondary opacity-70" : "bg-gradient-to-br from-primary to-accent"}`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-medium text-primary-foreground/80 capitalize">{card.card_type || "Virtual"} Card {card.status === "frozen" ? "· Frozen" : ""}</span>
                <Globe className="w-5 h-5 text-primary-foreground/60" />
              </div>
              <p className="text-lg font-mono text-primary-foreground mb-1 tracking-widest">
                {showDetails ? `•••• •••• •••• ${card.card_number_last4 || "0000"}` : `•••• •••• •••• ••••`}
              </p>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-[10px] text-primary-foreground/60">Spend Limit</p>
                  <p className="text-sm font-bold text-primary-foreground">
                    {showDetails ? `ꠄ ${Number(card.spend_limit || 0).toLocaleString()}` : "••••"}
                  </p>
                </div>
                <button onClick={() => setShowDetails(!showDetails)} className="p-2 rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="glass-card p-6 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No cards yet</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => navigate("/dashboard/pay/virtual-cards")} className="glass-card p-3 flex flex-col items-center gap-2"><Plus className="w-5 h-5 text-primary" /><span className="text-[10px] font-medium">New Card</span></button>
        <button onClick={() => activeCard ? freeze(activeCard) : toast.error("Create a card first")} className="glass-card p-3 flex flex-col items-center gap-2"><Lock className="w-5 h-5 text-primary" /><span className="text-[10px] font-medium">{activeCard?.status === "frozen" ? "Unfreeze" : "Freeze"}</span></button>
        <button onClick={() => navigate("/dashboard/settings")} className="glass-card p-3 flex flex-col items-center gap-2"><Settings className="w-5 h-5 text-primary" /><span className="text-[10px] font-medium">Settings</span></button>
      </div>
    </MiniAppContainer>
  );
};

export default WaidCard;
