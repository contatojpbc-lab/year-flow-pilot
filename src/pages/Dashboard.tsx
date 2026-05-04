import { useEffect, useState, useMemo } from "react";
 import { Target, Flame, Calendar, TrendingUp, PartyPopper, AlertCircle, Zap } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { MVDIndicator } from "@/components/dashboard/MVDIndicator";
import { GoalsOverview } from "@/components/dashboard/GoalsOverview";
import { FinanceSnapshot } from "@/components/dashboard/FinanceSnapshot";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DailyPriorities } from "@/components/dashboard/DailyPriorities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LifeAreaTrendsCard, HistoryInsightsCard } from "@/components/history/HistoryComponents";
import { MonthlyReportSummary } from "@/components/reports/MonthlyReportCard";
import { ConsistencyMetricsCard, MVDCompletionMetricsCard, RoutineGoalsCorrelationCard } from "@/components/history/EvolutionMetrics";
 import { MentalLoadAlert } from "@/components/dashboard/MentalLoadAlert";
 import { SmartRecommendations } from "@/components/dashboard/SmartRecommendations";
 import { ExecutionModeToggle } from "@/components/dashboard/ExecutionModeToggle";
 import { LightModeView } from "@/components/dashboard/LightModeView";
import { useGoals } from "@/contexts/GoalsContext";
import { useMVD } from "@/contexts/MVDContext";
import { useLifeAreas } from "@/contexts/LifeAreasContext";
import { useFinances } from "@/contexts/FinancesContext";
 import { useExecutionMode } from "@/contexts/ExecutionModeContext";
 import { useWeeklyReview } from "@/contexts/WeeklyReviewContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { goals } = useGoals();
  const { items, completedItems, allCompleted, currentStreak, longestStreak } = useMVD();
  const { lifeAreas } = useLifeAreas();
  const { plan } = useFinances();
   const { isLightMode } = useExecutionMode();
  const { savedReviews } = useWeeklyReview();
  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate average progress from context goals
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  // Detect stagnant goals (progress < 10% or goals that haven't moved)
  const stagnantGoals = useMemo(() => {
    return goals.filter(goal => goal.progress < 10);
  }, [goals]);

  // Check if MVD hasn't been started today
  const mvdNotStarted = completedItems.length === 0 && items.length > 0;

  // Show celebration when MVD is completed
  useEffect(() => {
    if (allCompleted && completedItems.length > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, completedItems.length]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-scale-in bg-success/20 backdrop-blur-sm rounded-2xl p-8 border border-success/30 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
                <PartyPopper className="h-8 w-8 text-success" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-success">MVD Completed!</h2>
                <p className="text-sm text-success/80 mt-1">
                  Streak: {currentStreak} days 🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Alerts Section */}
       <div className="space-y-2">
         {/* Mental Load Alert - Priority */}
         <MentalLoadAlert />
         
         {mvdNotStarted && (
           <Alert className="border-warning/30 bg-warning/5">
             <AlertCircle className="h-4 w-4 text-warning" />
             <AlertDescription className="text-sm text-warning">
               Seu MVD ainda não foi iniciado hoje. Comece com o primeiro item!
             </AlertDescription>
           </Alert>
         )}
         {stagnantGoals.length > 0 && (
           <Alert className="border-muted-foreground/30 bg-muted/30">
             <AlertCircle className="h-4 w-4 text-muted-foreground" />
             <AlertDescription className="text-sm text-muted-foreground">
               {stagnantGoals.length === 1 
                 ? `A meta "${stagnantGoals[0].title}" precisa de atenção (${stagnantGoals[0].progress}% de progresso).`
                 : `${stagnantGoals.length} metas precisam de atenção (menos de 10% de progresso).`
               }
             </AlertDescription>
           </Alert>
         )}
       </div>

      {/* Header */}
      <div className="space-y-1">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-foreground">Good morning!</h1>
             <p className="text-muted-foreground">Here's your Life OS overview for today.</p>
           </div>
           <ExecutionModeToggle />
         </div>
      </div>

       {/* Light Mode View - Replaces normal dashboard */}
       {isLightMode ? (
         <LightModeView />
       ) : (
         <>
           {/* Stats Grid */}
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatCard
          title="Active Goals"
          value={activeGoalsCount}
          subtitle={`${completedGoalsCount} completed this year`}
          icon={Target}
          variant="glow"
        />
        <StatCard
          title="Current Streak"
          value={`${currentStreak} days`}
          subtitle={`Longest: ${longestStreak} days`}
          icon={Flame}
          trend={currentStreak > 0 ? "up" : undefined}
          trendValue={currentStreak > 0 ? `+${currentStreak}` : undefined}
          className={cn(allCompleted && "ring-2 ring-success/50")}
        />
        <StatCard
          title="Weekly Reviews"
          value={savedReviews.length}
          subtitle="reviews completed"
          icon={Calendar}
        />
        <StatCard
          title="Goals Progress"
          value={`${averageProgress}%`}
          subtitle="average completion"
          icon={TrendingUp}
          trend="up"
          trendValue="+5%"
        />
           </div>

           {/* Main Content Grid */}
           <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Progress, MVD & Priorities */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">2026 Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <ProgressRing 
                progress={averageProgress} 
                label="Complete"
                sublabel="across all goals"
              />
            </CardContent>
          </Card>

          {/* MVD Indicator */}
          <MVDIndicator 
            items={items} 
            completedItems={completedItems}
          />
          
          {/* Consistency Metrics */}
          <ConsistencyMetricsCard />
        </div>

        {/* Center Column - Daily Priorities & Goals */}
        <div className="lg:col-span-1 space-y-6">
          {/* Daily Priorities - Main Focus */}
          <DailyPriorities />
           <SmartRecommendations />
          <GoalsOverview goals={goals} lifeAreas={lifeAreas} />
        </div>

        {/* Right Column - Finances, Trends & Insights */}
        <div className="space-y-6">
          <FinanceSnapshot plan={plan} />
          <LifeAreaTrendsCard />
           <RoutineGoalsCorrelationCard />
          <HistoryInsightsCard maxInsights={3} />
        </div>
           </div>
         </>
       )}
    </div>
  );
};

export default Dashboard;
