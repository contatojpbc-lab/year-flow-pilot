import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TrialBanner } from "./TrialBanner";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(`onboarding_done_${user.id}`);
    if (!done && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground capitalize">{today}</span>
            </div>
          </header>
          <TrialBanner />
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
