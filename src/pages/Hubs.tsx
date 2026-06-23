import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, ArrowDownLeft, CreditCard, QrCode, Wallet, Shield, CreditCard as CardIcon,
  TrendingUp, BarChart3, Brain, ShoppingBag, GraduationCap, Newspaper,
  Gift, Target, Zap, Star, ChevronRight, Search, Pin, PinOff, Sparkles,
  ArrowRight, Clock, Flame, Lock, Banknote, Heart, Briefcase, Users, Receipt,
  Repeat, Globe, Building2, Store, Truck, Activity, Trophy, User, FileText,
  Smartphone, Key, Share2, MessageSquare, Calendar, Mic
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Quick Actions
const quickActions = [
  { icon: Send, label: "Send", path: "/dashboard/send", color: "text-primary" },
  { icon: ArrowDownLeft, label: "Receive", path: "/dashboard/fund", color: "text-primary" },
  { icon: CreditCard, label: "Pay", path: "/dashboard/bills", color: "text-accent" },
  { icon: QrCode, label: "Scan", path: "/dashboard/qrpay", color: "text-primary" },
];

// Core Apps
const coreApps = [
  { id: "waidpay", icon: Wallet, label: "WaidPay", desc: "Payments & transfers", path: "/dashboard/hub/waidpay", color: "from-primary/20 to-primary/5", usage: 95 },
  { id: "waidvault", icon: Shield, label: "WaidVault", desc: "Savings & security", path: "/dashboard/hub/waidvault", color: "from-accent/20 to-accent/5", usage: 72 },
  { id: "waidcard", icon: CardIcon, label: "WaidCard", desc: "Virtual & physical cards", path: "/dashboard/hub/waidcard", color: "from-primary/20 to-accent/5", usage: 58 },
];

// Explore Categories
const exploreCategories = [
  {
    name: "Wealth",
    items: [
      { id: "waidlock", icon: Lock, label: "WaidLock", desc: "Drip wealth release", path: "/dashboard/wealth/waidlock" },
      { id: "goals", icon: Target, label: "WaidGoals", desc: "Savings targets", path: "/dashboard/wealth/goals" },
      { id: "vest", icon: TrendingUp, label: "WaidVest", desc: "Investment baskets", path: "/dashboard/wealth/vest" },
      { id: "yield", icon: Zap, label: "SmaiYield", desc: "Stake & earn", path: "/dashboard/wealth/yield" },
      { id: "loans", icon: Banknote, label: "WaidLoans", desc: "Micro-loans", path: "/dashboard/wealth/loans" },
      { id: "insure", icon: Heart, label: "WaidInsure", desc: "Insurance plans", path: "/dashboard/wealth/insure" },
      { id: "pension", icon: Briefcase, label: "WaidPension", desc: "Retirement pot", path: "/dashboard/wealth/pension" },
      { id: "groupsave", icon: Users, label: "GroupSave", desc: "Susu circles", path: "/dashboard/wealth/groupsave" },
      { id: "budget", icon: Wallet, label: "WaidBudget", desc: "Envelopes", path: "/dashboard/wealth/budget" },
      { id: "tax", icon: Receipt, label: "TaxVault", desc: "Auto tax aside", path: "/dashboard/wealth/tax" },
    ],
  },
  {
    name: "Payments",
    items: [
      { id: "split", icon: Users, label: "Split Bills", desc: "Share costs", path: "/dashboard/pay/split" },
      { id: "request", icon: ArrowDownLeft, label: "Request", desc: "Ask to be paid", path: "/dashboard/pay/request" },
      { id: "subs", icon: Repeat, label: "Subscriptions", desc: "Recurring", path: "/dashboard/pay/subscriptions" },
      { id: "remit", icon: Globe, label: "Remittance", desc: "Cross-border", path: "/dashboard/pay/remittance" },
      { id: "escrow", icon: Lock, label: "Escrow", desc: "Held funds", path: "/dashboard/pay/escrow" },
      { id: "payroll", icon: Building2, label: "Payroll", desc: "Bulk salaries", path: "/dashboard/pay/payroll" },
      { id: "tip", icon: Heart, label: "Tip Jar", desc: "Donations", path: "/dashboard/pay/tipjar" },
      { id: "vcards", icon: CreditCard, label: "Virtual Cards", desc: "Single-use", path: "/dashboard/pay/virtual-cards" },
    ],
  },
  {
    name: "Marketplace",
    items: [
      { id: "waidsoko", icon: ShoppingBag, label: "WaidSoko", desc: "Digital marketplace", path: "/dashboard/sokoplace" },
      { id: "stores", icon: Store, label: "Storefronts", desc: "Vendors", path: "/dashboard/sokoplace/storefronts" },
      { id: "wishlist", icon: Heart, label: "Wishlist", desc: "Price drops", path: "/dashboard/sokoplace/wishlist" },
      { id: "flash", icon: Flame, label: "Flash Deals", desc: "Auctions", path: "/dashboard/sokoplace/flash" },
      { id: "logistics", icon: Truck, label: "Tracking", desc: "Live delivery", path: "/dashboard/sokoplace/logistics" },
    ],
  },
  {
    name: "Social",
    items: [
      { id: "circles", icon: Users, label: "Circles", desc: "Shared wallets", path: "/dashboard/social/circles" },
      { id: "feed", icon: Activity, label: "Feed", desc: "Activity", path: "/dashboard/social/feed" },
      { id: "leaderboard", icon: Trophy, label: "Leaderboards", desc: "Top users", path: "/dashboard/social/leaderboards" },
      { id: "publicprofile", icon: User, label: "Profile", desc: "Public link", path: "/dashboard/social/profile" },
    ],
  },
  {
    name: "Intelligence",
    items: [
      { id: "betramaid", icon: Brain, label: "Betramaid KI", desc: "AI advisor", path: "/dashboard/hub/betramaid" },
      { id: "insights", icon: Brain, label: "Insights AI", desc: "Find leaks", path: "/dashboard/intel/insights" },
      { id: "forecast", icon: TrendingUp, label: "Forecast", desc: "Net worth", path: "/dashboard/intel/forecast" },
      { id: "sentinel", icon: Shield, label: "Sentinel", desc: "Fraud guard", path: "/dashboard/intel/sentinel" },
    ],
  },
  {
    name: "Business",
    items: [
      { id: "merchant", icon: Store, label: "Merchant", desc: "Become a seller", path: "/dashboard/biz/merchant" },
      { id: "invoice", icon: FileText, label: "Invoices", desc: "Build & send", path: "/dashboard/biz/invoices" },
      { id: "pos", icon: Smartphone, label: "POS", desc: "Phone terminal", path: "/dashboard/biz/pos" },
      { id: "api", icon: Key, label: "API & Webhooks", desc: "Developers", path: "/dashboard/biz/api" },
    ],
  },
  {
    name: "Engagement",
    items: [
      { id: "missions", icon: Target, label: "Missions", desc: "Quests & XP", path: "/dashboard/engage/missions" },
      { id: "courses", icon: GraduationCap, label: "Courses", desc: "Akademi", path: "/dashboard/engage/courses" },
      { id: "affiliate", icon: Share2, label: "Affiliate", desc: "Earn referrals", path: "/dashboard/engage/affiliate" },
      { id: "akademi", icon: GraduationCap, label: "Akademi", desc: "Learn finance", path: "/dashboard/hub/akademi" },
      { id: "niuz", icon: Newspaper, label: "Niuz", desc: "Market news", path: "/dashboard/hub/niuz" },
    ],
  },
  {
    name: "Economy",
    items: [
      { id: "waidtrade", icon: TrendingUp, label: "WaidTrade", desc: "Trade assets", path: "/dashboard/hub/waidtrade" },
      { id: "smaitredex", icon: BarChart3, label: "SmaiTredEx", desc: "Exchange", path: "/dashboard/hub/smaitredex" },
      { id: "staking", icon: Zap, label: "SmaiStaking", desc: "Lock & earn APY", path: "/dashboard/new/staking" },
      { id: "predict", icon: TrendingUp, label: "WaidPredict", desc: "Prediction markets", path: "/dashboard/new/predict" },
    ],
  },
  {
    name: "Connect",
    items: [
      { id: "chat", icon: MessageSquare, label: "WaidChat", desc: "Talk & send money", path: "/dashboard/new/chat" },
      { id: "voice", icon: Mic, label: "WaidVoice", desc: "Talk to KonsAI", path: "/dashboard/new/voice" },
      { id: "give", icon: Heart, label: "WaidGive", desc: "Causes & donations", path: "/dashboard/new/give" },
      { id: "events", icon: Calendar, label: "WaidEvents", desc: "Tickets & gatherings", path: "/dashboard/new/events" },
      { id: "jobs", icon: Briefcase, label: "WaidJobs", desc: "Gigs & talent", path: "/dashboard/new/jobs" },
      { id: "rent", icon: Key, label: "WaidRent", desc: "Rent anything", path: "/dashboard/new/rent" },
      { id: "expense", icon: Users, label: "Expense Groups", desc: "Shared ledger", path: "/dashboard/new/expense-groups" },
      { id: "recovery", icon: Shield, label: "Recovery & Heirs", desc: "Trusted contacts", path: "/dashboard/new/recovery" },
    ],
  },
  {
    name: "Civilization",
    items: [
      { id: "civ", icon: Globe, label: "Civilization", desc: "Economic command center", path: "/dashboard/civ" },
      { id: "onyix", icon: Zap, label: "Onyix Core", desc: "Reserve energy layer", path: "/dashboard/civ/onyix" },
      { id: "treasuries", icon: Building2, label: "Treasuries", desc: "Per-entity treasuries", path: "/dashboard/civ/treasuries" },
      { id: "tredbeings", icon: Sparkles, label: "TredBeings", desc: "Autonomous beings", path: "/dashboard/civ/tredbeings" },
      { id: "family", icon: Users, label: "Family Economy", desc: "Shared family treasury", path: "/dashboard/civ/family" },
      { id: "coops", icon: Users, label: "Cooperatives", desc: "Village/school/community", path: "/dashboard/civ/cooperatives" },
      { id: "prosperity", icon: Heart, label: "Prosperity Pool", desc: "Universal support", path: "/dashboard/civ/prosperity" },
      { id: "civmissions", icon: Target, label: "Civ Missions", desc: "Economic tasks & rewards", path: "/dashboard/civ/missions" },
      { id: "reputation", icon: Trophy, label: "Reputation", desc: "Trust & contributions", path: "/dashboard/civ/reputation" },
      { id: "konsnet", icon: Activity, label: "KonsNet", desc: "Network graph", path: "/dashboard/civ/konsnet" },
      { id: "proofs", icon: FileText, label: "WaidesPruf", desc: "Immutable proofs", path: "/dashboard/civ/proofs" },
    ],
  },
];

// Rewards
const rewards = [
  { icon: Gift, label: "Daily Rewards", desc: "Claim your daily bonus", value: "ꠄ 5.00", action: "Claim", color: "text-primary" },
  { icon: Target, label: "Missions", desc: "3 of 5 completed today", value: "60%", action: "View", color: "text-accent" },
  { icon: Zap, label: "SmaiPowa Boost", desc: "Activity multiplier active", value: "2.5x", action: "Details", color: "text-primary" },
];

const Hubs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedApps, setPinnedApps] = useState<string[]>(["waidpay", "waidvault", "waidcard"]);

  const togglePin = (id: string) => {
    setPinnedApps(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  // Reorder core apps by usage
  const sortedCoreApps = useMemo(() =>
    [...coreApps].sort((a, b) => {
      const aPinned = pinnedApps.includes(a.id);
      const bPinned = pinnedApps.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return b.usage - a.usage;
    }), [pinnedApps]
  );

  // Filter explore apps by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return exploreCategories;
    const q = searchQuery.toLowerCase();
    return exploreCategories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="max-w-lg lg:max-w-6xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Hubs</h1>
            <p className="text-xs text-muted-foreground">Konsmik Entity Hub</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full gradient-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, services..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>

        {/* SECTION A — Quick Actions */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION B — Core Apps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-display font-semibold text-foreground flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary" /> Core Apps
            </h2>
            <span className="text-[10px] text-muted-foreground">Personalized</span>
          </div>
          <div className="space-y-2.5">
            {sortedCoreApps.map((app) => (
              <button
                key={app.id}
                onClick={() => navigate(app.path)}
                className="glass-card p-4 flex items-center gap-3 w-full text-left hover:border-primary/20 transition-all group active:scale-[0.98]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0`}>
                  <app.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{app.label}</p>
                  <p className="text-[11px] text-muted-foreground">{app.desc}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(app.id); }}
                  className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  {pinnedApps.includes(app.id)
                    ? <Pin className="w-3.5 h-3.5 text-primary" />
                    : <PinOff className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* SECTION C — Explore (Konsmik Entities) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-display font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Explore
            </h2>
            <span className="text-[10px] text-muted-foreground">Konsmik Entities</span>
          </div>
          {filteredCategories.map((cat) => (
            <div key={cat.name} className="mb-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">{cat.name}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                {cat.items.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => navigate(app.path)}
                    className="glass-card p-3.5 text-left hover:border-primary/20 transition-all group active:scale-[0.97]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center mb-2.5 group-hover:bg-primary/10 transition-colors">
                      <app.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{app.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{app.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION D — Rewards & Engagement */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-display font-semibold text-foreground flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-accent" /> Rewards
            </h2>
            <button className="text-[10px] text-primary flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {rewards.map((reward) => (
              <div key={reward.label} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center flex-shrink-0">
                  <reward.icon className={`w-5 h-5 ${reward.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{reward.label}</p>
                  <p className="text-[10px] text-muted-foreground">{reward.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-primary">{reward.value}</p>
                  <button className="text-[10px] text-primary/80 hover:text-primary">{reward.action}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KonsGate Preview */}
        <div className="glass-card p-4 border-primary/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">KonsGate — Coming Soon</p>
              <p className="text-[10px] text-muted-foreground">Build & publish your own mini apps for the Konsmik ecosystem</p>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="h-8" />
      </div>
    </DashboardLayout>
  );
};

export default Hubs;
