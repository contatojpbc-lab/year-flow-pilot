import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useMVD } from '@/contexts/MVDContext';
import { useLifeAreas } from '@/contexts/LifeAreasContext';
import { useRoutine } from '@/contexts/RoutineContext';

export type RecommendationType = 'next_action' | 'high_impact' | 'quick_win' | 'strategic';

export interface SmartRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  action: string;
  reasoning: string;
  estimatedTime?: string;
  impactScore: number;
  linkedGoalId?: string;
  linkedAreaId?: string;
  priority: number;
}

const typeLabels: Record<RecommendationType, string> = {
  next_action: 'Melhor Próxima Ação',
  high_impact: 'Maior Impacto',
  quick_win: 'Vitória Rápida',
  strategic: 'Ação Estratégica',
};

const daysUntil = (date: Date): number => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const useSmartRecommendations = (): SmartRecommendation[] => {
  const { goals } = useGoals();
  const { history } = useHistory();
  const { completedItems, items: mvdItems } = useMVD();
  const { lifeAreas } = useLifeAreas();
  const { routineItems } = useRoutine();

  return useMemo(() => {
    const recommendations: SmartRecommendation[] = [];
    const activeGoals = goals.filter(g => g.status === 'active');

    // 1. NEXT ACTION
    const pendingMVD = mvdItems.filter(item => !completedItems.includes(item.id));
    if (pendingMVD.length > 0) {
      const nextMVDItem = pendingMVD[0];
      recommendations.push({
        id: 'next-mvd',
        type: 'next_action',
        title: typeLabels.next_action,
        description: nextMVDItem.title,
        action: 'Completar agora',
        reasoning: `Próximo item do seu MVD. ${pendingMVD.length} itens restantes para manter o streak.`,
        estimatedTime: '5-10 min',
        impactScore: 7,
        priority: 1,
      });
    } else {
      const priorityGoal = activeGoals
        .filter(g => daysUntil(g.timeBound) <= 60)
        .sort((a, b) => a.progress - b.progress)[0];
      if (priorityGoal) {
        const linkedHabit = routineItems.find(h => h.linkedGoalId === priorityGoal.id);
        if (linkedHabit) {
          recommendations.push({
            id: 'next-habit',
            type: 'next_action',
            title: typeLabels.next_action,
            description: linkedHabit.title,
            action: 'Executar hábito',
            reasoning: `Vinculado à meta "${priorityGoal.title}" que precisa de atenção.`,
            estimatedTime: '15-30 min',
            impactScore: 8,
            linkedGoalId: priorityGoal.id,
            priority: 1,
          });
        }
      }
    }

    // 2. HIGH IMPACT
    const goalsWithGap = activeGoals.map(goal => {
      const daysRemaining = daysUntil(goal.timeBound);
      const totalDays = 365;
      const elapsedRatio = Math.max(0, 1 - (daysRemaining / totalDays));
      const expectedProgress = elapsedRatio * 100;
      const gap = expectedProgress - goal.progress;
      return { goal, gap, daysRemaining };
    }).filter(g => g.gap > 5 && g.daysRemaining > 0)
      .sort((a, b) => b.gap - a.gap);

    if (goalsWithGap.length > 0) {
      const topGap = goalsWithGap[0];
      const area = lifeAreas.find(a => a.id === topGap.goal.lifeAreaId);
      const linkedHabit = routineItems.find(h => h.linkedGoalId === topGap.goal.id);

      recommendations.push({
        id: 'high-impact-goal',
        type: 'high_impact',
        title: typeLabels.high_impact,
        description: linkedHabit?.title || `Trabalhar em: ${topGap.goal.title}`,
        action: 'Dedicar 30 min hoje',
        reasoning: `Meta ${Math.round(topGap.gap)}% abaixo do esperado. ${topGap.daysRemaining} dias restantes.`,
        estimatedTime: '30-45 min',
        impactScore: 9,
        linkedGoalId: topGap.goal.id,
        linkedAreaId: area?.id,
        priority: 2,
      });
    }

    // 3. QUICK WIN
    const quickHabits = routineItems.filter(h => h.isActive);
    if (quickHabits.length > 0) {
      const linkedQuickHabit = quickHabits.find(h => h.linkedGoalId && h.timeOfDay === 'morning')
        || quickHabits.find(h => h.linkedGoalId)
        || quickHabits.find(h => h.timeOfDay === 'morning')
        || quickHabits[0];
      const linkedGoal = goals.find(g => g.id === linkedQuickHabit.linkedGoalId);
      const estimatedTime = linkedQuickHabit.timeOfDay === 'morning' ? '10' : '15';

      recommendations.push({
        id: 'quick-win',
        type: 'quick_win',
        title: typeLabels.quick_win,
        description: linkedQuickHabit.title,
        action: 'Fazer agora',
        reasoning: linkedGoal
          ? `Ação rápida que impacta "${linkedGoal.title}". Perfeita para manter o momentum.`
          : 'Ação curta e eficiente para manter a consistência.',
        estimatedTime: `${estimatedTime} min`,
        impactScore: 5,
        linkedGoalId: linkedQuickHabit.linkedGoalId,
        priority: 3,
      });
    }

    // 4. STRATEGIC
    if (history) {
      const currentMonth = new Date().getMonth() + 1;
      const areaScores = new Map<string, { current: number; previous: number }>();

      history.lifeAreas.forEach(snapshot => {
        if (snapshot.month === currentMonth || snapshot.month === currentMonth - 1) {
          const existing = areaScores.get(snapshot.lifeAreaId) || { current: 0, previous: 0 };
          if (snapshot.month === currentMonth) existing.current = snapshot.overallScore;
          else existing.previous = snapshot.overallScore;
          areaScores.set(snapshot.lifeAreaId, existing);
        }
      });

      let worstArea: { id: string; trend: number; score: number } | null = null;
      areaScores.forEach((scores, areaId) => {
        const trend = scores.current - scores.previous;
        if (!worstArea || trend < worstArea.trend) {
          worstArea = { id: areaId, trend, score: scores.current };
        }
      });

      if (worstArea && worstArea.trend < 0) {
        const area = lifeAreas.find(a => a.id === worstArea!.id);
        const areaGoals = activeGoals.filter(g => g.lifeAreaId === worstArea!.id);
        const priorityGoal = areaGoals.sort((a, b) => a.progress - b.progress)[0];

        recommendations.push({
          id: 'strategic-area',
          type: 'strategic',
          title: typeLabels.strategic,
          description: priorityGoal
            ? `Revisar e replanejar: ${priorityGoal.title}`
            : `Dedicar tempo à área: ${area?.name || 'Vida'}`,
          action: 'Planejar esta semana',
          reasoning: `Área "${area?.name}" caiu ${Math.abs(worstArea.trend).toFixed(0)}% este mês. Requer atenção estratégica.`,
          estimatedTime: '20-30 min',
          impactScore: 8,
          linkedGoalId: priorityGoal?.id,
          linkedAreaId: worstArea.id,
          priority: 4,
        });
      } else {
        const topGoal = activeGoals
          .filter(g => g.progress >= 50)
          .sort((a, b) => b.progress - a.progress)[0];
        if (topGoal) {
          recommendations.push({
            id: 'strategic-consolidate',
            type: 'strategic',
            title: typeLabels.strategic,
            description: `Acelerar: ${topGoal.title}`,
            action: 'Intensificar esta semana',
            reasoning: `Meta em ${topGoal.progress}%. Momento ideal para acelerar e consolidar ganhos.`,
            estimatedTime: '30 min/dia',
            impactScore: 7,
            linkedGoalId: topGoal.id,
            priority: 4,
          });
        }
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, [goals, history, completedItems, mvdItems, lifeAreas, routineItems]);
};

export { typeLabels };
