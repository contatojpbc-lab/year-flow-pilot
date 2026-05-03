import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Reminder, ReminderType, ReminderFrequency } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RemindersContextType {
  reminders: Reminder[];
  loading: boolean;
  refresh: () => Promise<void>;
  createReminder: (input: { title: string; description?: string; type: ReminderType; scheduledDate: Date; frequency: ReminderFrequency; linkedEntityId?: string }) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

function mapRow(row: any): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    linkedEntityId: row.linked_entity_id ?? undefined,
    scheduledDate: new Date(row.scheduled_date),
    frequency: row.frequency,
    isActive: row.is_active,
    notificationSent: row.notification_sent,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setReminders([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .order('scheduled_date', { ascending: true });
    setReminders((data ?? []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const createReminder = useCallback(async (input) => {
    if (!user) return;
    await supabase.from('reminders').insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      scheduled_date: input.scheduledDate.toISOString(),
      frequency: input.frequency,
      linked_entity_id: input.linkedEntityId ?? null,
    });
    await refresh();
  }, [user, refresh]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    await supabase.from('reminders').update({ is_active: isActive }).eq('id', id);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive } : r));
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
    await refresh();
  }, [refresh]);

  return (
    <RemindersContext.Provider value={{ reminders, loading, refresh, createReminder, toggleActive, deleteReminder }}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within a RemindersProvider');
  return ctx;
}
