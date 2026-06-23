import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WalletPreview from "@/components/WalletPreview";
import QuickActions from "@/components/QuickActions";
import Features from "@/components/Features";
import GlobalReach from "@/components/GlobalReach";
import PricingSection from "@/components/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WalletPreview />
      <QuickActions />
      <Features />
      <GlobalReach />
      <PricingSection />
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-bold text-primary-foreground">W</span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">WaidTred</p>
          <p className="text-xs text-muted-foreground mb-4">Powered by Konsmik Civilization</p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
            <a href="#" className="hover:text-foreground">API</a>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">© 2026 WaidTred. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
