import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';

// ============================================
// TYPES
// ============================================

export type TrendDirection = 'accelerating' | 'steady' | 'slowing' | 'declining';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type OpportunityType = 'growth' | 'optimization' | 'breakthrough' | 'recovery';

export interface PerformancePrediction {
  lifeArea: string;
  currentScore: number;
  predictedScore30d: number;
  predictedScore90d: number;
  predictedScoreEOY: number;
  trend: TrendDirection;
  confidence: number; // 0-100
  keyFactors: string[];
  historicalGrowthRate: number; // % per month
}

export interface SuggestedGoal {
  id: string;
  title: string;
  description: string;
  lifeArea: string;
  suggestedDeadline: Date;
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedImpact: number; // 0-100
  rationale: string;
  prerequisites: string[];
  successProbability: number; // 0-100
}

export interface QuarterlyPlan {
  quarter: string; // Q1, Q2, Q3, Q4
  year: number;
  theme: string;
  primaryObjectives: string[];
  keyResults: {
    metric: string;
    current: number;
    target: number;
    unit: string;
  }[];
  focusAreas: string[];
  risksToMitigate: string[];
}

export interface AnnualPlan {
  year: number;
  vision: string;
  bigGoals: {
    title: string;
    lifeArea: string;
    targetDate: Date;
    milestones: string[];
  }[];
  quarterlyThemes: string[];
  expectedOutcomes: string[];
  keyMetricsToTrack: string[];
}

export interface FutureRisk {
  id: string;
  title: string;
  description: string;
  lifeArea: string;
  probability: number; // 0-100
  impact: RiskLevel;
  timeframe: string;
  earlyWarningSign: string;
  mitigationStrategy: string;
  status: 'emerging' | 'active' | 'monitored';
}

export interface FutureOpportunity {
  id: string;
  title: string;
  description: string;
  lifeArea: string;
  type: OpportunityType;
  potentialImpact: number; // 0-100
  windowOfOpportunity: string;
  requiredAction: string;
  readinessScore: number; // 0-100
}

export interface HistoricalInsight {
  pattern: string;
  frequency: string;
  impact: string;
  recommendation: string;
}

export interface PredictiveAnalysis {
  predictions: PerformancePrediction[];
  suggestedGoals: SuggestedGoal[];
  currentQuarterPlan: QuarterlyPlan;
  nextQuarterPlan: QuarterlyPlan;
  annualPlan: AnnualPlan;
  risks: FutureRisk[];
  opportunities: FutureOpportunity[];
  historicalInsights: HistoricalInsight[];
  overallOutlook: 'very_positive' | 'positive' | 'neutral' | 'concerning';
  confidenceScore: number;
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generatePredictions = (): PerformancePrediction[] => [
  {
    lifeArea: 'Saúde & Fitness',
    currentScore: 85,
    predictedScore30d: 88,
    predictedScore90d: 92,
    predictedScoreEOY: 95,
    trend: 'accelerating',
    confidence: 85,
    keyFactors: ['Consistência de treino alta', 'Hábitos alimentares melhorando', 'Sono regularizado'],
    historicalGrowthRate: 3.5,
  },
  {
    lifeArea: 'Carreira & Trabalho',
    currentScore: 72,
    predictedScore30d: 74,
    predictedScore90d: 78,
    predictedScoreEOY: 82,
    trend: 'steady',
    confidence: 75,
    keyFactors: ['Projetos em andamento', 'Aprendizado contínuo', 'Networking ativo'],
    historicalGrowthRate: 2.0,
  },
  {
    lifeArea: 'Crescimento Pessoal',
    currentScore: 78,
    predictedScore30d: 80,
    predictedScore90d: 85,
    predictedScoreEOY: 90,
    trend: 'accelerating',
    confidence: 80,
    keyFactors: ['Leitura consistente', 'Cursos em progresso', 'Reflexão semanal'],
    historicalGrowthRate: 2.8,
  },
  {
    lifeArea: 'Relacionamentos',
    currentScore: 55,
    predictedScore30d: 54,
    predictedScore90d: 52,
    predictedScoreEOY: 50,
    trend: 'declining',
    confidence: 70,
    keyFactors: ['Tempo limitado', 'Priorização de carreira', 'Poucas iniciativas sociais'],
    historicalGrowthRate: -1.5,
  },
  {
    lifeArea: 'Finanças',
    currentScore: 68,
    predictedScore30d: 70,
    predictedScore90d: 75,
    predictedScoreEOY: 80,
    trend: 'steady',
    confidence: 78,
    keyFactors: ['Orçamento controlado', 'Investimentos regulares', 'Renda estável'],
    historicalGrowthRate: 2.2,
  },
  {
    lifeArea: 'Hobbies & Lazer',
    currentScore: 45,
    predictedScore30d: 42,
    predictedScore90d: 40,
    predictedScoreEOY: 38,
    trend: 'declining',
    confidence: 65,
    keyFactors: ['Falta de tempo dedicado', 'Prioridades competindo', 'Sem planejamento'],
    historicalGrowthRate: -2.0,
  },
];

const generateSuggestedGoals = (): SuggestedGoal[] => [
  {
    id: 'sg-1',
    title: 'Completar Certificação AWS',
    description: 'Obter certificação AWS Solutions Architect para impulsionar carreira',
    lifeArea: 'Carreira & Trabalho',
    suggestedDeadline: new Date('2026-06-30'),
    estimatedEffort: 'high',
    expectedImpact: 85,
    rationale: 'Seu histórico mostra progressão constante em skills técnicas. Esta certificação alinha com seu padrão de crescimento.',
    prerequisites: ['Curso preparatório', '40h de estudo', 'Projetos práticos'],
    successProbability: 78,
  },
  {
    id: 'sg-2',
    title: 'Estabelecer Rotina Social Semanal',
    description: 'Agendar pelo menos 2 encontros sociais por semana',
    lifeArea: 'Relacionamentos',
    suggestedDeadline: new Date('2026-03-31'),
    estimatedEffort: 'medium',
    expectedImpact: 70,
    rationale: 'Área em declínio há 3 meses. Intervenção necessária para reverter tendência.',
    prerequisites: ['Mapear contatos importantes', 'Bloquear tempo na agenda'],
    successProbability: 65,
  },
  {
    id: 'sg-3',
    title: 'Atingir Reserva de Emergência 6 Meses',
    description: 'Acumular 6 meses de despesas em reserva líquida',
    lifeArea: 'Finanças',
    suggestedDeadline: new Date('2026-09-30'),
    estimatedEffort: 'medium',
    expectedImpact: 75,
    rationale: 'Seu padrão de poupança indica capacidade. Meta alinhada com crescimento financeiro histórico.',
    prerequisites: ['Revisar orçamento', 'Automatizar transferências'],
    successProbability: 82,
  },
  {
    id: 'sg-4',
    title: 'Correr Meia Maratona',
    description: 'Completar 21km em evento oficial',
    lifeArea: 'Saúde & Fitness',
    suggestedDeadline: new Date('2026-10-15'),
    estimatedEffort: 'high',
    expectedImpact: 90,
    rationale: 'Tendência acelerada em fitness. Meta desafiadora mas alcançável dado seu progresso.',
    prerequisites: ['Plano de treino', 'Avaliação médica', 'Inscrição em evento'],
    successProbability: 75,
  },
  {
    id: 'sg-5',
    title: 'Ler 24 Livros Este Ano',
    description: 'Meta de 2 livros por mês focados em crescimento',
    lifeArea: 'Crescimento Pessoal',
    suggestedDeadline: new Date('2026-12-31'),
    estimatedEffort: 'low',
    expectedImpact: 65,
    rationale: 'Hábito de leitura já estabelecido. Meta escalona seu progresso atual.',
    prerequisites: ['Lista de livros curada', 'Tempo diário reservado'],
    successProbability: 88,
  },
];

const generateCurrentQuarterPlan = (): QuarterlyPlan => ({
  quarter: 'Q1',
  year: 2026,
  theme: 'Fundações Sólidas',
  primaryObjectives: [
    'Consolidar rotina de alta performance',
    'Estabilizar área de Relacionamentos',
    'Manter crescimento em Saúde & Fitness',
  ],
  keyResults: [
    { metric: 'Life Score', current: 67, target: 72, unit: 'pontos' },
    { metric: 'Dias de MVD', current: 45, target: 75, unit: 'dias' },
    { metric: 'Consistência de Rotina', current: 78, target: 85, unit: '%' },
    { metric: 'Score Relacionamentos', current: 55, target: 65, unit: 'pontos' },
  ],
  focusAreas: ['Relacionamentos', 'Consistência', 'Hábitos fundamentais'],
  risksToMitigate: ['Burnout por excesso de metas', 'Negligência de lazer'],
});

const generateNextQuarterPlan = (): QuarterlyPlan => ({
  quarter: 'Q2',
  year: 2026,
  theme: 'Aceleração Estratégica',
  primaryObjectives: [
    'Iniciar certificação profissional',
    'Expandir rede de contatos',
    'Implementar sistema de revisão avançado',
  ],
  keyResults: [
    { metric: 'Life Score', current: 72, target: 78, unit: 'pontos' },
    { metric: 'Progresso Certificação', current: 0, target: 50, unit: '%' },
    { metric: 'Novos Contatos', current: 0, target: 15, unit: 'pessoas' },
    { metric: 'Reserva Emergência', current: 3, target: 4.5, unit: 'meses' },
  ],
  focusAreas: ['Carreira', 'Networking', 'Finanças'],
  risksToMitigate: ['Perda de momentum em Saúde', 'Dispersão de foco'],
});

const generateAnnualPlan = (): AnnualPlan => ({
  year: 2026,
  vision: 'Ano de transformação: equilibrar excelência profissional com vida plena',
  bigGoals: [
    {
      title: 'Life Score 85+',
      lifeArea: 'Geral',
      targetDate: new Date('2026-12-31'),
      milestones: ['70 em Mar', '75 em Jun', '80 em Set', '85 em Dez'],
    },
    {
      title: 'Certificação AWS + Promoção',
      lifeArea: 'Carreira & Trabalho',
      targetDate: new Date('2026-09-30'),
      milestones: ['Curso completo', 'Prática em projetos', 'Exame aprovado', 'Aplicar promoção'],
    },
    {
      title: 'Meia Maratona Concluída',
      lifeArea: 'Saúde & Fitness',
      targetDate: new Date('2026-10-15'),
      milestones: ['Base 10km', 'Treino 15km', 'Evento teste', 'Meia maratona'],
    },
    {
      title: 'Relacionamentos Recuperados (Score 70+)',
      lifeArea: 'Relacionamentos',
      targetDate: new Date('2026-06-30'),
      milestones: ['Rotina social', 'Eventos mensais', 'Viagem com amigos'],
    },
  ],
  quarterlyThemes: [
    'Q1: Fundações Sólidas',
    'Q2: Aceleração Estratégica',
    'Q3: Execução Intensiva',
    'Q4: Colheita e Celebração',
  ],
  expectedOutcomes: [
    'Todas as áreas da vida acima de 60 pontos',
    'Carreira em novo patamar com certificação',
    'Saúde no melhor nível histórico',
    'Equilíbrio sustentável entre áreas',
  ],
  keyMetricsToTrack: [
    'Life Score semanal',
    'Progresso de metas por área',
    'Consistência de MVD',
    'Horas de trabalho profundo',
    'Eventos sociais mensais',
  ],
});

const generateRisks = (): FutureRisk[] => [
  {
    id: 'risk-1',
    title: 'Burnout por Sobrecarga',
    description: 'Múltiplas metas ambiciosas podem levar a exaustão se não houver gestão adequada',
    lifeArea: 'Geral',
    probability: 45,
    impact: 'high',
    timeframe: 'Próximos 3 meses',
    earlyWarningSign: 'Queda de energia após 14h por 3+ dias consecutivos',
    mitigationStrategy: 'Implementar dia de descanso obrigatório semanal e limitar metas ativas a 3',
    status: 'monitored',
  },
  {
    id: 'risk-2',
    title: 'Isolamento Social Crônico',
    description: 'Tendência de declínio em Relacionamentos pode se tornar irreversível',
    lifeArea: 'Relacionamentos',
    probability: 60,
    impact: 'high',
    timeframe: 'Próximos 2 meses',
    earlyWarningSign: 'Menos de 1 interação social por semana por 3 semanas',
    mitigationStrategy: 'Agendar compromissos sociais fixos na agenda como prioridade não-negociável',
    status: 'active',
  },
  {
    id: 'risk-3',
    title: 'Estagnação de Carreira',
    description: 'Crescimento steady pode não ser suficiente para promoção almejada',
    lifeArea: 'Carreira & Trabalho',
    probability: 35,
    impact: 'medium',
    timeframe: '6 meses',
    earlyWarningSign: 'Progresso em certificação abaixo de 30% após 2 meses',
    mitigationStrategy: 'Acelerar estudos e buscar projetos de maior visibilidade',
    status: 'emerging',
  },
  {
    id: 'risk-4',
    title: 'Perda de Momentum Fitness',
    description: 'Meta de meia maratona pode ser comprometida por lesão ou overtraining',
    lifeArea: 'Saúde & Fitness',
    probability: 30,
    impact: 'medium',
    timeframe: '4 meses',
    earlyWarningSign: 'Dores persistentes ou queda de performance por 2+ semanas',
    mitigationStrategy: 'Incluir semanas de recuperação e avaliação fisioterápica preventiva',
    status: 'emerging',
  },
];

const generateOpportunities = (): FutureOpportunity[] => [
  {
    id: 'opp-1',
    title: 'Pico de Performance em Saúde',
    description: 'Tendência acelerada indica potencial para resultados excepcionais',
    lifeArea: 'Saúde & Fitness',
    type: 'breakthrough',
    potentialImpact: 90,
    windowOfOpportunity: 'Próximos 6 meses',
    requiredAction: 'Manter consistência e adicionar desafio progressivo',
    readinessScore: 85,
  },
  {
    id: 'opp-2',
    title: 'Certificação como Catalisador',
    description: 'AWS pode abrir portas para projetos internacionais e aumento salarial',
    lifeArea: 'Carreira & Trabalho',
    type: 'growth',
    potentialImpact: 85,
    windowOfOpportunity: '2026',
    requiredAction: 'Priorizar estudos e networking com profissionais certificados',
    readinessScore: 70,
  },
  {
    id: 'opp-3',
    title: 'Recuperação Rápida de Relacionamentos',
    description: 'Intervenção agora pode reverter tendência antes que se consolide',
    lifeArea: 'Relacionamentos',
    type: 'recovery',
    potentialImpact: 75,
    windowOfOpportunity: 'Próximos 60 dias',
    requiredAction: 'Agenda social semanal não-negociável',
    readinessScore: 55,
  },
  {
    id: 'opp-4',
    title: 'Automatização Financeira',
    description: 'Sistemas de investimento automático podem acelerar crescimento patrimonial',
    lifeArea: 'Finanças',
    type: 'optimization',
    potentialImpact: 70,
    windowOfOpportunity: 'Q1 2026',
    requiredAction: 'Configurar aportes automáticos e rebalanceamento',
    readinessScore: 80,
  },
  {
    id: 'opp-5',
    title: 'Sinergia Crescimento + Carreira',
    description: 'Livros e cursos podem ser direcionados para certificação, multiplicando impacto',
    lifeArea: 'Crescimento Pessoal',
    type: 'optimization',
    potentialImpact: 65,
    windowOfOpportunity: 'Contínuo',
    requiredAction: 'Alinhar lista de leitura com objetivos de certificação',
    readinessScore: 90,
  },
];

const generateHistoricalInsights = (): HistoricalInsight[] => [
  {
    pattern: 'Segundas-feiras de alta performance',
    frequency: '78% das semanas',
    impact: 'Manhãs de segunda definem o tom da semana',
    recommendation: 'Proteger segunda-feira como dia de foco máximo',
  },
  {
    pattern: 'Quedas pós-viagem',
    frequency: '3 de 4 viagens',
    impact: 'Perda de streak e dificuldade de retomada',
    recommendation: 'Criar protocolo de re-entrada com MVD simplificado',
  },
  {
    pattern: 'Picos de produtividade às 9h-11h',
    frequency: 'Diário',
    impact: 'Melhor output cognitivo do dia',
    recommendation: 'Reservar este bloco para trabalho profundo exclusivamente',
  },
  {
    pattern: 'Correlação exercício → produtividade',
    frequency: '85% dos dias',
    impact: '+40% de tarefas em dias com exercício matinal',
    recommendation: 'Priorizar movimento antes do trabalho',
  },
];

// ============================================
// HOOK
// ============================================

export const usePredictiveAnalysis = (): PredictiveAnalysis => {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();

  const analysis = useMemo((): PredictiveAnalysis => {
    const predictions = generatePredictions();
    const suggestedGoals = generateSuggestedGoals();
    const currentQuarterPlan = generateCurrentQuarterPlan();
    const nextQuarterPlan = generateNextQuarterPlan();
    const annualPlan = generateAnnualPlan();
    const risks = generateRisks();
    const opportunities = generateOpportunities();
    const historicalInsights = generateHistoricalInsights();

    // Calculate overall outlook
    const avgTrend = predictions.reduce((sum, p) => {
      const trendScore = p.trend === 'accelerating' ? 2 : p.trend === 'steady' ? 1 : p.trend === 'slowing' ? 0 : -1;
      return sum + trendScore;
    }, 0) / predictions.length;

    const overallOutlook: 'very_positive' | 'positive' | 'neutral' | 'concerning' = 
      avgTrend > 1.2 ? 'very_positive' : avgTrend > 0.5 ? 'positive' : avgTrend > 0 ? 'neutral' : 'concerning';

    // Calculate confidence score
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      predictions,
      suggestedGoals,
      currentQuarterPlan,
      nextQuarterPlan,
      annualPlan,
      risks,
      opportunities,
      historicalInsights,
      overallOutlook,
      confidenceScore: Math.round(avgConfidence),
    };
  }, [goals, currentStreak]);

  return analysis;
};
