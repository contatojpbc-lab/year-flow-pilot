import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { LifeArea } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LifeAreasContextType {
  lifeAreas: LifeArea[];
  loading: boolean;
  refresh: () => Promise<void>;
  getLifeAreaById: (id: string) => LifeArea | undefined;
}

const LifeAreasContext = createContext<LifeAreasContextType | undefined>(undefined);

function mapRow(row: any): LifeArea {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    name: row.name,
    icon: row.icon,
    color: row.color,
    description: row.description ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function LifeAreasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLifeAreas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('life_areas')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setLifeAreas(data.map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const getLifeAreaById = useCallback(
    (id: string) => lifeAreas.find(a => a.id === id),
    [lifeAreas]
  );

  return (
    <LifeAreasContext.Provider value={{ lifeAreas, loading, refresh, getLifeAreaById }}>
      {children}
    </LifeAreasContext.Provider>
  );
}

export function useLifeAreas() {
  const ctx = useContext(LifeAreasContext);
  if (!ctx) throw new Error('useLifeAreas must be used within LifeAreasProvider');
  return ctx;
}
