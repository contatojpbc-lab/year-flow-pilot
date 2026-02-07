import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';

// ============================================
// TYPES
// ============================================

export type ImprovementCategory = 'habits' | 'productivity' | 'mindset' | 'systems' | 'recovery';
export type ImpactLevel = 'transformational' | 'high' | 'medium' | 'incremental';
export type ExperimentStatus = 'suggested' | 'active' | 'completed' | 'abandoned';

export interface StrategicImprovement {
  id: string;
  category: ImprovementCategory;
  title: string;
  description: string;
  rationale: string; // Why this is being suggested based on data
  expectedImpact: ImpactLevel;
  timeToImplement: string; // e.g., "1 week", "2-3 days"
  relatedLifeAreas: string[];
  priority: number; // 1-10
}

export interface HighImpactHabit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | '3x_week' | 'as_needed';
  timeRequired: string; // e.g., "15 min", "30 min"
  impactScore: number; // 0-100
  synergies: string[]; // Other habits/goals this enhances
  scientificBacking: string;
  quickStart: string; // How to start immediately
}

export interface ProductivityExperiment {
  id: string;
  title: string;
  hypothesis: string;
  duration: string; // e.g., "7 days", "2 weeks"
  protocol: string[]; // Steps to follow
  successMetrics: string[];
  status: ExperimentStatus;
  expectedOutcome: string;
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
}

export interface GrowthMetric {
  id: string;
  name: string;
  currentValue: number;
  previousValue: number; // Last period
  baselineValue: number; // When tracking started
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  growthRate: number; // Percentage
  period: '7d' | '30d' | '90d' | 'ytd';
}

export interface GrowthEvaluation {
  overallScore: number; // 0-100
  scoreChange: number; // vs last period
  strengths: string[];
  developmentAreas: string[];
  milestones: {
    title: string;
    achievedDate: Date;
    significance: string;
  }[];
  projections: {
    metric: string;
    currentTrajectory: string;
    optimisticTrajectory: string;
  }[];
}

export interface StrategicAnalysis {
  weeklyImprovements: StrategicImprovement[];
  highImpactHabits: HighImpactHabit[];
  experiments: ProductivityExperiment[];
  growthMetrics: GrowthMetric[];
  growthEvaluation: GrowthEvaluation;
  weeklyFocus: {
    theme: string;
    keyObjective: string;
    supportingActions: string[];
  };
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

const generateMockImprovements = (): StrategicImprovement[] => [
  {
    id: 'imp-1',
    category: 'habits',
    title: 'Implementar Morning Stack',
    description: 'Criar uma rotina matinal encadeada de 3 micro-hábitos: água, alongamento, 5 min de planejamento',
    rationale: 'Seus dados mostram 40% mais produtividade em dias com manhã estruturada',
    expectedImpact: 'high',
    timeToImplement: '3-5 dias para formar',
    relatedLifeAreas: ['Health & Fitness', 'Personal Growth'],
    priority: 9,
  },
  {
    id: 'imp-2',
    category: 'productivity',
    title: 'Bloco de Trabalho Profundo',
    description: 'Reservar 2h diárias sem interrupções para trabalho cognitivo intenso',
    rationale: 'Análise mostra que suas metas de carreira avançam 3x mais rápido com foco ininterrupto',
    expectedImpact: 'transformational',
    timeToImplement: '1 semana',
    relatedLifeAreas: ['Career & Work', 'Personal Growth'],
    priority: 10,
  },
  {
    id: 'imp-3',
    category: 'systems',
    title: 'Sistema de Captura Rápida',
    description: 'Usar app de notas para capturar ideias/tarefas em menos de 10 segundos',
    rationale: 'Você relatou perda de ideias e tarefas esquecidas nas últimas 3 semanas',
    expectedImpact: 'medium',
    timeToImplement: '2 dias',
    relatedLifeAreas: ['Career & Work'],
    priority: 7,
  },
  {
    id: 'imp-4',
    category: 'recovery',
    title: 'Protocolo de Descanso Ativo',
    description: 'Introduzir pausas de 5 min a cada 90 min com movimento leve',
    rationale: 'Sua produtividade cai 60% após 14h - pausas regulares podem estender seu pico',
    expectedImpact: 'high',
    timeToImplement: '1 dia',
    relatedLifeAreas: ['Health & Fitness', 'Career & Work'],
    priority: 8,
  },
  {
    id: 'imp-5',
    category: 'mindset',
    title: 'Journaling de Gratidão Noturno',
    description: 'Escrever 3 coisas boas do dia antes de dormir',
    rationale: 'Correlação encontrada: dias com reflexão positiva = 25% melhor desempenho no dia seguinte',
    expectedImpact: 'medium',
    timeToImplement: '1 semana para hábito',
    relatedLifeAreas: ['Personal Growth', 'Relationships'],
    priority: 6,
  },
];

const generateMockHighImpactHabits = (): HighImpactHabit[] => [
  {
    id: 'habit-1',
    title: 'Revisão Semanal Estruturada',
    description: 'Dedicar 30 minutos todo domingo para revisar a semana e planejar a próxima',
    frequency: 'weekly',
    timeRequired: '30 min',
    impactScore: 92,
    synergies: ['Metas de longo prazo', 'Produtividade diária', 'Redução de estresse'],
    scientificBacking: 'Estudos mostram que revisão semanal aumenta conclusão de metas em 42%',
    quickStart: 'Defina alarme para domingo às 19h e use template de 5 perguntas',
  },
  {
    id: 'habit-2',
    title: 'Primeira Tarefa = Alta Prioridade',
    description: 'Começar o dia com a tarefa mais importante antes de checar emails/mensagens',
    frequency: 'daily',
    timeRequired: '45-60 min',
    impactScore: 88,
    synergies: ['Metas de carreira', 'Progresso em projetos', 'Satisfação pessoal'],
    scientificBacking: 'Willpower é limitado - usar energia matinal para prioridades maximiza resultados',
    quickStart: 'Defina sua MIT (Most Important Task) na noite anterior',
  },
  {
    id: 'habit-3',
    title: 'Movimento Matinal',
    description: '20 minutos de exercício leve ao acordar para ativar corpo e mente',
    frequency: 'daily',
    timeRequired: '20 min',
    impactScore: 85,
    synergies: ['Energia ao longo do dia', 'Qualidade do sono', 'Clareza mental'],
    scientificBacking: 'Exercício matinal aumenta BDNF e melhora função cognitiva por 4-6 horas',
    quickStart: 'Deixe roupa de exercício ao lado da cama, comece com 10 min',
  },
  {
    id: 'habit-4',
    title: 'Leitura Diária Focada',
    description: 'Ler 20 páginas por dia de livros que desenvolvem habilidades relevantes',
    frequency: 'daily',
    timeRequired: '25-30 min',
    impactScore: 78,
    synergies: ['Crescimento profissional', 'Vocabulário', 'Perspectivas novas'],
    scientificBacking: 'Leitura regular correlaciona com maior sucesso profissional e longevidade cognitiva',
    quickStart: 'Escolha 1 livro relevante para sua meta principal e leia antes de dormir',
  },
  {
    id: 'habit-5',
    title: 'Check-in de Energia',
    description: 'Avaliar nível de energia 3x ao dia e ajustar tarefas conforme capacidade',
    frequency: 'daily',
    timeRequired: '2 min',
    impactScore: 72,
    synergies: ['Autoconhecimento', 'Produtividade sustentável', 'Prevenção de burnout'],
    scientificBacking: 'Consciência energética permite alocação otimizada de tarefas cognitivas',
    quickStart: 'Configure 3 alarmes (9h, 14h, 18h) com pergunta "Minha energia é 1-5?"',
  },
];

const generateMockExperiments = (): ProductivityExperiment[] => [
  {
    id: 'exp-1',
    title: 'Semana sem Redes Sociais Matinais',
    hypothesis: 'Evitar redes sociais até 12h aumentará foco e reduzirá ansiedade',
    duration: '7 dias',
    protocol: [
      'Remover apps de redes sociais da tela inicial',
      'Usar Screen Time para bloquear até 12h',
      'Substituir por 10 min de leitura ou planejamento',
      'Registrar níveis de foco e ansiedade diariamente',
    ],
    successMetrics: ['Aumento de 20%+ em tarefas concluídas', 'Redução de ansiedade auto-relatada'],
    status: 'suggested',
    expectedOutcome: 'Manhãs mais produtivas e início de dia com menos sobrecarga mental',
    difficultyLevel: 'moderate',
  },
  {
    id: 'exp-2',
    title: 'Técnica Pomodoro Modificada (52/17)',
    hypothesis: '52 min de trabalho + 17 min de pausa é mais efetivo que 25/5 para trabalho profundo',
    duration: '5 dias úteis',
    protocol: [
      'Usar timer para 52 min de foco intenso',
      'Pausa de 17 min com movimento e descanso visual',
      'Máximo 4 ciclos por dia',
      'Registrar qualidade do output por ciclo',
    ],
    successMetrics: ['Completar mais tarefas complexas', 'Manter energia até final do dia'],
    status: 'suggested',
    expectedOutcome: 'Descobrir seu ritmo ideal de trabalho/descanso',
    difficultyLevel: 'easy',
  },
  {
    id: 'exp-3',
    title: 'Journaling de 5 Minutos',
    hypothesis: 'Escrever 5 min por dia sobre progresso aumenta consciência e motivação',
    duration: '14 dias',
    protocol: [
      'Escolher horário fixo (recomendado: noite)',
      'Responder 3 perguntas: O que fiz? O que aprendi? O que farei amanhã?',
      'Usar app de notas ou caderno físico',
      'Reler entradas aos domingos',
    ],
    successMetrics: ['Maior clareza sobre prioridades', 'Identificação de padrões'],
    status: 'active',
    expectedOutcome: 'Desenvolver hábito de reflexão que potencializa outros hábitos',
    difficultyLevel: 'easy',
  },
  {
    id: 'exp-4',
    title: 'Batching de Comunicação',
    hypothesis: 'Verificar emails/mensagens apenas 3x ao dia reduz fragmentação de atenção',
    duration: '7 dias',
    protocol: [
      'Definir horários: 9h, 13h, 17h',
      'Desativar todas as notificações fora desses horários',
      'Comunicar a equipe/família sobre o experimento',
      'Registrar urgências reais perdidas (se houver)',
    ],
    successMetrics: ['Menos trocas de contexto', 'Blocos de foco maiores'],
    status: 'suggested',
    expectedOutcome: 'Recuperar em média 1-2 horas de tempo produtivo por dia',
    difficultyLevel: 'challenging',
  },
];

const generateMockGrowthMetrics = (): GrowthMetric[] => [
  {
    id: 'gm-1',
    name: 'Consistência de Rotina',
    currentValue: 78,
    previousValue: 65,
    baselineValue: 45,
    unit: '%',
    trend: 'improving',
    growthRate: 20,
    period: '30d',
  },
  {
    id: 'gm-2',
    name: 'Progresso Médio de Metas',
    currentValue: 42,
    previousValue: 35,
    baselineValue: 15,
    unit: '%',
    trend: 'improving',
    growthRate: 20,
    period: '90d',
  },
  {
    id: 'gm-3',
    name: 'Dias de MVD Completo',
    currentValue: 22,
    previousValue: 18,
    baselineValue: 8,
    unit: 'dias/mês',
    trend: 'improving',
    growthRate: 22,
    period: '30d',
  },
  {
    id: 'gm-4',
    name: 'Streak Atual',
    currentValue: 12,
    previousValue: 7,
    baselineValue: 3,
    unit: 'dias',
    trend: 'improving',
    growthRate: 71,
    period: '7d',
  },
  {
    id: 'gm-5',
    name: 'Horas de Trabalho Profundo',
    currentValue: 14,
    previousValue: 16,
    baselineValue: 8,
    unit: 'h/semana',
    trend: 'declining',
    growthRate: -12,
    period: '7d',
  },
  {
    id: 'gm-6',
    name: 'Taxa de Conclusão Semanal',
    currentValue: 68,
    previousValue: 65,
    baselineValue: 52,
    unit: '%',
    trend: 'stable',
    growthRate: 5,
    period: '7d',
  },
];

const generateMockGrowthEvaluation = (): GrowthEvaluation => ({
  overallScore: 72,
  scoreChange: 8,
  strengths: [
    'Consistência matinal excepcional - 85% de adesão nos últimos 30 dias',
    'Progresso constante em metas de saúde - você está à frente do esperado',
    'Streak de MVD mostra disciplina crescente',
    'Boa recuperação após quedas de produtividade',
  ],
  developmentAreas: [
    'Metas de aprendizado (Espanhol B1) estão abaixo do ritmo necessário',
    'Trabalho profundo diminuiu 12% esta semana - revisar bloqueios de agenda',
    'Sextas-feiras continuam sendo o dia mais fraco - considerar ajuste de expectativas',
    'Área de Relacionamentos com menos atenção que outras áreas',
  ],
  milestones: [
    {
      title: 'Primeiro mês com 20+ dias de MVD',
      achievedDate: new Date('2026-01-28'),
      significance: 'Marco de consistência que indica formação de hábito sólido',
    },
    {
      title: 'Meta de exercício atingida por 4 semanas consecutivas',
      achievedDate: new Date('2026-01-21'),
      significance: 'Demonstra capacidade de manter compromissos de longo prazo',
    },
    {
      title: 'Primeira revisão semanal completa',
      achievedDate: new Date('2026-01-05'),
      significance: 'Estabeleceu prática de reflexão estruturada',
    },
  ],
  projections: [
    {
      metric: 'Progresso de Metas',
      currentTrajectory: 'Atingir 60% até março no ritmo atual',
      optimisticTrajectory: 'Com ajustes sugeridos, pode chegar a 75% até março',
    },
    {
      metric: 'Consistência de Rotina',
      currentTrajectory: 'Estabilizar em 80-85% nos próximos 60 dias',
      optimisticTrajectory: 'Potencial para 90%+ com implementação de morning stack',
    },
    {
      metric: 'Equilíbrio de Áreas',
      currentTrajectory: 'Saúde e Carreira continuarão dominantes',
      optimisticTrajectory: 'Adicionar 1 hábito de Relacionamentos pode equilibrar',
    },
  ],
});

// ============================================
// HOOK
// ============================================

export const useStrategicImprovements = (): StrategicAnalysis => {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();

  const analysis = useMemo((): StrategicAnalysis => {
    const improvements = generateMockImprovements();
    const habits = generateMockHighImpactHabits();
    const experiments = generateMockExperiments();
    const metrics = generateMockGrowthMetrics();
    const evaluation = generateMockGrowthEvaluation();

    // Sort improvements by priority
    const sortedImprovements = [...improvements].sort((a, b) => b.priority - a.priority);

    // Sort habits by impact score
    const sortedHabits = [...habits].sort((a, b) => b.impactScore - a.impactScore);

    // Generate weekly focus based on data
    const weeklyFocus = {
      theme: 'Consistência e Profundidade',
      keyObjective: 'Aumentar horas de trabalho profundo em 20% mantendo MVD streak',
      supportingActions: [
        'Implementar bloco de 2h de foco pela manhã',
        'Reduzir verificação de emails para 3x/dia',
        'Completar MVD antes das 18h todos os dias',
      ],
    };

    return {
      weeklyImprovements: sortedImprovements,
      highImpactHabits: sortedHabits,
      experiments,
      growthMetrics: metrics,
      growthEvaluation: evaluation,
      weeklyFocus,
    };
  }, [goals, currentStreak]);

  return analysis;
};
