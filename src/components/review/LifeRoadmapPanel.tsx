import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Map, CheckCircle2, Clock, AlertTriangle, Calendar, Sparkles, RotateCcw, History, TrendingUp } from 'lucide-react';
import { useLifeRoadmap, RoadmapStatus } from '@/hooks/useLifeRoadmap';
import { cn } from '@/lib/utils';

const statusConfig: Record<RoadmapStatus, { label: string; className: string; icon: any }> = {
  completed: { label: 'Concluído', className: 'border-success/40 bg-success/10 text-success', icon: CheckCircle2 },
  in_progress: { label: 'Em andamento', className: 'border-primary/40 bg-primary/10 text-primary', icon: Clock },
  at_risk: { label: 'Em risco', className: 'border-warning/40 bg-warning/10 text-warning', icon: AlertTriangle },
  planned: { label: 'Planejado', className: 'border-muted-foreground/30 bg-muted/30 text-muted-foreground', icon: Calendar },
};

export const LifeRoadmapPanel = () => {
  const {
    years,
    currentYear,
    areas,
    areaYearlyPlans,
    yearlySnapshots,
    updateMilestoneProgress,
    resetRoadmap,
    lastAutoUpdate,
  } = useLifeRoadmap();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const overallVisionProgress = Math.round(
    yearlySnapshots.reduce((s, y) => s + y.overallProgress, 0) / yearlySnapshots.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Map className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Roadmap de Vida 2026 → 2030</h2>
                  <Badge variant="outline" className="text-xs">Auto-sync</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plano de 5 anos dividido por área. Atualização automática a partir das suas metas ativas.
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Visão geral: {overallVisionProgress}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Atualizado {lastAutoUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetRoadmap} className="text-xs text-muted-foreground">
              <RotateCcw className="h-3 w-3 mr-1" />
              Resetar ajustes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Linha do Tempo Anual</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {yearlySnapshots.map(snap => {
              const isSelected = snap.year === selectedYear;
              return (
                <button
                  key={snap.year}
                  onClick={() => setSelectedYear(snap.year)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all hover:border-primary/50',
                    isSelected ? 'border-primary bg-primary/5 shadow-glow' : 'border-border/50 bg-muted/20',
                    snap.isHistorical && 'opacity-90'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-foreground">{snap.year}</span>
                    {snap.isCurrent && <Badge variant="outline" className="text-[10px] border-primary text-primary">Atual</Badge>}
                    {snap.isHistorical && <Badge variant="outline" className="text-[10px]">Histórico</Badge>}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{snap.overallProgress}%</div>
                  <Progress value={snap.overallProgress} className="h-1.5 mb-2" />
                  <div className="text-[11px] text-muted-foreground">
                    {snap.completedMilestones}/{snap.totalMilestones} marcos
                  </div>
                  {snap.topArea && (
                    <div className="text-[11px] text-success mt-1 truncate">↑ {snap.topArea.name}</div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Year Detail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Plano {selectedYear} por Área</CardTitle>
            </div>
            <Badge variant="outline">
              {selectedYear === currentYear ? 'Em execução' : selectedYear < currentYear ? 'Concluído' : 'Futuro'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {areas.map(area => {
            const plan = areaYearlyPlans.find(p => p.areaId === area.id && p.year === selectedYear);
            if (!plan) return null;
            const StatusIcon = statusConfig[plan.status].icon;

            return (
              <div key={area.id} className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: area.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-sm">{area.name}</div>
                      <div className="text-xs text-muted-foreground italic mt-0.5 truncate">
                        {plan.vision}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-[10px] gap-1', statusConfig[plan.status].className)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[plan.status].label}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">{plan.averageProgress}%</span>
                  </div>
                </div>

                <Progress value={plan.averageProgress} className="h-1.5 mb-3" />

                {plan.milestones.map(ms => {
                  const cfg = statusConfig[ms.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={ms.id} className="rounded-md bg-background/40 border border-border/30 p-3 mt-2">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.className.split(' ').find(c => c.startsWith('text-')))} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">{ms.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Meta: {ms.targetMetric}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          impacto {ms.impactScore}/10
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={ms.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">{ms.progress}%</span>
                        {selectedYear === currentYear && (
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={ms.progress}
                            onChange={e => updateMilestoneProgress(ms.id, Number(e.target.value))}
                            className="w-20 h-1 accent-primary cursor-pointer"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Auto-update note */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Plano auto-atualizado:</span> o progresso do ano em execução ({currentYear}) é recalculado automaticamente a partir das metas ativas em cada área (60% dados reais + 40% projeção). Anos futuros mostram a visão estratégica e marcos planejados.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
