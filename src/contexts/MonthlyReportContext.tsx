import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useHistory } from './HistoryContext';
import { useGoals } from './GoalsContext';
import { useFinances } from './FinancesContext';
import { getMonthName } from '@/data/historyMockData';

// ============================================
// TYPES
// ============================================

export interface LifeAreaSummary {
  id: string;
  name: string;
  color: string;
  goalsProgress: number;
  habitsConsistency: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface GoalSummary {
  id: string;
  title: string;
  lifeArea: string;
  lifeAreaColor: string;
  progress: number;
  targetProgress: number;
  status: 'completed' | 'on_track' | 'behind' | 'at_risk';
}

export interface FinancialHighlight {
  type: 'positive' | 'negative' | 'neutral';
  icon: 'savings' | 'spending' | 'budget' | 'goal';
  title: string;
  value: string;
  description: string;
}

export interface MonthlyReport {
  month: number;
  year: number;
  monthName: string;
  
  // Life area summaries
  lifeAreaSummaries: LifeAreaSummary[];
  
  // Goals breakdown
  completedGoals: GoalSummary[];
  inProgressGoals: GoalSummary[];
  atRiskGoals: GoalSummary[];
  
  // Financial highlights
  financialHighlights: FinancialHighlight[];
  
  // Auto-generated summary text
  autoSummary: string;
  
  // Manual reflection
  reflection: string;
  
  // Key metrics
  metrics: {
    mvdCompletionRate: number;
    habitsConsistency: number;
    goalsProgress: number;
    savingsRate: number;
    budgetAdherence: number;
  };
}

export interface SavedMonthlyReport extends MonthlyReport {
  id: string;
  savedAt: Date;
}

interface MonthlyReportContextType {
  currentReport: MonthlyReport;
  savedReports: SavedMonthlyReport[];
  reflection: string;
  setReflection: (value: string) => void;
  saveReport: () => void;
  getReportByMonth: (month: number, year: number) => SavedMonthlyReport | null;
}

const MonthlyReportContext = createContext<MonthlyReportContextType | null>(null);

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateAutoSummary = (
  lifeAreas: LifeAreaSummary[],
  completedGoals: GoalSummary[],
  atRiskGoals: GoalSummary[],
  metrics: MonthlyReport['metrics'],
  monthName: string
): string => {
  const parts: string[] = [];
  
  // Opening statement based on overall performance
  const overallScore = (metrics.mvdCompletionRate + metrics.habitsConsistency + metrics.goalsProgress) / 3;
  
  if (overallScore >= 80) {
    parts.push(`${monthName} foi um mês excelente!`);
  } else if (overallScore >= 60) {
    parts.push(`${monthName} foi um bom mês com progresso consistente.`);
  } else if (overallScore >= 40) {
    parts.push(`${monthName} teve altos e baixos.`);
  } else {
    parts.push(`${monthName} foi um mês desafiador.`);
  }
  
  // Goals highlight
  if (completedGoals.length > 0) {
    parts.push(`Você concluiu ${completedGoals.length} meta${completedGoals.length > 1 ? 's' : ''}.`);
  }
  
  // Top performing life area
  const topArea = [...lifeAreas].sort((a, b) => b.overallScore - a.overallScore)[0];
  if (topArea && topArea.overallScore >= 70) {
    parts.push(`${topArea.name} foi sua área mais forte (${topArea.overallScore}%).`);
  }
  
  // Area needing attention
  const weakArea = [...lifeAreas].sort((a, b) => a.overallScore - b.overallScore)[0];
  if (weakArea && weakArea.overallScore < 50 && weakArea.id !== topArea?.id) {
    parts.push(`${weakArea.name} precisa de mais atenção.`);
  }
  
  // Financial summary
  if (metrics.savingsRate >= 20) {
    parts.push(`Suas finanças estão ótimas com ${metrics.savingsRate}% de economia.`);
  } else if (metrics.budgetAdherence < 70) {
    parts.push(`Atenção ao orçamento: aderência de ${metrics.budgetAdherence}%.`);
  }
  
  // MVD consistency
  if (metrics.mvdCompletionRate >= 85) {
    parts.push(`Excelente disciplina diária com ${metrics.mvdCompletionRate}% de conclusão do MVD.`);
  }
  
  // At-risk goals warning
  if (atRiskGoals.length > 0) {
    parts.push(`${atRiskGoals.length} meta${atRiskGoals.length > 1 ? 's precisam' : ' precisa'} de foco urgente.`);
  }
  
  return parts.join(' ');
};

const getGoalStatus = (progress: number, targetProgress: number): GoalSummary['status'] => {
  if (progress >= 100) return 'completed';
  if (progress >= targetProgress * 0.9) return 'on_track';
  if (progress >= targetProgress * 0.5) return 'behind';
  return 'at_risk';
};

// ============================================
// PROVIDER
// ============================================

export const MonthlyReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getMonthComparison, getLifeAreaTrends, history, currentMonth } = useHistory();
  const { goals } = useGoals();
  const { plan, totalPlanned, totalActual } = useFinances();
  
  const [reflection, setReflection] = useState('');
  const [savedReports, setSavedReports] = useState<SavedMonthlyReport[]>(() => {
    const saved = localStorage.getItem('monthly-reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate current month report
  const currentReport = useMemo((): MonthlyReport => {
    const comparison = getMonthComparison();
    const lifeAreaTrends = getLifeAreaTrends();
    const currentYear = new Date().getFullYear();
    const monthName = getMonthName(currentMonth);
    
    // Life area summaries
    const lifeAreaSummaries: LifeAreaSummary[] = lifeAreaTrends.map(area => {
      const latestData = area.monthlyData[area.monthlyData.length - 1];
      return {
        id: area.lifeAreaId,
        name: area.lifeAreaName,
        color: area.lifeAreaColor,
        goalsProgress: latestData?.goalsProgress || 0,
        habitsConsistency: latestData?.habitsConsistency || 0,
        overallScore: latestData?.overallScore || 0,
        trend: area.trend.direction,
        trendPercentage: area.trend.percentage,
      };
    });
    
    // Expected progress for current month (proportional to month in year)
    const expectedProgress = Math.round((currentMonth / 12) * 100);
    
    // Goals breakdown
    const goalsWithStatus: GoalSummary[] = goals.map(goal => {
      const lifeAreaMatch = lifeAreaSummaries.find(la => la.id === goal.lifeAreaId);
      return {
        id: goal.id,
        title: goal.title,
        lifeArea: lifeAreaMatch?.name || 'Unknown',
        lifeAreaColor: lifeAreaMatch?.color || '#888',
        progress: goal.progress,
        targetProgress: expectedProgress,
        status: getGoalStatus(goal.progress, expectedProgress),
      };
    });
    
    const completedGoals = goalsWithStatus.filter(g => g.status === 'completed');
    const inProgressGoals = goalsWithStatus.filter(g => g.status === 'on_track' || g.status === 'behind');
    const atRiskGoals = goalsWithStatus.filter(g => g.status === 'at_risk');
    
    // Financial highlights
    const financialHighlights: FinancialHighlight[] = [];
    
    // Savings highlight
    const savingsRate = comparison.finances.savingsRate.current;
    if (savingsRate >= 20) {
      financialHighlights.push({
        type: 'positive',
        icon: 'savings',
        title: 'Taxa de Economia',
        value: `${savingsRate}%`,
        description: 'Você está economizando bem este mês',
      });
    } else if (savingsRate < 10) {
      financialHighlights.push({
        type: 'negative',
        icon: 'savings',
        title: 'Taxa de Economia',
        value: `${savingsRate}%`,
        description: 'Considere reduzir gastos para economizar mais',
      });
    }
    
    // Budget adherence highlight
    const budgetAdherence = comparison.finances.budgetAdherence.current;
    if (budgetAdherence >= 90) {
      financialHighlights.push({
        type: 'positive',
        icon: 'budget',
        title: 'Aderência ao Orçamento',
        value: `${budgetAdherence}%`,
        description: 'Excelente controle de gastos',
      });
    } else if (budgetAdherence < 70) {
      financialHighlights.push({
        type: 'negative',
        icon: 'budget',
        title: 'Aderência ao Orçamento',
        value: `${budgetAdherence}%`,
        description: 'Gastos acima do planejado',
      });
    }
    
    // Spending comparison
    const spendingChange = comparison.finances.budgetAdherence.trend;
    if (spendingChange.direction === 'up') {
      financialHighlights.push({
        type: 'positive',
        icon: 'spending',
        title: 'Melhoria nos Gastos',
        value: `+${spendingChange.percentage}%`,
        description: `Melhor controle comparado a ${getMonthName(comparison.previousMonth)}`,
      });
    } else if (spendingChange.direction === 'down' && spendingChange.percentage >= 10) {
      financialHighlights.push({
        type: 'negative',
        icon: 'spending',
        title: 'Aumento de Gastos',
        value: `-${spendingChange.percentage}%`,
        description: `Gastos aumentaram vs ${getMonthName(comparison.previousMonth)}`,
      });
    }
    
    // Available balance
    const availableBalance = plan.actualIncome - totalActual;
    if (availableBalance > 0) {
      financialHighlights.push({
        type: 'neutral',
        icon: 'goal',
        title: 'Saldo Disponível',
        value: `R$ ${availableBalance.toLocaleString('pt-BR')}`,
        description: 'Disponível para metas ou reserva',
      });
    }
    
    // Metrics
    const metrics = {
      mvdCompletionRate: comparison.mvd.current,
      habitsConsistency: comparison.habits.current,
      goalsProgress: comparison.goals.current,
      savingsRate: comparison.finances.savingsRate.current,
      budgetAdherence: comparison.finances.budgetAdherence.current,
    };
    
    // Auto-generated summary
    const autoSummary = generateAutoSummary(
      lifeAreaSummaries,
      completedGoals,
      atRiskGoals,
      metrics,
      monthName
    );
    
    return {
      month: currentMonth,
      year: currentYear,
      monthName,
      lifeAreaSummaries,
      completedGoals,
      inProgressGoals,
      atRiskGoals,
      financialHighlights,
      autoSummary,
      reflection: '',
      metrics,
    };
  }, [getMonthComparison, getLifeAreaTrends, goals, plan, totalActual, currentMonth]);

  // Save report
  const saveReport = useCallback(() => {
    const newReport: SavedMonthlyReport = {
      ...currentReport,
      reflection,
      id: `report-${currentReport.year}-${currentReport.month}`,
      savedAt: new Date(),
    };
    
    // Replace if exists, otherwise add
    const existingIndex = savedReports.findIndex(
      r => r.month === newReport.month && r.year === newReport.year
    );
    
    let updated: SavedMonthlyReport[];
    if (existingIndex >= 0) {
      updated = [...savedReports];
      updated[existingIndex] = newReport;
    } else {
      updated = [newReport, ...savedReports];
    }
    
    setSavedReports(updated);
    localStorage.setItem('monthly-reports', JSON.stringify(updated));
    setReflection('');
  }, [currentReport, reflection, savedReports]);

  // Get report by month
  const getReportByMonth = useCallback((month: number, year: number): SavedMonthlyReport | null => {
    return savedReports.find(r => r.month === month && r.year === year) || null;
  }, [savedReports]);

  const value: MonthlyReportContextType = {
    currentReport,
    savedReports,
    reflection,
    setReflection,
    saveReport,
    getReportByMonth,
  };

  return (
    <MonthlyReportContext.Provider value={value}>
      {children}
    </MonthlyReportContext.Provider>
  );
};

export const useMonthlyReport = (): MonthlyReportContextType => {
  const context = useContext(MonthlyReportContext);
  if (!context) {
    throw new Error('useMonthlyReport must be used within a MonthlyReportProvider');
  }
  return context;
};
