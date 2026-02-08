import { 
  Crown, TrendingUp, TrendingDown, Minus, Target, 
  AlertTriangle, CheckCircle2, Clock, Lightbulb,
  BarChart3, Users, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCEOMode, PerformanceMetric, LifeAreaScore, StrategicDecision } from "@/hooks/useCEOMode";
import { cn } from "@/lib/utils";

// ============================================
// SUB-COMPONENTS
// ============================================

const LifeScoreGauge = ({ score, previousScore, trend }: { 
  score: number; 
  previousScore: number;
  trend: 'improving' | 'stable' | 'declining';
}) => {
  const change = score - previousScore;
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success';
    if (s >= 60) return 'text-primary';
    if (s >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card variant="glow" className="overflow-hidden">
      <div className="h-1 gradient-primary" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Life Score</span>
          </div>
          <Badge variant={trend === 'improving' ? 'default' : trend === 'declining' ? 'destructive' : 'secondary'}>
            {trend === 'improving' ? 'Melhorando' : trend === 'declining' ? 'Caindo' : 'Estável'}
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className={cn("text-6xl font-bold", getScoreColor(score))}>
              {score}
            </div>
            <p className="text-sm text-muted-foreground mt-1">de 100</p>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            {change > 0 ? (
              <ArrowUpRight className="h-8 w-8 text-success" />
            ) : change < 0 ? (
              <ArrowDownRight className="h-8 w-8 text-destructive" />
            ) : (
              <Minus className="h-8 w-8 text-muted-foreground" />
            )}
            <span className={cn(
              "text-lg font-semibold",
              change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {change > 0 ? '+' : ''}{change}
            </span>
            <span className="text-xs text-muted-foreground">vs semana anterior</span>
          </div>
        </div>

        <div className="mt-4">
          <Progress 
            value={score} 
            className="h-3"
            indicatorColor={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'destructive'}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ metric }: { metric: PerformanceMetric }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success bg-success/10';
      case 'good': return 'text-primary bg-primary/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'critical': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const percentage = Math.round((metric.value / metric.target) * 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
          <div className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", getStatusColor(metric.status))}>
            {metric.trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>{metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{metric.value}</span>
          <span className="text-sm text-muted-foreground">/ {metric.target} {metric.unit}</span>
        </div>
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-1.5 mt-2"
          indicatorColor={metric.status === 'excellent' || metric.status === 'good' ? 'success' : 'warning'}
        />
      </CardContent>
    </Card>
  );
};

const AreaStrengthCard = ({ areas, type }: { areas: LifeAreaScore[]; type: 'strength' | 'weakness' }) => {
  const isStrength = type === 'strength';
  
  return (
    <Card className={cn(
      "border-l-4",
      isStrength ? "border-l-success" : "border-l-destructive"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isStrength ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <CardTitle className="text-base">
            {isStrength ? 'Áreas Fortes' : 'Áreas para Melhorar'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {areas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isStrength ? 'Nenhuma área se destaca positivamente' : 'Nenhuma área crítica identificada'}
          </p>
        ) : (
          areas.map((area) => (
            <div key={area.area} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{area.area}</p>
                <p className="text-xs text-muted-foreground">{area.keyMetric}</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-lg font-bold",
                  isStrength ? "text-success" : "text-destructive"
                )}>
                  {area.score}
                </span>
                <p className="text-xs text-muted-foreground">
                  {area.trend === 'improving' ? '↑' : area.trend === 'declining' ? '↓' : '→'}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const DecisionCard = ({ decision }: { decision: StrategicDecision }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'priority': return <Target className="h-4 w-4" />;
      case 'resource': return <Users className="h-4 w-4" />;
      case 'direction': return <Zap className="h-4 w-4" />;
      case 'optimization': return <BarChart3 className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      case 'decided': return <Badge variant="default">Decidido</Badge>;
      case 'in_progress': return <Badge className="bg-primary/80">Em Andamento</Badge>;
      default: return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <Card variant="interactive" className="hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-primary">
            {getCategoryIcon(decision.category)}
            <span className="text-xs uppercase tracking-wide font-medium">
              {decision.category}
            </span>
          </div>
          {getStatusBadge(decision.status)}
        </div>
        
        <h4 className="font-semibold text-foreground mb-1">{decision.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{decision.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", getImpactColor(decision.impact))}>
              Impacto {decision.impact === 'high' ? 'Alto' : decision.impact === 'medium' ? 'Médio' : 'Baixo'}
            </span>
            {decision.deadline && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {decision.deadline}
              </span>
            )}
          </div>
        </div>
        
        {decision.recommendation && (
          <div className="mt-3 p-2 bg-primary/5 rounded-md border border-primary/10">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-xs text-foreground">{decision.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExecutiveSummaryCard = ({ summary }: { summary: ReturnType<typeof useCEOMode>['executiveSummary'] }) => (
  <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        <CardTitle>Resumo Executivo</CardTitle>
      </div>
      <CardDescription className="text-base font-medium text-foreground">
        {summary.headline}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Key Insights */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Insights Principais
        </h4>
        <ul className="space-y-1.5">
          {summary.keyInsights.map((insight, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Critical Alerts */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alertas Críticos
        </h4>
        <ul className="space-y-1.5">
          {summary.criticalAlerts.map((alert, i) => (
            <li key={i} className="text-sm text-warning/90">
              {alert}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Weekly Highlight */}
      <div className="p-3 bg-success/10 rounded-lg border border-success/20">
        <h4 className="text-sm font-semibold text-success mb-1">🏆 Destaque da Semana</h4>
        <p className="text-sm text-foreground">{summary.weeklyHighlight}</p>
      </div>

      {/* Action Recommendation */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-1">📋 Recomendação de Ação</h4>
        <p className="text-sm text-foreground">{summary.actionableRecommendation}</p>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// MAIN COMPONENT
// ============================================

export function CEOModePanel() {
  const dashboard = useCEOMode();

  const pendingDecisions = dashboard.strategicDecisions.filter(d => d.status === 'pending');
  const activeDecisions = dashboard.strategicDecisions.filter(d => d.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <Crown className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">CEO Mode</h2>
          <p className="text-sm text-muted-foreground">
            Semana {dashboard.weekNumber} • Visão executiva da sua vida
          </p>
        </div>
      </div>

      {/* Life Score + Executive Summary */}
      <div className="grid lg:grid-cols-2 gap-4">
        <LifeScoreGauge 
          score={dashboard.overallLifeScore}
          previousScore={dashboard.previousLifeScore}
          trend={dashboard.scoreTrend}
        />
        <ExecutiveSummaryCard summary={dashboard.executiveSummary} />
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="decisions">Decisões</TabsTrigger>
        </TabsList>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.performanceMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </TabsContent>

        {/* Life Areas Tab */}
        <TabsContent value="areas" className="space-y-4">
          {/* Strengths vs Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <AreaStrengthCard areas={dashboard.strengths} type="strength" />
            <AreaStrengthCard areas={dashboard.weaknesses} type="weakness" />
          </div>

          {/* All Areas Grid */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Todas as Áreas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboard.lifeAreaScores.map((area) => (
                  <div 
                    key={area.area}
                    className={cn(
                      "p-3 rounded-lg border",
                      area.isStrength && "border-success/30 bg-success/5",
                      area.isWeakness && "border-destructive/30 bg-destructive/5",
                      !area.isStrength && !area.isWeakness && "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{area.area}</span>
                      <span className={cn(
                        "text-lg font-bold",
                        area.score >= 70 ? "text-success" : area.score >= 50 ? "text-foreground" : "text-destructive"
                      )}>
                        {area.score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{area.keyMetric}</span>
                      <span className={cn(
                        "text-xs",
                        area.trend === 'improving' ? "text-success" : area.trend === 'declining' ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {area.trend === 'improving' ? '↑' : area.trend === 'declining' ? '↓' : '→'}
                        {area.score - area.previousScore > 0 ? '+' : ''}{area.score - area.previousScore}
                      </span>
                    </div>
                    <Progress 
                      value={area.score} 
                      className="h-1 mt-2"
                      indicatorColor={area.score >= 70 ? 'success' : area.score >= 50 ? 'default' : 'destructive'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Decisions Tab */}
        <TabsContent value="decisions" className="space-y-4">
          {/* Pending Decisions */}
          {pendingDecisions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Decisões Pendentes ({pendingDecisions.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))}
              </div>
            </div>
          )}

          {/* Active/Decided */}
          {activeDecisions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Decisões Ativas / Concluídas ({activeDecisions.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
