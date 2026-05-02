import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LifeAreasProvider } from "@/contexts/LifeAreasContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { RoutineProvider } from "@/contexts/RoutineContext";
import { MVDProvider } from "@/contexts/MVDContext";
import { WeeklyReviewProvider } from "@/contexts/WeeklyReviewContext";
import { FinancesProvider } from "@/contexts/FinancesContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { MonthlyReportProvider } from "@/contexts/MonthlyReportContext";
import { ExecutionModeProvider } from "@/contexts/ExecutionModeContext";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Routine from "./pages/Routine";
import WeeklyReview from "./pages/WeeklyReview";
import MVD from "./pages/MVD";
import Finances from "./pages/Finances";
import Journal from "./pages/Journal";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedApp = () => (
  <LifeAreasProvider>
    <GoalsProvider>
    <RoutineProvider>
    <MVDProvider>
      <WeeklyReviewProvider>
        <FinancesProvider>
          <HistoryProvider>
            <MonthlyReportProvider>
              <ExecutionModeProvider>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/routine" element={<Routine />} />
                    <Route path="/review" element={<WeeklyReview />} />
                    <Route path="/mvd" element={<MVD />} />
                    <Route path="/finances" element={<Finances />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ExecutionModeProvider>
            </MonthlyReportProvider>
          </HistoryProvider>
        </FinancesProvider>
      </WeeklyReviewProvider>
    </MVDProvider>
    </RoutineProvider>
    </GoalsProvider>
  </LifeAreasProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ProtectedApp />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
