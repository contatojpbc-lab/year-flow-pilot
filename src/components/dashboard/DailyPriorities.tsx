import { useMemo } from 'react';
import { useMentalLoad } from '@/hooks/useMentalLoad';
import { Target, Flame, Clock, AlertTriangle, TrendingDown, ArrowUp, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGoals } from '@/contexts/GoalsContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useLifeAreas } from '@/contexts/LifeAreasContext';
import { useRoutine } from '@/contexts/RoutineContext';
import { useMVD } from '@/contexts/MVDContext';
import { cn } from '@/lib/utils';

// Priority item types
type PriorityType = 'goal' | 'habit' | 'life_area' | 'mvd';

interface PriorityItem {
  id: string;
  title: string;
  subtitle?: string;
  type: PriorityType;
  priorityScore: number;
  reasons: string[];
  lifeAreaColor?: string;
  progress?: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
}

const daysUntil = (date: Date): number => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getUrgencyMultiplier = (daysRemaining: number): number => {
  if (daysRemaining <= 7) return 1.5;
  if (daysRemaining <= 30) return 1.3;
  if (daysRemaining <= 90) return 1.1;
  return 1.0;
};

const getUrgencyLevel = (score: number): PriorityItem['urgencyLevel'] => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

const urgencyColors: Record<PriorityItem['urgencyLevel'], string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  low: 'bg-muted text-muted-foreground border-muted',
};

const typeIcons: Record<PriorityType, React.ElementType> = {
  goal: Target,
  habit: Flame,
  life_area: TrendingDown,
  mvd: Clock,
};

export const DailyPriorities = () => {
  const { goals } = useGoals();
  const { history } = useHistory();
  const { lifeAreas } = useLifeAreas();
  const { routineItems } = useRoutine();
  const { items: mvdItems } = useMVD();

  const priorities = useMemo((): PriorityItem[] => {
    const items: PriorityItem[] = [];
    const currentMonth = new Date().getMonth() + 1;

    // 1. Goals
    goals.forEach(goal => {
      const daysRemaining = daysUntil(goal.timeBound);
      const area = lifeAreas.find(a => a.id === goal.lifeAreaId);
      if (daysRemaining <= 0 || goal.status !== 'active') return;

      const totalDays = daysUntil(goal.timeBound) + (365 - daysRemaining);
      const elapsedRatio = 1 - (daysRemaining / totalDays);
      const expectedProgress = elapsedRatio * 100;
      const progressGap = expectedProgress - goal.progress;

      const urgencyMultiplier = getUrgencyMultiplier(daysRemaining);
      const gapScore = Math.max(0, progressGap) * 0.5;
      const lowProgressBonus = goal.progress < 30 ? 15 : 0;

      let score = (gapScore + lowProgressBonus) * urgencyMultiplier;
      score = Math.min(100, Math.max(0, score));

      const reasons: string[] = [];
      if (progressGap > 10) reasons.push(`${Math.round(progressGap)}% abaixo do esperado`);
      if (daysRemaining <= 30) reasons.push(`${daysRemaining} dias restantes`);
      if (goal.progress < 20) reasons.push('Baixo progresso');

      if (score > 20 || daysRemaining <= 30) {
        items.push({
          id: goal.id,
          title: goal.title,
          subtitle: area?.name,
          type: 'goal',
          priorityScore: score,
          reasons,
          lifeAreaColor: area?.color,
          progress: goal.progress,
          urgencyLevel: getUrgencyLevel(score),
        });
      }
    });

    // 2. Habits linked to priority goals
    const priorityGoalIds = items.filter(i => i.type === 'goal').map(i => i.id);
    routineItems.forEach(habit => {
      if (habit.linkedGoalId && priorityGoalIds.includes(habit.linkedGoalId)) {
        const linkedGoal = goals.find(g => g.id === habit.linkedGoalId);
        const area = linkedGoal ? lifeAreas.find(a => a.id === linkedGoal.lifeAreaId) : null;
        const baseScore = items.find(i => i.id === habit.linkedGoalId)?.priorityScore || 50;
        const score = baseScore * 0.9;

        items.push({
          id: habit.id,
          title: habit.title,
          subtitle: `Impacta: ${linkedGoal?.title}`,
          type: 'habit',
          priorityScore: score,
          reasons: ['Vinculado a meta prioritária'],
          lifeAreaColor: area?.color,
          urgencyLevel: getUrgencyLevel(score),
        });
      }
    });

    // 3. Life areas with stagnation/decline
    if (history) {
      const lifeAreaScores = new Map<string, number[]>();
      history.lifeAreas.forEach(snapshot => {
        if (snapshot.month >= currentMonth - 2) {
          const scores = lifeAreaScores.get(snapshot.lifeAreaId) || [];
          scores.push(snapshot.overallScore);
          lifeAreaScores.set(snapshot.lifeAreaId, scores);
        }
      });

      lifeAreaScores.forEach((scores, areaId) => {
        if (scores.length < 2) return;
        const trend = scores[scores.length - 1] - scores[0];
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const area = lifeAreas.find(a => a.id === areaId);

        if (trend < -5 || (avgScore < 60 && Math.abs(trend) < 3)) {
          const declineScore = trend < -5 ? 70 + Math.abs(trend) : 55;
          items.push({
            id: areaId,
            title: area?.name || 'Área',
            subtitle: trend < -5 ? 'Área em declínio' : 'Área estagnada',
            type: 'life_area',
            priorityScore: declineScore,
            reasons: [
              trend < -5
                ? `Queda de ${Math.abs(trend).toFixed(0)}% nos últimos meses`
                : `Média de ${avgScore.toFixed(0)}% nos últimos meses`,
            ],
            lifeAreaColor: area?.color,
            progress: avgScore,
            urgencyLevel: getUrgencyLevel(declineScore),
          });
        }
      });
    }

    // 4. MVD
    if (mvdItems.length > 0) {
      items.push({
        id: 'mvd-daily',
        title: 'Concluir MVD do dia',
        subtitle: `${mvdItems.length} itens essenciais`,
        type: 'mvd',
        priorityScore: 45,
        reasons: ['Mantém o streak ativo', 'Fundação do dia'],
        urgencyLevel: 'medium',
      });
    }

    return items.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [goals, history, lifeAreas, routineItems, mvdItems]);

  const mentalLoad = useMentalLoad();

  const displayedPriorities = useMemo(() => {
    return priorities.slice(0, mentalLoad.maxPrioritiesToShow);
  }, [priorities, mentalLoad.maxPrioritiesToShow]);

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-primary" />
            Prioridades do Dia
          </CardTitle>
          <div className="flex items-center gap-2">
            {mentalLoad.shouldReduceTasks && (
              <Badge variant="outline" className="text-xs text-warning border-warning/30 bg-warning/10">
                <Brain className="h-3 w-3 mr-1" />
                Modo Foco
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {displayedPriorities.length} itens
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mentalLoad.shouldReduceTasks && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2 mb-2">
            <span className="font-medium">Sugestões reduzidas.</span> Foque apenas nestas prioridades essenciais.
          </div>
        )}
        {displayedPriorities.map((item, index) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                "hover:bg-accent/50",
                index === 0 && "ring-1 ring-primary/20 bg-primary/5"
              )}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: item.lifeAreaColor
                    ? `${item.lifeAreaColor.replace(')', ' / 0.15)')}`
                    : 'hsl(var(--muted))',
                }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: item.lifeAreaColor || 'hsl(var(--muted-foreground))' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground truncate">{item.title}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0", urgencyColors[item.urgencyLevel])}
                  >
                    {item.urgencyLevel === 'critical' ? 'Crítico' :
                     item.urgencyLevel === 'high' ? 'Alto' :
                     item.urgencyLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>

                {item.subtitle && (
                  <p className="text-xs text-muted-foreground mb-1.5">{item.subtitle}</p>
                )}

                {item.progress !== undefined && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <Progress value={item.progress} size="sm" className="flex-1 h-1.5" />
                    <span className="text-[10px] text-muted-foreground w-8">
                      {item.progress.toFixed(0)}%
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {item.reasons.map((reason, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-foreground">
                  {Math.round(item.priorityScore)}
                </div>
                <div className="text-[10px] text-muted-foreground">score</div>
              </div>
            </div>
          );
        })}

        {displayedPriorities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma prioridade urgente hoje!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
