import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';

// ============================================
// TYPES
// ============================================

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface LifeAreaScore {
  area: string;
  score: number;
  previousScore: number;
  trend: 'improving' | 'stable' | 'declining';
  isStrength: boolean;
  isWeakness: boolean;
  keyMetric: string;
}

export interface StrategicDecision {
  id: string;
  title: string;
  category: 'priority' | 'resource' | 'direction' | 'optimization';
  description: string;
  impact: 'high' | 'medium' | 'low';
  deadline?: string;
  status: 'pending' | 'decided' | 'in_progress';
  recommendation?: string;
}

export interface ExecutiveSummary {
  headline: string;
  keyInsights: string[];
  criticalAlerts: string[];
  weeklyHighlight: string;
  actionableRecommendation: string;
}

export interface CEODashboard {
  overallLifeScore: number;
  previousLifeScore: number;
  scoreChange: number;
  scoreTrend: 'improving' | 'stable' | 'declining';
  performanceMetrics: PerformanceMetric[];
  lifeAreaScores: LifeAreaScore[];
  strengths: LifeAreaScore[];
  weaknesses: LifeAreaScore[];
  strategicDecisions: StrategicDecision[];
  executiveSummary: ExecutiveSummary;
  weekNumber: number;
  reportDate: Date;
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generatePerformanceMetrics = (): PerformanceMetric[] => [
  {
    id: 'pm-1',
    name: 'Taxa de Execução',
    value: 78,
    target: 85,
    unit: '%',
    trend: 'up',
    trendValue: 5,
    status: 'good',
  },
  {
    id: 'pm-2',
    name: 'Consistência de Rotina',
    value: 82,
    target: 90,
    unit: '%',
    trend: 'up',
    trendValue: 8,
    status: 'good',
  },
  {
    id: 'pm-3',
    name: 'Progresso de Metas',
    value: 45,
    target: 50,
    unit: '%',
    trend: 'stable',
    trendValue: 2,
    status: 'warning',
  },
  {
    id: 'pm-4',
    name: 'Streak MVD',
    value: 12,
    target: 30,
    unit: 'dias',
    trend: 'up',
    trendValue: 5,
    status: 'good',
  },
  {
    id: 'pm-5',
    name: 'Horas de Foco Profundo',
    value: 14,
    target: 20,
    unit: 'h/sem',
    trend: 'down',
    trendValue: -3,
    status: 'warning',
  },
  {
    id: 'pm-6',
    name: 'Equilíbrio de Áreas',
    value: 68,
    target: 80,
    unit: '%',
    trend: 'stable',
    trendValue: 0,
    status: 'warning',
  },
];

const generateLifeAreaScores = (): LifeAreaScore[] => [
  {
    area: 'Saúde & Fitness',
    score: 85,
    previousScore: 78,
    trend: 'improving',
    isStrength: true,
    isWeakness: false,
    keyMetric: '5 treinos/semana',
  },
  {
    area: 'Carreira & Trabalho',
    score: 72,
    previousScore: 70,
    trend: 'stable',
    isStrength: false,
    isWeakness: false,
    keyMetric: '3 projetos ativos',
  },
  {
    area: 'Crescimento Pessoal',
    score: 78,
    previousScore: 72,
    trend: 'improving',
    isStrength: true,
    isWeakness: false,
    keyMetric: '4 livros/mês',
  },
  {
    area: 'Relacionamentos',
    score: 55,
    previousScore: 60,
    trend: 'declining',
    isStrength: false,
    isWeakness: true,
    keyMetric: 'Baixa frequência social',
  },
  {
    area: 'Finanças',
    score: 68,
    previousScore: 65,
    trend: 'stable',
    isStrength: false,
    isWeakness: false,
    keyMetric: '75% do orçamento',
  },
  {
    area: 'Hobbies & Lazer',
    score: 45,
    previousScore: 50,
    trend: 'declining',
    isStrength: false,
    isWeakness: true,
    keyMetric: 'Tempo insuficiente',
  },
];

const generateStrategicDecisions = (): StrategicDecision[] => [
  {
    id: 'sd-1',
    title: 'Realocar tempo para Relacionamentos',
    category: 'resource',
    description: 'Área de Relacionamentos está em declínio contínuo. Considerar redistribuir 2h/semana de Carreira.',
    impact: 'high',
    deadline: 'Esta semana',
    status: 'pending',
    recommendation: 'Agendar pelo menos 1 encontro social semanal',
  },
  {
    id: 'sd-2',
    title: 'Ajustar meta de Espanhol B1',
    category: 'direction',
    description: 'Meta está 35% abaixo do ritmo necessário. Decidir entre estender prazo ou aumentar esforço.',
    impact: 'medium',
    status: 'pending',
    recommendation: 'Estender prazo em 2 meses e manter ritmo atual',
  },
  {
    id: 'sd-3',
    title: 'Proteger blocos de trabalho profundo',
    category: 'optimization',
    description: 'Horas de foco caíram 18% este mês. Reuniões estão fragmentando manhãs.',
    impact: 'high',
    deadline: 'Próxima segunda',
    status: 'in_progress',
    recommendation: 'Bloquear 8h-11h como "no-meeting zone"',
  },
  {
    id: 'sd-4',
    title: 'Definir prioridade Q1: Saúde vs Carreira',
    category: 'priority',
    description: 'Ambas áreas competem por tempo. Performance geral depende de foco claro.',
    impact: 'high',
    status: 'decided',
    recommendation: 'Manter Saúde como prioridade #1 até Março',
  },
  {
    id: 'sd-5',
    title: 'Automatizar revisão financeira',
    category: 'optimization',
    description: 'Gasto de 1h/semana em tracking manual pode ser reduzido.',
    impact: 'low',
    status: 'pending',
    recommendation: 'Configurar categorização automática no app',
  },
];

const generateExecutiveSummary = (lifeScore: number, scoreChange: number): ExecutiveSummary => ({
  headline: scoreChange >= 0 
    ? `Semana positiva: Life Score subiu ${scoreChange} pontos para ${lifeScore}` 
    : `Atenção necessária: Life Score caiu ${Math.abs(scoreChange)} pontos para ${lifeScore}`,
  keyInsights: [
    'Consistência de rotina atingiu o melhor nível em 30 dias (82%)',
    'Área de Saúde & Fitness lidera com score 85 - seu ponto mais forte',
    'Relacionamentos e Hobbies precisam de atenção urgente - ambos em declínio',
    'Streak MVD de 12 dias indica disciplina crescente',
  ],
  criticalAlerts: [
    '⚠️ Horas de trabalho profundo caíram 18% - risco para metas de carreira',
    '⚠️ Relacionamentos em declínio há 3 semanas consecutivas',
    '⚠️ Meta de Espanhol B1 precisa de decisão esta semana',
  ],
  weeklyHighlight: 'Primeiro mês com 20+ dias de MVD completo - marco significativo de consistência!',
  actionableRecommendation: 'FOCO DA SEMANA: Reequilibrar tempo entre Carreira e Relacionamentos. Agende 1 evento social e proteja 2h diárias de trabalho profundo.',
});

// ============================================
// HOOK
// ============================================

export const useCEOMode = (): CEODashboard => {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();

  const dashboard = useMemo((): CEODashboard => {
    const performanceMetrics = generatePerformanceMetrics();
    const lifeAreaScores = generateLifeAreaScores();
    const strategicDecisions = generateStrategicDecisions();

    // Calculate overall life score (weighted average of areas)
    const totalScore = lifeAreaScores.reduce((sum, area) => sum + area.score, 0);
    const overallLifeScore = Math.round(totalScore / lifeAreaScores.length);
    const previousLifeScore = 69; // Mock previous week score
    const scoreChange = overallLifeScore - previousLifeScore;

    // Determine trend
    const scoreTrend: 'improving' | 'stable' | 'declining' = 
      scoreChange > 2 ? 'improving' : scoreChange < -2 ? 'declining' : 'stable';

    // Identify strengths and weaknesses
    const sortedAreas = [...lifeAreaScores].sort((a, b) => b.score - a.score);
    const strengths = sortedAreas.filter(a => a.isStrength);
    const weaknesses = sortedAreas.filter(a => a.isWeakness);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(overallLifeScore, scoreChange);

    // Get current week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

    return {
      overallLifeScore,
      previousLifeScore,
      scoreChange,
      scoreTrend,
      performanceMetrics,
      lifeAreaScores,
      strengths,
      weaknesses,
      strategicDecisions,
      executiveSummary,
      weekNumber,
      reportDate: now,
    };
  }, [goals, currentStreak]);

  return dashboard;
};
