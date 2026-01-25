import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHistory } from "@/contexts/HistoryContext";
import { getMonthName, getFullMonthName } from "@/data/historyMockData";
import { TrendDirection, HistoryInsight } from "@/types/history";
import { cn } from "@/lib/utils";

const TrendIcon = ({ direction, className }: { direction: TrendDirection; className?: string }) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className={cn("h-4 w-4 text-success", className)} />;
    case 'down':
      return <TrendingDown className={cn("h-4 w-4 text-destructive", className)} />;
    case 'stable':
      return <Minus className={cn("h-4 w-4 text-muted-foreground", className)} />;
  }
};

const TrendBadge = ({ direction, percentage }: { direction: TrendDirection; percentage: number }) => (
  <Badge
    variant="secondary"
    className={cn(
      "text-xs gap-1",
      direction === 'up' && "bg-success/10 text-success border-success/20",
      direction === 'down' && "bg-destructive/10 text-destructive border-destructive/20",
      direction === 'stable' && "bg-secondary text-muted-foreground"
    )}
  >
    <TrendIcon direction={direction} className="h-3 w-3" />
    {direction === 'stable' ? 'Stable' : `${direction === 'up' ? '+' : '-'}${percentage}%`}
  </Badge>
);

const InsightCard = ({ insight }: { insight: HistoryInsight }) => (
  <div
    className={cn(
      "p-3 rounded-lg text-sm",
      insight.type === 'improvement' && "bg-success/10 border border-success/20",
      insight.type === 'achievement' && "bg-primary/10 border border-primary/20",
      insight.type === 'decline' && "bg-warning/10 border border-warning/20",
      insight.type === 'warning' && "bg-destructive/10 border border-destructive/20"
    )}
  >
    <div className="flex items-start gap-2">
      <TrendIcon direction={insight.trend} className="mt-0.5" />
      <span>{insight.message}</span>
    </div>
  </div>
);

interface MonthComparisonCardProps {
  module?: 'goals' | 'habits' | 'mvd' | 'finances';
  compact?: boolean;
}

export const MonthComparisonCard = ({ module, compact = false }: MonthComparisonCardProps) => {
  const { getMonthComparison, currentMonth } = useHistory();
  const comparison = getMonthComparison();

  const currentMonthName = getFullMonthName(comparison.currentMonth);
  const previousMonthName = getMonthName(comparison.previousMonth);

  // Filter data based on module
  const dataToShow = module
    ? {
        [module]: module === 'finances'
          ? comparison.finances
          : comparison[module as keyof typeof comparison],
      }
    : {
        goals: comparison.goals,
        habits: comparison.habits,
        mvd: comparison.mvd,
      };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {module === 'finances' ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Savings:</span>
              <TrendBadge
                direction={comparison.finances.savingsRate.trend.direction}
                percentage={comparison.finances.savingsRate.trend.percentage}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Budget:</span>
              <TrendBadge
                direction={comparison.finances.budgetAdherence.trend.direction}
                percentage={comparison.finances.budgetAdherence.trend.percentage}
              />
            </div>
          </>
        ) : (
          Object.entries(dataToShow).map(([key, data]) => {
            if (key === 'finances') return null;
            const typedData = data as { current: number; previous: number; trend: { direction: TrendDirection; percentage: number } };
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <TrendBadge direction={typedData.trend.direction} percentage={typedData.trend.percentage} />
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {currentMonthName} vs {previousMonthName}
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {module === 'finances' ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Savings Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comparison.finances.savingsRate.current}%</span>
                <TrendBadge
                  direction={comparison.finances.savingsRate.trend.direction}
                  percentage={comparison.finances.savingsRate.trend.percentage}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget Adherence</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comparison.finances.budgetAdherence.current}%</span>
                <TrendBadge
                  direction={comparison.finances.budgetAdherence.trend.direction}
                  percentage={comparison.finances.budgetAdherence.trend.percentage}
                />
              </div>
            </div>
          </>
        ) : (
          Object.entries(dataToShow).map(([key, data]) => {
            const typedData = data as { current: number; previous: number; trend: { direction: TrendDirection; percentage: number } };
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{typedData.current}%</span>
                  <TrendBadge direction={typedData.trend.direction} percentage={typedData.trend.percentage} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

interface LifeAreaTrendsCardProps {
  lifeAreaId?: string;
}

export const LifeAreaTrendsCard = ({ lifeAreaId }: LifeAreaTrendsCardProps) => {
  const { getLifeAreaTrends, getLifeAreaComparison, currentMonth } = useHistory();

  if (lifeAreaId) {
    const comparison = getLifeAreaComparison(lifeAreaId);
    if (!comparison) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: comparison.lifeAreaColor }}
              />
              <CardTitle className="text-sm font-medium">{comparison.lifeAreaName}</CardTitle>
            </div>
            <TrendBadge direction={comparison.trend.direction} percentage={comparison.trend.percentage} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {comparison.monthlyData.map((data, idx) => (
              <div
                key={data.month}
                className="flex-1 h-16 flex flex-col justify-end gap-1"
                title={`${getMonthName(data.month)}: ${data.overallScore}%`}
              >
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${data.overallScore}%`,
                    backgroundColor: data.month === currentMonth
                      ? comparison.lifeAreaColor
                      : `${comparison.lifeAreaColor}50`,
                  }}
                />
                <span className="text-[10px] text-center text-muted-foreground">
                  {getMonthName(data.month)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allTrends = getLifeAreaTrends();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Life Areas Evolution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allTrends.map((area) => {
          const latestData = area.monthlyData[area.monthlyData.length - 1];
          return (
            <div key={area.lifeAreaId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: area.lifeAreaColor }}
                  />
                  <span className="text-sm text-foreground">{area.lifeAreaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{latestData?.overallScore || 0}%</span>
                  <TrendBadge direction={area.trend.direction} percentage={area.trend.percentage} />
                </div>
              </div>
              <Progress value={latestData?.overallScore || 0} size="sm" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

interface HistoryInsightsCardProps {
  module?: 'goals' | 'habits' | 'mvd' | 'finances' | 'lifeArea';
  maxInsights?: number;
}

export const HistoryInsightsCard = ({ module, maxInsights = 3 }: HistoryInsightsCardProps) => {
  const { insights } = useHistory();

  const filteredInsights = module
    ? insights.filter((i) => i.module === module)
    : insights;

  const displayInsights = filteredInsights.slice(0, maxInsights);

  if (displayInsights.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Trends & Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </CardContent>
    </Card>
  );
};

interface AnnualProgressChartProps {
  module: 'goals' | 'habits' | 'mvd' | 'finances';
  metric?: 'savingsRate' | 'budgetAdherence';
}

export const AnnualProgressChart = ({ module, metric = 'savingsRate' }: AnnualProgressChartProps) => {
  const { getGoalsHistory, getHabitsHistory, getMVDHistory, getFinancesHistory, currentMonth } = useHistory();

  let data: { month: number; value: number }[] = [];
  let label = '';

  switch (module) {
    case 'goals':
      data = getGoalsHistory().map((g) => ({ month: g.month, value: g.averageProgress }));
      label = 'Goals Progress';
      break;
    case 'habits':
      data = getHabitsHistory().map((h) => ({ month: h.month, value: h.consistencyRate }));
      label = 'Habit Consistency';
      break;
    case 'mvd':
      data = getMVDHistory().map((m) => ({ month: m.month, value: m.completionRate }));
      label = 'MVD Completion';
      break;
    case 'finances':
      data = getFinancesHistory().map((f) => ({
        month: f.month,
        value: metric === 'savingsRate' ? f.savingsRate : f.budgetAdherence,
      }));
      label = metric === 'savingsRate' ? 'Savings Rate' : 'Budget Adherence';
      break;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{label} - 2026</CardTitle>
          {data.length > 0 && (
            <span className="text-sm font-medium text-primary">
              {data[data.length - 1]?.value}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 h-20">
          {data.map((d) => (
            <div
              key={d.month}
              className="flex-1 flex flex-col justify-end gap-1"
              title={`${getMonthName(d.month)}: ${d.value}%`}
            >
              <div
                className={cn(
                  "w-full rounded-t transition-all",
                  d.month === currentMonth
                    ? "bg-primary"
                    : "bg-primary/30"
                )}
                style={{ height: `${(d.value / maxValue) * 100}%` }}
              />
              <span className="text-[10px] text-center text-muted-foreground">
                {getMonthName(d.month)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { TrendIcon, TrendBadge, InsightCard };
