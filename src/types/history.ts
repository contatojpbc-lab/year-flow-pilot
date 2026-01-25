/**
 * ============================================
 * ANNUAL HISTORY TRACKING TYPES
 * ============================================
 * 
 * Types for tracking monthly evolution across all modules:
 * - Goals progress
 * - Habits/Routine consistency
 * - MVD completion rates
 * - Financial metrics
 * - Life areas performance
 */

// ============================================
// TREND INDICATORS
// ============================================

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendData {
  direction: TrendDirection;
  percentage: number; // Absolute change percentage
  label: string; // Human-readable description
}

// ============================================
// MONTHLY SNAPSHOTS
// ============================================

/**
 * Monthly snapshot for goals tracking
 */
export interface GoalsMonthlySnapshot {
  month: number; // 1-12
  year: number;
  averageProgress: number; // 0-100
  goalsCompleted: number;
  goalsActive: number;
  byLifeArea: Record<string, number>; // lifeAreaId -> average progress
}

/**
 * Monthly snapshot for habits/routine tracking
 */
export interface HabitsMonthlySnapshot {
  month: number;
  year: number;
  totalCompletions: number;
  possibleCompletions: number;
  consistencyRate: number; // 0-100
  topHabits: Array<{ id: string; title: string; completionRate: number }>;
  bottomHabits: Array<{ id: string; title: string; completionRate: number }>;
}

/**
 * Monthly snapshot for MVD tracking
 */
export interface MVDMonthlySnapshot {
  month: number;
  year: number;
  daysCompleted: number;
  totalDays: number;
  completionRate: number; // 0-100
  averageStreak: number;
  longestStreakInMonth: number;
}

/**
 * Monthly snapshot for finances tracking
 */
export interface FinancesMonthlySnapshot {
  month: number;
  year: number;
  plannedIncome: number;
  actualIncome: number;
  plannedExpenses: number;
  actualExpenses: number;
  savingsRate: number; // 0-100
  budgetAdherence: number; // 0-100 (how well within budget)
  byCategory: Record<string, { planned: number; actual: number }>;
  financialGoalsProgress: number; // Average progress of all financial goals
}

/**
 * Monthly snapshot for life area performance
 */
export interface LifeAreaMonthlySnapshot {
  month: number;
  year: number;
  lifeAreaId: string;
  lifeAreaName: string;
  lifeAreaColor: string;
  goalsProgress: number;
  habitsConsistency: number;
  overallScore: number; // Weighted average
}

// ============================================
// ANNUAL HISTORY
// ============================================

/**
 * Complete annual history for a user
 */
export interface AnnualHistory {
  userId: string;
  year: number;
  goals: GoalsMonthlySnapshot[];
  habits: HabitsMonthlySnapshot[];
  mvd: MVDMonthlySnapshot[];
  finances: FinancesMonthlySnapshot[];
  lifeAreas: LifeAreaMonthlySnapshot[];
  lastUpdated: Date;
}

// ============================================
// COMPARISON DATA
// ============================================

export interface MonthComparison {
  currentMonth: number;
  previousMonth: number;
  goals: {
    current: number;
    previous: number;
    trend: TrendData;
  };
  habits: {
    current: number;
    previous: number;
    trend: TrendData;
  };
  mvd: {
    current: number;
    previous: number;
    trend: TrendData;
  };
  finances: {
    savingsRate: { current: number; previous: number; trend: TrendData };
    budgetAdherence: { current: number; previous: number; trend: TrendData };
  };
}

export interface LifeAreaComparison {
  lifeAreaId: string;
  lifeAreaName: string;
  lifeAreaColor: string;
  monthlyData: Array<{
    month: number;
    goalsProgress: number;
    habitsConsistency: number;
    overallScore: number;
  }>;
  trend: TrendData;
}

// ============================================
// INSIGHTS
// ============================================

export interface HistoryInsight {
  id: string;
  type: 'improvement' | 'decline' | 'achievement' | 'warning';
  module: 'goals' | 'habits' | 'mvd' | 'finances' | 'lifeArea';
  message: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  trend: TrendDirection;
  lifeAreaId?: string;
}
