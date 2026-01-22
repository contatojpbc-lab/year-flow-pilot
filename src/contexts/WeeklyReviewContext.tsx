import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { mockRoutineItems } from '@/data/mockData';
import { useGoals } from './GoalsContext';
import { useMVD } from './MVDContext';
import { WeeklyReview } from '@/types';

interface WeeklyStats {
  habitConsistency: { id: string; title: string; completedDays: number; totalDays: number }[];
  topGoal: { id: string; title: string; progress: number; weeklyGain: number } | null;
  bottomGoal: { id: string; title: string; progress: number; weeklyGain: number } | null;
  mvdCompletedDays: number;
  totalDays: number;
  autoSummary: string;
}

interface WeeklyReviewContextType {
  currentWeek: number;
  weekStartDate: Date;
  weekEndDate: Date;
  weeklyStats: WeeklyStats;
  savedReviews: WeeklyReview[];
  currentReview: {
    whatWorked: string;
    whatDidntWork: string;
    improvements: string;
    progressReflection: string;
    overallRating: number;
  };
  updateCurrentReview: (field: string, value: string | number) => void;
  saveReview: () => void;
  isReviewMode: boolean;
  setIsReviewMode: (value: boolean) => void;
}

const WeeklyReviewContext = createContext<WeeklyReviewContextType | undefined>(undefined);

// Simulate weekly data - in real app this would come from stored data
const generateMockWeeklyData = () => {
  // Simulate habit completion for the week (Mon-Sun)
  const habitData = mockRoutineItems.map(habit => ({
    id: habit.id,
    title: habit.title,
    completedDays: Math.floor(Math.random() * 4) + 3, // 3-7 days
    totalDays: 7,
  }));

  return {
    habitData,
    mvdDays: Math.floor(Math.random() * 3) + 4, // 4-7 days
  };
};

export function WeeklyReviewProvider({ children }: { children: ReactNode }) {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();
  
  // Calculate current week
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  
  // Week date range
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - now.getDay() + 1); // Monday
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6); // Sunday

  // Mock weekly data
  const mockData = useMemo(() => generateMockWeeklyData(), []);

  // Calculate weekly stats
  const weeklyStats = useMemo((): WeeklyStats => {
    // Sort habits by consistency
    const sortedHabits = [...mockData.habitData].sort((a, b) => 
      (b.completedDays / b.totalDays) - (a.completedDays / a.totalDays)
    );

    // Goal progress analysis - simulate weekly gains
    const goalsWithGains = goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      progress: goal.progress,
      weeklyGain: Math.floor(Math.random() * 10) + 1, // Simulated weekly gain
    }));

    const sortedByGain = [...goalsWithGains].sort((a, b) => b.weeklyGain - a.weeklyGain);
    const topGoal = sortedByGain[0] || null;
    const bottomGoal = sortedByGain[sortedByGain.length - 1] || null;

    // Generate auto summary
    const topHabits = sortedHabits.slice(0, 2).map(h => h.title).join(' and ');
    const mvdPercentage = Math.round((mockData.mvdDays / 7) * 100);
    
    let autoSummary = '';
    if (mvdPercentage >= 85) {
      autoSummary = `Excellent week! You completed your MVD ${mockData.mvdDays} out of 7 days (${mvdPercentage}%). `;
    } else if (mvdPercentage >= 60) {
      autoSummary = `Good week! You completed your MVD ${mockData.mvdDays} out of 7 days (${mvdPercentage}%). `;
    } else {
      autoSummary = `Challenging week. You completed your MVD ${mockData.mvdDays} out of 7 days (${mvdPercentage}%). `;
    }

    if (topHabits) {
      autoSummary += `Your most consistent habits were "${topHabits}". `;
    }

    if (topGoal) {
      autoSummary += `Best progress on "${topGoal.title}" (+${topGoal.weeklyGain}%). `;
    }

    if (bottomGoal && bottomGoal.id !== topGoal?.id) {
      autoSummary += `Consider focusing more on "${bottomGoal.title}" next week.`;
    }

    return {
      habitConsistency: sortedHabits,
      topGoal,
      bottomGoal: bottomGoal?.id !== topGoal?.id ? bottomGoal : null,
      mvdCompletedDays: mockData.mvdDays,
      totalDays: 7,
      autoSummary,
    };
  }, [goals, mockData]);

  // Review state
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedReviews, setSavedReviews] = useState<WeeklyReview[]>(() => {
    const saved = localStorage.getItem('weekly-reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentReview, setCurrentReview] = useState({
    whatWorked: '',
    whatDidntWork: '',
    improvements: '',
    progressReflection: '',
    overallRating: 0,
  });

  const updateCurrentReview = (field: string, value: string | number) => {
    setCurrentReview(prev => ({ ...prev, [field]: value }));
  };

  const saveReview = () => {
    const newReview: WeeklyReview = {
      id: `review-${Date.now()}`,
      userId: 'user-1',
      year: 2026,
      weekNumber: currentWeek,
      weekStartDate,
      weekEndDate,
      whatWorked: currentReview.whatWorked,
      whatDidntWork: currentReview.whatDidntWork,
      improvements: currentReview.improvements,
      progressReflection: currentReview.progressReflection,
      goalsReviewed: goals.map(g => g.id),
      overallRating: currentReview.overallRating,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = [newReview, ...savedReviews];
    setSavedReviews(updated);
    localStorage.setItem('weekly-reviews', JSON.stringify(updated));
    
    // Reset form
    setCurrentReview({
      whatWorked: '',
      whatDidntWork: '',
      improvements: '',
      progressReflection: '',
      overallRating: 0,
    });
    setIsReviewMode(false);
  };

  return (
    <WeeklyReviewContext.Provider value={{
      currentWeek,
      weekStartDate,
      weekEndDate,
      weeklyStats,
      savedReviews,
      currentReview,
      updateCurrentReview,
      saveReview,
      isReviewMode,
      setIsReviewMode,
    }}>
      {children}
    </WeeklyReviewContext.Provider>
  );
}

export function useWeeklyReview() {
  const context = useContext(WeeklyReviewContext);
  if (context === undefined) {
    throw new Error('useWeeklyReview must be used within a WeeklyReviewProvider');
  }
  return context;
}
