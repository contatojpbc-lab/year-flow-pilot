import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { MVDProvider } from "@/contexts/MVDContext";
import { WeeklyReviewProvider } from "@/contexts/WeeklyReviewContext";
import { FinancesProvider } from "@/contexts/FinancesContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Routine from "./pages/Routine";
import WeeklyReview from "./pages/WeeklyReview";
import MVD from "./pages/MVD";
import Finances from "./pages/Finances";
import Journal from "./pages/Journal";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoalsProvider>
      <MVDProvider>
        <WeeklyReviewProvider>
          <FinancesProvider>
            <HistoryProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
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
                </BrowserRouter>
              </TooltipProvider>
            </HistoryProvider>
          </FinancesProvider>
        </WeeklyReviewProvider>
      </MVDProvider>
    </GoalsProvider>
  </QueryClientProvider>
);

export default App;
