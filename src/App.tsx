import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";

// Public
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const Auth$ = ({ children, allow }: { children: React.ReactNode; allow?: ("super_admin"|"admin"|"agent"|"moderator"|"user")[] }) => (
  <ProtectedRoute allow={allow}>{children}</ProtectedRoute>
);

// User Dashboard
import DashboardHome from "./pages/DashboardHome";
import SendMoney from "./pages/SendMoney";
import WithdrawMoney from "./pages/WithdrawMoney";
import TransactionHistory from "./pages/TransactionHistory";
import Recharge from "./pages/Recharge";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import SmaiPinPage from "./pages/SmaiPin";
import SokoPlace from "./pages/SokoPlace";
import SokoPlaceProduct from "./pages/SokoPlaceProduct";
import SokoPlaceOrders from "./pages/SokoPlaceOrders";
import QRPay from "./pages/QRPay";
import BillPayment from "./pages/BillPayment";
import AirtimeData from "./pages/AirtimeData";
import Contacts from "./pages/Contacts";
import FundingRequest from "./pages/FundingRequest";
import Settings from "./pages/Settings";
import Referral from "./pages/Referral";
import ScheduledTransfers from "./pages/ScheduledTransfers";
import DisputeForm from "./pages/DisputeForm";
import Notifications from "./pages/Notifications";
import KYC from "./pages/KYC";
import Hubs from "./pages/Hubs";
import WaidPay from "./pages/hub/WaidPay";
import WaidVault from "./pages/hub/WaidVault";
import WaidCard from "./pages/hub/WaidCard";
import WaidTrade from "./pages/hub/WaidTrade";
import SmaiTredEx from "./pages/hub/SmaiTredEx";
import BetramaidKI from "./pages/hub/BetramaidKI";
import WaidesAkademi from "./pages/hub/WaidesAkademi";
import WaidesNiuz from "./pages/hub/WaidesNiuz";

// Admin (WACE)
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminWallets from "./pages/admin/AdminWallets";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminGlobal from "./pages/admin/AdminGlobal";
import AdminRecharge from "./pages/admin/AdminRecharge";
import AdminMerchants from "./pages/admin/AdminMerchants";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminKI from "./pages/admin/AdminKI";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminSmaiPins from "./pages/admin/AdminSmaiPins";
import AdminFunding from "./pages/admin/AdminFunding";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminChat from "./pages/admin/AdminChat";
import AdminSokoPlace from "./pages/admin/AdminSokoPlace";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminRiskScoring from "./pages/admin/AdminRiskScoring";
import AdminTreasury from "./pages/admin/AdminTreasury";
import AdminCompliance from "./pages/admin/AdminCompliance";

// Wealth (1-10)
import WaidLock from "./pages/wealth/WaidLock";
import WaidGoals from "./pages/wealth/WaidGoals";
import WaidVest from "./pages/wealth/WaidVest";
import SmaiYield from "./pages/wealth/SmaiYield";
import WaidLoans from "./pages/wealth/WaidLoans";
import WaidInsure from "./pages/wealth/WaidInsure";
import WaidPension from "./pages/wealth/WaidPension";
import GroupSave from "./pages/wealth/GroupSave";
import WaidBudget from "./pages/wealth/WaidBudget";
import TaxVault from "./pages/wealth/TaxVault";

// Payments (11-18)
import SplitBills from "./pages/payments/SplitBills";
import RequestMoney from "./pages/payments/RequestMoney";
import Subscriptions from "./pages/payments/Subscriptions";
import Remittance from "./pages/payments/Remittance";
import Escrow from "./pages/payments/Escrow";
import Payroll from "./pages/payments/Payroll";
import TipJar from "./pages/payments/TipJar";
import VirtualCards from "./pages/payments/VirtualCards";

// SokoPlace (19-23)
import Storefronts from "./pages/soko/Storefronts";
import Reviews from "./pages/soko/Reviews";
import Wishlist from "./pages/soko/Wishlist";
import FlashDeals from "./pages/soko/FlashDeals";
import Logistics from "./pages/soko/Logistics";

// Social (24-27)
import Circles from "./pages/social/Circles";
import Feed from "./pages/social/Feed";
import Leaderboards from "./pages/social/Leaderboards";
import PublicProfile from "./pages/social/PublicProfile";

// Intelligence (28-30)
import SpendingInsights from "./pages/intelligence/SpendingInsights";
import WealthForecast from "./pages/intelligence/WealthForecast";
import FraudSentinel from "./pages/intelligence/FraudSentinel";

// Business (31-34)
import MerchantOnboarding from "./pages/business/MerchantOnboarding";
import InvoiceBuilder from "./pages/business/InvoiceBuilder";
import POSMode from "./pages/business/POSMode";
import ApiKeys from "./pages/business/ApiKeys";

// Engagement (35-37)
import Missions from "./pages/engagement/Missions";
import AkademiCourses from "./pages/engagement/AkademiCourses";
import Affiliate from "./pages/engagement/Affiliate";

// Agent
import AgentOverview from "./pages/agent/AgentOverview";
import AgentFunding from "./pages/agent/AgentFunding";
import AgentChat from "./pages/agent/AgentChat";
import AgentActivity from "./pages/agent/AgentActivity";

// Moderator
import ModeratorOverview from "./pages/moderator/ModeratorOverview";
import ModeratorFlagged from "./pages/moderator/ModeratorFlagged";
import ModeratorDisputes from "./pages/moderator/ModeratorDisputes";
import ModeratorChats from "./pages/moderator/ModeratorChats";
import ModeratorActionLog from "./pages/moderator/ModeratorActionLog";

// New features (10)
import WaidChat from "./pages/new/WaidChat";
import WaidGive from "./pages/new/WaidGive";
import WaidEvents from "./pages/new/WaidEvents";
import WaidJobs from "./pages/new/WaidJobs";
import WaidRent from "./pages/new/WaidRent";
import SmaiStaking from "./pages/new/SmaiStaking";
import WaidPredict from "./pages/new/WaidPredict";
import ExpenseGroups from "./pages/new/ExpenseGroups";
import Recovery from "./pages/new/Recovery";
import WaidVoice from "./pages/new/WaidVoice";

// Civilization Core
import CivilizationDashboard from "./pages/civ/CivilizationDashboard";
import OnyixCore from "./pages/civ/OnyixCore";
import EntityTreasuries from "./pages/civ/EntityTreasuries";
import TredBeings from "./pages/civ/TredBeings";
import FamilyEconomy from "./pages/civ/FamilyEconomy";
import Cooperatives from "./pages/civ/Cooperatives";
import ProsperityPool from "./pages/civ/ProsperityPool";
import MissionMarketplace from "./pages/civ/MissionMarketplace";
import Reputation from "./pages/civ/Reputation";
import KonsNetGraph from "./pages/civ/KonsNetGraph";
import WaidesPruf from "./pages/civ/WaidesPruf";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<Auth$><DashboardHome /></Auth$>} />
            <Route path="/dashboard/send" element={<Auth$><SendMoney /></Auth$>} />
            <Route path="/dashboard/withdraw" element={<Auth$><WithdrawMoney /></Auth$>} />
            <Route path="/dashboard/history" element={<Auth$><TransactionHistory /></Auth$>} />
            <Route path="/dashboard/recharge" element={<Auth$><Recharge /></Auth$>} />
            <Route path="/dashboard/profile" element={<Auth$><Profile /></Auth$>} />
            <Route path="/dashboard/analytics" element={<Auth$><Analytics /></Auth$>} />
            <Route path="/dashboard/smaipin" element={<Auth$><SmaiPinPage /></Auth$>} />
            <Route path="/dashboard/sokoplace" element={<Auth$><SokoPlace /></Auth$>} />
            <Route path="/dashboard/sokoplace/:id" element={<Auth$><SokoPlaceProduct /></Auth$>} />
            <Route path="/dashboard/sokoplace/orders" element={<Auth$><SokoPlaceOrders /></Auth$>} />
            <Route path="/dashboard/qrpay" element={<Auth$><QRPay /></Auth$>} />
            <Route path="/dashboard/bills" element={<Auth$><BillPayment /></Auth$>} />
            <Route path="/dashboard/airtime" element={<Auth$><AirtimeData /></Auth$>} />
            <Route path="/dashboard/contacts" element={<Auth$><Contacts /></Auth$>} />
            <Route path="/dashboard/fund" element={<Auth$><FundingRequest /></Auth$>} />
            <Route path="/dashboard/settings" element={<Auth$><Settings /></Auth$>} />
            <Route path="/dashboard/referral" element={<Auth$><Referral /></Auth$>} />
            <Route path="/dashboard/scheduled" element={<Auth$><ScheduledTransfers /></Auth$>} />
            <Route path="/dashboard/dispute" element={<Auth$><DisputeForm /></Auth$>} />
            <Route path="/dashboard/notifications" element={<Auth$><Notifications /></Auth$>} />
            <Route path="/dashboard/kyc" element={<Auth$><KYC /></Auth$>} />
            <Route path="/dashboard/hubs" element={<Auth$><Hubs /></Auth$>} />
            <Route path="/dashboard/hub/waidpay" element={<Auth$><WaidPay /></Auth$>} />
            <Route path="/dashboard/hub/waidvault" element={<Auth$><WaidVault /></Auth$>} />
            <Route path="/dashboard/hub/waidcard" element={<Auth$><WaidCard /></Auth$>} />
            <Route path="/dashboard/hub/waidtrade" element={<Auth$><WaidTrade /></Auth$>} />
            <Route path="/dashboard/hub/smaitredex" element={<Auth$><SmaiTredEx /></Auth$>} />
            <Route path="/dashboard/hub/betramaid" element={<Auth$><BetramaidKI /></Auth$>} />
            <Route path="/dashboard/hub/akademi" element={<Auth$><WaidesAkademi /></Auth$>} />
            <Route path="/dashboard/hub/niuz" element={<Auth$><WaidesNiuz /></Auth$>} />

            {/* Wealth */}
            <Route path="/dashboard/wealth/waidlock" element={<Auth$><WaidLock /></Auth$>} />
            <Route path="/dashboard/wealth/goals" element={<Auth$><WaidGoals /></Auth$>} />
            <Route path="/dashboard/wealth/vest" element={<Auth$><WaidVest /></Auth$>} />
            <Route path="/dashboard/wealth/yield" element={<Auth$><SmaiYield /></Auth$>} />
            <Route path="/dashboard/wealth/loans" element={<Auth$><WaidLoans /></Auth$>} />
            <Route path="/dashboard/wealth/insure" element={<Auth$><WaidInsure /></Auth$>} />
            <Route path="/dashboard/wealth/pension" element={<Auth$><WaidPension /></Auth$>} />
            <Route path="/dashboard/wealth/groupsave" element={<Auth$><GroupSave /></Auth$>} />
            <Route path="/dashboard/wealth/budget" element={<Auth$><WaidBudget /></Auth$>} />
            <Route path="/dashboard/wealth/tax" element={<Auth$><TaxVault /></Auth$>} />

            {/* Payments */}
            <Route path="/dashboard/pay/split" element={<Auth$><SplitBills /></Auth$>} />
            <Route path="/dashboard/pay/request" element={<Auth$><RequestMoney /></Auth$>} />
            <Route path="/dashboard/pay/subscriptions" element={<Auth$><Subscriptions /></Auth$>} />
            <Route path="/dashboard/pay/remittance" element={<Auth$><Remittance /></Auth$>} />
            <Route path="/dashboard/pay/escrow" element={<Auth$><Escrow /></Auth$>} />
            <Route path="/dashboard/pay/payroll" element={<Auth$><Payroll /></Auth$>} />
            <Route path="/dashboard/pay/tipjar" element={<Auth$><TipJar /></Auth$>} />
            <Route path="/dashboard/pay/virtual-cards" element={<Auth$><VirtualCards /></Auth$>} />

            {/* SokoPlace */}
            <Route path="/dashboard/sokoplace/storefronts" element={<Auth$><Storefronts /></Auth$>} />
            <Route path="/dashboard/sokoplace/reviews" element={<Auth$><Reviews /></Auth$>} />
            <Route path="/dashboard/sokoplace/wishlist" element={<Auth$><Wishlist /></Auth$>} />
            <Route path="/dashboard/sokoplace/flash" element={<Auth$><FlashDeals /></Auth$>} />
            <Route path="/dashboard/sokoplace/logistics" element={<Auth$><Logistics /></Auth$>} />

            {/* Social */}
            <Route path="/dashboard/social/circles" element={<Auth$><Circles /></Auth$>} />
            <Route path="/dashboard/social/feed" element={<Auth$><Feed /></Auth$>} />
            <Route path="/dashboard/social/leaderboards" element={<Auth$><Leaderboards /></Auth$>} />
            <Route path="/dashboard/social/profile" element={<Auth$><PublicProfile /></Auth$>} />

            {/* Intelligence */}
            <Route path="/dashboard/intel/insights" element={<Auth$><SpendingInsights /></Auth$>} />
            <Route path="/dashboard/intel/forecast" element={<Auth$><WealthForecast /></Auth$>} />
            <Route path="/dashboard/intel/sentinel" element={<Auth$><FraudSentinel /></Auth$>} />

            {/* Business */}
            <Route path="/dashboard/biz/merchant" element={<Auth$><MerchantOnboarding /></Auth$>} />
            <Route path="/dashboard/biz/invoices" element={<Auth$><InvoiceBuilder /></Auth$>} />
            <Route path="/dashboard/biz/pos" element={<Auth$><POSMode /></Auth$>} />
            <Route path="/dashboard/biz/api" element={<Auth$><ApiKeys /></Auth$>} />

            {/* Engagement */}
            <Route path="/dashboard/engage/missions" element={<Auth$><Missions /></Auth$>} />
            <Route path="/dashboard/engage/courses" element={<Auth$><AkademiCourses /></Auth$>} />
            <Route path="/dashboard/engage/affiliate" element={<Auth$><Affiliate /></Auth$>} />

            {/* New features */}
            <Route path="/dashboard/new/chat" element={<Auth$><WaidChat /></Auth$>} />
            <Route path="/dashboard/new/give" element={<Auth$><WaidGive /></Auth$>} />
            <Route path="/dashboard/new/events" element={<Auth$><WaidEvents /></Auth$>} />
            <Route path="/dashboard/new/jobs" element={<Auth$><WaidJobs /></Auth$>} />
            <Route path="/dashboard/new/rent" element={<Auth$><WaidRent /></Auth$>} />
            <Route path="/dashboard/new/staking" element={<Auth$><SmaiStaking /></Auth$>} />
            <Route path="/dashboard/new/predict" element={<Auth$><WaidPredict /></Auth$>} />
            <Route path="/dashboard/new/expense-groups" element={<Auth$><ExpenseGroups /></Auth$>} />
            <Route path="/dashboard/new/recovery" element={<Auth$><Recovery /></Auth$>} />
            <Route path="/dashboard/new/voice" element={<Auth$><WaidVoice /></Auth$>} />

            {/* Civilization Core */}
            <Route path="/dashboard/civ" element={<Auth$><CivilizationDashboard /></Auth$>} />
            <Route path="/dashboard/civ/onyix" element={<Auth$><OnyixCore /></Auth$>} />
            <Route path="/dashboard/civ/treasuries" element={<Auth$><EntityTreasuries /></Auth$>} />
            <Route path="/dashboard/civ/tredbeings" element={<Auth$><TredBeings /></Auth$>} />
            <Route path="/dashboard/civ/family" element={<Auth$><FamilyEconomy /></Auth$>} />
            <Route path="/dashboard/civ/cooperatives" element={<Auth$><Cooperatives /></Auth$>} />
            <Route path="/dashboard/civ/prosperity" element={<Auth$><ProsperityPool /></Auth$>} />
            <Route path="/dashboard/civ/missions" element={<Auth$><MissionMarketplace /></Auth$>} />
            <Route path="/dashboard/civ/reputation" element={<Auth$><Reputation /></Auth$>} />
            <Route path="/dashboard/civ/konsnet" element={<Auth$><KonsNetGraph /></Auth$>} />
            <Route path="/dashboard/civ/proofs" element={<Auth$><WaidesPruf /></Auth$>} />


            {/* Admin (WACE) */}
            <Route path="/admin" element={<Auth$ allow={["admin"]}><AdminOverview /></Auth$>} />
            <Route path="/admin/users" element={<Auth$ allow={["admin"]}><AdminUsers /></Auth$>} />
            <Route path="/admin/users/:id" element={<Auth$ allow={["admin"]}><AdminUserDetail /></Auth$>} />
            <Route path="/admin/wallets" element={<Auth$ allow={["admin"]}><AdminWallets /></Auth$>} />
            <Route path="/admin/transactions" element={<Auth$ allow={["admin"]}><AdminTransactions /></Auth$>} />
            <Route path="/admin/funding" element={<Auth$ allow={["admin"]}><AdminFunding /></Auth$>} />
            <Route path="/admin/withdrawals" element={<Auth$ allow={["admin"]}><AdminWithdrawals /></Auth$>} />
            <Route path="/admin/global" element={<Auth$ allow={["admin"]}><AdminGlobal /></Auth$>} />
            <Route path="/admin/countries" element={<Auth$ allow={["admin"]}><AdminCountries /></Auth$>} />
            <Route path="/admin/recharge" element={<Auth$ allow={["admin"]}><AdminRecharge /></Auth$>} />
            <Route path="/admin/merchants" element={<Auth$ allow={["admin"]}><AdminMerchants /></Auth$>} />
            <Route path="/admin/agents" element={<Auth$ allow={["admin"]}><AdminAgents /></Auth$>} />
            <Route path="/admin/chat" element={<Auth$ allow={["admin"]}><AdminChat /></Auth$>} />
            <Route path="/admin/integrations" element={<Auth$ allow={["admin"]}><AdminIntegrations /></Auth$>} />
            <Route path="/admin/providers" element={<Auth$ allow={["admin"]}><AdminProviders /></Auth$>} />
            <Route path="/admin/ki" element={<Auth$ allow={["admin"]}><AdminKI /></Auth$>} />
            <Route path="/admin/security" element={<Auth$ allow={["admin"]}><AdminSecurity /></Auth$>} />
            <Route path="/admin/alerts" element={<Auth$ allow={["admin"]}><AdminAlerts /></Auth$>} />
            <Route path="/admin/audit" element={<Auth$ allow={["admin"]}><AdminAuditLog /></Auth$>} />
            <Route path="/admin/smaipin" element={<Auth$ allow={["admin"]}><AdminSmaiPins /></Auth$>} />
            <Route path="/admin/sokoplace" element={<Auth$ allow={["admin"]}><AdminSokoPlace /></Auth$>} />
            <Route path="/admin/orders" element={<Auth$ allow={["admin"]}><AdminOrders /></Auth$>} />
            <Route path="/admin/pricing" element={<Auth$ allow={["admin"]}><AdminPricing /></Auth$>} />
            <Route path="/admin/risk" element={<Auth$ allow={["admin"]}><AdminRiskScoring /></Auth$>} />
            <Route path="/admin/treasury" element={<Auth$ allow={["admin"]}><AdminTreasury /></Auth$>} />
            <Route path="/admin/compliance" element={<Auth$ allow={["admin"]}><AdminCompliance /></Auth$>} />

            {/* Agent */}
            <Route path="/agent" element={<Auth$ allow={["agent"]}><AgentOverview /></Auth$>} />
            <Route path="/agent/funding" element={<Auth$ allow={["agent"]}><AgentFunding /></Auth$>} />
            <Route path="/agent/chat" element={<Auth$ allow={["agent"]}><AgentChat /></Auth$>} />
            <Route path="/agent/activity" element={<Auth$ allow={["agent"]}><AgentActivity /></Auth$>} />

            {/* Moderator */}
            <Route path="/moderator" element={<Auth$ allow={["moderator"]}><ModeratorOverview /></Auth$>} />
            <Route path="/moderator/flagged" element={<Auth$ allow={["moderator"]}><ModeratorFlagged /></Auth$>} />
            <Route path="/moderator/disputes" element={<Auth$ allow={["moderator"]}><ModeratorDisputes /></Auth$>} />
            <Route path="/moderator/chats" element={<Auth$ allow={["moderator"]}><ModeratorChats /></Auth$>} />
            <Route path="/moderator/actions" element={<Auth$ allow={["moderator"]}><ModeratorActionLog /></Auth$>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
