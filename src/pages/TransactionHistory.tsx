import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Send } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { Database } from "@/integrations/supabase/types";
import { txTypeIcons } from "@/lib/constants";
import { TransactionService } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";

const filters = ["All", "Transfers", "Recharge", "Bills", "Received"] as const;
type FilterType = (typeof filters)[number];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const filterMap: Record<FilterType, string[]> = {
  All: [],
  Transfers: ["transfer"],
  Recharge: ["airtime", "data"],
  Bills: ["bill", "qr-pay"],
  Received: ["received"],
};

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    TransactionService.getUserTransactions(user.id, 200).then(({ data }) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [user]);

  const filtered = useMemo(
    () => activeFilter === "All" ? transactions : transactions.filter((tx) => filterMap[activeFilter].includes(tx.type)),
    [activeFilter, transactions],
  );

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const date = new Date(tx.created_at ?? 0).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    (acc[date] ??= []).push(tx);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center" aria-label="Back to dashboard">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">Transaction History</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeFilter === filter ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {filter}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-sm text-muted-foreground py-12">Loading transactions…</p>}
        {!loading && Object.entries(grouped).map(([date, txs]) => (
          <div key={date} className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 font-medium">{date}</p>
            <div className="space-y-2">
              {txs.map((tx) => {
                const Icon = txTypeIcons[tx.type] || Send;
                const isPositive = tx.type === "received";
                const amount = Number(tx.amount);
                return (
                  <div key={tx.id} className="glass-card p-3.5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-4 h-4 ${isPositive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{tx.description || tx.recipient || "Transaction"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${isPositive ? "text-primary" : "text-foreground"}`}>
                        {isPositive ? "+" : "-"} SMK {Math.abs(amount).toLocaleString()}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md inline-block ${tx.status === "completed" ? "bg-primary/10 text-primary" : tx.status === "pending" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionHistory;
