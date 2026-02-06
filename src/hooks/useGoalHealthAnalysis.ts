import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { mockLifeAreas } from '@/data/mockData';
import { Goal } from '@/types';

export type GoalHealthStatus = 'healthy' | 'at_risk' | 'stuck' | 'unrealistic';

export interface GoalHealthIssue {
  type: 'deadline' | 'scope' | 'effort' | 'stagnation' | 'overload';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface AdjustmentRecommendation {
  id: string;
  type: 'deadline' | 'scope' | 'effort' | 'pause' | 'split' | 'merge';
  title: string;
  description: string;
  impact: string;
  priority: number;
  actionLabel: string;
}

export interface GoalHealthReport {
  goalId: string;
  goalTitle: string;
  lifeAreaId: string;
  lifeAreaName: string;
  lifeAreaColor: string;
  status: GoalHealthStatus;
  healthScore: number; // 0-100
  issues: GoalHealthIssue[];
  recommendations: AdjustmentRecommendation[];
  metrics: {
    daysRemaining: number;
    expectedProgress: number;
    actualProgress: number;
    progressGap: number;
    velocityRequired: number; // % per week needed
    currentVelocity: number; // estimated % per week
  };
}

export interface LifeAreaBalance {
  lifeAreaId: string;
  lifeAreaName: string;
  lifeAreaColor: string;
  goalsCount: number;
  averageProgress: number;
  totalEffortWeight: number;
  isOverloaded: boolean;
  isNeglected: boolean;
}

export interface RebalanceRecommendation {
  id: string;
  type: 'reduce_focus' | 'increase_focus' | 'redistribute' | 'prioritize';
  fromArea?: string;
  toArea?: string;
  title: string;
  description: string;
  reasoning: string;
}

export interface GoalHealthAnalysis {
  reports: GoalHealthReport[];
  healthyGoals: number;
  atRiskGoals: number;
  stuckGoals: number;
  unrealisticGoals: number;
  overallHealthScore: number;
  lifeAreaBalance: LifeAreaBalance[];
  rebalanceRecommendations: RebalanceRecommendation[];
  topPriorityAdjustments: AdjustmentRecommendation[];
}

function calculateGoalHealth(goal: Goal): GoalHealthReport {
  const lifeArea = mockLifeAreas.find(a => a.id === goal.lifeAreaId);
  const now = new Date();
  const deadline = new Date(goal.timeBound);
  const createdAt = new Date(goal.createdAt);
  
  // Calculate time metrics
  const totalDays = Math.max(1, (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Expected progress based on time elapsed
  const elapsedRatio = Math.min(1, elapsedDays / totalDays);
  const expectedProgress = elapsedRatio * 100;
  const progressGap = expectedProgress - goal.progress;
  
  // Calculate required velocity
  const weeksRemaining = Math.max(1, daysRemaining / 7);
  const progressNeeded = 100 - goal.progress;
  const velocityRequired = progressNeeded / weeksRemaining;
  
  // Estimate current velocity (simulated based on progress and time)
  const weeksElapsed = Math.max(1, elapsedDays / 7);
  const currentVelocity = goal.progress / weeksElapsed;
  
  // Determine issues
  const issues: GoalHealthIssue[] = [];
  
  // Check for stagnation (less than 10% progress after 25% of time)
  if (elapsedRatio > 0.25 && goal.progress < 10) {
    issues.push({
      type: 'stagnation',
      severity: 'high',
      description: `Meta com apenas ${goal.progress.toFixed(0)}% após ${Math.round(elapsedRatio * 100)}% do tempo`,
    });
  }
  
  // Check for unrealistic deadline
  if (velocityRequired > currentVelocity * 2 && daysRemaining < 90) {
    issues.push({
      type: 'deadline',
      severity: velocityRequired > currentVelocity * 3 ? 'high' : 'medium',
      description: `Precisa de ${velocityRequired.toFixed(1)}%/semana, atual é ${currentVelocity.toFixed(1)}%/semana`,
    });
  }
  
  // Check for scope issues (too ambitious)
  if (progressGap > 30 && elapsedRatio > 0.4) {
    issues.push({
      type: 'scope',
      severity: progressGap > 50 ? 'high' : 'medium',
      description: `Defasagem de ${progressGap.toFixed(0)}% em relação ao esperado`,
    });
  }
  
  // Check for effort issues (not enough linked habits)
  if (goal.progress < 30 && elapsedRatio > 0.3) {
    issues.push({
      type: 'effort',
      severity: 'medium',
      description: 'Esforço atual pode não ser suficiente para o objetivo',
    });
  }
  
  // Calculate health score
  let healthScore = 100;
  healthScore -= progressGap > 0 ? Math.min(40, progressGap) : 0;
  healthScore -= issues.filter(i => i.severity === 'high').length * 20;
  healthScore -= issues.filter(i => i.severity === 'medium').length * 10;
  healthScore -= issues.filter(i => i.severity === 'low').length * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Determine status
  let status: GoalHealthStatus = 'healthy';
  if (healthScore < 30 || issues.some(i => i.type === 'stagnation' && i.severity === 'high')) {
    status = goal.progress < 10 && elapsedRatio > 0.3 ? 'stuck' : 'unrealistic';
  } else if (healthScore < 60 || issues.length >= 2) {
    status = 'at_risk';
  }
  
  // Generate recommendations
  const recommendations: AdjustmentRecommendation[] = [];
  
  if (issues.some(i => i.type === 'deadline')) {
    const suggestedExtension = Math.ceil(progressNeeded / (currentVelocity || 1));
    recommendations.push({
      id: `${goal.id}-deadline`,
      type: 'deadline',
      title: 'Estender prazo',
      description: `Considere estender o prazo em ${suggestedExtension} semanas para um ritmo mais sustentável`,
      impact: 'Reduz pressão e aumenta chance de sucesso',
      priority: 1,
      actionLabel: 'Ajustar prazo',
    });
  }
  
  if (issues.some(i => i.type === 'scope')) {
    recommendations.push({
      id: `${goal.id}-scope`,
      type: 'scope',
      title: 'Reduzir escopo',
      description: 'Divida a meta em objetivos menores e mais alcançáveis',
      impact: 'Metas menores são mais fáceis de manter e completar',
      priority: 2,
      actionLabel: 'Redefinir escopo',
    });
  }
  
  if (issues.some(i => i.type === 'effort')) {
    recommendations.push({
      id: `${goal.id}-effort`,
      type: 'effort',
      title: 'Aumentar dedicação',
      description: 'Vincule mais hábitos diários ou aumente a frequência das ações',
      impact: 'Mais consistência acelera o progresso gradualmente',
      priority: 3,
      actionLabel: 'Adicionar hábitos',
    });
  }
  
  if (issues.some(i => i.type === 'stagnation') && goal.progress < 5) {
    recommendations.push({
      id: `${goal.id}-pause`,
      type: 'pause',
      title: 'Pausar temporariamente',
      description: 'Considere pausar esta meta e focar em outras mais viáveis agora',
      impact: 'Libera energia mental para metas com mais momentum',
      priority: 1,
      actionLabel: 'Pausar meta',
    });
  }
  
  if (progressGap > 40 && daysRemaining > 60) {
    recommendations.push({
      id: `${goal.id}-split`,
      type: 'split',
      title: 'Dividir em fases',
      description: 'Transforme em 2-3 metas menores com marcos intermediários',
      impact: 'Vitórias menores mantêm motivação alta',
      priority: 2,
      actionLabel: 'Dividir meta',
    });
  }
  
  return {
    goalId: goal.id,
    goalTitle: goal.title,
    lifeAreaId: goal.lifeAreaId,
    lifeAreaName: lifeArea?.name || 'Unknown',
    lifeAreaColor: lifeArea?.color || 'hsl(0 0% 50%)',
    status,
    healthScore,
    issues,
    recommendations: recommendations.sort((a, b) => a.priority - b.priority),
    metrics: {
      daysRemaining: Math.round(daysRemaining),
      expectedProgress: Math.round(expectedProgress),
      actualProgress: goal.progress,
      progressGap: Math.round(progressGap),
      velocityRequired: Math.round(velocityRequired * 10) / 10,
      currentVelocity: Math.round(currentVelocity * 10) / 10,
    },
  };
}

function analyzeLifeAreaBalance(goals: Goal[]): LifeAreaBalance[] {
  const areaMap = new Map<string, { goals: Goal[]; totalProgress: number }>();
  
  // Group goals by life area
  goals.forEach(goal => {
    const existing = areaMap.get(goal.lifeAreaId) || { goals: [], totalProgress: 0 };
    existing.goals.push(goal);
    existing.totalProgress += goal.progress;
    areaMap.set(goal.lifeAreaId, existing);
  });
  
  const avgGoalsPerArea = goals.length / mockLifeAreas.length;
  
  return mockLifeAreas.map(area => {
    const data = areaMap.get(area.id);
    const goalsCount = data?.goals.length || 0;
    const averageProgress = goalsCount > 0 ? (data?.totalProgress || 0) / goalsCount : 0;
    
    // Simulate effort weight (in real app, based on time spent, habits linked, etc.)
    const totalEffortWeight = goalsCount * (1 + Math.random() * 0.5);
    
    return {
      lifeAreaId: area.id,
      lifeAreaName: area.name,
      lifeAreaColor: area.color,
      goalsCount,
      averageProgress: Math.round(averageProgress),
      totalEffortWeight: Math.round(totalEffortWeight * 10) / 10,
      isOverloaded: goalsCount > avgGoalsPerArea * 1.5,
      isNeglected: goalsCount === 0 || (goalsCount > 0 && averageProgress < 15),
    };
  });
}

function generateRebalanceRecommendations(
  balance: LifeAreaBalance[],
  reports: GoalHealthReport[]
): RebalanceRecommendation[] {
  const recommendations: RebalanceRecommendation[] = [];
  
  const overloaded = balance.filter(b => b.isOverloaded);
  const neglected = balance.filter(b => b.isNeglected);
  
  // Recommend reducing focus on overloaded areas
  overloaded.forEach(area => {
    const areaReports = reports.filter(r => r.lifeAreaId === area.lifeAreaId);
    const worstGoal = areaReports.sort((a, b) => a.healthScore - b.healthScore)[0];
    
    recommendations.push({
      id: `reduce-${area.lifeAreaId}`,
      type: 'reduce_focus',
      fromArea: area.lifeAreaName,
      title: `Reduzir foco em ${area.lifeAreaName}`,
      description: `Você tem ${area.goalsCount} metas nesta área. Considere pausar ou simplificar algumas.`,
      reasoning: worstGoal 
        ? `"${worstGoal.goalTitle}" está com score de saúde de ${worstGoal.healthScore}%`
        : 'Muitas metas competindo por atenção',
    });
  });
  
  // Recommend increasing focus on neglected areas
  neglected.forEach(area => {
    if (area.goalsCount === 0) {
      recommendations.push({
        id: `add-${area.lifeAreaId}`,
        type: 'increase_focus',
        toArea: area.lifeAreaName,
        title: `Adicionar meta em ${area.lifeAreaName}`,
        description: 'Esta área não tem metas ativas. Uma vida equilibrada requer atenção a todas as áreas.',
        reasoning: 'Equilíbrio entre áreas da vida promove bem-estar geral',
      });
    } else {
      recommendations.push({
        id: `boost-${area.lifeAreaId}`,
        type: 'prioritize',
        toArea: area.lifeAreaName,
        title: `Priorizar ${area.lifeAreaName}`,
        description: `Progresso médio de apenas ${area.averageProgress}%. Dedique mais tempo a esta área.`,
        reasoning: 'Áreas negligenciadas podem impactar outras a longo prazo',
      });
    }
  });
  
  // Recommend redistribution if severe imbalance
  if (overloaded.length > 0 && neglected.length > 0) {
    recommendations.push({
      id: 'redistribute-general',
      type: 'redistribute',
      fromArea: overloaded[0]?.lifeAreaName,
      toArea: neglected[0]?.lifeAreaName,
      title: 'Reequilibrar esforço',
      description: `Mova parte da energia de "${overloaded[0]?.lifeAreaName}" para "${neglected[0]?.lifeAreaName}"`,
      reasoning: 'Distribuição mais equilibrada aumenta satisfação geral',
    });
  }
  
  return recommendations;
}

export function useGoalHealthAnalysis(): GoalHealthAnalysis {
  const { goals } = useGoals();
  
  return useMemo(() => {
    // Generate health reports for all active goals
    const activeGoals = goals.filter(g => g.status === 'active');
    const reports = activeGoals.map(calculateGoalHealth);
    
    // Count by status
    const healthyGoals = reports.filter(r => r.status === 'healthy').length;
    const atRiskGoals = reports.filter(r => r.status === 'at_risk').length;
    const stuckGoals = reports.filter(r => r.status === 'stuck').length;
    const unrealisticGoals = reports.filter(r => r.status === 'unrealistic').length;
    
    // Calculate overall health
    const overallHealthScore = reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.healthScore, 0) / reports.length)
      : 100;
    
    // Analyze life area balance
    const lifeAreaBalance = analyzeLifeAreaBalance(goals);
    
    // Generate rebalance recommendations
    const rebalanceRecommendations = generateRebalanceRecommendations(lifeAreaBalance, reports);
    
    // Get top priority adjustments across all goals
    const allRecommendations = reports.flatMap(r => 
      r.recommendations.map(rec => ({ ...rec, goalTitle: r.goalTitle }))
    );
    const topPriorityAdjustments = allRecommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);
    
    return {
      reports,
      healthyGoals,
      atRiskGoals,
      stuckGoals,
      unrealisticGoals,
      overallHealthScore,
      lifeAreaBalance,
      rebalanceRecommendations,
      topPriorityAdjustments,
    };
  }, [goals]);
}
