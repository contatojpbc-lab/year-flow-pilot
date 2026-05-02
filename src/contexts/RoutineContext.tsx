import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RoutineItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RoutineContextType {
  routineItems: RoutineItem[];
  todayCompletedIds: string[];
  loading: boolean;
  refresh: () => Promise<void>;
  toggleHabitToday: (routineItemId: string) => Promise<boolean>; // returns new completed state
  createRoutineItem: (input: Partial<RoutineItem> & { title: string }) => Promise<void>;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

function mapRow(row: any): RoutineItem {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    title: row.title,
    description: row.description ?? undefined,
    timeOfDay: row.time_of_day,
    linkedGoalId: row.linked_goal_id ?? undefined,
    isActive: row.is_active,
    order: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [todayCompletedIds, setTodayCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRoutineItems([]);
      setTodayCompletedIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = todayISO();
    const [{ data: items }, { data: entries }] = await Promise.all([
      supabase.from('routine_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('habit_entries').select('routine_item_id, completed').eq('entry_date', today),
    ]);
    if (items) setRoutineItems(items.map(mapRow));
    setTodayCompletedIds((entries ?? []).filter((e: any) => e.completed).map((e: any) => e.routine_item_id));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleHabitToday = useCallback(async (routineItemId: string): Promise<boolean> => {
    if (!user) return false;
    const today = todayISO();
    const isCompleted = todayCompletedIds.includes(routineItemId);
    const newCompleted = !isCompleted;

    setTodayCompletedIds(prev =>
      newCompleted ? [...prev, routineItemId] : prev.filter(id => id !== routineItemId)
    );

    await supabase.from('habit_entries').upsert(
      {
        user_id: user.id,
        routine_item_id: routineItemId,
        entry_date: today,
        completed: newCompleted,
      },
      { onConflict: 'routine_item_id,entry_date' }
    );
    return newCompleted;
  }, [user, todayCompletedIds]);

  const createRoutineItem = useCallback(async (input: Partial<RoutineItem> & { title: string }) => {
    if (!user) return;
    const { error } = await supabase.from('routine_items').insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      time_of_day: input.timeOfDay ?? 'anytime',
      linked_goal_id: input.linkedGoalId ?? null,
      is_active: input.isActive ?? true,
      sort_order: input.order ?? 0,
    });
    if (!error) await refresh();
  }, [user, refresh]);

  return (
    <RoutineContext.Provider value={{ routineItems, todayCompletedIds, loading, refresh, toggleHabitToday, createRoutineItem }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error('useRoutine must be used within RoutineProvider');
  return ctx;
}
