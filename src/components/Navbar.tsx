import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
            W
          </div>
          <span className="font-display text-xl font-bold text-foreground">WaidTred</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Wallet", "Global", "Security"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
          <Button variant="hero" size="sm">Get Started</Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 py-4 space-y-3">
          {["Features", "Wallet", "Global", "Security"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
          <Button variant="hero" size="sm" className="w-full">Get Started</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
