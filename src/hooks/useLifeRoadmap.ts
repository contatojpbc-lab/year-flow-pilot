import { useMemo, useState, useCallback, useEffect } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useLifeAreas } from '@/contexts/LifeAreasContext';

export type RoadmapStatus = 'completed' | 'in_progress' | 'planned' | 'at_risk';

export interface RoadmapMilestone {
  id: string;
  year: number;
  areaId: string;
  title: string;
  description: string;
  targetMetric: string;
  status: RoadmapStatus;
  progress: number; // 0-100
  impactScore: number; // 1-10
}

export interface AreaYearlyPlan {
  areaId: string;
  year: number;
  vision: string;
  milestones: RoadmapMilestone[];
  averageProgress: number;
  status: RoadmapStatus;
}

export interface YearlySnapshot {
  year: number;
  overallProgress: number;
  completedMilestones: number;
  totalMilestones: number;
  topArea: { id: string; name: string; progress: number } | null;
  laggingArea: { id: string; name: string; progress: number } | null;
  isHistorical: boolean;
  isCurrent: boolean;
}

const STORAGE_KEY = 'life-roadmap-v1';
const ROADMAP_YEARS = [2026, 2027, 2028, 2029, 2030];

// Vision per area per year (simulated)
const visionMatrix: Record<string, Record<number, string>> = {
  'area-1': {
    2026: 'Construir base de saúde — corrida e força',
    2027: 'Performance atlética consistente',
    2028: 'Otimização total: sono, nutrição e recuperação',
    2029: 'Longevidade ativa — biomarcadores no topo',
    2030: 'Saúde como ativo permanente da vida',
  },
  'area-2': {
    2026: 'Consolidar expertise técnica e visibilidade',
    2027: 'Liderança de projetos estratégicos',
    2028: 'Transição para posição sênior / fundação própria',
    2029: 'Escala — equipe, produto ou marca pessoal',
    2030: 'Autoridade reconhecida no setor',
  },
  'area-3': {
    2026: 'Reserva de emergência + investimentos iniciais',
    2027: 'Carteira diversificada, taxa de poupança 30%+',
    2028: 'Renda passiva começa a cobrir gastos fixos',
    2029: 'Independência parcial — 50% das despesas',
    2030: 'Liberdade financeira plena (FIRE)',
  },
  'area-4': {
    2026: 'Reconectar com pessoas-chave, presença ativa',
    2027: 'Rede sólida de relacionamentos profundos',
    2028: 'Construir vida familiar / parceria estável',
    2029: 'Comunidade e mentoria — gerar valor a outros',
    2030: 'Legado relacional — círculo íntimo forte',
  },
  'area-5': {
    2026: 'Hábito de leitura e cursos estruturados',
    2027: 'Domínio de 1 nova competência transformadora',
    2028: 'Síntese — ensinar/escrever sobre o aprendido',
    2029: 'Projeto criativo de longo prazo em execução',
    2030: 'Maestria — autoridade no que escolheu aprofundar',
  },
};

// Generate roadmap milestones (simulated, deterministic)
const generateMilestones = (currentYear: number): RoadmapMilestone[] => {
  const templates: Record<string, Array<{ title: string; metric: string; impact: number }>> = {
    'area-1': [
      { title: 'Meia-maratona concluída', metric: '21km < 2h', impact: 8 },
      { title: 'Maratona completa', metric: '42km finalizada', impact: 9 },
      { title: '15% gordura corporal', metric: 'Body comp ideal', impact: 7 },
      { title: 'Idade biológica < cronológica', metric: 'Exames anuais', impact: 9 },
      { title: 'Rotina de longevidade consolidada', metric: '5 pilares ativos', impact: 10 },
    ],
    'area-2': [
      { title: 'Promoção a sênior', metric: 'Novo cargo', impact: 9 },
      { title: 'Liderar projeto estratégico', metric: 'Equipe 5+', impact: 8 },
      { title: 'Side project gerando receita', metric: 'R$ 5k/mês', impact: 9 },
      { title: 'Marca pessoal estabelecida', metric: '10k seguidores qualificados', impact: 8 },
      { title: 'Posição de autoridade no nicho', metric: 'Palestras / publicações', impact: 10 },
    ],
    'area-3': [
      { title: 'Reserva de 6 meses', metric: 'R$ 60k em renda fixa', impact: 9 },
      { title: 'Carteira diversificada R$ 200k', metric: '30% poupança/mês', impact: 9 },
      { title: 'Renda passiva R$ 2k/mês', metric: 'Dividendos + juros', impact: 9 },
      { title: 'Renda passiva R$ 5k/mês', metric: '50% das despesas', impact: 10 },
      { title: 'Liberdade financeira', metric: 'Patrimônio 25x gastos anuais', impact: 10 },
    ],
    'area-4': [
      { title: 'Encontros mensais com família', metric: '12 encontros/ano', impact: 7 },
      { title: 'Círculo íntimo definido', metric: '5 relações profundas', impact: 8 },
      { title: 'Parceria estável / vida em comum', metric: 'Convivência saudável', impact: 9 },
      { title: 'Mentoria ativa', metric: '3 mentorados', impact: 8 },
      { title: 'Comunidade de impacto criada', metric: 'Grupo recorrente', impact: 9 },
    ],
    'area-5': [
      { title: '24 livros lidos no ano', metric: '2/mês', impact: 7 },
      { title: 'Nova competência dominada', metric: 'Certificação / projeto', impact: 8 },
      { title: 'Curso ou conteúdo próprio publicado', metric: '1 lançamento', impact: 9 },
      { title: 'Projeto criativo finalizado', metric: 'Livro / produto', impact: 9 },
      { title: 'Reconhecimento como referência', metric: 'Convites externos', impact: 10 },
    ],
  };

  const milestones: RoadmapMilestone[] = [];
  ROADMAP_YEARS.forEach((year, yearIdx) => {
    Object.keys(templates).forEach(areaId => {
      const tpl = templates[areaId][yearIdx];
      if (!tpl) return;

      let status: RoadmapStatus;
      let progress: number;

      if (year < currentYear) {
        // Historical — mostly completed
        status = 'completed';
        progress = 88 + Math.floor(Math.random() * 13);
      } else if (year === currentYear) {
        // Current year — in progress
        progress = 30 + Math.floor((Math.sin(yearIdx + areaId.length) + 1) * 25);
        status = progress > 60 ? 'in_progress' : progress < 25 ? 'at_risk' : 'in_progress';
      } else {
        status = 'planned';
        progress = 0;
      }

      milestones.push({
        id: `ms-${year}-${areaId}`,
        year,
        areaId,
        title: tpl.title,
        description: visionMatrix[areaId]?.[year] || '',
        targetMetric: tpl.metric,
        impactScore: tpl.impact,
        status,
        progress,
      });
    });
  });

  return milestones;
};

export const useLifeRoadmap = () => {
  const { goals } = useGoals();
  const currentYear = new Date().getFullYear();

  // Persist user-modified milestones (e.g., progress overrides)
  const [overrides, setOverrides] = useState<Record<string, Partial<RoadmapMilestone>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const baseMilestones = useMemo(() => generateMilestones(currentYear), [currentYear]);

  // Auto-update current year milestones based on real goals progress
  const milestones = useMemo<RoadmapMilestone[]>(() => {
    const activeGoalsByArea = new Map<string, number[]>();
    goals.filter(g => g.status === 'active').forEach(g => {
      const arr = activeGoalsByArea.get(g.lifeAreaId) || [];
      arr.push(g.progress);
      activeGoalsByArea.set(g.lifeAreaId, arr);
    });

    return baseMilestones.map(m => {
      const override = overrides[m.id];
      if (override) return { ...m, ...override };

      // Auto-sync current year with real goals
      if (m.year === currentYear) {
        const areaProgresses = activeGoalsByArea.get(m.areaId);
        if (areaProgresses && areaProgresses.length > 0) {
          const avg = Math.round(areaProgresses.reduce((s, p) => s + p, 0) / areaProgresses.length);
          // Blend baseline projection with real progress (60/40 in favor of real data)
          const blended = Math.round(avg * 0.6 + m.progress * 0.4);
          let status: RoadmapStatus = 'in_progress';
          if (blended >= 95) status = 'completed';
          else if (blended < 25) status = 'at_risk';
          return { ...m, progress: blended, status };
        }
      }
      return m;
    });
  }, [baseMilestones, overrides, goals, currentYear]);

  // Group by area-year
  const areaYearlyPlans = useMemo<AreaYearlyPlan[]>(() => {
    const plans: AreaYearlyPlan[] = [];
    mockLifeAreas.forEach(area => {
      ROADMAP_YEARS.forEach(year => {
        const yearMilestones = milestones.filter(m => m.areaId === area.id && m.year === year);
        if (yearMilestones.length === 0) return;
        const avgProgress = Math.round(
          yearMilestones.reduce((s, m) => s + m.progress, 0) / yearMilestones.length
        );
        let status: RoadmapStatus = 'planned';
        if (year < currentYear) status = 'completed';
        else if (year === currentYear) {
          status = avgProgress >= 95 ? 'completed' : avgProgress < 25 ? 'at_risk' : 'in_progress';
        }
        plans.push({
          areaId: area.id,
          year,
          vision: visionMatrix[area.id]?.[year] || '',
          milestones: yearMilestones,
          averageProgress: avgProgress,
          status,
        });
      });
    });
    return plans;
  }, [milestones, currentYear]);

  // Yearly snapshots (historical view)
  const yearlySnapshots = useMemo<YearlySnapshot[]>(() => {
    return ROADMAP_YEARS.map(year => {
      const yearMs = milestones.filter(m => m.year === year);
      const completed = yearMs.filter(m => m.status === 'completed').length;
      const overallProgress = yearMs.length > 0
        ? Math.round(yearMs.reduce((s, m) => s + m.progress, 0) / yearMs.length)
        : 0;

      const byArea = new Map<string, number[]>();
      yearMs.forEach(m => {
        const arr = byArea.get(m.areaId) || [];
        arr.push(m.progress);
        byArea.set(m.areaId, arr);
      });

      let topArea: YearlySnapshot['topArea'] = null;
      let laggingArea: YearlySnapshot['laggingArea'] = null;
      byArea.forEach((progresses, areaId) => {
        const avg = progresses.reduce((s, p) => s + p, 0) / progresses.length;
        const area = mockLifeAreas.find(a => a.id === areaId);
        if (!area) return;
        if (!topArea || avg > topArea.progress) topArea = { id: areaId, name: area.name, progress: Math.round(avg) };
        if (!laggingArea || avg < laggingArea.progress) laggingArea = { id: areaId, name: area.name, progress: Math.round(avg) };
      });

      return {
        year,
        overallProgress,
        completedMilestones: completed,
        totalMilestones: yearMs.length,
        topArea,
        laggingArea,
        isHistorical: year < currentYear,
        isCurrent: year === currentYear,
      };
    });
  }, [milestones, currentYear]);

  const updateMilestoneProgress = useCallback((id: string, progress: number) => {
    const clamped = Math.min(100, Math.max(0, progress));
    let status: RoadmapStatus = 'in_progress';
    if (clamped >= 95) status = 'completed';
    else if (clamped < 25) status = 'at_risk';
    setOverrides(prev => ({ ...prev, [id]: { progress: clamped, status } }));
  }, []);

  const resetRoadmap = useCallback(() => {
    setOverrides({});
  }, []);

  // Auto-recalculation insight
  const lastAutoUpdate = useMemo(() => new Date(), [milestones]);

  return {
    years: ROADMAP_YEARS,
    currentYear,
    areas: mockLifeAreas,
    milestones,
    areaYearlyPlans,
    yearlySnapshots,
    updateMilestoneProgress,
    resetRoadmap,
    lastAutoUpdate,
  };
};
