import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const ALLOWED_WHEN_EXPIRED = ["/settings", "/paywall"];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || (user && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace state={{ from: location }} />;
  }

  if (status === "expired" && !ALLOWED_WHEN_EXPIRED.includes(location.pathname)) {
    return <Navigate to="/paywall" replace />;
  }

  return <>{children}</>;
}
