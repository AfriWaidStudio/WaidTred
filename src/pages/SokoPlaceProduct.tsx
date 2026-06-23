import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Minus, Plus, AlertCircle, CheckCircle, Upload } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { mockInventory, assetCategoryIcons } from "@/lib/mock-sokoplace";
import { useToast } from "@/hooks/use-toast";

const SokoPlaceProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  const item = mockInventory.find(i => i.id === id);

  if (!item) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Asset not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/sokoplace")}>Back to Market</Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalPrice = item.price_in_sika * quantity;
  const canBuy = item.status !== "out_of_stock" && quantity <= item.quantity;

  const handleBuy = async () => {
    setBuying(true);
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setBuying(false);
    toast({ title: "Purchase successful!", description: `You bought ${quantity}x ${item.asset_name} for ꠄ ${totalPrice.toLocaleString()}` });
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto px-4 pt-16 text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Purchase Complete!</h2>
          <p className="text-sm text-muted-foreground mb-1">{quantity}x {item.asset_name}</p>
          <p className="text-2xl font-bold text-primary mb-6">ꠄ {totalPrice.toLocaleString()}</p>
          {item.asset_type === "giftcard" && (
            <div className="glass-card p-4 mb-6 text-left">
              <p className="text-xs text-muted-foreground mb-1">Your Gift Card Code</p>
              <p className="text-lg font-mono font-bold text-primary tracking-wider">GIFT-XXXX-XXXX-XXXX</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard/sokoplace")}>Continue Shopping</Button>
            <Button variant="hero" className="flex-1" onClick={() => navigate("/dashboard/sokoplace/orders")}>View Orders</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Back */}
        <button onClick={() => navigate("/dashboard/sokoplace")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground py-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero */}
        <div className="glass-card p-6 mb-4 text-center">
          <div className="text-5xl mb-3">{assetCategoryIcons[item.asset_type]}</div>
          <h1 className="text-xl font-display font-bold text-foreground mb-1">{item.asset_name}</h1>
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          <p className="text-3xl font-bold text-primary">ꠄ {item.price_in_sika.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">per unit</p>
        </div>

        {/* Buy / Sell tabs */}
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4">
          <button onClick={() => setTab("buy")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "buy" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
            Buy
          </button>
          <button onClick={() => setTab("sell")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "sell" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
            Sell to WaidTred
          </button>
        </div>

        {tab === "buy" ? (
          <div className="space-y-4">
            {/* Quantity */}
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-2">Quantity</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="text-2xl font-bold font-display text-foreground w-16 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(item.quantity, quantity + 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">{item.quantity.toLocaleString()} available</p>
            </div>

            {/* Summary */}
            <div className="glass-card p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="text-foreground">ꠄ {item.price_in_sika.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quantity</span>
                <span className="text-foreground">{quantity}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-bold text-primary">ꠄ {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <Button variant="hero" className="w-full" size="lg" onClick={handleBuy} disabled={!canBuy || buying}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {buying ? "Processing..." : `Buy for ꠄ ${totalPrice.toLocaleString()}`}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-card p-4 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Sell {item.asset_name} to WaidTred</p>
              <p className="text-xs text-muted-foreground mb-4">Upload proof and submit for admin review. Once approved, your wallet will be credited.</p>
              <div className="border-2 border-dashed border-border rounded-xl p-6 mb-4 hover:border-primary/30 transition-colors cursor-pointer">
                <p className="text-xs text-muted-foreground">Tap to upload proof (screenshot/receipt)</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Submit Sell Request
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2">Sell requests require admin verification</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SokoPlaceProduct;
