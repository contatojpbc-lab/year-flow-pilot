import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import Paywall from "@/pages/Paywall";

function SubscriptionGate({ children }: { children: ReactNode }) {
  const { status, loading } = useSubscription();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Allow Settings access even when expired so user can manage account
  const allowedWhenExpired = ["/settings"];
  if (status === "expired" && !allowedWhenExpired.includes(location.pathname)) {
    return <Paywall />;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace state={{ from: location }} />;
  }

  return (
    <SubscriptionProvider>
      <SubscriptionGate>{children}</SubscriptionGate>
    </SubscriptionProvider>
  );
}
