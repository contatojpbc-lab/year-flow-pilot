import { useMemo } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';

// ============================================
// TYPES
// ============================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type FailureContext = 'high_workload' | 'after_break' | 'end_of_week' | 'start_of_week' | 'deadline_pressure' | 'low_energy';

export interface FailurePattern {
  id: string;
  type: 'recurring' | 'contextual' | 'temporal';
  frequency: number; // How many times this pattern occurred
  description: string;
  affectedAreas: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastOccurrence: Date;
  suggestedCorrection: string;
}

export interface UnproductiveSlot {
  dayOfWeek: DayOfWeek;
  timeOfDay: TimeOfDay;
  failureRate: number; // 0-100
  commonFailures: string[];
  suggestedAction: string;
}

export interface HistoricalCorrection {
  id: string;
  pattern: string;
  correction: string;
  successRate: number; // 0-100
  timesApplied: number;
  lastApplied: Date;
}

export interface RiskAlert {
  id: string;
  type: 'repetition_risk' | 'pattern_detected' | 'context_warning' | 'trend_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  relatedPattern?: string;
  preventiveAction: string;
  probability: number; // 0-100
}

export interface FailureAnalysis {
  patterns: FailurePattern[];
  unproductiveSlots: UnproductiveSlot[];
  historicalCorrections: HistoricalCorrection[];
  riskAlerts: RiskAlert[];
  summary: {
    totalPatternsDetected: number;
    criticalPatterns: number;
    mostProblematicDay: DayOfWeek;
    mostProblematicTime: TimeOfDay;
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

const generateMockFailurePatterns = (): FailurePattern[] => {
  const now = new Date();
  
  return [
    {
      id: 'pattern-1',
      type: 'recurring',
      frequency: 8,
      description: 'Abandono de hábitos após quebra de streak',
      affectedAreas: ['Health & Fitness', 'Personal Growth'],
      severity: 'high',
      lastOccurrence: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Implementar "dia de recuperação" quando streak quebrar, em vez de reiniciar do zero',
    },
    {
      id: 'pattern-2',
      type: 'temporal',
      frequency: 12,
      description: 'Queda de produtividade às quartas-feiras',
      affectedAreas: ['Career & Work'],
      severity: 'medium',
      lastOccurrence: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Reservar quartas para tarefas menos exigentes ou reuniões',
    },
    {
      id: 'pattern-3',
      type: 'contextual',
      frequency: 5,
      description: 'Metas financeiras ignoradas em meses de despesas extras',
      affectedAreas: ['Finances'],
      severity: 'medium',
      lastOccurrence: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Criar buffer de 15% no orçamento para despesas inesperadas',
    },
    {
      id: 'pattern-4',
      type: 'recurring',
      frequency: 6,
      description: 'Procrastinação em tarefas de longo prazo',
      affectedAreas: ['Personal Growth', 'Career & Work'],
      severity: 'high',
      lastOccurrence: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Dividir metas grandes em micro-tarefas diárias de 15 minutos',
    },
    {
      id: 'pattern-5',
      type: 'temporal',
      frequency: 15,
      description: 'MVD incompleto às sextas-feiras à noite',
      affectedAreas: ['Health & Fitness'],
      severity: 'low',
      lastOccurrence: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Completar MVD antes das 18h às sextas ou ajustar expectativas para o fim de semana',
    },
    {
      id: 'pattern-6',
      type: 'contextual',
      frequency: 4,
      description: 'Abandono de rotina após viagens',
      affectedAreas: ['Health & Fitness', 'Personal Growth'],
      severity: 'critical',
      lastOccurrence: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      suggestedCorrection: 'Criar "rotina de viagem" simplificada e "protocolo de retorno" de 3 dias',
    },
  ];
};

const generateMockUnproductiveSlots = (): UnproductiveSlot[] => {
  return [
    {
      dayOfWeek: 'wednesday',
      timeOfDay: 'afternoon',
      failureRate: 72,
      commonFailures: ['Falta de foco', 'Reuniões excessivas', 'Fadiga mental'],
      suggestedAction: 'Bloquear agenda para trabalho profundo ou descanso ativo',
    },
    {
      dayOfWeek: 'friday',
      timeOfDay: 'evening',
      failureRate: 85,
      commonFailures: ['MVD incompleto', 'Exercício pulado', 'Rotina noturna ignorada'],
      suggestedAction: 'Antecipar tarefas essenciais para manhã de sexta',
    },
    {
      dayOfWeek: 'monday',
      timeOfDay: 'morning',
      failureRate: 45,
      commonFailures: ['Início lento', 'Planejamento demorado'],
      suggestedAction: 'Preparar plano semanal no domingo à noite',
    },
    {
      dayOfWeek: 'sunday',
      timeOfDay: 'afternoon',
      failureRate: 60,
      commonFailures: ['Procrastinação', 'Falta de estrutura'],
      suggestedAction: 'Definir 1-2 "âncoras" obrigatórias para domingos',
    },
  ];
};

const generateMockHistoricalCorrections = (): HistoricalCorrection[] => {
  const now = new Date();
  
  return [
    {
      id: 'correction-1',
      pattern: 'Abandono pós-quebra de streak',
      correction: 'Regra dos 2 dias: nunca pular 2 dias seguidos',
      successRate: 78,
      timesApplied: 12,
      lastApplied: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'correction-2',
      pattern: 'Procrastinação em tarefas grandes',
      correction: 'Técnica Pomodoro com sessões de 25 minutos',
      successRate: 65,
      timesApplied: 8,
      lastApplied: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'correction-3',
      pattern: 'Queda às quartas-feiras',
      correction: 'Quarta como "dia de manutenção" - tarefas leves',
      successRate: 82,
      timesApplied: 6,
      lastApplied: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'correction-4',
      pattern: 'MVD incompleto às sextas',
      correction: 'MVD simplificado para sextas (apenas 2 itens essenciais)',
      successRate: 90,
      timesApplied: 4,
      lastApplied: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'correction-5',
      pattern: 'Rotina pós-viagem',
      correction: 'Protocolo de retorno: dia 1 apenas MVD básico',
      successRate: 71,
      timesApplied: 3,
      lastApplied: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    },
  ];
};

const generateMockRiskAlerts = (): RiskAlert[] => {
  return [
    {
      id: 'alert-1',
      type: 'repetition_risk',
      severity: 'high',
      title: 'Risco de abandono pós-streak',
      description: 'Seu streak atual está em 12 dias. Historicamente, você tende a abandonar hábitos após quebras de streak longas.',
      relatedPattern: 'pattern-1',
      preventiveAction: 'Prepare um "plano B" para amanhã caso quebre o streak - defina o mínimo absoluto',
      probability: 68,
    },
    {
      id: 'alert-2',
      type: 'context_warning',
      severity: 'medium',
      title: 'Quarta-feira se aproximando',
      description: 'Amanhã é quarta-feira, seu dia menos produtivo historicamente (72% taxa de falha à tarde).',
      relatedPattern: 'pattern-2',
      preventiveAction: 'Agende tarefas importantes para manhã e reserve tarde para tarefas leves',
      probability: 72,
    },
    {
      id: 'alert-3',
      type: 'pattern_detected',
      severity: 'critical',
      title: 'Padrão de procrastinação ativo',
      description: 'A meta "Aprender Espanhol B1" está com progresso estagnado há 2 semanas - padrão similar ao ocorrido em outubro.',
      relatedPattern: 'pattern-4',
      preventiveAction: 'Defina uma micro-tarefa de 10 minutos para hoje: revisar 5 palavras novas',
      probability: 75,
    },
    {
      id: 'alert-4',
      type: 'trend_alert',
      severity: 'medium',
      title: 'Fim de semana se aproximando',
      description: 'Sexta-feira à noite tem 85% de taxa de falha no MVD. Considere antecipar tarefas.',
      relatedPattern: 'pattern-5',
      preventiveAction: 'Complete o MVD antes das 17h na sexta',
      probability: 85,
    },
    {
      id: 'alert-5',
      type: 'repetition_risk',
      severity: 'low',
      title: 'Início de mês: atenção ao orçamento',
      description: 'Meses anteriores mostraram gastos extras no início do mês. Monitore despesas impulsivas.',
      relatedPattern: 'pattern-3',
      preventiveAction: 'Revise o orçamento e defina limite diário para gastos variáveis',
      probability: 45,
    },
  ];
};

// ============================================
// HOOK
// ============================================

export const useFailurePatternAnalysis = (): FailureAnalysis => {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();

  const analysis = useMemo((): FailureAnalysis => {
    const patterns = generateMockFailurePatterns();
    const unproductiveSlots = generateMockUnproductiveSlots();
    const historicalCorrections = generateMockHistoricalCorrections();
    const riskAlerts = generateMockRiskAlerts();

    // Calculate summary
    const criticalPatterns = patterns.filter(p => p.severity === 'critical' || p.severity === 'high').length;
    
    // Find most problematic day
    const dayFailures: Record<DayOfWeek, number> = {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
    };
    unproductiveSlots.forEach(slot => {
      dayFailures[slot.dayOfWeek] += slot.failureRate;
    });
    const mostProblematicDay = Object.entries(dayFailures)
      .sort((a, b) => b[1] - a[1])[0][0] as DayOfWeek;
    
    // Find most problematic time
    const timeFailures: Record<TimeOfDay, number> = {
      morning: 0, afternoon: 0, evening: 0, night: 0
    };
    unproductiveSlots.forEach(slot => {
      timeFailures[slot.timeOfDay] += slot.failureRate;
    });
    const mostProblematicTime = Object.entries(timeFailures)
      .sort((a, b) => b[1] - a[1])[0][0] as TimeOfDay;

    // Calculate overall risk level
    const avgAlertProbability = riskAlerts.reduce((acc, a) => acc + a.probability, 0) / riskAlerts.length;
    const overallRiskLevel = avgAlertProbability > 70 ? 'high' : avgAlertProbability > 50 ? 'medium' : 'low';

    return {
      patterns,
      unproductiveSlots,
      historicalCorrections,
      riskAlerts,
      summary: {
        totalPatternsDetected: patterns.length,
        criticalPatterns,
        mostProblematicDay,
        mostProblematicTime,
        overallRiskLevel,
      },
    };
  }, [goals, currentStreak]);

  return analysis;
};
