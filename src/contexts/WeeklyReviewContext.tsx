import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useGoals } from './GoalsContext';
import { useRoutine } from './RoutineContext';
import { WeeklyReview } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  saveReview: () => Promise<void>;
  isReviewMode: boolean;
  setIsReviewMode: (value: boolean) => void;
}

const WeeklyReviewContext = createContext<WeeklyReviewContextType | undefined>(undefined);

const toISO = (d: Date) => d.toISOString().slice(0, 10);

export function WeeklyReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { goals } = useGoals();
  const { routineItems } = useRoutine();

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  const weekStartDate = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const weekEndDate = useMemo(() => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + 6);
    return d;
  }, [weekStartDate]);

  const [savedReviews, setSavedReviews] = useState<WeeklyReview[]>([]);
  const [habitEntries, setHabitEntries] = useState<{ routine_item_id: string; entry_date: string; completed: boolean }[]>([]);
  const [mvdCheckIns, setMvdCheckIns] = useState<{ check_in_date: string; mvd_completed: boolean }[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReview, setCurrentReview] = useState({
    whatWorked: '',
    whatDidntWork: '',
    improvements: '',
    progressReflection: '',
    overallRating: 0,
  });

  const refresh = useCallback(async () => {
    if (!user) return;
    const startISO = toISO(weekStartDate);
    const endISO = toISO(weekEndDate);

    const [{ data: reviews }, { data: hEntries }, { data: mvd }] = await Promise.all([
      supabase.from('weekly_reviews').select('*').order('week_number', { ascending: false }),
      supabase.from('habit_entries').select('routine_item_id, entry_date, completed').gte('entry_date', startISO).lte('entry_date', endISO),
      supabase.from('mvd_check_ins').select('check_in_date, mvd_completed').gte('check_in_date', startISO).lte('check_in_date', endISO),
    ]);

    setSavedReviews((reviews ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      year: r.year,
      weekNumber: r.week_number,
      weekStartDate: new Date(r.week_start_date),
      weekEndDate: new Date(r.week_end_date),
      whatWorked: r.what_worked,
      whatDidntWork: r.what_didnt_work,
      improvements: r.improvements,
      progressReflection: r.progress_reflection,
      goalsReviewed: r.goals_reviewed ?? [],
      overallRating: r.overall_rating,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    })));
    setHabitEntries(hEntries ?? []);
    setMvdCheckIns(mvd ?? []);
  }, [user, weekStartDate, weekEndDate]);

  useEffect(() => { refresh(); }, [refresh]);

  const weeklyStats = useMemo<WeeklyStats>(() => {
    // Habit consistency from real entries
    const habitConsistency = routineItems.map(habit => {
      const completedDays = habitEntries.filter(e => e.routine_item_id === habit.id && e.completed).length;
      return { id: habit.id, title: habit.title, completedDays, totalDays: 7 };
    }).sort((a, b) => b.completedDays - a.completedDays);

    const mvdCompletedDays = mvdCheckIns.filter(c => c.mvd_completed).length;

    // Goal gains: compare current progress with previous saved review (if any)
    const lastReview = savedReviews[0];
    const previousProgressByGoal = new Map<string, number>();
    if (lastReview) {
      // Use 0 baseline if no historical snapshots; compute relative gain via current.progress
    }

    const goalsWithGains = goals.map(g => ({
      id: g.id,
      title: g.title,
      progress: g.progress,
      weeklyGain: Math.max(0, Math.round((g.progress - (previousProgressByGoal.get(g.id) ?? g.progress)) * 10) / 10),
    }));

    const sortedByGain = [...goalsWithGains].sort((a, b) => b.progress - a.progress);
    const topGoal = sortedByGain[0] || null;
    const bottomGoal = sortedByGain[sortedByGain.length - 1] || null;

    const mvdPercentage = Math.round((mvdCompletedDays / 7) * 100);
    const topHabits = habitConsistency.slice(0, 2).filter(h => h.completedDays > 0).map(h => h.title).join(' e ');

    let autoSummary = '';
    if (mvdPercentage >= 85) {
      autoSummary = `Semana excelente! Você completou o MVD ${mvdCompletedDays} de 7 dias (${mvdPercentage}%). `;
    } else if (mvdPercentage >= 60) {
      autoSummary = `Boa semana! Você completou o MVD ${mvdCompletedDays} de 7 dias (${mvdPercentage}%). `;
    } else {
      autoSummary = `Semana desafiadora. Você completou o MVD ${mvdCompletedDays} de 7 dias (${mvdPercentage}%). `;
    }
    if (topHabits) autoSummary += `Hábitos mais consistentes: "${topHabits}". `;
    if (topGoal) autoSummary += `Maior progresso: "${topGoal.title}" (${topGoal.progress}%).`;

    return {
      habitConsistency,
      topGoal,
      bottomGoal: bottomGoal && bottomGoal.id !== topGoal?.id ? bottomGoal : null,
      mvdCompletedDays,
      totalDays: 7,
      autoSummary,
    };
  }, [routineItems, habitEntries, mvdCheckIns, goals, savedReviews]);

  const updateCurrentReview = (field: string, value: string | number) => {
    setCurrentReview(prev => ({ ...prev, [field]: value }));
  };

  const saveReview = useCallback(async () => {
    if (!user) return;
    await supabase.from('weekly_reviews').insert({
      user_id: user.id,
      week_number: currentWeek,
      week_start_date: toISO(weekStartDate),
      week_end_date: toISO(weekEndDate),
      what_worked: currentReview.whatWorked,
      what_didnt_work: currentReview.whatDidntWork,
      improvements: currentReview.improvements,
      progress_reflection: currentReview.progressReflection,
      goals_reviewed: goals.map(g => g.id),
      overall_rating: currentReview.overallRating,
    });
    setCurrentReview({ whatWorked: '', whatDidntWork: '', improvements: '', progressReflection: '', overallRating: 0 });
    setIsReviewMode(false);
    await refresh();
  }, [user, currentWeek, weekStartDate, weekEndDate, currentReview, goals, refresh]);

  return (
    <WeeklyReviewContext.Provider value={{
      currentWeek, weekStartDate, weekEndDate, weeklyStats, savedReviews,
      currentReview, updateCurrentReview, saveReview, isReviewMode, setIsReviewMode,
    }}>
      {children}
    </WeeklyReviewContext.Provider>
  );
}

export function useWeeklyReview() {
  const ctx = useContext(WeeklyReviewContext);
  if (!ctx) throw new Error('useWeeklyReview must be used within a WeeklyReviewProvider');
  return ctx;
}
