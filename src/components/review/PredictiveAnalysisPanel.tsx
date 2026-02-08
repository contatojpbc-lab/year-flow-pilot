import { 
  TrendingUp, TrendingDown, Minus, Target, Calendar,
  AlertTriangle, Lightbulb, ChevronRight, Zap, Shield,
  Clock, BarChart3, Sparkles, Eye, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  usePredictiveAnalysis, 
  PerformancePrediction, 
  SuggestedGoal, 
  QuarterlyPlan,
  FutureRisk,
  FutureOpportunity
} from "@/hooks/usePredictiveAnalysis";
import { cn } from "@/lib/utils";

// ============================================
// SUB-COMPONENTS
// ============================================

const OutlookBanner = ({ outlook, confidence }: { 
  outlook: 'very_positive' | 'positive' | 'neutral' | 'concerning';
  confidence: number;
}) => {
  const config = {
    very_positive: { label: 'Muito Positivo', color: 'text-success', bg: 'bg-success/10', icon: TrendingUp },
    positive: { label: 'Positivo', color: 'text-primary', bg: 'bg-primary/10', icon: TrendingUp },
    neutral: { label: 'Neutro', color: 'text-muted-foreground', bg: 'bg-muted', icon: Minus },
    concerning: { label: 'Preocupante', color: 'text-destructive', bg: 'bg-destructive/10', icon: TrendingDown },
  };

  const { label, color, bg, icon: Icon } = config[outlook];

  return (
    <Card variant="glow" className="overflow-hidden">
      <div className="h-1 gradient-primary" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", bg)}>
              <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perspectiva Geral</p>
              <p className={cn("text-2xl font-bold", color)}>{label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Confiança da Análise</p>
            <p className="text-2xl font-bold text-foreground">{confidence}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PredictionCard = ({ prediction }: { prediction: PerformancePrediction }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating': return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'steady': return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'slowing': return <Minus className="h-4 w-4 text-warning" />;
      case 'declining': return <ArrowDownRight className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'accelerating': return 'Acelerando';
      case 'steady': return 'Estável';
      case 'slowing': return 'Desacelerando';
      case 'declining': return 'Em Declínio';
      default: return trend;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{prediction.lifeArea}</h4>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(prediction.trend)}
              <span className="text-xs text-muted-foreground">{getTrendLabel(prediction.trend)}</span>
            </div>
          </div>
          <Badge variant={prediction.trend === 'declining' ? 'destructive' : 'secondary'}>
            {prediction.confidence}% confiança
          </Badge>
        </div>

        {/* Score Progression */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className={cn("text-lg font-bold", getScoreColor(prediction.currentScore))}>
              {prediction.currentScore}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">30 dias</p>
            <p className={cn("text-lg font-bold", getScoreColor(prediction.predictedScore30d))}>
              {prediction.predictedScore30d}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">90 dias</p>
            <p className={cn("text-lg font-bold", getScoreColor(prediction.predictedScore90d))}>
              {prediction.predictedScore90d}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Fim do Ano</p>
            <p className={cn("text-lg font-bold", getScoreColor(prediction.predictedScoreEOY))}>
              {prediction.predictedScoreEOY}
            </p>
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Fatores Chave:</p>
          {prediction.keyFactors.map((factor, i) => (
            <p key={i} className="text-xs text-foreground flex items-center gap-1">
              <span className="text-primary">•</span> {factor}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SuggestedGoalCard = ({ goal }: { goal: SuggestedGoal }) => {
  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low': return <Badge variant="secondary">Esforço Baixo</Badge>;
      case 'medium': return <Badge className="bg-warning/80">Esforço Médio</Badge>;
      case 'high': return <Badge variant="destructive">Esforço Alto</Badge>;
      default: return null;
    }
  };

  return (
    <Card variant="interactive" className="hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline">{goal.lifeArea}</Badge>
          {getEffortBadge(goal.estimatedEffort)}
        </div>

        <h4 className="font-semibold text-foreground mb-1">{goal.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">Impacto: {goal.expectedImpact}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-success" />
            <span className="text-sm text-foreground">Sucesso: {goal.successProbability}%</span>
          </div>
        </div>

        <div className="p-2 bg-muted/50 rounded-md mb-3">
          <p className="text-xs text-foreground">
            <span className="font-medium">Por que esta meta:</span> {goal.rationale}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Prazo sugerido: {goal.suggestedDeadline.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const QuarterPlanCard = ({ plan, isCurrent }: { plan: QuarterlyPlan; isCurrent: boolean }) => (
  <Card className={cn(isCurrent && "border-primary/30")}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{plan.quarter} {plan.year}</CardTitle>
        </div>
        {isCurrent && <Badge>Atual</Badge>}
      </div>
      <CardDescription className="text-base font-medium text-foreground">
        {plan.theme}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Objectives */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">OBJETIVOS PRINCIPAIS</p>
        {plan.primaryObjectives.map((obj, i) => (
          <p key={i} className="text-sm text-foreground flex items-center gap-2 mb-1">
            <ChevronRight className="h-3 w-3 text-primary" /> {obj}
          </p>
        ))}
      </div>

      <Separator />

      {/* Key Results */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">RESULTADOS CHAVE</p>
        <div className="space-y-2">
          {plan.keyResults.map((kr, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground">{kr.metric}</span>
                <span className="text-muted-foreground">{kr.current} → {kr.target} {kr.unit}</span>
              </div>
              <Progress 
                value={(kr.current / kr.target) * 100} 
                className="h-1.5"
                indicatorColor={kr.current >= kr.target * 0.8 ? 'success' : 'default'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div className="flex flex-wrap gap-1">
        {plan.focusAreas.map((area, i) => (
          <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RiskCard = ({ risk }: { risk: FutureRisk }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-l-destructive bg-destructive/5';
      case 'high': return 'border-l-warning bg-warning/5';
      case 'medium': return 'border-l-primary bg-primary/5';
      case 'low': return 'border-l-muted-foreground bg-muted/50';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="destructive">Ativo</Badge>;
      case 'emerging': return <Badge className="bg-warning/80">Emergente</Badge>;
      case 'monitored': return <Badge variant="secondary">Monitorado</Badge>;
      default: return null;
    }
  };

  return (
    <Card className={cn("border-l-4", getImpactColor(risk.impact))}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">{risk.lifeArea}</span>
          </div>
          {getStatusBadge(risk.status)}
        </div>

        <h4 className="font-semibold text-foreground mb-1">{risk.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <span className="text-muted-foreground">Probabilidade:</span>
            <span className="ml-1 font-medium text-foreground">{risk.probability}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Janela:</span>
            <span className="ml-1 font-medium text-foreground">{risk.timeframe}</span>
          </div>
        </div>

        <div className="p-2 bg-warning/10 rounded-md mb-2">
          <p className="text-xs">
            <span className="font-medium text-warning">⚡ Sinal de Alerta:</span>
            <span className="text-foreground ml-1">{risk.earlyWarningSign}</span>
          </p>
        </div>

        <div className="p-2 bg-success/10 rounded-md">
          <p className="text-xs">
            <span className="font-medium text-success">✓ Mitigação:</span>
            <span className="text-foreground ml-1">{risk.mitigationStrategy}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const OpportunityCard = ({ opportunity }: { opportunity: FutureOpportunity }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return <Zap className="h-4 w-4 text-success" />;
      case 'growth': return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'optimization': return <BarChart3 className="h-4 w-4 text-primary" />;
      case 'recovery': return <Shield className="h-4 w-4 text-warning" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'breakthrough': return 'Avanço';
      case 'growth': return 'Crescimento';
      case 'optimization': return 'Otimização';
      case 'recovery': return 'Recuperação';
      default: return type;
    }
  };

  return (
    <Card className="border-l-4 border-l-success">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getTypeIcon(opportunity.type)}
            <span className="text-xs font-medium text-muted-foreground">{getTypeLabel(opportunity.type)}</span>
          </div>
          <Badge variant="outline">{opportunity.lifeArea}</Badge>
        </div>

        <h4 className="font-semibold text-foreground mb-1">{opportunity.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Impacto Potencial</p>
            <div className="flex items-center gap-2">
              <Progress value={opportunity.potentialImpact} className="h-1.5 flex-1" indicatorColor="success" />
              <span className="text-sm font-medium text-success">{opportunity.potentialImpact}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prontidão</p>
            <div className="flex items-center gap-2">
              <Progress value={opportunity.readinessScore} className="h-1.5 flex-1" />
              <span className="text-sm font-medium text-foreground">{opportunity.readinessScore}%</span>
            </div>
          </div>
        </div>

        <div className="p-2 bg-primary/10 rounded-md">
          <p className="text-xs">
            <span className="font-medium text-primary">Ação Necessária:</span>
            <span className="text-foreground ml-1">{opportunity.requiredAction}</span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Janela: {opportunity.windowOfOpportunity}
        </p>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PredictiveAnalysisPanel() {
  const analysis = usePredictiveAnalysis();

  const activeRisks = analysis.risks.filter(r => r.status === 'active');
  const otherRisks = analysis.risks.filter(r => r.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <Eye className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Análise Preditiva</h2>
          <p className="text-sm text-muted-foreground">
            Projeções baseadas no seu histórico de performance
          </p>
        </div>
      </div>

      {/* Outlook Banner */}
      <OutlookBanner outlook={analysis.overallOutlook} confidence={analysis.confidenceScore} />

      {/* Tabbed Content */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="predictions">Projeções</TabsTrigger>
          <TabsTrigger value="goals">Metas IA</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.predictions.map((prediction) => (
              <PredictionCard key={prediction.lifeArea} prediction={prediction} />
            ))}
          </div>

          {/* Historical Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Padrões Históricos Identificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {analysis.historicalInsights.map((insight, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground text-sm">{insight.pattern}</p>
                    <p className="text-xs text-muted-foreground mb-1">{insight.frequency} • {insight.impact}</p>
                    <p className="text-xs text-primary">💡 {insight.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggested Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Metas Sugeridas por IA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Baseadas no seu histórico, tendências e lacunas identificadas em cada área da vida.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {analysis.suggestedGoals.map((goal) => (
              <SuggestedGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Quarterly Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            <QuarterPlanCard plan={analysis.currentQuarterPlan} isCurrent={true} />
            <QuarterPlanCard plan={analysis.nextQuarterPlan} isCurrent={false} />
          </div>

          {/* Annual Plan */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Plano Anual {analysis.annualPlan.year}</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-foreground">
                "{analysis.annualPlan.vision}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Big Goals */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">GRANDES METAS DO ANO</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.annualPlan.bigGoals.map((goal, i) => (
                    <div key={i} className="p-3 bg-card rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{goal.title}</span>
                        <Badge variant="outline" className="text-xs">{goal.lifeArea}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Prazo: {goal.targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {goal.milestones.map((m, j) => (
                          <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quarterly Themes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">TEMAS TRIMESTRAIS</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {analysis.annualPlan.quarterlyThemes.map((theme, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded text-center">
                      <p className="text-xs text-foreground">{theme}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Outcomes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">RESULTADOS ESPERADOS</p>
                <div className="space-y-1">
                  {analysis.annualPlan.expectedOutcomes.map((outcome, i) => (
                    <p key={i} className="text-sm text-foreground flex items-center gap-2">
                      <span className="text-success">✓</span> {outcome}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-4">
          {activeRisks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Riscos Ativos ({activeRisks.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeRisks.map((risk) => (
                  <RiskCard key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}

          {otherRisks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Riscos em Monitoramento ({otherRisks.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {otherRisks.map((risk) => (
                  <RiskCard key={risk.id} risk={risk} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
