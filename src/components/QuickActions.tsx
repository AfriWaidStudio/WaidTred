import { Send, Smartphone, CreditCard, QrCode, ArrowDownLeft, Receipt } from "lucide-react";

const actions = [
  { icon: Send, label: "Send Money", desc: "Transfer globally", color: "text-primary" },
  { icon: ArrowDownLeft, label: "Receive", desc: "Get paid instantly", color: "text-primary" },
  { icon: Smartphone, label: "Recharge", desc: "Airtime & data", color: "text-accent" },
  { icon: CreditCard, label: "Pay Bills", desc: "Utilities & more", color: "text-accent" },
  { icon: QrCode, label: "Scan & Pay", desc: "QR payments", color: "text-primary" },
  { icon: Receipt, label: "Invoices", desc: "Payment links", color: "text-accent" },
];

const QuickActions = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Everything in <span className="gradient-text-accent">One Tap</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Send, receive, recharge, and pay — all from a single app.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {actions.map((action) => (
            <button
              key={action.label}
              className="glass-card p-6 text-left hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              <action.icon className={`w-8 h-8 ${action.color} mb-4 group-hover:scale-110 transition-transform`} />
              <p className="font-semibold text-foreground mb-1">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
