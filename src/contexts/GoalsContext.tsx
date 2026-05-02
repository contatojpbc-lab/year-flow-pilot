import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Goal, GoalStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateGoalProgress: (goalId: string, progressDelta: number) => Promise<void>;
  getGoalById: (goalId: string) => Goal | undefined;
  getProgressPerHabit: (goalId: string) => number;
  createGoal: (input: Partial<Goal> & { title: string; lifeAreaId: string }) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

function mapRow(row: any): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    title: row.title,
    description: row.description ?? '',
    lifeAreaId: row.life_area_id ?? '',
    status: (row.status as GoalStatus) ?? 'planned',
    specific: row.specific ?? '',
    measurable: row.measurable ?? '',
    achievable: row.achievable ?? '',
    relevant: row.relevant ?? '',
    timeBound: row.time_bound ? new Date(row.time_bound) : new Date(),
    progress: Number(row.progress ?? 0),
    milestones: [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [linkedHabitsCount, setLinkedHabitsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLinkedHabitsCount({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: goalsData }, { data: routineData }] = await Promise.all([
      supabase.from('goals').select('*').order('created_at', { ascending: true }),
      supabase.from('routine_items').select('linked_goal_id'),
    ]);
    if (goalsData) setGoals(goalsData.map(mapRow));
    const counts: Record<string, number> = {};
    (routineData ?? []).forEach((r: any) => {
      if (r.linked_goal_id) counts[r.linked_goal_id] = (counts[r.linked_goal_id] ?? 0) + 1;
    });
    setLinkedHabitsCount(counts);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const getProgressPerHabit = useCallback((goalId: string): number => {
    const count = linkedHabitsCount[goalId] ?? 0;
    if (count === 0) return 0;
    return 2 / count;
  }, [linkedHabitsCount]);

  const updateGoalProgress = useCallback(async (goalId: string, progressDelta: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newProgress = Math.min(100, Math.max(0, goal.progress + progressDelta));
    const rounded = Math.round(newProgress * 10) / 10;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress: rounded } : g));
    await supabase.from('goals').update({ progress: rounded }).eq('id', goalId);
  }, [goals]);

  const getGoalById = useCallback((goalId: string) => goals.find(g => g.id === goalId), [goals]);

  const createGoal = useCallback(async (input: Partial<Goal> & { title: string; lifeAreaId: string }) => {
    if (!user) return;
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? '',
      life_area_id: input.lifeAreaId,
      status: input.status ?? 'planned',
      specific: input.specific ?? '',
      measurable: input.measurable ?? '',
      achievable: input.achievable ?? '',
      relevant: input.relevant ?? '',
      time_bound: input.timeBound?.toISOString() ?? null,
      progress: input.progress ?? 0,
    });
    if (!error) await refresh();
  }, [user, refresh]);

  return (
    <GoalsContext.Provider value={{ goals, loading, refresh, updateGoalProgress, getGoalById, getProgressPerHabit, createGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) throw new Error('useGoals must be used within a GoalsProvider');
  return context;
}
