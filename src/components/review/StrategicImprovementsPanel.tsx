import { 
  Lightbulb, 
  Zap, 
  FlaskConical, 
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Trophy,
  Compass,
  Sparkles,
  BookOpen,
  Play,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useStrategicImprovements,
  StrategicImprovement,
  HighImpactHabit,
  ProductivityExperiment,
  GrowthMetric
} from "@/hooks/useStrategicImprovements";
import { cn } from "@/lib/utils";

// ============================================
// SUB-COMPONENTS
// ============================================

const ImpactBadge = ({ impact }: { impact: string }) => {
  const config = {
    transformational: { label: 'Transformacional', className: 'bg-primary/20 text-primary border-primary/30' },
    high: { label: 'Alto Impacto', className: 'bg-success/20 text-success border-success/30' },
    medium: { label: 'Médio', className: 'bg-warning/20 text-warning border-warning/30' },
    incremental: { label: 'Incremental', className: 'bg-muted text-muted-foreground border-border' },
  };
  
  const { label, className } = config[impact as keyof typeof config] || config.incremental;
  
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

const CategoryIcon = ({ category }: { category: string }) => {
  const icons = {
    habits: <Zap className="h-4 w-4" />,
    productivity: <Target className="h-4 w-4" />,
    mindset: <Sparkles className="h-4 w-4" />,
    systems: <Compass className="h-4 w-4" />,
    recovery: <Clock className="h-4 w-4" />,
  };
  return icons[category as keyof typeof icons] || <Lightbulb className="h-4 w-4" />;
};

const CategoryLabel: Record<string, string> = {
  habits: 'Hábitos',
  productivity: 'Produtividade',
  mindset: 'Mentalidade',
  systems: 'Sistemas',
  recovery: 'Recuperação',
};

const ImprovementCard = ({ improvement }: { improvement: StrategicImprovement }) => (
  <Card className="border-border/50">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <CategoryIcon category={improvement.category} />
          </div>
          <div>
            <Badge variant="secondary" className="text-xs mb-1">
              {CategoryLabel[improvement.category]}
            </Badge>
            <h4 className="font-medium text-foreground text-sm leading-tight">
              {improvement.title}
            </h4>
          </div>
        </div>
        <ImpactBadge impact={improvement.expectedImpact} />
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {improvement.description}
      </p>
      
      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border/50 mb-3">
        <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">
          <span className="font-medium">Por que:</span> {improvement.rationale}
        </p>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {improvement.timeToImplement}
        </span>
        <div className="flex gap-1">
          {improvement.relatedLifeAreas.slice(0, 2).map((area, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {area.split(' ')[0]}
            </Badge>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const HabitCard = ({ habit }: { habit: HighImpactHabit }) => {
  const frequencyLabel = {
    daily: 'Diário',
    weekly: 'Semanal',
    '3x_week': '3x/semana',
    as_needed: 'Conforme necessário',
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="font-medium text-foreground text-sm mb-1">
              {habit.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{frequencyLabel[habit.frequency]}</Badge>
              <span>{habit.timeRequired}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-success">{habit.impactScore}</span>
            <p className="text-xs text-muted-foreground">impacto</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {habit.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              {habit.scientificBacking}
            </p>
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
            <Play className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              <span className="font-medium">Comece agora:</span> {habit.quickStart}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Sinergias:</p>
          <div className="flex flex-wrap gap-1">
            {habit.synergies.map((synergy, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {synergy}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ExperimentCard = ({ experiment }: { experiment: ProductivityExperiment }) => {
  const statusConfig = {
    suggested: { label: 'Sugerido', className: 'bg-muted text-muted-foreground' },
    active: { label: 'Em andamento', className: 'bg-primary/20 text-primary' },
    completed: { label: 'Concluído', className: 'bg-success/20 text-success' },
    abandoned: { label: 'Abandonado', className: 'bg-destructive/20 text-destructive' },
  };

  const difficultyConfig = {
    easy: { label: 'Fácil', color: 'text-success' },
    moderate: { label: 'Moderado', color: 'text-warning' },
    challenging: { label: 'Desafiador', color: 'text-destructive' },
  };

  const { label: statusLabel, className: statusClass } = statusConfig[experiment.status];
  const { label: diffLabel, color: diffColor } = difficultyConfig[experiment.difficultyLevel];

  return (
    <Card className={cn(
      "border-border/50",
      experiment.status === 'active' && "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-foreground text-sm">
              {experiment.title}
            </h4>
          </div>
          <Badge className={statusClass}>{statusLabel}</Badge>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {experiment.duration}
          </span>
          <span className={diffColor}>{diffLabel}</span>
        </div>
        
        <div className="p-2 rounded-lg bg-muted/50 border border-border/50 mb-3">
          <p className="text-xs text-foreground">
            <span className="font-medium">Hipótese:</span> {experiment.hypothesis}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Protocolo:</p>
          <ul className="space-y-1">
            {experiment.protocol.slice(0, 3).map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-medium">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Resultado esperado:</span> {experiment.expectedOutcome}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const GrowthMetricCard = ({ metric }: { metric: GrowthMetric }) => {
  const TrendIcon = metric.trend === 'improving' ? ArrowUpRight :
                    metric.trend === 'declining' ? ArrowDownRight : Minus;
  
  const trendColor = metric.trend === 'improving' ? 'text-success' :
                     metric.trend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  const periodLabel = {
    '7d': '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    'ytd': 'Este ano',
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-foreground">{metric.name}</p>
          <Badge variant="secondary" className="text-xs">{periodLabel[metric.period]}</Badge>
        </div>
        
        <div className="flex items-end gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">
            {metric.currentValue}{metric.unit === '%' || metric.unit.includes('/') ? '' : ' '}{metric.unit}
          </span>
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{metric.growthRate > 0 ? '+' : ''}{metric.growthRate}%</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Anterior: {metric.previousValue}{metric.unit}</span>
            <span>Baseline: {metric.baselineValue}{metric.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const StrategicImprovementsPanel = () => {
  const analysis = useStrategicImprovements();
  
  const scoreChangeColor = analysis.growthEvaluation.scoreChange > 0 ? 'text-success' :
                           analysis.growthEvaluation.scoreChange < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header with Weekly Focus */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-success to-warning" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <CardTitle>Estratégia & Crescimento</CardTitle>
          </div>
          <CardDescription>
            Sugestões personalizadas baseadas em seus dados de desempenho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Foco da Semana: {analysis.weeklyFocus.theme}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {analysis.weeklyFocus.keyObjective}
            </p>
            <div className="space-y-1">
              {analysis.weeklyFocus.supportingActions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {action}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-foreground">
            {analysis.growthEvaluation.overallScore}
          </p>
          <p className="text-xs text-muted-foreground">Score de Crescimento</p>
          <span className={cn("text-sm font-medium", scoreChangeColor)}>
            {analysis.growthEvaluation.scoreChange > 0 ? '+' : ''}{analysis.growthEvaluation.scoreChange} pts
          </span>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-success">
            {analysis.growthEvaluation.strengths.length}
          </p>
          <p className="text-xs text-muted-foreground">Pontos Fortes</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-warning">
            {analysis.growthEvaluation.developmentAreas.length}
          </p>
          <p className="text-xs text-muted-foreground">Em Desenvolvimento</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-primary">
            {analysis.growthEvaluation.milestones.length}
          </p>
          <p className="text-xs text-muted-foreground">Marcos Atingidos</p>
        </Card>
      </div>

      {/* Tabs for detailed content */}
      <Tabs defaultValue="improvements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="improvements" className="text-xs sm:text-sm">
            Melhorias
          </TabsTrigger>
          <TabsTrigger value="habits" className="text-xs sm:text-sm">
            Hábitos
          </TabsTrigger>
          <TabsTrigger value="experiments" className="text-xs sm:text-sm">
            Experimentos
          </TabsTrigger>
          <TabsTrigger value="growth" className="text-xs sm:text-sm">
            Crescimento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="improvements" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Melhorias estratégicas priorizadas para esta semana
          </p>
          <div className="grid gap-3">
            {analysis.weeklyImprovements.slice(0, 5).map(improvement => (
              <ImprovementCard key={improvement.id} improvement={improvement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hábitos de alto impacto recomendados com base em seus objetivos
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.highImpactHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Experimentos de produtividade para descobrir o que funciona para você
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.experiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Avaliação completa do seu crescimento pessoal ao longo do tempo
          </p>
          
          {/* Growth Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.growthMetrics.map(metric => (
              <GrowthMetricCard key={metric.id} metric={metric} />
            ))}
          </div>

          {/* Strengths & Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-success">
                  <Trophy className="h-4 w-4" />
                  <CardTitle className="text-sm">Pontos Fortes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.growthEvaluation.strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-warning">
                  <Target className="h-4 w-4" />
                  <CardTitle className="text-sm">Áreas em Desenvolvimento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.growthEvaluation.developmentAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{area}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Milestones */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Trophy className="h-4 w-4" />
                <CardTitle className="text-sm">Marcos Alcançados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.growthEvaluation.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.significance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projections */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <CardTitle className="text-sm">Projeções</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.growthEvaluation.projections.map((projection, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/50">
                    <p className="font-medium text-foreground text-sm mb-2">{projection.metric}</p>
                    <div className="grid gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary">Atual</Badge>
                        <span className="text-muted-foreground">{projection.currentTrajectory}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-success/20 text-success">Otimista</Badge>
                        <span className="text-foreground">{projection.optimisticTrajectory}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
