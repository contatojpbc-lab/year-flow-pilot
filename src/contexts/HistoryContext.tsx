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
    
    // Goals insights
    if (comparison.goals.trend.direction === 'up' && comparison.goals.trend.percentage >= 10) {
      result.push({
        id: 'goals-up',
        type: 'improvement',
        module: 'goals',
        message: `Great progress! Goals advanced ${comparison.goals.trend.percentage}% compared to ${getMonthName(comparison.previousMonth)}`,
        metric: 'averageProgress',
        currentValue: comparison.goals.current,
        previousValue: comparison.goals.previous,
        trend: 'up',
      });
    } else if (comparison.goals.trend.direction === 'down') {
      result.push({
        id: 'goals-down',
        type: 'decline',
        module: 'goals',
        message: `Goals progress slowed by ${comparison.goals.trend.percentage}% this month`,
        metric: 'averageProgress',
        currentValue: comparison.goals.current,
        previousValue: comparison.goals.previous,
        trend: 'down',
      });
    }
    
    // Habits insights
    if (comparison.habits.trend.direction === 'up') {
      result.push({
        id: 'habits-up',
        type: 'improvement',
        module: 'habits',
        message: `Habit consistency improved ${comparison.habits.trend.percentage}% from last month`,
        metric: 'consistencyRate',
        currentValue: comparison.habits.current,
        previousValue: comparison.habits.previous,
        trend: 'up',
      });
    } else if (comparison.habits.trend.direction === 'down') {
      result.push({
        id: 'habits-down',
        type: 'warning',
        module: 'habits',
        message: `Habit consistency dropped ${comparison.habits.trend.percentage}% - consider reviewing your routine`,
        metric: 'consistencyRate',
        currentValue: comparison.habits.current,
        previousValue: comparison.habits.previous,
        trend: 'down',
      });
    }
    
    // MVD insights
    if (comparison.mvd.current >= 90) {
      result.push({
        id: 'mvd-achievement',
        type: 'achievement',
        module: 'mvd',
        message: `Excellent! ${comparison.mvd.current}% MVD completion rate this month`,
        metric: 'completionRate',
        currentValue: comparison.mvd.current,
        previousValue: comparison.mvd.previous,
        trend: comparison.mvd.trend.direction,
      });
    } else if (comparison.mvd.trend.direction === 'down' && comparison.mvd.trend.percentage >= 10) {
      result.push({
        id: 'mvd-down',
        type: 'warning',
        module: 'mvd',
        message: `MVD completion dropped ${comparison.mvd.trend.percentage}% - refocus on your non-negotiables`,
        metric: 'completionRate',
        currentValue: comparison.mvd.current,
        previousValue: comparison.mvd.previous,
        trend: 'down',
      });
    }
    
    // Finance insights
    if (comparison.finances.savingsRate.current > comparison.finances.savingsRate.previous) {
      result.push({
        id: 'savings-up',
        type: 'improvement',
        module: 'finances',
        message: `Savings rate increased to ${comparison.finances.savingsRate.current}% (+${comparison.finances.savingsRate.trend.percentage}%)`,
        metric: 'savingsRate',
        currentValue: comparison.finances.savingsRate.current,
        previousValue: comparison.finances.savingsRate.previous,
        trend: 'up',
      });
    }
    
    if (comparison.finances.budgetAdherence.trend.direction === 'down') {
      result.push({
        id: 'budget-down',
        type: 'warning',
        module: 'finances',
        message: `Budget adherence dropped to ${comparison.finances.budgetAdherence.current}% - review spending patterns`,
        metric: 'budgetAdherence',
        currentValue: comparison.finances.budgetAdherence.current,
        previousValue: comparison.finances.budgetAdherence.previous,
        trend: 'down',
      });
    }
    
    // Life area insights
    const lifeAreaTrends = getLifeAreaTrends();
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
        message: `${topImprover.lifeAreaName} is your fastest growing area (+${topImprover.trend.percentage}%)`,
        metric: 'overallScore',
        currentValue: topImprover.monthlyData[topImprover.monthlyData.length - 1]?.overallScore || 0,
        previousValue: topImprover.monthlyData[0]?.overallScore || 0,
        trend: 'up',
        lifeAreaId: topImprover.lifeAreaId,
      });
    }
    
    if (topDecliner && topDecliner.trend.percentage >= 10) {
      result.push({
        id: 'lifearea-declining',
        type: 'warning',
        module: 'lifeArea',
        message: `${topDecliner.lifeAreaName} needs attention (-${topDecliner.trend.percentage}% this year)`,
        metric: 'overallScore',
        currentValue: topDecliner.monthlyData[topDecliner.monthlyData.length - 1]?.overallScore || 0,
        previousValue: topDecliner.monthlyData[0]?.overallScore || 0,
        trend: 'down',
        lifeAreaId: topDecliner.lifeAreaId,
      });
    }
    
    return result;
  }, [getMonthComparison, getLifeAreaTrends]);

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
