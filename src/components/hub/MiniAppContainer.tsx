import { ArrowLeft, MoreVertical, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface MiniAppContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
}

const MiniAppContainer = ({ title, subtitle, children, onBack }: MiniAppContainerProps) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        {/* Mini App Header */}
        <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack || (() => navigate("/dashboard/hubs"))}
                className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-display font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini App Content */}
        <div className="px-4 py-5">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MiniAppContainer;
