 import { useMemo } from 'react';
 import { useGoals } from '@/contexts/GoalsContext';
 import { useMVD } from '@/contexts/MVDContext';
 import { mockRoutineItems } from '@/data/mockData';
 
 export interface MentalLoadState {
   score: number; // 0-100, higher = more overloaded
   level: 'low' | 'moderate' | 'high' | 'critical';
   factors: string[];
   recommendations: string[];
   shouldReduceTasks: boolean;
   maxPrioritiesToShow: number;
 }
 
 // Calculate days until deadline
 const daysUntil = (date: Date): number => {
   const now = new Date();
   const target = new Date(date);
   const diffTime = target.getTime() - now.getTime();
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 };
 
 export const useMentalLoad = (): MentalLoadState => {
   const { goals } = useGoals();
   const { items: mvdItems, completedItems, allCompleted } = useMVD();
 
   return useMemo(() => {
     let score = 0;
     const factors: string[] = [];
     const recommendations: string[] = [];
 
     // Factor 1: Number of active goals (weight: 15)
     const activeGoals = goals.filter(g => g.status === 'active');
     if (activeGoals.length > 8) {
       score += 15;
       factors.push(`${activeGoals.length} metas ativas simultâneas`);
     } else if (activeGoals.length > 5) {
       score += 8;
     }
 
     // Factor 2: Goals with tight deadlines (weight: 25)
     const urgentGoals = activeGoals.filter(g => daysUntil(g.timeBound) <= 14);
     if (urgentGoals.length >= 3) {
       score += 25;
       factors.push(`${urgentGoals.length} metas com prazo em até 2 semanas`);
     } else if (urgentGoals.length >= 2) {
       score += 15;
       factors.push(`${urgentGoals.length} metas com prazo próximo`);
     } else if (urgentGoals.length === 1) {
       score += 5;
     }
 
     // Factor 3: Low progress on multiple goals (weight: 20)
     const strugglingGoals = activeGoals.filter(g => g.progress < 20);
     if (strugglingGoals.length >= 4) {
       score += 20;
       factors.push(`${strugglingGoals.length} metas com menos de 20% de progresso`);
     } else if (strugglingGoals.length >= 2) {
       score += 10;
     }
 
     // Factor 4: MVD not started (weight: 10)
     if (mvdItems.length > 0 && completedItems.length === 0) {
       score += 10;
       factors.push('MVD do dia ainda não iniciado');
     }
 
     // Factor 5: Too many habits (weight: 15)
     const totalHabits = mockRoutineItems.length;
     if (totalHabits > 10) {
       score += 15;
       factors.push(`${totalHabits} hábitos diários para manter`);
     } else if (totalHabits > 7) {
       score += 8;
     }
 
     // Factor 6: Multiple goals behind schedule (weight: 15)
     const behindScheduleGoals = activeGoals.filter(goal => {
       const daysRemaining = daysUntil(goal.timeBound);
       if (daysRemaining <= 0) return false;
       const totalDays = 365; // Simplified: assume year-long goals
       const elapsedRatio = 1 - (daysRemaining / totalDays);
       const expectedProgress = elapsedRatio * 100;
       return goal.progress < expectedProgress - 15; // 15% or more behind
     });
     
     if (behindScheduleGoals.length >= 3) {
       score += 15;
       factors.push(`${behindScheduleGoals.length} metas atrasadas em relação ao esperado`);
     } else if (behindScheduleGoals.length >= 1) {
       score += 5;
     }
 
     // Bonus: MVD completed reduces stress
     if (allCompleted) {
       score = Math.max(0, score - 15);
     }
 
     // Clamp score
     score = Math.min(100, Math.max(0, score));
 
     // Determine level
     let level: MentalLoadState['level'];
     if (score >= 70) {
       level = 'critical';
     } else if (score >= 50) {
       level = 'high';
     } else if (score >= 30) {
       level = 'moderate';
     } else {
       level = 'low';
     }
 
     // Generate recommendations based on level
     if (level === 'critical') {
       recommendations.push('Foque apenas no MVD hoje');
       recommendations.push('Considere adiar metas não urgentes');
       recommendations.push('Faça uma pausa de 10 minutos');
     } else if (level === 'high') {
       recommendations.push('Priorize as 2-3 tarefas mais importantes');
       recommendations.push('Evite adicionar novas metas esta semana');
     } else if (level === 'moderate') {
       recommendations.push('Mantenha o foco nas prioridades do dia');
     }
 
     // Determine task reduction
     const shouldReduceTasks = level === 'high' || level === 'critical';
     const maxPrioritiesToShow = level === 'critical' ? 3 : level === 'high' ? 4 : 6;
 
     return {
       score,
       level,
       factors,
       recommendations,
       shouldReduceTasks,
       maxPrioritiesToShow,
     };
   }, [goals, mvdItems, completedItems, allCompleted]);
 };