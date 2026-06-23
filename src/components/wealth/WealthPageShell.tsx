import { ReactNode } from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Props {
  title: string;
  subtitle?: string;
  Icon?: LucideIcon;
  back?: string;
  children: ReactNode;
}

const WealthPageShell = ({ title, subtitle, Icon, back = "/dashboard/hubs", children }: Props) => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="max-w-lg lg:max-w-6xl mx-auto px-4 pt-6 pb-8">
        <button onClick={() => navigate(back)} className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 hover:text-primary">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="mb-5">
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />} {title}
          </h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {children}
        <div className="h-8" />
      </div>
    </DashboardLayout>
  );
};
export default WealthPageShell;
