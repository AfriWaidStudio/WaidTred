import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const GlobalReach = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="glass-card p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.12),transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 text-foreground">
              One App.<br />
              <span className="gradient-text">The Entire World.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              WaidTred is not just a fintech app. It's a borderless financial system designed to unify how the world sends money, pays for services, and accesses value.
            </p>
            <Button variant="hero" size="lg" className="text-base px-10 py-6">
              Join WaidTred <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                W
              </div>
              <span className="font-display font-bold text-foreground">WaidTred</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Konsmia · Secured by SmaiPin · Guided by Waides KI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;
