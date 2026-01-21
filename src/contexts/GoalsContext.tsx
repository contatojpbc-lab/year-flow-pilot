import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Goal } from '@/types';
import { mockGoals, mockRoutineItems } from '@/data/mockData';

interface GoalsContextType {
  goals: Goal[];
  updateGoalProgress: (goalId: string, progressDelta: number) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  getProgressPerHabit: (goalId: string) => number;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  // Calculate how much progress each habit contributes to a goal
  // Based on total habits linked to that goal
  const getProgressPerHabit = useCallback((goalId: string): number => {
    const linkedHabits = mockRoutineItems.filter(r => r.linkedGoalId === goalId);
    if (linkedHabits.length === 0) return 0;
    // Each habit can contribute up to 100% / number of linked habits
    // But we want incremental progress, so each completion adds a portion
    // Let's say completing all linked habits daily = 2% progress towards the goal
    const dailyMaxProgress = 2;
    return dailyMaxProgress / linkedHabits.length;
  }, []);

  const updateGoalProgress = useCallback((goalId: string, progressDelta: number) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id !== goalId) return goal;
        const newProgress = Math.min(100, Math.max(0, goal.progress + progressDelta));
        return { ...goal, progress: Math.round(newProgress * 10) / 10 };
      })
    );
  }, []);

  const getGoalById = useCallback((goalId: string): Goal | undefined => {
    return goals.find(g => g.id === goalId);
  }, [goals]);

  return (
    <GoalsContext.Provider value={{ goals, updateGoalProgress, getGoalById, getProgressPerHabit }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
