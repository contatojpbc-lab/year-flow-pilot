import { useState, useMemo } from 'react';

export type DecisionCategory = 'career' | 'finance' | 'health' | 'relationship' | 'personal' | 'business';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  timeCost: number; // hours/week
  moneyCost: number; // R$
  moneyReturn: number; // R$ projected
  impactScore: number; // 0-100
  riskScore: number; // 0-100
  effortScore: number; // 0-100
  alignmentScore: number; // 0-100 (alignment with goals)
  pros: string[];
  cons: string[];
}

export interface FutureScenario {
  optionId: string;
  timeframe: '1m' | '3m' | '6m' | '1y';
  outcome: string;
  probability: number;
  financialImpact: number;
  lifeScoreImpact: number;
  risks: string[];
  opportunities: string[];
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  category: DecisionCategory;
  importance: ImpactLevel;
  createdAt: Date;
  decidedAt?: Date;
  status: 'pending' | 'decided' | 'reviewing';
  options: DecisionOption[];
  recommendedOptionId?: string;
  recommendationReason?: string;
  chosenOptionId?: string;
  scenarios: FutureScenario[];
  outcome?: 'success' | 'partial' | 'failure' | 'pending';
  outcomeNotes?: string;
}

const generateMockDecisions = (): Decision[] => [
  {
    id: 'd1',
    title: 'Aceitar nova proposta de emprego?',
    description: 'Empresa ofereceu cargo sênior com 30% de aumento, mas exige mudança de cidade.',
    category: 'career',
    importance: 'critical',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    status: 'pending',
    options: [
      {
        id: 'o1',
        name: 'Aceitar a proposta',
        description: 'Mudar de cidade e assumir o novo cargo',
        timeCost: 50,
        moneyCost: 15000,
        moneyReturn: 96000,
        impactScore: 85,
        riskScore: 65,
        effortScore: 80,
        alignmentScore: 78,
        pros: ['Aumento salarial de 30%', 'Crescimento de carreira', 'Novos desafios técnicos'],
        cons: ['Mudança de cidade', 'Distância da família', 'Custo de relocação'],
      },
      {
        id: 'o2',
        name: 'Manter emprego atual',
        description: 'Continuar no cargo atual e buscar promoção interna',
        timeCost: 40,
        moneyCost: 0,
        moneyReturn: 18000,
        impactScore: 45,
        riskScore: 25,
        effortScore: 40,
        alignmentScore: 55,
        pros: ['Estabilidade', 'Rede de contatos', 'Sem custos de mudança'],
        cons: ['Crescimento limitado', 'Salário menor', 'Possível estagnação'],
      },
      {
        id: 'o3',
        name: 'Negociar contraproposta',
        description: 'Usar a oferta para negociar promoção e aumento no atual',
        timeCost: 42,
        moneyCost: 500,
        moneyReturn: 48000,
        impactScore: 70,
        riskScore: 40,
        effortScore: 55,
        alignmentScore: 72,
        pros: ['Sem mudança de cidade', 'Possível aumento', 'Reconhecimento interno'],
        cons: ['Risco de perder ambas', 'Pode gerar atrito', 'Aumento menor'],
      },
    ],
    recommendedOptionId: 'o3',
    recommendationReason: 'Equilibra ganho financeiro com baixo risco e alta alinhamento aos seus valores familiares atuais.',
    scenarios: [
      {
        optionId: 'o1',
        timeframe: '6m',
        outcome: 'Adaptação à nova cidade com ganho financeiro real, mas estresse familiar elevado',
        probability: 70,
        financialImpact: 48000,
        lifeScoreImpact: 5,
        risks: ['Burnout por adaptação', 'Distanciamento familiar'],
        opportunities: ['Promoção rápida', 'Networking premium'],
      },
      {
        optionId: 'o3',
        timeframe: '6m',
        outcome: 'Aumento conquistado internamente com manutenção da estrutura de vida',
        probability: 65,
        financialImpact: 24000,
        lifeScoreImpact: 12,
        risks: ['Negociação não atender expectativa'],
        opportunities: ['Novo cargo interno', 'Maior visibilidade'],
      },
    ],
  },
  {
    id: 'd2',
    title: 'Investir em curso premium de R$ 8.000?',
    description: 'Curso de especialização em IA com duração de 6 meses',
    category: 'personal',
    importance: 'high',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    decidedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
    status: 'decided',
    options: [
      {
        id: 'o4', name: 'Fazer o curso', description: 'Investir tempo e dinheiro',
        timeCost: 12, moneyCost: 8000, moneyReturn: 35000,
        impactScore: 80, riskScore: 35, effortScore: 70, alignmentScore: 90,
        pros: ['Alta demanda de mercado', 'Networking'], cons: ['Custo alto', 'Tempo significativo'],
      },
      {
        id: 'o5', name: 'Estudar por conta própria', description: 'Recursos gratuitos',
        timeCost: 8, moneyCost: 0, moneyReturn: 12000,
        impactScore: 50, riskScore: 50, effortScore: 60, alignmentScore: 70,
        pros: ['Sem custo'], cons: ['Sem certificação', 'Menos estruturado'],
      },
    ],
    recommendedOptionId: 'o4',
    recommendationReason: 'ROI projetado de 4.4x em 12 meses com forte alinhamento estratégico.',
    chosenOptionId: 'o4',
    scenarios: [],
    outcome: 'success',
    outcomeNotes: 'Curso gerou 2 propostas de freelance no 3º mês.',
  },
  {
    id: 'd3',
    title: 'Comprar carro novo ou usado?',
    description: 'Substituir carro atual com 10 anos de uso',
    category: 'finance',
    importance: 'high',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
    decidedAt: new Date(Date.now() - 55 * 24 * 3600 * 1000),
    status: 'decided',
    options: [],
    chosenOptionId: 'used',
    scenarios: [],
    outcome: 'success',
    outcomeNotes: 'Economia de R$25.000 redirecionada para reserva.',
  },
];

export const useDecisionSupport = () => {
  const [decisions, setDecisions] = useState<Decision[]>(generateMockDecisions());

  const stats = useMemo(() => {
    const total = decisions.length;
    const pending = decisions.filter(d => d.status === 'pending').length;
    const decided = decisions.filter(d => d.status === 'decided').length;
    const successful = decisions.filter(d => d.outcome === 'success').length;
    const successRate = decided > 0 ? Math.round((successful / decided) * 100) : 0;
    return { total, pending, decided, successful, successRate };
  }, [decisions]);

  const calculateOptionScore = (option: DecisionOption): number => {
    // Weighted composite score
    const roi = option.moneyCost > 0 ? (option.moneyReturn / option.moneyCost) * 10 : option.moneyReturn / 1000;
    const score =
      option.impactScore * 0.25 +
      option.alignmentScore * 0.25 +
      (100 - option.riskScore) * 0.20 +
      (100 - option.effortScore) * 0.10 +
      Math.min(roi, 100) * 0.20;
    return Math.round(score);
  };

  const getBestOption = (decision: Decision): DecisionOption | null => {
    if (decision.options.length === 0) return null;
    return [...decision.options].sort((a, b) => calculateOptionScore(b) - calculateOptionScore(a))[0];
  };

  const decideOption = (decisionId: string, optionId: string) => {
    setDecisions(prev => prev.map(d =>
      d.id === decisionId
        ? { ...d, status: 'decided' as const, chosenOptionId: optionId, decidedAt: new Date(), outcome: 'pending' as const }
        : d
    ));
  };

  return { decisions, stats, calculateOptionScore, getBestOption, decideOption };
};
