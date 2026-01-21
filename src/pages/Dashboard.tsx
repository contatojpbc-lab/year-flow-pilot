import { Target, Flame, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { MVDIndicator } from "@/components/dashboard/MVDIndicator";
import { GoalsOverview } from "@/components/dashboard/GoalsOverview";
import { FinanceSnapshot } from "@/components/dashboard/FinanceSnapshot";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/contexts/GoalsContext";
import { 
  mockDashboardStats, 
  mockLifeAreas, 
  mockMVDItems,
  mockFinancialPlan 
} from "@/data/mockData";

const Dashboard = () => {
  const { goals } = useGoals();
  const stats = mockDashboardStats;
  const completedMVDItems = ['mvd-1', 'mvd-2', 'mvd-4'];

  // Calculate average progress from context goals
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Good morning!</h1>
        <p className="text-muted-foreground">Here's your Life OS overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Goals"
          value={stats.activeGoals}
          subtitle={`${stats.completedGoals} completed this year`}
          icon={Target}
          variant="glow"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          subtitle={`Longest: ${stats.longestStreak} days`}
          icon={Flame}
          trend="up"
          trendValue="+3"
        />
        <StatCard
          title="Weekly Reviews"
          value={stats.weeklyReviewsDone}
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
        {/* Left Column - Progress & MVD */}
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
            items={mockMVDItems} 
            completedItems={completedMVDItems}
          />
        </div>

        {/* Center Column - Goals */}
        <div className="lg:col-span-1 space-y-6">
          <GoalsOverview goals={goals} lifeAreas={mockLifeAreas} />
          <RecentActivity />
        </div>

        {/* Right Column - Finances */}
        <div className="space-y-6">
          <FinanceSnapshot plan={mockFinancialPlan} />
          
          {/* Quick Journal Prompt */}
          <Card variant="interactive" className="animate-slide-up group">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-lg">✍️</span>
                </div>
                <h3 className="font-medium text-foreground">Daily Reflection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                What's one thing you're grateful for today?
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
