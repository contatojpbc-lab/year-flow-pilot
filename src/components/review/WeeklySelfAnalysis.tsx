import { 
  TrendingUp, TrendingDown, Minus, Award, AlertTriangle, 
  Lightbulb, Target, CheckCircle2, Flame, ArrowUpRight, 
  ArrowDownRight, BarChart3, Sparkles, Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWeeklyAnalysis, WeeklyStrength, WeeklyBottleneck, ImprovementInsight } from "@/hooks/useWeeklyAnalysis";
import { cn } from "@/lib/utils";

const TrendIcon = ({ direction }: { direction: 'improving' | 'declining' | 'stable' }) => {
  switch (direction) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

const ChangeIndicator = ({ change, suffix = '%' }: { change: number; suffix?: string }) => {
  if (change === 0) return <span className="text-xs text-muted-foreground">--</span>;
  
  const isPositive = change > 0;
  return (
    <span className={cn(
      "text-xs font-medium flex items-center gap-0.5",
      isPositive ? "text-success" : "text-destructive"
    )}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {isPositive ? '+' : ''}{change}{suffix}
    </span>
  );
};

const StrengthCard = ({ strength }: { strength: WeeklyStrength }) => {
  const categoryIcon = {
    mvd: <CheckCircle2 className="h-4 w-4" />,
    habits: <Flame className="h-4 w-4" />,
    goals: <Target className="h-4 w-4" />,
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success">
        {categoryIcon[strength.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{strength.title}</p>
        <p className="text-xs text-muted-foreground">{strength.metric}</p>
      </div>
      <Badge variant="outline" className="text-success border-success/30">
        {strength.score}%
      </Badge>
    </div>
  );
};

const BottleneckCard = ({ bottleneck }: { bottleneck: WeeklyBottleneck }) => {
  const severityColors = {
    low: 'border-muted-foreground/30 bg-muted/20',
    medium: 'border-warning/30 bg-warning/5',
    high: 'border-destructive/30 bg-destructive/5',
  };

  const severityBadge = {
    low: 'secondary',
    medium: 'outline',
    high: 'destructive',
  } as const;

  return (
    <div className={cn("p-3 rounded-lg border", severityColors[bottleneck.severity])}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(
            "h-4 w-4",
            bottleneck.severity === 'high' ? 'text-destructive' :
            bottleneck.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
          )} />
          <span className="text-sm font-medium text-foreground">{bottleneck.title}</span>
        </div>
        <Badge variant={severityBadge[bottleneck.severity]} className="text-xs">
          {bottleneck.severity === 'high' ? 'Crítico' : 
           bottleneck.severity === 'medium' ? 'Atenção' : 'Leve'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{bottleneck.issue}</p>
      <div className="flex items-start gap-1.5 text-xs text-primary">
        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>{bottleneck.suggestion}</span>
      </div>
    </div>
  );
};

const InsightCard = ({ insight }: { insight: ImprovementInsight }) => {
  const typeConfig = {
    pattern: { icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
    opportunity: { icon: Lightbulb, color: 'text-warning', bg: 'bg-warning/10' },
    warning: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    achievement: { icon: Award, color: 'text-success', bg: 'bg-success/10' },
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-card border">
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground mb-1">{insight.message}</p>
        <p className="text-xs text-muted-foreground">{insight.actionable}</p>
      </div>
    </div>
  );
};

export function WeeklySelfAnalysis() {
  const analysis = useWeeklyAnalysis();
  const { currentWeek, productivityTrend, weekOverWeekComparison, strengths, bottlenecks, insights, previousWeeks } = analysis;

  return (
    <div className="space-y-6">
      {/* Header with Trend */}
      <Card variant="glow" className="overflow-hidden">
        <div className={cn(
          "h-1",
          productivityTrend.direction === 'improving' ? 'bg-success' :
          productivityTrend.direction === 'declining' ? 'bg-destructive' : 'bg-muted'
        )} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Autoanálise Semanal</CardTitle>
            </div>
            <Badge variant="outline" className={cn(
              "flex items-center gap-1",
              productivityTrend.direction === 'improving' ? 'text-success border-success/30' :
              productivityTrend.direction === 'declining' ? 'text-destructive border-destructive/30' : ''
            )}>
              <TrendIcon direction={productivityTrend.direction} />
              {productivityTrend.direction === 'improving' ? 'Em alta' :
               productivityTrend.direction === 'declining' ? 'Em queda' : 'Estável'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{currentWeek.overallScore}</p>
              <p className="text-xs text-muted-foreground">Score Geral</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{previousWeeks.length}</p>
              <p className="text-xs text-muted-foreground">Semanas Analisadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-foreground">{productivityTrend.percentageChange}%</p>
                <TrendIcon direction={productivityTrend.direction} />
              </div>
              <p className="text-xs text-muted-foreground">Variação</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {productivityTrend.direction === 'improving' 
              ? 'Você está melhorando consistentemente. Continue assim!'
              : productivityTrend.direction === 'declining'
              ? 'Detectamos uma queda na produtividade. Veja os gargalos abaixo.'
              : 'Seu desempenho está estável. Busque oportunidades de crescimento.'}
          </p>
        </CardContent>
      </Card>

      {/* Week over Week Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Comparação Semanal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MVD */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">MVD</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{weekOverWeekComparison.mvd.current}%</span>
                <ChangeIndicator change={weekOverWeekComparison.mvd.change} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={weekOverWeekComparison.mvd.current} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">
                vs {weekOverWeekComparison.mvd.previous}%
              </span>
            </div>
          </div>

          {/* Habits */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Hábitos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{weekOverWeekComparison.habits.current}%</span>
                <ChangeIndicator change={weekOverWeekComparison.habits.change} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={weekOverWeekComparison.habits.current} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">
                vs {weekOverWeekComparison.habits.previous}%
              </span>
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Metas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{weekOverWeekComparison.goals.current}%</span>
                <ChangeIndicator change={weekOverWeekComparison.goals.change} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={weekOverWeekComparison.goals.current} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">
                vs {weekOverWeekComparison.goals.previous}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Bottlenecks Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              <CardTitle className="text-base">Pontos Fortes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {strengths.length > 0 ? (
              strengths.map(strength => (
                <StrengthCard key={strength.id} strength={strength} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Continue trabalhando para identificar seus pontos fortes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Gargalos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {bottlenecks.length > 0 ? (
              bottlenecks.map(bottleneck => (
                <BottleneckCard key={bottleneck.id} bottleneck={bottleneck} />
              ))
            ) : (
              <div className="text-center py-4">
                <Sparkles className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum gargalo crítico identificado!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Improvement Insights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Insights de Melhoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
