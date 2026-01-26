import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  AnnualHistory,
  TrendData,
  TrendDirection,
  MonthComparison,
  LifeAreaComparison,
  HistoryInsight,
  GoalsMonthlySnapshot,
  HabitsMonthlySnapshot,
  MVDMonthlySnapshot,
  FinancesMonthlySnapshot,
} from '@/types/history';
import { mockAnnualHistory, getMonthName } from '@/data/historyMockData';

// ============================================
// CONTEXT TYPE
// ============================================

interface HistoryContextType {
  history: AnnualHistory;
  currentMonth: number;
  
  // Comparison functions
  getMonthComparison: (month?: number) => MonthComparison;
  getLifeAreaComparison: (lifeAreaId: string) => LifeAreaComparison | null;
  getLifeAreaTrends: () => LifeAreaComparison[];
  
  // Data retrieval
  getGoalsHistory: () => GoalsMonthlySnapshot[];
  getHabitsHistory: () => HabitsMonthlySnapshot[];
  getMVDHistory: () => MVDMonthlySnapshot[];
  getFinancesHistory: () => FinancesMonthlySnapshot[];
  
  // Insights
  insights: HistoryInsight[];
  
  // Trend calculation
  calculateTrend: (current: number, previous: number, metricName?: string) => TrendData;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateTrendDirection = (current: number, previous: number): TrendDirection => {
  const threshold = 2; // 2% threshold for "stable"
  const diff = current - previous;
  
  if (Math.abs(diff) < threshold) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

const calculateTrendPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.abs(Math.round(((current - previous) / previous) * 100));
};

const getTrendLabel = (direction: TrendDirection, percentage: number, metricName?: string): string => {
  const metric = metricName || 'value';
  
  switch (direction) {
    case 'up':
      return `+${percentage}% increase in ${metric}`;
    case 'down':
      return `-${percentage}% decrease in ${metric}`;
    case 'stable':
      return `${metric} remained stable`;
  }
};

// ============================================
// PROVIDER
// ============================================

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history] = useState<AnnualHistory>(mockAnnualHistory);
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Calculate trend data
  const calculateTrend = useCallback((current: number, previous: number, metricName?: string): TrendData => {
    const direction = calculateTrendDirection(current, previous);
    const percentage = calculateTrendPercentage(current, previous);
    const label = getTrendLabel(direction, percentage, metricName);
    
    return { direction, percentage, label };
  }, []);

  // Get month comparison
  const getMonthComparison = useCallback((month?: number): MonthComparison => {
    const targetMonth = month || currentMonth;
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    
    const currentGoals = history.goals.find(g => g.month === targetMonth);
    const previousGoals = history.goals.find(g => g.month === prevMonth);
    
    const currentHabits = history.habits.find(h => h.month === targetMonth);
    const previousHabits = history.habits.find(h => h.month === prevMonth);
    
    const currentMVD = history.mvd.find(m => m.month === targetMonth);
    const previousMVD = history.mvd.find(m => m.month === prevMonth);
    
    const currentFinances = history.finances.find(f => f.month === targetMonth);
    const previousFinances = history.finances.find(f => f.month === prevMonth);
    
    return {
      currentMonth: targetMonth,
      previousMonth: prevMonth,
      goals: {
        current: currentGoals?.averageProgress || 0,
        previous: previousGoals?.averageProgress || 0,
        trend: calculateTrend(
          currentGoals?.averageProgress || 0,
          previousGoals?.averageProgress || 0,
          'goals progress'
        ),
      },
      habits: {
        current: currentHabits?.consistencyRate || 0,
        previous: previousHabits?.consistencyRate || 0,
        trend: calculateTrend(
          currentHabits?.consistencyRate || 0,
          previousHabits?.consistencyRate || 0,
          'habit consistency'
        ),
      },
      mvd: {
        current: currentMVD?.completionRate || 0,
        previous: previousMVD?.completionRate || 0,
        trend: calculateTrend(
          currentMVD?.completionRate || 0,
          previousMVD?.completionRate || 0,
          'MVD completion'
        ),
      },
      finances: {
        savingsRate: {
          current: currentFinances?.savingsRate || 0,
          previous: previousFinances?.savingsRate || 0,
          trend: calculateTrend(
            currentFinances?.savingsRate || 0,
            previousFinances?.savingsRate || 0,
            'savings rate'
          ),
        },
        budgetAdherence: {
          current: currentFinances?.budgetAdherence || 0,
          previous: previousFinances?.budgetAdherence || 0,
          trend: calculateTrend(
            currentFinances?.budgetAdherence || 0,
            previousFinances?.budgetAdherence || 0,
            'budget adherence'
          ),
        },
      },
    };
  }, [history, currentMonth, calculateTrend]);

  // Get life area comparison
  const getLifeAreaComparison = useCallback((lifeAreaId: string): LifeAreaComparison | null => {
    const areaSnapshots = history.lifeAreas.filter(la => la.lifeAreaId === lifeAreaId);
    
    if (areaSnapshots.length === 0) return null;
    
    const firstSnapshot = areaSnapshots[0];
    const monthlyData = areaSnapshots
      .filter(s => s.month <= currentMonth)
      .map(s => ({
        month: s.month,
        goalsProgress: s.goalsProgress,
        habitsConsistency: s.habitsConsistency,
        overallScore: s.overallScore,
      }));
    
    // Calculate overall trend (first recorded month vs latest)
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    
    return {
      lifeAreaId,
      lifeAreaName: firstSnapshot.lifeAreaName,
      lifeAreaColor: firstSnapshot.lifeAreaColor,
      monthlyData,
      trend: calculateTrend(
        lastMonth?.overallScore || 0,
        firstMonth?.overallScore || 0,
        'overall score'
      ),
    };
  }, [history.lifeAreas, currentMonth, calculateTrend]);

  // Get all life area trends
  const getLifeAreaTrends = useCallback((): LifeAreaComparison[] => {
    const uniqueAreaIds = [...new Set(history.lifeAreas.map(la => la.lifeAreaId))];
    return uniqueAreaIds
      .map(id => getLifeAreaComparison(id))
      .filter((comparison): comparison is LifeAreaComparison => comparison !== null);
  }, [history.lifeAreas, getLifeAreaComparison]);

  // Data retrieval functions
  const getGoalsHistory = useCallback(() => 
    history.goals.filter(g => g.month <= currentMonth),
    [history.goals, currentMonth]
  );

  const getHabitsHistory = useCallback(() => 
    history.habits.filter(h => h.month <= currentMonth),
    [history.habits, currentMonth]
  );

  const getMVDHistory = useCallback(() => 
    history.mvd.filter(m => m.month <= currentMonth),
    [history.mvd, currentMonth]
  );

  const getFinancesHistory = useCallback(() => 
    history.finances.filter(f => f.month <= currentMonth),
    [history.finances, currentMonth]
  );

  // Generate insights
  const insights = useMemo((): HistoryInsight[] => {
    const result: HistoryInsight[] = [];
    const comparison = getMonthComparison();
    const lifeAreaTrends = getLifeAreaTrends();
    
    // ========================================
    // CONSISTENCY INSIGHTS (30-day pattern)
    // ========================================
    
    // Habits consistency change
    if (comparison.habits.trend.direction === 'up' && comparison.habits.trend.percentage >= 10) {
      result.push({
        id: 'consistency-up',
        type: 'achievement',
        module: 'habits',
        message: `Sua consistência aumentou ${comparison.habits.trend.percentage}% nos últimos 30 dias`,
        metric: 'consistencyRate',
        currentValue: comparison.habits.current,
        previousValue: comparison.habits.previous,
        trend: 'up',
      });
    } else if (comparison.habits.trend.direction === 'down' && comparison.habits.trend.percentage >= 5) {
      result.push({
        id: 'consistency-down',
        type: 'warning',
        module: 'habits',
        message: `Sua consistência caiu ${comparison.habits.trend.percentage}% - revise sua rotina`,
        metric: 'consistencyRate',
        currentValue: comparison.habits.current,
        previousValue: comparison.habits.previous,
        trend: 'down',
      });
    }
    
    // ========================================
    // MVD-FINANCE CORRELATION INSIGHTS
    // ========================================
    
    const currentMVD = history.mvd.find(m => m.month === currentMonth);
    const currentFinances = history.finances.find(f => f.month === currentMonth);
    const prevMVD = history.mvd.find(m => m.month === (currentMonth === 1 ? 12 : currentMonth - 1));
    const prevFinances = history.finances.find(f => f.month === (currentMonth === 1 ? 12 : currentMonth - 1));
    
    // Check if MVD completion correlates with better finances
    if (currentMVD && currentFinances && prevMVD && prevFinances) {
      const mvdImproved = currentMVD.completionRate > prevMVD.completionRate;
      const financesImproved = currentFinances.savingsRate > prevFinances.savingsRate || 
                               currentFinances.budgetAdherence > prevFinances.budgetAdherence;
      
      if (mvdImproved && financesImproved) {
        result.push({
          id: 'mvd-finance-correlation',
          type: 'improvement',
          module: 'mvd',
          message: 'Finanças melhoram quando MVD é concluído',
          metric: 'correlation',
          currentValue: currentMVD.completionRate,
          previousValue: prevMVD.completionRate,
          trend: 'up',
        });
      }
    }
    
    // High MVD completion achievement
    if (currentMVD && currentMVD.completionRate >= 90) {
      result.push({
        id: 'mvd-excellence',
        type: 'achievement',
        module: 'mvd',
        message: `Excelente! ${currentMVD.completionRate}% de conclusão do MVD este mês`,
        metric: 'completionRate',
        currentValue: currentMVD.completionRate,
        previousValue: prevMVD?.completionRate || 0,
        trend: comparison.mvd.trend.direction,
      });
    }
    
    // ========================================
    // LIFE AREA STAGNATION INSIGHTS
    // ========================================
    
    // Check for stagnant life areas (3+ weeks/months without significant change)
    lifeAreaTrends.forEach(area => {
      if (area.monthlyData.length >= 3) {
        const recentMonths = area.monthlyData.slice(-3);
        const scores = recentMonths.map(m => m.overallScore);
        const variance = Math.max(...scores) - Math.min(...scores);
        
        // If variance is less than 5% over 3 months, area is stagnant
        if (variance < 5) {
          result.push({
            id: `stagnant-${area.lifeAreaId}`,
            type: 'warning',
            module: 'lifeArea',
            message: `Área ${area.lifeAreaName} está estagnada há 3 semanas`,
            metric: 'overallScore',
            currentValue: scores[scores.length - 1],
            previousValue: scores[0],
            trend: 'stable',
            lifeAreaId: area.lifeAreaId,
          });
        }
      }
    });
    
    // ========================================
    // GOALS PROGRESS INSIGHTS
    // ========================================
    
    if (comparison.goals.trend.direction === 'up' && comparison.goals.trend.percentage >= 10) {
      result.push({
        id: 'goals-momentum',
        type: 'improvement',
        module: 'goals',
        message: `Suas metas avançaram ${comparison.goals.trend.percentage}% comparado a ${getMonthName(comparison.previousMonth)}`,
        metric: 'averageProgress',
        currentValue: comparison.goals.current,
        previousValue: comparison.goals.previous,
        trend: 'up',
      });
    } else if (comparison.goals.trend.direction === 'down' && comparison.goals.trend.percentage >= 5) {
      result.push({
        id: 'goals-slowdown',
        type: 'decline',
        module: 'goals',
        message: `Progresso das metas desacelerou ${comparison.goals.trend.percentage}% este mês`,
        metric: 'averageProgress',
        currentValue: comparison.goals.current,
        previousValue: comparison.goals.previous,
        trend: 'down',
      });
    }
    
    // ========================================
    // FINANCE INSIGHTS
    // ========================================
    
    if (currentFinances) {
      if (currentFinances.savingsRate >= 20) {
        result.push({
          id: 'savings-excellent',
          type: 'achievement',
          module: 'finances',
          message: `Você está economizando ${currentFinances.savingsRate}% da renda - excelente!`,
          metric: 'savingsRate',
          currentValue: currentFinances.savingsRate,
          previousValue: prevFinances?.savingsRate || 0,
          trend: 'up',
        });
      }
      
      if (comparison.finances.budgetAdherence.trend.direction === 'down' && 
          comparison.finances.budgetAdherence.trend.percentage >= 10) {
        result.push({
          id: 'budget-warning',
          type: 'warning',
          module: 'finances',
          message: `Aderência ao orçamento caiu para ${comparison.finances.budgetAdherence.current}% - revise gastos`,
          metric: 'budgetAdherence',
          currentValue: comparison.finances.budgetAdherence.current,
          previousValue: comparison.finances.budgetAdherence.previous,
          trend: 'down',
        });
      }
    }
    
    // ========================================
    // TOP PERFORMER & NEEDS ATTENTION
    // ========================================
    
    const topImprover = lifeAreaTrends
      .filter(la => la.trend.direction === 'up')
      .sort((a, b) => b.trend.percentage - a.trend.percentage)[0];
    
    const topDecliner = lifeAreaTrends
      .filter(la => la.trend.direction === 'down')
      .sort((a, b) => b.trend.percentage - a.trend.percentage)[0];
    
    if (topImprover && topImprover.trend.percentage >= 15) {
      result.push({
        id: 'lifearea-top',
        type: 'achievement',
        module: 'lifeArea',
        message: `${topImprover.lifeAreaName} é sua área com maior crescimento (+${topImprover.trend.percentage}%)`,
        metric: 'overallScore',
        currentValue: topImprover.monthlyData[topImprover.monthlyData.length - 1]?.overallScore || 0,
        previousValue: topImprover.monthlyData[0]?.overallScore || 0,
        trend: 'up',
        lifeAreaId: topImprover.lifeAreaId,
      });
    }
    
    if (topDecliner && topDecliner.trend.percentage >= 10) {
      result.push({
        id: 'lifearea-attention',
        type: 'warning',
        module: 'lifeArea',
        message: `${topDecliner.lifeAreaName} precisa de atenção (-${topDecliner.trend.percentage}% este ano)`,
        metric: 'overallScore',
        currentValue: topDecliner.monthlyData[topDecliner.monthlyData.length - 1]?.overallScore || 0,
        previousValue: topDecliner.monthlyData[0]?.overallScore || 0,
        trend: 'down',
        lifeAreaId: topDecliner.lifeAreaId,
      });
    }
    
    // ========================================
    // STREAK INSIGHTS
    // ========================================
    
    if (currentMVD && currentMVD.longestStreakInMonth >= 7) {
      result.push({
        id: 'streak-achievement',
        type: 'achievement',
        module: 'mvd',
        message: `Sua maior sequência este mês foi de ${currentMVD.longestStreakInMonth} dias!`,
        metric: 'longestStreakInMonth',
        currentValue: currentMVD.longestStreakInMonth,
        previousValue: prevMVD?.longestStreakInMonth || 0,
        trend: 'up',
      });
    }
    
    return result;
  }, [getMonthComparison, getLifeAreaTrends, history.mvd, history.finances, currentMonth]);

  const value: HistoryContextType = {
    history,
    currentMonth,
    getMonthComparison,
    getLifeAreaComparison,
    getLifeAreaTrends,
    getGoalsHistory,
    getHabitsHistory,
    getMVDHistory,
    getFinancesHistory,
    insights,
    calculateTrend,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
