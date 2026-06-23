import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronRight, Target, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock analytics data
const weeklySpending = [
  { day: "Mon", amount: 120, received: 0 },
  { day: "Tue", amount: 85, received: 200 },
  { day: "Wed", amount: 310, received: 0 },
  { day: "Thu", amount: 50, received: 1200 },
  { day: "Fri", amount: 420, received: 0 },
  { day: "Sat", amount: 180, received: 3500 },
  { day: "Sun", amount: 95, received: 0 },
];

const monthlyTrend = [
  { month: "Oct", spent: 3200, income: 5800 },
  { month: "Nov", spent: 4100, income: 6200 },
  { month: "Dec", spent: 5500, income: 5400 },
  { month: "Jan", spent: 3800, income: 7100 },
  { month: "Feb", spent: 2900, income: 6800 },
  { month: "Mar", spent: 3400, income: 7500 },
  { month: "Apr", spent: 1260, income: 4900 },
];

const categoryBreakdown = [
  { name: "Transfers", value: 3800, color: "hsl(152, 100%, 41%)" },
  { name: "Recharge", value: 680, color: "hsl(42, 100%, 55%)" },
  { name: "Bills", value: 1250, color: "hsl(200, 80%, 55%)" },
  { name: "Merchants", value: 920, color: "hsl(280, 70%, 55%)" },
  { name: "Other", value: 350, color: "hsl(0, 0%, 45%)" },
];

const budgets = [
  { category: "Transfers", budget: 5000, spent: 3800, icon: "💸" },
  { category: "Recharge", budget: 1000, spent: 680, icon: "📱" },
  { category: "Bills", budget: 1500, spent: 1250, icon: "🧾" },
  { category: "Shopping", budget: 2000, spent: 920, icon: "🛍️" },
  { category: "Savings Goal", budget: 10000, spent: 6200, icon: "🎯" },
];

const kiInsights = [
  {
    type: "saving" as const,
    icon: TrendingDown,
    title: "Spending down 15% this week",
    description: "Great progress! You're spending less compared to last week. If you maintain this pace, you'll save an extra ꠄ 800 this month.",
    action: "View breakdown",
  },
  {
    type: "alert" as const,
    icon: AlertTriangle,
    title: "Bills budget at 83%",
    description: "Your bills spending is approaching the monthly limit. Consider reviewing upcoming subscriptions to stay within budget.",
    action: "Review bills",
  },
  {
    type: "opportunity" as const,
    icon: Lightbulb,
    title: "Switch to monthly data plan",
    description: "You've purchased 4 weekly data bundles this month (ꠄ 200). A monthly plan would cost only ꠄ 100 — saving you ꠄ 100.",
    action: "Compare plans",
  },
  {
    type: "growth" as const,
    icon: TrendingUp,
    title: "Savings goal 62% complete",
    description: "You're on track to reach your ꠄ 10,000 savings goal by June. Increasing weekly savings by ꠄ 50 would get you there by May.",
    action: "Adjust goal",
  },
];

type Period = "week" | "month" | "year";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-2.5 border border-glass-border text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ꠄ {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("week");

  const totalSpent = categoryBreakdown.reduce((s, c) => s + c.value, 0);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground">Analytics</h1>
            <p className="text-[11px] text-muted-foreground">Powered by Waides KI</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                period === p ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Total Spent</p>
            <p className="text-xl font-bold font-display text-foreground">ꠄ {totalSpent.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-medium">15% less than last {period}</span>
            </div>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Total Received</p>
            <p className="text-xl font-bold font-display text-foreground">ꠄ 4,900</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-medium">+8% from last {period}</span>
            </div>
          </div>
        </div>

        {/* Spending Chart */}
        <div className="glass-card p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {period === "week" ? "Daily Spending" : "Monthly Trend"}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">Spending vs income over time</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {period === "week" ? (
                <BarChart data={weeklySpending} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Spent" fill="hsl(152, 100%, 41%)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="received" name="Received" fill="hsl(42, 100%, 55%)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 100%, 41%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152, 100%, 41%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(42, 100%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(42, 100%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="spent" name="Spent" stroke="hsl(152, 100%, 41%)" fill="url(#gradSpent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="hsl(42, 100%, 55%)" fill="url(#gradIncome)" strokeWidth={2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {categoryBreakdown.map((cat) => {
                const pct = Math.round((cat.value / totalSpent) * 100);
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-foreground flex-1">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">ꠄ {cat.value.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Budget Tracking */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" /> Budget Tracking
            </h3>
          </div>
          <div className="space-y-3">
            {budgets.map((b) => {
              const pct = Math.round((b.spent / b.budget) * 100);
              const isOver = pct > 90;
              const isGoal = b.category === "Savings Goal";
              return (
                <div key={b.category} className="glass-card p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{b.icon}</span>
                      <span className="text-sm font-medium text-foreground">{b.category}</span>
                    </div>
                    <span className={`text-xs font-semibold ${isGoal ? "text-primary" : isOver ? "text-accent" : "text-muted-foreground"}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary/80 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGoal ? "gradient-primary" : isOver ? "gradient-accent" : "gradient-primary"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>ꠄ {b.spent.toLocaleString()} {isGoal ? "saved" : "spent"}</span>
                    <span>ꠄ {b.budget.toLocaleString()} {isGoal ? "goal" : "budget"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KI Insights */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Waides KI Insights</h3>
          </div>
          <div className="space-y-3">
            {kiInsights.map((insight, i) => {
              const colorMap = {
                saving: "text-primary bg-primary/10 border-primary/20",
                alert: "text-accent bg-accent/10 border-accent/20",
                opportunity: "text-accent bg-accent/10 border-accent/20",
                growth: "text-primary bg-primary/10 border-primary/20",
              };
              const colors = colorMap[insight.type];
              return (
                <div key={i} className={`glass-card p-4 border ${colors.split(" ")[2]}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.split(" ").slice(1, 2).join(" ")}`}>
                      <insight.icon className={`w-4 h-4 ${colors.split(" ")[0]}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">{insight.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{insight.description}</p>
                      <button className="flex items-center gap-1 text-xs text-primary font-medium">
                        {insight.action} <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
