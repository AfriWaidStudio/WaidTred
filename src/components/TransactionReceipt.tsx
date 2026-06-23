import { Download, X, CheckCircle } from "lucide-react";

interface TransactionReceiptProps {
  tx: {
    id: string;
    title: string;
    amount: number;
    type: string;
    status: string;
    recipient?: string;
    date: string;
  };
  onClose: () => void;
}

const TransactionReceipt = ({ tx, onClose }: TransactionReceiptProps) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-sm glass-card rounded-2xl border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg font-bold text-foreground">Receipt</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">ꠄ {tx.amount.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          ["Transaction ID", tx.id],
          ["Type", tx.type],
          ["Description", tx.title],
          ...(tx.recipient ? [["Recipient", tx.recipient]] : []),
          ["Date", tx.date],
          ["Status", tx.status],
        ].map(([label, value]) => (
          <div key={label as string} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground flex items-center justify-center gap-2 hover:bg-secondary/30">
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Done</button>
      </div>

      <p className="text-center text-[9px] text-muted-foreground mt-4">WaidTred • Powered by Konsmik Civilization</p>
    </div>
  </div>
);

export default TransactionReceipt;
