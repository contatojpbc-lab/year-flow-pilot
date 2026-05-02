import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
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
  LifeAreaMonthlySnapshot,
} from '@/types/history';
import { getMonthName } from '@/data/historyMockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HistoryContextType {
  history: AnnualHistory;
  currentMonth: number;
  loading: boolean;
  refresh: () => Promise<void>;
  getMonthComparison: (month?: number) => MonthComparison;
  getLifeAreaComparison: (lifeAreaId: string) => LifeAreaComparison | null;
  getLifeAreaTrends: () => LifeAreaComparison[];
  getGoalsHistory: () => GoalsMonthlySnapshot[];
  getHabitsHistory: () => HabitsMonthlySnapshot[];
  getMVDHistory: () => MVDMonthlySnapshot[];
  getFinancesHistory: () => FinancesMonthlySnapshot[];
  insights: HistoryInsight[];
  calculateTrend: (current: number, previous: number, metricName?: string) => TrendData;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

const calculateTrendDirection = (current: number, previous: number): TrendDirection => {
  const threshold = 2;
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
    case 'up':    return `+${percentage}% increase in ${metric}`;
    case 'down':  return `-${percentage}% decrease in ${metric}`;
    case 'stable':return `${metric} remained stable`;
  }
};

function emptyHistory(userId: string, year: number): AnnualHistory {
  return {
    userId,
    year,
    goals: [],
    habits: [],
    mvd: [],
    finances: [],
    lifeAreas: [],
    lastUpdated: new Date(),
  };
}

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [history, setHistory] = useState<AnnualHistory>(() => emptyHistory('', currentYear));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setHistory(emptyHistory('', currentYear));
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('monthly_snapshots')
      .select('*')
      .eq('year', currentYear)
      .order('month', { ascending: true });

    if (error || !data) {
      setHistory(emptyHistory(user.id, currentYear));
      setLoading(false);
      return;
    }

    const goals: GoalsMonthlySnapshot[] = [];
    const habits: HabitsMonthlySnapshot[] = [];
    const mvd: MVDMonthlySnapshot[] = [];
    const finances: FinancesMonthlySnapshot[] = [];
    const lifeAreas: LifeAreaMonthlySnapshot[] = [];

    data.forEach((row: any) => {
      goals.push({
        month: row.month,
        year: row.year,
        averageProgress: Number(row.goals_average_progress),
        goalsCompleted: row.goals_completed_count,
        goalsActive: row.goals_active_count,
        byLifeArea: {},
      });
      habits.push({
        month: row.month,
        year: row.year,
        totalCompletions: row.habits_total_completed,
        possibleCompletions: 0,
        consistencyRate: Number(row.habits_consistency_rate),
        topHabits: [],
        bottomHabits: [],
      });
      mvd.push({
        month: row.month,
        year: row.year,
        daysCompleted: row.mvd_completed_days,
        totalDays: 30,
        completionRate: Number(row.mvd_completion_rate),
        averageStreak: 0,
        longestStreakInMonth: row.mvd_longest_streak,
      });
      finances.push({
        month: row.month,
        year: row.year,
        plannedIncome: 0,
        actualIncome: 0,
        plannedExpenses: 0,
        actualExpenses: Number(row.finances_total_spent),
        savingsRate: Number(row.finances_savings_rate),
        budgetAdherence: Number(row.finances_budget_adherence),
        byCategory: {},
        financialGoalsProgress: 0,
      });
      const breakdown = (row.life_areas_breakdown as any[]) ?? [];
      breakdown.forEach(la => {
        lifeAreas.push({
          month: row.month,
          year: row.year,
          lifeAreaId: la.lifeAreaId,
          lifeAreaName: la.name ?? '',
          lifeAreaColor: la.color ?? 'hsl(var(--primary))',
          goalsProgress: Number(la.goalsProgress ?? 0),
          habitsConsistency: Number(la.habitsConsistency ?? 0),
          overallScore: Number(la.overallScore ?? 0),
        });
      });
    });

    setHistory({
      userId: user.id,
      year: currentYear,
      goals, habits, mvd, finances, lifeAreas,
      lastUpdated: new Date(),
    });
    setLoading(false);
  }, [user, currentYear]);

  useEffect(() => { refresh(); }, [refresh]);

  const calculateTrend = useCallback((current: number, previous: number, metricName?: string): TrendData => {
    const direction = calculateTrendDirection(current, previous);
    const percentage = calculateTrendPercentage(current, previous);
    const label = getTrendLabel(direction, percentage, metricName);
    return { direction, percentage, label };
  }, []);

  const getMonthComparison = useCallback((month?: number): MonthComparison => {
    const targetMonth = month || currentMonth;
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const cg = history.goals.find(g => g.month === targetMonth);
    const pg = history.goals.find(g => g.month === prevMonth);
    const ch = history.habits.find(h => h.month === targetMonth);
    const ph = history.habits.find(h => h.month === prevMonth);
    const cm = history.mvd.find(m => m.month === targetMonth);
    const pm = history.mvd.find(m => m.month === prevMonth);
    const cf = history.finances.find(f => f.month === targetMonth);
    const pf = history.finances.find(f => f.month === prevMonth);

    return {
      currentMonth: targetMonth,
      previousMonth: prevMonth,
      goals: {
        current: cg?.averageProgress || 0,
        previous: pg?.averageProgress || 0,
        trend: calculateTrend(cg?.averageProgress || 0, pg?.averageProgress || 0, 'goals progress'),
      },
      habits: {
        current: ch?.consistencyRate || 0,
        previous: ph?.consistencyRate || 0,
        trend: calculateTrend(ch?.consistencyRate || 0, ph?.consistencyRate || 0, 'habit consistency'),
      },
      mvd: {
        current: cm?.completionRate || 0,
        previous: pm?.completionRate || 0,
        trend: calculateTrend(cm?.completionRate || 0, pm?.completionRate || 0, 'MVD completion'),
      },
      finances: {
        savingsRate: {
          current: cf?.savingsRate || 0,
          previous: pf?.savingsRate || 0,
          trend: calculateTrend(cf?.savingsRate || 0, pf?.savingsRate || 0, 'savings rate'),
        },
        budgetAdherence: {
          current: cf?.budgetAdherence || 0,
          previous: pf?.budgetAdherence || 0,
          trend: calculateTrend(cf?.budgetAdherence || 0, pf?.budgetAdherence || 0, 'budget adherence'),
        },
      },
    };
  }, [history, currentMonth, calculateTrend]);

  const getLifeAreaComparison = useCallback((lifeAreaId: string): LifeAreaComparison | null => {
    const snaps = history.lifeAreas.filter(la => la.lifeAreaId === lifeAreaId);
    if (snaps.length === 0) return null;
    const first = snaps[0];
    const monthly = snaps
      .filter(s => s.month <= currentMonth)
      .map(s => ({ month: s.month, goalsProgress: s.goalsProgress, habitsConsistency: s.habitsConsistency, overallScore: s.overallScore }));
    const f = monthly[0];
    const l = monthly[monthly.length - 1];
    return {
      lifeAreaId,
      lifeAreaName: first.lifeAreaName,
      lifeAreaColor: first.lifeAreaColor,
      monthlyData: monthly,
      trend: calculateTrend(l?.overallScore || 0, f?.overallScore || 0, 'overall score'),
    };
  }, [history.lifeAreas, currentMonth, calculateTrend]);

  const getLifeAreaTrends = useCallback((): LifeAreaComparison[] => {
    const ids = [...new Set(history.lifeAreas.map(la => la.lifeAreaId))];
    return ids.map(id => getLifeAreaComparison(id)).filter((c): c is LifeAreaComparison => c !== null);
  }, [history.lifeAreas, getLifeAreaComparison]);

  const getGoalsHistory = useCallback(() => history.goals.filter(g => g.month <= currentMonth), [history.goals, currentMonth]);
  const getHabitsHistory = useCallback(() => history.habits.filter(h => h.month <= currentMonth), [history.habits, currentMonth]);
  const getMVDHistory = useCallback(() => history.mvd.filter(m => m.month <= currentMonth), [history.mvd, currentMonth]);
  const getFinancesHistory = useCallback(() => history.finances.filter(f => f.month <= currentMonth), [history.finances, currentMonth]);

  const insights = useMemo((): HistoryInsight[] => {
    if (history.goals.length === 0 && history.habits.length === 0 && history.mvd.length === 0 && history.finances.length === 0) {
      return [];
    }
    const result: HistoryInsight[] = [];
    const comparison = getMonthComparison();
    const lifeAreaTrends = getLifeAreaTrends();

    if (comparison.habits.trend.direction === 'up' && comparison.habits.trend.percentage >= 10) {
      result.push({ id: 'consistency-up', type: 'achievement', module: 'habits',
        message: `Sua consistência aumentou ${comparison.habits.trend.percentage}% nos últimos 30 dias`,
        metric: 'consistencyRate', currentValue: comparison.habits.current, previousValue: comparison.habits.previous, trend: 'up' });
    } else if (comparison.habits.trend.direction === 'down' && comparison.habits.trend.percentage >= 5) {
      result.push({ id: 'consistency-down', type: 'warning', module: 'habits',
        message: `Sua consistência caiu ${comparison.habits.trend.percentage}% - revise sua rotina`,
        metric: 'consistencyRate', currentValue: comparison.habits.current, previousValue: comparison.habits.previous, trend: 'down' });
    }

    const cMVD = history.mvd.find(m => m.month === currentMonth);
    const pMVD = history.mvd.find(m => m.month === (currentMonth === 1 ? 12 : currentMonth - 1));
    const cFin = history.finances.find(f => f.month === currentMonth);
    const pFin = history.finances.find(f => f.month === (currentMonth === 1 ? 12 : currentMonth - 1));

    if (cMVD && cFin && pMVD && pFin) {
      const mvdImproved = cMVD.completionRate > pMVD.completionRate;
      const finImproved = cFin.savingsRate > pFin.savingsRate || cFin.budgetAdherence > pFin.budgetAdherence;
      if (mvdImproved && finImproved) {
        result.push({ id: 'mvd-finance-correlation', type: 'improvement', module: 'mvd',
          message: 'Finanças melhoram quando MVD é concluído', metric: 'correlation',
          currentValue: cMVD.completionRate, previousValue: pMVD.completionRate, trend: 'up' });
      }
    }

    if (cMVD && cMVD.completionRate >= 90) {
      result.push({ id: 'mvd-excellence', type: 'achievement', module: 'mvd',
        message: `Excelente! ${cMVD.completionRate}% de conclusão do MVD este mês`,
        metric: 'completionRate', currentValue: cMVD.completionRate, previousValue: pMVD?.completionRate || 0,
        trend: comparison.mvd.trend.direction });
    }

    lifeAreaTrends.forEach(area => {
      if (area.monthlyData.length >= 3) {
        const recent = area.monthlyData.slice(-3);
        const scores = recent.map(m => m.overallScore);
        const variance = Math.max(...scores) - Math.min(...scores);
        if (variance < 5) {
          result.push({ id: `stagnant-${area.lifeAreaId}`, type: 'warning', module: 'lifeArea',
            message: `Área ${area.lifeAreaName} está estagnada há 3 semanas`,
            metric: 'overallScore', currentValue: scores[scores.length - 1], previousValue: scores[0],
            trend: 'stable', lifeAreaId: area.lifeAreaId });
        }
      }
    });

    if (comparison.goals.trend.direction === 'up' && comparison.goals.trend.percentage >= 10) {
      result.push({ id: 'goals-momentum', type: 'improvement', module: 'goals',
        message: `Suas metas avançaram ${comparison.goals.trend.percentage}% comparado a ${getMonthName(comparison.previousMonth)}`,
        metric: 'averageProgress', currentValue: comparison.goals.current, previousValue: comparison.goals.previous, trend: 'up' });
    } else if (comparison.goals.trend.direction === 'down' && comparison.goals.trend.percentage >= 5) {
      result.push({ id: 'goals-slowdown', type: 'decline', module: 'goals',
        message: `Progresso das metas desacelerou ${comparison.goals.trend.percentage}% este mês`,
        metric: 'averageProgress', currentValue: comparison.goals.current, previousValue: comparison.goals.previous, trend: 'down' });
    }

    if (cFin && cFin.savingsRate >= 20) {
      result.push({ id: 'savings-excellent', type: 'achievement', module: 'finances',
        message: `Você está economizando ${cFin.savingsRate}% da renda - excelente!`,
        metric: 'savingsRate', currentValue: cFin.savingsRate, previousValue: pFin?.savingsRate || 0, trend: 'up' });
    }

    return result;
  }, [getMonthComparison, getLifeAreaTrends, history, currentMonth]);

  const value: HistoryContextType = {
    history, currentMonth, loading, refresh,
    getMonthComparison, getLifeAreaComparison, getLifeAreaTrends,
    getGoalsHistory, getHabitsHistory, getMVDHistory, getFinancesHistory,
    insights, calculateTrend,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = (): HistoryContextType => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within a HistoryProvider');
  return ctx;
};
