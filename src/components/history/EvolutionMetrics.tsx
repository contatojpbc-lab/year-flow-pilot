/**
 * Evolution Metrics Component
 * Displays key metrics based on historical data:
 * - Consistency (7, 30, 90 days)
 * - Life area evolution percentages
 * - MVD completion rates
 * - Routine-to-goals correlation
 */

import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CalendarDays, 
  Target, 
  Flame, 
  CheckCircle2,
  ArrowUpRight,
  Activity,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useHistory } from "@/contexts/HistoryContext";
import { cn } from "@/lib/utils";

// ============================================
// CONSISTENCY METRICS (7, 30, 90 days)
// ============================================

interface ConsistencyMetric {
  period: string;
  days: number;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export const ConsistencyMetricsCard = () => {
  const { getHabitsHistory, getMVDHistory, currentMonth } = useHistory();
  
  const metrics = useMemo((): ConsistencyMetric[] => {
    const habitsHistory = getHabitsHistory();
    const mvdHistory = getMVDHistory();
    
    // Simulate 7, 30, 90 day windows using monthly data
    // In a real app, this would use daily granularity
    const currentMonthData = habitsHistory.find(h => h.month === currentMonth);
    const prevMonthData = habitsHistory.find(h => h.month === currentMonth - 1);
    const threeMonthsAgoData = habitsHistory.find(h => h.month === currentMonth - 3);
    
    const currentRate = currentMonthData?.consistencyRate || 0;
    const prevRate = prevMonthData?.consistencyRate || 0;
    const threeMonthRate = threeMonthsAgoData?.consistencyRate || 0;
    
    // Calculate trends
    const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
      const diff = current - previous;
      if (Math.abs(diff) < 3) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };
    
    // 7-day simulated from current month (last week approximation)
    const sevenDayRate = Math.min(currentRate + Math.floor(Math.random() * 5), 100);
    // 30-day is current month
    const thirtyDayRate = currentRate;
    // 90-day is average of last 3 months
    const ninetyDayRate = Math.round(
      (currentRate + prevRate + threeMonthRate) / 3
    );
    
    return [
      {
        period: '7 dias',
        days: 7,
        value: sevenDayRate,
        trend: calculateTrend(sevenDayRate, thirtyDayRate),
        change: sevenDayRate - thirtyDayRate,
      },
      {
        period: '30 dias',
        days: 30,
        value: thirtyDayRate,
        trend: calculateTrend(thirtyDayRate, prevRate),
        change: thirtyDayRate - prevRate,
      },
      {
        period: '90 dias',
        days: 90,
        value: ninetyDayRate,
        trend: calculateTrend(ninetyDayRate, threeMonthRate),
        change: ninetyDayRate - threeMonthRate,
      },
    ];
  }, [getHabitsHistory, getMVDHistory, currentMonth]);
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-destructive" />;
      case 'stable': return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Consistência</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.period} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{metric.value}%</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 gap-1",
                    metric.trend === 'up' && "bg-success/10 text-success",
                    metric.trend === 'down' && "bg-destructive/10 text-destructive",
                    metric.trend === 'stable' && "bg-secondary text-muted-foreground"
                  )}
                >
                  {getTrendIcon(metric.trend)}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={metric.value} 
              size="sm"
              indicatorColor={metric.value >= 80 ? "success" : metric.value >= 60 ? "default" : "warning"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================
// LIFE AREA EVOLUTION
// ============================================

interface LifeAreaEvolution {
  id: string;
  name: string;
  color: string;
  currentScore: number;
  initialScore: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

export const LifeAreaEvolutionCard = () => {
  const { getLifeAreaTrends } = useHistory();
  
  const evolution = useMemo((): LifeAreaEvolution[] => {
    const trends = getLifeAreaTrends();
    
    return trends.map(area => {
      const first = area.monthlyData[0];
      const last = area.monthlyData[area.monthlyData.length - 1];
      const initial = first?.overallScore || 0;
      const current = last?.overallScore || 0;
      const change = initial === 0 ? current : Math.round(((current - initial) / initial) * 100);
      
      return {
        id: area.lifeAreaId,
        name: area.lifeAreaName,
        color: area.lifeAreaColor,
        currentScore: current,
        initialScore: initial,
        percentageChange: change,
        trend: area.trend.direction,
      };
    }).sort((a, b) => b.percentageChange - a.percentageChange);
  }, [getLifeAreaTrends]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Evolução por Área da Vida</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {evolution.map((area) => (
          <div key={area.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                <span className="text-sm text-foreground">{area.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{area.currentScore}%</span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 gap-0.5",
                    area.percentageChange > 0 && "bg-success/10 text-success",
                    area.percentageChange < 0 && "bg-destructive/10 text-destructive",
                    area.percentageChange === 0 && "bg-secondary text-muted-foreground"
                  )}
                >
                  {area.trend === 'up' ? <ArrowUpRight className="h-2.5 w-2.5" /> : null}
                  {area.percentageChange > 0 ? '+' : ''}{area.percentageChange}%
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 h-1.5">
              <div 
                className="rounded-full transition-all"
                style={{ 
                  width: `${area.initialScore}%`, 
                  backgroundColor: `${area.color}40`
                }}
              />
              <div 
                className="rounded-full transition-all"
                style={{ 
                  width: `${Math.max(area.currentScore - area.initialScore, 0)}%`,
                  backgroundColor: area.color
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================
// MVD COMPLETION METRICS
// ============================================

export const MVDCompletionMetricsCard = () => {
  const { getMVDHistory, currentMonth } = useHistory();
  
  const metrics = useMemo(() => {
    const mvdHistory = getMVDHistory();
    const currentData = mvdHistory.find(m => m.month === currentMonth);
    const prevData = mvdHistory.find(m => m.month === currentMonth - 1);
    
    // Calculate year average
    const yearAverage = mvdHistory.length > 0
      ? Math.round(mvdHistory.reduce((acc, m) => acc + m.completionRate, 0) / mvdHistory.length)
      : 0;
    
    // Calculate best month
    const bestMonth = mvdHistory.reduce((best, m) => 
      m.completionRate > (best?.completionRate || 0) ? m : best, 
      mvdHistory[0]
    );
    
    return {
      currentRate: currentData?.completionRate || 0,
      previousRate: prevData?.completionRate || 0,
      yearAverage,
      bestMonth: bestMonth?.month || 1,
      bestRate: bestMonth?.completionRate || 0,
      daysCompleted: currentData?.daysCompleted || 0,
      totalDays: currentData?.totalDays || 31,
      longestStreak: currentData?.longestStreakInMonth || 0,
    };
  }, [getMVDHistory, currentMonth]);
  
  const trend = metrics.currentRate > metrics.previousRate ? 'up' : 
                metrics.currentRate < metrics.previousRate ? 'down' : 'stable';
  const change = metrics.currentRate - metrics.previousRate;

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <CardTitle className="text-sm font-medium">Taxa de Conclusão MVD</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Rate */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-foreground">
                {metrics.currentRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.daysCompleted} de {metrics.totalDays} dias
              </p>
            </div>
            <Badge 
              variant="secondary"
              className={cn(
                "gap-1",
                trend === 'up' && "bg-success/10 text-success",
                trend === 'down' && "bg-destructive/10 text-destructive",
                trend === 'stable' && "bg-secondary text-muted-foreground"
              )}
            >
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend === 'stable' && <Minus className="h-3 w-3" />}
              {change > 0 ? '+' : ''}{change}% vs mês anterior
            </Badge>
          </div>
          
          <Progress value={metrics.currentRate} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{metrics.yearAverage}%</p>
              <p className="text-[10px] text-muted-foreground">Média anual</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{metrics.longestStreak}</p>
              <p className="text-[10px] text-muted-foreground">Maior sequência</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-success">{getMonthName(metrics.bestMonth)}</p>
              <p className="text-[10px] text-muted-foreground">Melhor mês ({metrics.bestRate}%)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// ROUTINE-GOALS CORRELATION
// ============================================

export const RoutineGoalsCorrelationCard = () => {
  const { getHabitsHistory, getGoalsHistory, currentMonth } = useHistory();
  
  const correlation = useMemo(() => {
    const habitsHistory = getHabitsHistory();
    const goalsHistory = getGoalsHistory();
    
    // Calculate correlation between habit consistency and goal progress
    const monthlyPairs = habitsHistory.map(h => {
      const goalData = goalsHistory.find(g => g.month === h.month);
      return {
        month: h.month,
        habitRate: h.consistencyRate,
        goalProgress: goalData?.averageProgress || 0,
      };
    });
    
    // Simple correlation calculation (normalized)
    const n = monthlyPairs.length;
    if (n < 2) return { coefficient: 0, interpretation: 'Dados insuficientes', pairs: [] };
    
    const sumH = monthlyPairs.reduce((a, p) => a + p.habitRate, 0);
    const sumG = monthlyPairs.reduce((a, p) => a + p.goalProgress, 0);
    const sumHG = monthlyPairs.reduce((a, p) => a + (p.habitRate * p.goalProgress), 0);
    const sumH2 = monthlyPairs.reduce((a, p) => a + (p.habitRate * p.habitRate), 0);
    const sumG2 = monthlyPairs.reduce((a, p) => a + (p.goalProgress * p.goalProgress), 0);
    
    const numerator = (n * sumHG) - (sumH * sumG);
    const denominator = Math.sqrt(((n * sumH2) - (sumH * sumH)) * ((n * sumG2) - (sumG * sumG)));
    
    const coefficient = denominator === 0 ? 0 : numerator / denominator;
    
    // Interpret correlation
    let interpretation = '';
    let strength = '';
    if (coefficient >= 0.7) {
      interpretation = 'Rotina consistente = mais metas concluídas';
      strength = 'strong';
    } else if (coefficient >= 0.4) {
      interpretation = 'Correlação moderada entre rotina e metas';
      strength = 'moderate';
    } else if (coefficient >= 0.2) {
      interpretation = 'Correlação fraca identificada';
      strength = 'weak';
    } else {
      interpretation = 'Sem correlação significativa';
      strength = 'none';
    }
    
    return {
      coefficient: Math.round(coefficient * 100) / 100,
      interpretation,
      strength,
      pairs: monthlyPairs.slice(-3), // Last 3 months
    };
  }, [getHabitsHistory, getGoalsHistory, currentMonth]);

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Rotina × Metas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Correlation Score */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {(correlation.coefficient * 100).toFixed(0)}%
                </span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    correlation.strength === 'strong' && "bg-success/10 text-success",
                    correlation.strength === 'moderate' && "bg-primary/10 text-primary",
                    correlation.strength === 'weak' && "bg-warning/10 text-warning",
                    correlation.strength === 'none' && "bg-secondary text-muted-foreground"
                  )}
                >
                  {correlation.strength === 'strong' && 'Forte'}
                  {correlation.strength === 'moderate' && 'Moderada'}
                  {correlation.strength === 'weak' && 'Fraca'}
                  {correlation.strength === 'none' && 'Baixa'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                correlação
              </p>
            </div>
            <Flame className={cn(
              "h-8 w-8",
              correlation.strength === 'strong' && "text-success",
              correlation.strength === 'moderate' && "text-primary",
              correlation.strength === 'weak' && "text-warning",
              correlation.strength === 'none' && "text-muted-foreground"
            )} />
          </div>
          
          {/* Interpretation */}
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-sm text-foreground">
              {correlation.interpretation}
            </p>
          </div>
          
          {/* Recent Months Comparison */}
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Últimos meses</p>
            {correlation.pairs.map((pair) => (
              <div key={pair.month} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{getMonthName(pair.month)}</span>
                <div className="flex items-center gap-4">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Rotina:</span> {pair.habitRate}%
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Metas:</span> {pair.goalProgress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// COMBINED EVOLUTION METRICS PANEL
// ============================================

interface EvolutionMetricsPanelProps {
  layout?: 'grid' | 'stack';
  showConsistency?: boolean;
  showLifeAreas?: boolean;
  showMVD?: boolean;
  showCorrelation?: boolean;
}

export const EvolutionMetricsPanel = ({
  layout = 'grid',
  showConsistency = true,
  showLifeAreas = true,
  showMVD = true,
  showCorrelation = true,
}: EvolutionMetricsPanelProps) => {
  return (
    <div className={cn(
      layout === 'grid' 
        ? "grid gap-4 md:grid-cols-2" 
        : "space-y-4"
    )}>
      {showConsistency && <ConsistencyMetricsCard />}
      {showMVD && <MVDCompletionMetricsCard />}
      {showLifeAreas && <LifeAreaEvolutionCard />}
      {showCorrelation && <RoutineGoalsCorrelationCard />}
    </div>
  );
};

export default EvolutionMetricsPanel;
