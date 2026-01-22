import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockMVDItems } from '@/data/mockData';
import { MVDItem } from '@/types';

interface MVDContextType {
  items: MVDItem[];
  completedItems: string[];
  toggleItem: (id: string) => void;
  allCompleted: boolean;
  completedCount: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

const MVDContext = createContext<MVDContextType | undefined>(undefined);

const getToday = () => new Date().toISOString().split('T')[0];

export function MVDProvider({ children }: { children: ReactNode }) {
  // Initialize state - check if it's a new day and reset if needed
  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    const savedDate = localStorage.getItem('mvd-date');
    const today = getToday();
    
    // If it's a new day, reset the completed items
    if (savedDate !== today) {
      return [];
    }
    
    // Otherwise, load saved items
    const saved = localStorage.getItem('mvd-completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    const saved = localStorage.getItem('mvd-streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [longestStreak, setLongestStreak] = useState<number>(() => {
    const saved = localStorage.getItem('mvd-longest-streak');
    return saved ? parseInt(saved, 10) : 21; // Start with mock value
  });

  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(() => {
    return localStorage.getItem('mvd-last-completed');
  });

  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(() => {
    const saved = localStorage.getItem('mvd-completed-today');
    const savedDate = localStorage.getItem('mvd-date');
    const today = getToday();
    
    // Reset if it's a new day
    if (savedDate !== today) {
      return false;
    }
    
    return saved === 'true';
  });

  const items = mockMVDItems;
  const allCompleted = items.every(item => completedItems.includes(item.id));
  const completedCount = completedItems.filter(id => items.some(item => item.id === id)).length;

  // Check for day change and handle streak logic
  useEffect(() => {
    const today = getToday();
    const savedDate = localStorage.getItem('mvd-date');
    
    if (savedDate && savedDate !== today) {
      // It's a new day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if MVD was completed yesterday
      const wasCompletedYesterday = lastCompletedDate === yesterdayStr;
      
      if (!wasCompletedYesterday && lastCompletedDate !== today) {
        // Streak broken - but only reset if it wasn't already today
        setCurrentStreak(0);
        localStorage.setItem('mvd-streak', '0');
      }
      
      // Reset completed items for new day
      setCompletedItems([]);
      setHasCompletedToday(false);
      localStorage.setItem('mvd-completed', '[]');
      localStorage.setItem('mvd-completed-today', 'false');
    }
    
    // Save current date
    localStorage.setItem('mvd-date', today);
  }, [lastCompletedDate]);

  // Handle streak increment when all items completed
  useEffect(() => {
    if (allCompleted && !hasCompletedToday && completedItems.length > 0) {
      const today = getToday();
      
      // Increment streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      localStorage.setItem('mvd-streak', newStreak.toString());
      
      // Update longest streak if needed
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
        localStorage.setItem('mvd-longest-streak', newStreak.toString());
      }
      
      // Mark today as completed
      setLastCompletedDate(today);
      setHasCompletedToday(true);
      localStorage.setItem('mvd-last-completed', today);
      localStorage.setItem('mvd-completed-today', 'true');
    }
  }, [allCompleted, hasCompletedToday, completedItems.length, currentStreak, longestStreak]);

  // Persist completed items
  useEffect(() => {
    localStorage.setItem('mvd-completed', JSON.stringify(completedItems));
  }, [completedItems]);

  const toggleItem = (id: string) => {
    setCompletedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <MVDContext.Provider value={{
      items,
      completedItems,
      toggleItem,
      allCompleted,
      completedCount,
      currentStreak,
      longestStreak,
      lastCompletedDate,
    }}>
      {children}
    </MVDContext.Provider>
  );
}

export function useMVD() {
  const context = useContext(MVDContext);
  if (context === undefined) {
    throw new Error('useMVD must be used within a MVDProvider');
  }
  return context;
}
