/**
 * Mock data for annual history tracking
 * Simulates 12 months of historical data for 2026
 */

import {
  AnnualHistory,
  GoalsMonthlySnapshot,
  HabitsMonthlySnapshot,
  MVDMonthlySnapshot,
  FinancesMonthlySnapshot,
  LifeAreaMonthlySnapshot,
} from '@/types/history';
import { mockLifeAreas } from './mockData';

const userId = 'user-1';
const year = 2026;

// Helper to get days in month
const getDaysInMonth = (month: number): number => {
  return new Date(year, month, 0).getDate();
};

// Generate realistic progression data
const generateGoalsSnapshots = (): GoalsMonthlySnapshot[] => {
  const months: GoalsMonthlySnapshot[] = [];
  
  // Base progress with gradual improvement
  const baseProgress = [8, 12, 18, 25, 30, 35, 38, 42, 48, 55, 62, 70];
  
  for (let month = 1; month <= 12; month++) {
    const isCurrentOrPast = month <= new Date().getMonth() + 1;
    
    months.push({
      month,
      year,
      averageProgress: isCurrentOrPast ? baseProgress[month - 1] : 0,
      goalsCompleted: month >= 10 ? 1 : 0,
      goalsActive: 3,
      byLifeArea: {
        'area-1': isCurrentOrPast ? baseProgress[month - 1] + Math.floor(Math.random() * 10) - 5 : 0,
        'area-2': isCurrentOrPast ? baseProgress[month - 1] + Math.floor(Math.random() * 15) - 7 : 0,
        'area-3': isCurrentOrPast ? baseProgress[month - 1] + Math.floor(Math.random() * 12) - 6 : 0,
        'area-4': isCurrentOrPast ? baseProgress[month - 1] + Math.floor(Math.random() * 8) - 4 : 0,
        'area-5': isCurrentOrPast ? baseProgress[month - 1] + Math.floor(Math.random() * 10) - 5 : 0,
      },
    });
  }
  
  return months;
};

const generateHabitsSnapshots = (): HabitsMonthlySnapshot[] => {
  const months: HabitsMonthlySnapshot[] = [];
  
  // Consistency improves over time with some variation
  const baseConsistency = [55, 62, 68, 72, 75, 70, 78, 82, 80, 85, 88, 90];
  
  for (let month = 1; month <= 12; month++) {
    const isCurrentOrPast = month <= new Date().getMonth() + 1;
    const days = getDaysInMonth(month);
    const habitCount = 5;
    const possible = days * habitCount;
    const completions = isCurrentOrPast ? Math.floor(possible * (baseConsistency[month - 1] / 100)) : 0;
    
    months.push({
      month,
      year,
      totalCompletions: completions,
      possibleCompletions: possible,
      consistencyRate: isCurrentOrPast ? baseConsistency[month - 1] : 0,
      topHabits: isCurrentOrPast ? [
        { id: 'routine-1', title: 'Morning meditation', completionRate: baseConsistency[month - 1] + 8 },
        { id: 'routine-4', title: 'Read for 30 min', completionRate: baseConsistency[month - 1] + 5 },
      ] : [],
      bottomHabits: isCurrentOrPast ? [
        { id: 'routine-3', title: 'Spanish practice', completionRate: baseConsistency[month - 1] - 15 },
      ] : [],
    });
  }
  
  return months;
};

const generateMVDSnapshots = (): MVDMonthlySnapshot[] => {
  const months: MVDMonthlySnapshot[] = [];
  
  // MVD completion rates
  const baseCompletion = [60, 68, 75, 80, 78, 72, 82, 88, 85, 90, 92, 95];
  
  for (let month = 1; month <= 12; month++) {
    const isCurrentOrPast = month <= new Date().getMonth() + 1;
    const days = getDaysInMonth(month);
    const completed = isCurrentOrPast ? Math.floor(days * (baseCompletion[month - 1] / 100)) : 0;
    
    months.push({
      month,
      year,
      daysCompleted: completed,
      totalDays: days,
      completionRate: isCurrentOrPast ? baseCompletion[month - 1] : 0,
      averageStreak: isCurrentOrPast ? Math.floor(baseCompletion[month - 1] / 10) : 0,
      longestStreakInMonth: isCurrentOrPast ? Math.floor(baseCompletion[month - 1] / 5) : 0,
    });
  }
  
  return months;
};

const generateFinancesSnapshots = (): FinancesMonthlySnapshot[] => {
  const months: FinancesMonthlySnapshot[] = [];
  
  // Financial data with realistic variation
  const baseIncome = 6500;
  const incomeVariation = [0, 250, 0, 500, 0, 0, 300, 0, 0, 750, 0, 1500];
  const savingsRates = [18, 20, 22, 25, 23, 20, 24, 26, 25, 28, 30, 32];
  const budgetAdherence = [75, 80, 85, 82, 88, 78, 85, 90, 88, 92, 94, 95];
  
  for (let month = 1; month <= 12; month++) {
    const isCurrentOrPast = month <= new Date().getMonth() + 1;
    const income = baseIncome + incomeVariation[month - 1];
    const expenses = income * (1 - savingsRates[month - 1] / 100);
    
    months.push({
      month,
      year,
      plannedIncome: baseIncome,
      actualIncome: isCurrentOrPast ? income : 0,
      plannedExpenses: 5500,
      actualExpenses: isCurrentOrPast ? expenses : 0,
      savingsRate: isCurrentOrPast ? savingsRates[month - 1] : 0,
      budgetAdherence: isCurrentOrPast ? budgetAdherence[month - 1] : 0,
      byCategory: isCurrentOrPast ? {
        'cat-1': { planned: 1800, actual: 1800 },
        'cat-2': { planned: 600, actual: 600 + (month % 3) * 40 },
        'cat-3': { planned: 300, actual: 280 + (month % 2) * 20 },
        'cat-4': { planned: 1500, actual: income * savingsRates[month - 1] / 100 },
        'cat-5': { planned: 200, actual: 180 + (month % 4) * 15 },
      } : {},
      financialGoalsProgress: isCurrentOrPast ? month * 7 : 0,
    });
  }
  
  return months;
};

const generateLifeAreaSnapshots = (): LifeAreaMonthlySnapshot[] => {
  const snapshots: LifeAreaMonthlySnapshot[] = [];
  
  mockLifeAreas.forEach(area => {
    for (let month = 1; month <= 12; month++) {
      const isCurrentOrPast = month <= new Date().getMonth() + 1;
      
      // Different growth patterns per area
      let baseProgress = 0;
      let baseConsistency = 0;
      
      switch (area.id) {
        case 'area-1': // Health - steady growth
          baseProgress = 10 + month * 5;
          baseConsistency = 55 + month * 3;
          break;
        case 'area-2': // Career - plateaus mid-year
          baseProgress = 15 + Math.min(month, 8) * 6;
          baseConsistency = 60 + month * 2.5;
          break;
        case 'area-3': // Finances - accelerates late year
          baseProgress = 5 + month * month * 0.5;
          baseConsistency = 70 + month * 2;
          break;
        case 'area-4': // Relationships - variable
          baseProgress = 20 + month * 4 + (month % 3) * 5;
          baseConsistency = 50 + month * 3.5;
          break;
        case 'area-5': // Personal Growth - consistent
          baseProgress = 12 + month * 5.5;
          baseConsistency = 58 + month * 2.8;
          break;
        default:
          baseProgress = 10 + month * 5;
          baseConsistency = 55 + month * 3;
      }
      
      const goalsProgress = isCurrentOrPast ? Math.min(baseProgress, 100) : 0;
      const habitsConsistency = isCurrentOrPast ? Math.min(baseConsistency, 100) : 0;
      
      snapshots.push({
        month,
        year,
        lifeAreaId: area.id,
        lifeAreaName: area.name,
        lifeAreaColor: area.color,
        goalsProgress,
        habitsConsistency,
        overallScore: isCurrentOrPast ? Math.round((goalsProgress * 0.6 + habitsConsistency * 0.4)) : 0,
      });
    }
  });
  
  return snapshots;
};

export const mockAnnualHistory: AnnualHistory = {
  userId,
  year,
  goals: generateGoalsSnapshots(),
  habits: generateHabitsSnapshots(),
  mvd: generateMVDSnapshots(),
  finances: generateFinancesSnapshots(),
  lifeAreas: generateLifeAreaSnapshots(),
  lastUpdated: new Date(),
};

// Helper to get month name
export const getMonthName = (month: number): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month - 1];
};

export const getFullMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};
