import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Role = "super_admin" | "admin" | "agent" | "moderator" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, user must have one of these roles (super_admin always passes). */
  allow?: Role[];
}

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (allow && allow.length > 0) {
    const ok = role === "super_admin" || allow.includes(role);
    if (!ok) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
