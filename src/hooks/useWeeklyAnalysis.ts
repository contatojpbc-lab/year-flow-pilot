import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useRoutine } from '@/contexts/RoutineContext';

export interface WeeklyPerformance {
  weekNumber: number;
  mvdCompletionRate: number;
  habitsConsistency: number;
  goalsProgress: number;
  overallScore: number;
}

export interface ProductivityTrend {
  direction: 'improving' | 'declining' | 'stable';
  percentageChange: number;
  weeksCompared: number;
}

export interface WeeklyStrength {
  id: string;
  category: 'mvd' | 'habits' | 'goals';
  title: string;
  metric: string;
  score: number;
}

export interface WeeklyBottleneck {
  id: string;
  category: 'mvd' | 'habits' | 'goals';
  title: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface ImprovementInsight {
  id: string;
  type: 'pattern' | 'opportunity' | 'warning' | 'achievement';
  message: string;
  actionable: string;
  priority: number;
}

export interface WeeklyAnalysis {
  currentWeek: WeeklyPerformance;
  previousWeeks: WeeklyPerformance[];
  productivityTrend: ProductivityTrend;
  strengths: WeeklyStrength[];
  bottlenecks: WeeklyBottleneck[];
  insights: ImprovementInsight[];
  weekOverWeekComparison: {
    mvd: { current: number; previous: number; change: number };
    habits: { current: number; previous: number; change: number };
    goals: { current: number; previous: number; change: number };
  };
}

// Simulate historical weekly data (in real app, this would come from stored data)
const generateHistoricalWeeklyData = (currentWeek: number): WeeklyPerformance[] => {
  const weeks: WeeklyPerformance[] = [];
  
  // Generate last 8 weeks of data with some variance
  for (let i = 0; i < 8; i++) {
    const weekNum = currentWeek - i;
    if (weekNum < 1) break;
    
    // Add realistic variance - some good weeks, some bad
    const baseScore = 65 + Math.sin(i * 0.8) * 15;
    const mvdRate = Math.max(40, Math.min(100, baseScore + (Math.random() * 20 - 10)));
    const habitsRate = Math.max(35, Math.min(100, baseScore + (Math.random() * 25 - 12)));
    const goalsProgress = Math.max(0, Math.min(15, 5 + (Math.random() * 8 - 4)));
    
    weeks.push({
      weekNumber: weekNum,
      mvdCompletionRate: Math.round(mvdRate),
      habitsConsistency: Math.round(habitsRate),
      goalsProgress: Math.round(goalsProgress * 10) / 10,
      overallScore: Math.round((mvdRate * 0.4 + habitsRate * 0.4 + goalsProgress * 2) / 1),
    });
  }
  
  return weeks;
};

export function useWeeklyAnalysis(): WeeklyAnalysis {
  const { goals } = useGoals();
  const { completedItems, items, currentStreak } = useMVD();
  const { history } = useHistory();
  
  // Calculate current week number
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  const analysis = useMemo((): WeeklyAnalysis => {
    // Generate historical data
    const historicalWeeks = generateHistoricalWeeklyData(currentWeekNumber);
    
    // Current week performance (simulated based on current state)
    const mvdCompletionRate = items.length > 0 
      ? Math.round((completedItems.length / items.length) * 100)
      : 0;
    
    // Simulate this week's habits consistency
    const thisWeekHabits = 72 + Math.floor(Math.random() * 15);
    
    // Average goals progress
    const avgGoalsProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;
    
    const currentWeek: WeeklyPerformance = {
      weekNumber: currentWeekNumber,
      mvdCompletionRate,
      habitsConsistency: thisWeekHabits,
      goalsProgress: avgGoalsProgress,
      overallScore: Math.round((mvdCompletionRate * 0.35 + thisWeekHabits * 0.35 + avgGoalsProgress * 0.3)),
    };

    // Previous week for comparison
    const previousWeek = historicalWeeks[1] || historicalWeeks[0];
    
    // Calculate productivity trend (last 4 weeks average vs previous 4 weeks)
    const recent4Weeks = historicalWeeks.slice(0, 4);
    const older4Weeks = historicalWeeks.slice(4, 8);
    
    const recentAvg = recent4Weeks.length > 0
      ? recent4Weeks.reduce((acc, w) => acc + w.overallScore, 0) / recent4Weeks.length
      : currentWeek.overallScore;
    
    const olderAvg = older4Weeks.length > 0
      ? older4Weeks.reduce((acc, w) => acc + w.overallScore, 0) / older4Weeks.length
      : recentAvg;
    
    const trendChange = recentAvg - olderAvg;
    
    const productivityTrend: ProductivityTrend = {
      direction: trendChange > 3 ? 'improving' : trendChange < -3 ? 'declining' : 'stable',
      percentageChange: Math.round(Math.abs(trendChange)),
      weeksCompared: Math.min(8, historicalWeeks.length),
    };

    // Identify strengths
    const strengths: WeeklyStrength[] = [];
    
    if (currentStreak >= 7) {
      strengths.push({
        id: 'streak-strength',
        category: 'mvd',
        title: 'Streak de MVD',
        metric: `${currentStreak} dias consecutivos`,
        score: Math.min(100, currentStreak * 10),
      });
    }
    
    if (thisWeekHabits >= 75) {
      strengths.push({
        id: 'habits-strength',
        category: 'habits',
        title: 'Consistência de Hábitos',
        metric: `${thisWeekHabits}% esta semana`,
        score: thisWeekHabits,
      });
    }
    
    const highProgressGoals = goals.filter(g => g.progress >= 50);
    if (highProgressGoals.length > 0) {
      strengths.push({
        id: 'goals-strength',
        category: 'goals',
        title: 'Metas em Progresso',
        metric: `${highProgressGoals.length} meta(s) > 50%`,
        score: Math.round(highProgressGoals.reduce((acc, g) => acc + g.progress, 0) / highProgressGoals.length),
      });
    }

    // Find best performing habit
    const bestHabit = mockRoutineItems.reduce((best, habit) => {
      const simScore = 70 + Math.random() * 30;
      if (!best || simScore > best.score) {
        return { habit, score: simScore };
      }
      return best;
    }, null as { habit: typeof mockRoutineItems[0]; score: number } | null);
    
    if (bestHabit && bestHabit.score >= 80) {
      strengths.push({
        id: 'top-habit',
        category: 'habits',
        title: bestHabit.habit.title,
        metric: `${Math.round(bestHabit.score)}% de consistência`,
        score: Math.round(bestHabit.score),
      });
    }

    // Identify bottlenecks
    const bottlenecks: WeeklyBottleneck[] = [];
    
    // Check for MVD issues
    if (mvdCompletionRate < 60) {
      bottlenecks.push({
        id: 'mvd-bottleneck',
        category: 'mvd',
        title: 'MVD Incompleto',
        issue: `Taxa de ${mvdCompletionRate}% está abaixo do ideal`,
        severity: mvdCompletionRate < 40 ? 'high' : 'medium',
        suggestion: 'Foque em completar pelo menos 3 itens do MVD por dia',
      });
    }
    
    // Check for declining habits
    if (previousWeek && thisWeekHabits < previousWeek.habitsConsistency - 10) {
      bottlenecks.push({
        id: 'habits-decline',
        category: 'habits',
        title: 'Queda nos Hábitos',
        issue: `Redução de ${previousWeek.habitsConsistency - thisWeekHabits}% vs semana anterior`,
        severity: 'medium',
        suggestion: 'Revise sua rotina e identifique bloqueios',
      });
    }
    
    // Check for stagnant goals
    const stagnantGoals = goals.filter(g => g.progress < 20);
    if (stagnantGoals.length > 0) {
      bottlenecks.push({
        id: 'stagnant-goals',
        category: 'goals',
        title: 'Metas Estagnadas',
        issue: `${stagnantGoals.length} meta(s) com menos de 20% de progresso`,
        severity: stagnantGoals.length > 1 ? 'high' : 'low',
        suggestion: `Priorize "${stagnantGoals[0]?.title}" esta semana`,
      });
    }

    // Check for missing habits
    const lowHabit = mockRoutineItems.find(() => Math.random() < 0.3);
    if (lowHabit) {
      bottlenecks.push({
        id: 'low-habit',
        category: 'habits',
        title: lowHabit.title,
        issue: 'Baixa aderência nesta semana',
        severity: 'low',
        suggestion: `Agende um horário fixo para "${lowHabit.title}"`,
      });
    }

    // Generate improvement insights
    const insights: ImprovementInsight[] = [];
    
    // Trend-based insights
    if (productivityTrend.direction === 'declining') {
      insights.push({
        id: 'declining-trend',
        type: 'warning',
        message: `Sua produtividade caiu ${productivityTrend.percentageChange}% nas últimas semanas`,
        actionable: 'Revise sua carga de tarefas e considere simplificar suas prioridades',
        priority: 1,
      });
    } else if (productivityTrend.direction === 'improving') {
      insights.push({
        id: 'improving-trend',
        type: 'achievement',
        message: `Excelente! Produtividade cresceu ${productivityTrend.percentageChange}% recentemente`,
        actionable: 'Mantenha o ritmo e considere adicionar novos desafios gradualmente',
        priority: 3,
      });
    }
    
    // Pattern detection
    if (currentStreak >= 5) {
      insights.push({
        id: 'streak-pattern',
        type: 'pattern',
        message: `Você está em um streak de ${currentStreak} dias - seu melhor período recente`,
        actionable: 'Identifique o que está funcionando e replique para outras áreas',
        priority: 2,
      });
    }
    
    // Opportunity insights
    const weekdayBias = Math.random() > 0.5;
    if (weekdayBias) {
      insights.push({
        id: 'weekday-opportunity',
        type: 'opportunity',
        message: 'Seu desempenho é melhor no início da semana',
        actionable: 'Agende tarefas importantes para segunda e terça-feira',
        priority: 4,
      });
    }
    
    // Goals velocity insight
    const avgProgress = goals.length > 0
      ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length
      : 0;
    
    const monthProgress = ((now.getMonth() + 1) / 12) * 100;
    
    if (avgProgress < monthProgress - 15) {
      insights.push({
        id: 'velocity-warning',
        type: 'warning',
        message: `Progresso das metas (${Math.round(avgProgress)}%) está atrás do calendário (${Math.round(monthProgress)}%)`,
        actionable: 'Considere revisar prazos ou aumentar dedicação semanal',
        priority: 1,
      });
    } else if (avgProgress >= monthProgress) {
      insights.push({
        id: 'velocity-achievement',
        type: 'achievement',
        message: 'Você está no ritmo certo para cumprir suas metas anuais',
        actionable: 'Continue consistente e celebre pequenas vitórias',
        priority: 5,
      });
    }

    // Week over week comparison
    const weekOverWeekComparison = {
      mvd: {
        current: mvdCompletionRate,
        previous: previousWeek?.mvdCompletionRate || 0,
        change: mvdCompletionRate - (previousWeek?.mvdCompletionRate || 0),
      },
      habits: {
        current: thisWeekHabits,
        previous: previousWeek?.habitsConsistency || 0,
        change: thisWeekHabits - (previousWeek?.habitsConsistency || 0),
      },
      goals: {
        current: avgGoalsProgress,
        previous: previousWeek?.goalsProgress || 0,
        change: Math.round((avgGoalsProgress - (previousWeek?.goalsProgress || 0)) * 10) / 10,
      },
    };

    return {
      currentWeek,
      previousWeeks: historicalWeeks,
      productivityTrend,
      strengths: strengths.slice(0, 4),
      bottlenecks: bottlenecks.slice(0, 4),
      insights: insights.sort((a, b) => a.priority - b.priority).slice(0, 5),
      weekOverWeekComparison,
    };
  }, [goals, completedItems, items, currentStreak, currentWeekNumber, history]);

  return analysis;
}
