import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { JournalEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface JournalContextType {
  entries: JournalEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  createEntry: (input: { title?: string; content: string; mood?: number; tags?: string[]; linkedGoalIds?: string[] }) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

function mapRow(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    date: new Date(row.entry_date),
    title: row.title || undefined,
    content: row.content,
    mood: row.mood ?? undefined,
    tags: row.tags ?? [],
    linkedGoalIds: row.linked_goal_ids ?? [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setEntries([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false });
    setEntries((data ?? []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const createEntry = useCallback(async (input: { title?: string; content: string; mood?: number; tags?: string[]; linkedGoalIds?: string[] }) => {
    if (!user) return;
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: input.title ?? '',
      content: input.content,
      mood: input.mood ?? null,
      tags: input.tags ?? [],
      linked_goal_ids: input.linkedGoalIds ?? [],
    });
    await refresh();
  }, [user, refresh]);

  const deleteEntry = useCallback(async (id: string) => {
    await supabase.from('journal_entries').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  return (
    <JournalContext.Provider value={{ entries, loading, refresh, createEntry, deleteEntry }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within a JournalProvider');
  return ctx;
}
