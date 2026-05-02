import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { MVDItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MVDContextType {
  items: MVDItem[];
  completedItems: string[];
  toggleItem: (id: string) => Promise<void>;
  allCompleted: boolean;
  completedCount: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const MVDContext = createContext<MVDContextType | undefined>(undefined);

const todayISO = () => new Date().toISOString().slice(0, 10);

function mapItem(row: any): MVDItem {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    title: row.title,
    description: row.description ?? undefined,
    order: row.sort_order,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function diffDays(a: string, b: string): number {
  const d1 = new Date(a + 'T00:00:00Z').getTime();
  const d2 = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((d1 - d2) / 86400000);
}

export function MVDProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<MVDItem[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const computeStreaks = useCallback((completedDates: string[]) => {
    if (completedDates.length === 0) {
      return { current: 0, longest: 0, last: null as string | null };
    }
    // Sort descending
    const sorted = [...completedDates].sort((a, b) => (a < b ? 1 : -1));
    const last = sorted[0];

    // Current streak: must include today or yesterday
    const today = todayISO();
    let current = 0;
    if (last === today || diffDays(today, last) === 1) {
      current = 1;
      for (let i = 1; i < sorted.length; i++) {
        if (diffDays(sorted[i - 1], sorted[i]) === 1) current++;
        else break;
      }
    }

    // Longest streak (ascending walk)
    const asc = [...completedDates].sort();
    let longest = 1;
    let run = 1;
    for (let i = 1; i < asc.length; i++) {
      if (diffDays(asc[i], asc[i - 1]) === 1) {
        run++;
        if (run > longest) longest = run;
      } else {
        run = 1;
      }
    }
    return { current, longest, last };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]); setCompletedItems([]);
      setCurrentStreak(0); setLongestStreak(0); setLastCompletedDate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = todayISO();
    const [{ data: itemsData }, { data: todayCheckIn }, { data: completedDays }] = await Promise.all([
      supabase.from('mvd_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('mvd_check_ins').select('completed_item_ids, mvd_completed').eq('check_in_date', today).maybeSingle(),
      supabase.from('mvd_check_ins').select('check_in_date').eq('mvd_completed', true).order('check_in_date', { ascending: false }),
    ]);

    if (itemsData) setItems(itemsData.map(mapItem));
    setCompletedItems(((todayCheckIn?.completed_item_ids ?? []) as string[]));
    const completedDates = (completedDays ?? []).map((r: any) => r.check_in_date as string);
    const { current, longest, last } = computeStreaks(completedDates);
    setCurrentStreak(current);
    setLongestStreak(longest);
    setLastCompletedDate(last);
    setLoading(false);
  }, [user, computeStreaks]);

  useEffect(() => { refresh(); }, [refresh]);

  // Reset completedItems at midnight (in case user keeps tab open across days)
  useEffect(() => {
    const interval = setInterval(() => {
      // Re-fetch if the local "today" has shifted
      refresh();
    }, 60 * 60 * 1000); // hourly
    return () => clearInterval(interval);
  }, [refresh]);

  const allCompleted = useMemo(
    () => items.length > 0 && items.every(item => completedItems.includes(item.id)),
    [items, completedItems]
  );
  const completedCount = useMemo(
    () => completedItems.filter(id => items.some(item => item.id === id)).length,
    [completedItems, items]
  );

  const toggleItem = useCallback(async (id: string) => {
    if (!user) return;
    const today = todayISO();
    const newCompleted = completedItems.includes(id)
      ? completedItems.filter(i => i !== id)
      : [...completedItems, id];
    setCompletedItems(newCompleted);

    const newAllCompleted = items.length > 0 && items.every(item => newCompleted.includes(item.id));

    await supabase.from('mvd_check_ins').upsert(
      {
        user_id: user.id,
        check_in_date: today,
        completed_item_ids: newCompleted,
        mvd_completed: newAllCompleted,
      },
      { onConflict: 'user_id,check_in_date' }
    );

    // Recompute streaks from server (cheap query)
    const { data: completedDays } = await supabase
      .from('mvd_check_ins')
      .select('check_in_date')
      .eq('mvd_completed', true)
      .order('check_in_date', { ascending: false });
    const dates = (completedDays ?? []).map((r: any) => r.check_in_date as string);
    const { current, longest, last } = computeStreaks(dates);
    setCurrentStreak(current);
    setLongestStreak(longest);
    setLastCompletedDate(last);
  }, [user, completedItems, items, computeStreaks]);

  return (
    <MVDContext.Provider value={{
      items, completedItems, toggleItem, allCompleted, completedCount,
      currentStreak, longestStreak, lastCompletedDate, loading, refresh,
    }}>
      {children}
    </MVDContext.Provider>
  );
}

export function useMVD() {
  const ctx = useContext(MVDContext);
  if (!ctx) throw new Error('useMVD must be used within a MVDProvider');
  return ctx;
}
