import { useState, useMemo } from 'react';

export interface ScenarioInputs {
  id: string;
  name: string;
  description: string;
  color: 'primary' | 'success' | 'warning' | 'destructive';
  // Financial
  monthlyIncome: number;
  incomeGrowthRate: number; // % annual
  monthlyExpenses: number;
  expensesGrowthRate: number; // % annual (inflation)
  monthlyInvestment: number;
  investmentReturnRate: number; // % annual
  initialSavings: number;
  // Habits / Life
  deepWorkHoursPerWeek: number;
  exerciseDaysPerWeek: number;
  sleepHoursPerNight: number;
  learningHoursPerWeek: number;
  // Horizon
  years: number;
}

export interface YearlyProjection {
  year: number;
  income: number;
  expenses: number;
  invested: number;
  netWorth: number;
  cashFlow: number;
  // Life impact metrics
  healthScore: number;
  careerScore: number;
  knowledgeScore: number;
  lifeScore: number;
}

export interface ScenarioResult {
  scenario: ScenarioInputs;
  projections: YearlyProjection[];
  finalNetWorth: number;
  totalInvested: number;
  totalReturns: number;
  finalLifeScore: number;
  financialFreedomYear: number | null; // year when investment income covers expenses
}

const defaultScenarios: ScenarioInputs[] = [
  {
    id: 's1',
    name: 'Caminho Atual',
    description: 'Mantendo hábitos e finanças como estão hoje',
    color: 'primary',
    monthlyIncome: 12000,
    incomeGrowthRate: 5,
    monthlyExpenses: 8500,
    expensesGrowthRate: 4,
    monthlyInvestment: 1500,
    investmentReturnRate: 9,
    initialSavings: 25000,
    deepWorkHoursPerWeek: 15,
    exerciseDaysPerWeek: 3,
    sleepHoursPerNight: 6.5,
    learningHoursPerWeek: 4,
    years: 10,
  },
  {
    id: 's2',
    name: 'Versão Otimizada',
    description: 'Hábitos elevados + maior taxa de poupança',
    color: 'success',
    monthlyIncome: 12000,
    incomeGrowthRate: 9,
    monthlyExpenses: 7500,
    expensesGrowthRate: 4,
    monthlyInvestment: 3500,
    investmentReturnRate: 11,
    initialSavings: 25000,
    deepWorkHoursPerWeek: 25,
    exerciseDaysPerWeek: 5,
    sleepHoursPerNight: 7.5,
    learningHoursPerWeek: 8,
    years: 10,
  },
];

export const useLifeSimulator = () => {
  const [scenarios, setScenarios] = useState<ScenarioInputs[]>(defaultScenarios);

  const calculateLifeScores = (inputs: ScenarioInputs, year: number) => {
    // Compounding habit impact: habits accrue benefits over time
    const habitMultiplier = 1 + (year * 0.04);

    const healthScore = Math.min(100, Math.round(
      (inputs.exerciseDaysPerWeek / 7 * 50 + (inputs.sleepHoursPerNight / 8) * 50) * habitMultiplier
    ));
    const careerScore = Math.min(100, Math.round(
      (inputs.deepWorkHoursPerWeek / 40 * 100) * habitMultiplier
    ));
    const knowledgeScore = Math.min(100, Math.round(
      (inputs.learningHoursPerWeek / 14 * 100) * habitMultiplier
    ));
    const lifeScore = Math.round((healthScore + careerScore + knowledgeScore) / 3);

    return { healthScore, careerScore, knowledgeScore, lifeScore };
  };

  const simulate = (inputs: ScenarioInputs): ScenarioResult => {
    const projections: YearlyProjection[] = [];
    let netWorth = inputs.initialSavings;
    let invested = inputs.initialSavings;
    let monthlyIncome = inputs.monthlyIncome;
    let monthlyExpenses = inputs.monthlyExpenses;
    let monthlyInvestment = inputs.monthlyInvestment;
    let totalInvested = inputs.initialSavings;
    let financialFreedomYear: number | null = null;

    // Better habits boost income growth slightly
    const habitBoost = (inputs.deepWorkHoursPerWeek / 20 + inputs.learningHoursPerWeek / 8) * 0.01;
    const effectiveIncomeGrowth = inputs.incomeGrowthRate / 100 + habitBoost;

    for (let year = 1; year <= inputs.years; year++) {
      const annualIncome = monthlyIncome * 12;
      const annualExpenses = monthlyExpenses * 12;
      const annualInvestment = monthlyInvestment * 12;
      const cashFlow = annualIncome - annualExpenses;

      // Investment growth + new contributions
      netWorth = netWorth * (1 + inputs.investmentReturnRate / 100) + annualInvestment;
      invested += annualInvestment;
      totalInvested += annualInvestment;

      // Financial freedom check (4% rule)
      const passiveIncome = netWorth * 0.04;
      if (financialFreedomYear === null && passiveIncome >= annualExpenses) {
        financialFreedomYear = year;
      }

      const scores = calculateLifeScores(inputs, year);

      projections.push({
        year,
        income: Math.round(annualIncome),
        expenses: Math.round(annualExpenses),
        invested: Math.round(annualInvestment),
        netWorth: Math.round(netWorth),
        cashFlow: Math.round(cashFlow),
        ...scores,
      });

      // Apply growth for next year
      monthlyIncome *= 1 + effectiveIncomeGrowth;
      monthlyExpenses *= 1 + inputs.expensesGrowthRate / 100;
      monthlyInvestment *= 1 + effectiveIncomeGrowth;
    }

    const final = projections[projections.length - 1];

    return {
      scenario: inputs,
      projections,
      finalNetWorth: final.netWorth,
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(final.netWorth - totalInvested),
      finalLifeScore: final.lifeScore,
      financialFreedomYear,
    };
  };

  const results = useMemo(() => scenarios.map(simulate), [scenarios]);

  const updateScenario = (id: string, updates: Partial<ScenarioInputs>) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addScenario = () => {
    const base = scenarios[0];
    const newScenario: ScenarioInputs = {
      ...base,
      id: `s${Date.now()}`,
      name: `Cenário ${scenarios.length + 1}`,
      description: 'Novo cenário customizado',
      color: 'warning',
    };
    setScenarios(prev => [...prev, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev);
  };

  return { scenarios, results, updateScenario, addScenario, removeScenario };
};
