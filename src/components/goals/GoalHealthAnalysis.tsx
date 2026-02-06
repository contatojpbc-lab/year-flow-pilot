import { 
  AlertTriangle, TrendingDown, Clock, Target, Scale, 
  Pause, Split, Zap, ChevronRight, Heart, Activity,
  CheckCircle2, XCircle, AlertCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  useGoalHealthAnalysis, 
  GoalHealthReport, 
  GoalHealthStatus,
  LifeAreaBalance,
  RebalanceRecommendation,
  AdjustmentRecommendation
} from "@/hooks/useGoalHealthAnalysis";
import { cn } from "@/lib/utils";

const statusConfig: Record<GoalHealthStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: typeof CheckCircle2;
}> = {
  healthy: { 
    label: 'Saudável', 
    color: 'text-success', 
    bgColor: 'bg-success/10',
    icon: CheckCircle2 
  },
  at_risk: { 
    label: 'Em Risco', 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    icon: AlertCircle 
  },
  stuck: { 
    label: 'Travada', 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    icon: XCircle 
  },
  unrealistic: { 
    label: 'Irrealista', 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    icon: AlertTriangle 
  },
};

const recommendationIcons: Record<string, typeof Clock> = {
  deadline: Clock,
  scope: Target,
  effort: Zap,
  pause: Pause,
  split: Split,
  merge: Target,
};

function GoalHealthCard({ report }: { report: GoalHealthReport }) {
  const config = statusConfig[report.status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      report.status !== 'healthy' && "border-l-2",
      report.status === 'at_risk' && "border-l-warning",
      (report.status === 'stuck' || report.status === 'unrealistic') && "border-l-destructive"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: report.lifeAreaColor }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {report.lifeAreaName}
            </span>
          </div>
          <Badge className={cn("flex items-center gap-1 flex-shrink-0", config.bgColor, config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        <CardTitle className="text-base mt-1">{report.goalTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score & Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/30">
            <p className={cn(
              "text-lg font-bold",
              report.healthScore >= 70 ? "text-success" :
              report.healthScore >= 40 ? "text-warning" : "text-destructive"
            )}>
              {report.healthScore}%
            </p>
            <p className="text-xs text-muted-foreground">Saúde</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{report.metrics.actualProgress}%</p>
            <p className="text-xs text-muted-foreground">Progresso</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{report.metrics.daysRemaining}</p>
            <p className="text-xs text-muted-foreground">Dias rest.</p>
          </div>
        </div>

        {/* Progress Gap */}
        {report.metrics.progressGap > 5 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
            <TrendingDown className="h-4 w-4 text-warning flex-shrink-0" />
            <span className="text-xs text-warning">
              {report.metrics.progressGap}% atrás do esperado para esta data
            </span>
          </div>
        )}

        {/* Issues */}
        {report.issues.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Problemas detectados:</p>
            {report.issues.map((issue, idx) => (
              <div key={idx} className={cn(
                "flex items-start gap-2 text-xs p-2 rounded",
                issue.severity === 'high' ? 'bg-destructive/5 text-destructive' :
                issue.severity === 'medium' ? 'bg-warning/5 text-warning' : 'bg-muted/30 text-muted-foreground'
              )}>
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{issue.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recomendações:</p>
            {report.recommendations.slice(0, 2).map((rec) => {
              const Icon = recommendationIcons[rec.type] || Target;
              return (
                <div key={rec.id} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LifeAreaBalanceCard({ balance }: { balance: LifeAreaBalance[] }) {
  const maxGoals = Math.max(...balance.map(b => b.goalsCount), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Equilíbrio entre Áreas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {balance.map((area) => (
          <div key={area.lifeAreaId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: area.lifeAreaColor }}
                />
                <span className="text-sm font-medium text-foreground">{area.lifeAreaName}</span>
                {area.isOverloaded && (
                  <Badge variant="outline" className="text-xs text-warning border-warning/30">
                    Sobrecarregada
                  </Badge>
                )}
                {area.isNeglected && (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                    Negligenciada
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {area.goalsCount} meta{area.goalsCount !== 1 ? 's' : ''} • {area.averageProgress}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={(area.goalsCount / maxGoals) * 100} 
                className="flex-1 h-1.5"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RebalanceRecommendationsCard({ recommendations }: { recommendations: RebalanceRecommendation[] }) {
  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Reequilíbrio Sugerido</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                rec.type === 'reduce_focus' ? 'bg-warning/10' :
                rec.type === 'increase_focus' ? 'bg-success/10' : 'bg-primary/10'
              )}>
                <Scale className={cn(
                  "h-4 w-4",
                  rec.type === 'reduce_focus' ? 'text-warning' :
                  rec.type === 'increase_focus' ? 'text-success' : 'text-primary'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {rec.reasoning}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function GoalHealthAnalysisPanel() {
  const analysis = useGoalHealthAnalysis();
  const { 
    reports, 
    healthyGoals, 
    atRiskGoals, 
    stuckGoals, 
    unrealisticGoals,
    overallHealthScore,
    lifeAreaBalance,
    rebalanceRecommendations 
  } = analysis;

  // Filter to show only problematic goals
  const problematicReports = reports.filter(r => r.status !== 'healthy');

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card variant="glow" className="overflow-hidden">
        <div className={cn(
          "h-1",
          overallHealthScore >= 70 ? 'bg-success' :
          overallHealthScore >= 40 ? 'bg-warning' : 'bg-destructive'
        )} />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Saúde das Metas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className={cn(
                "text-2xl font-bold",
                overallHealthScore >= 70 ? "text-success" :
                overallHealthScore >= 40 ? "text-warning" : "text-destructive"
              )}>
                {overallHealthScore}%
              </p>
              <p className="text-xs text-muted-foreground">Score Geral</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">{healthyGoals}</p>
              <p className="text-xs text-muted-foreground">Saudáveis</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <p className="text-2xl font-bold text-warning">{atRiskGoals}</p>
              <p className="text-xs text-muted-foreground">Em Risco</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">{stuckGoals}</p>
              <p className="text-xs text-muted-foreground">Travadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">{unrealisticGoals}</p>
              <p className="text-xs text-muted-foreground">Irrealistas</p>
            </div>
          </div>

          {problematicReports.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm text-success">Todas as metas estão em boa saúde!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {problematicReports.length} meta{problematicReports.length > 1 ? 's precisam' : ' precisa'} de atenção. 
              Veja as recomendações abaixo.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Life Area Balance */}
      <LifeAreaBalanceCard balance={lifeAreaBalance} />

      {/* Rebalance Recommendations */}
      <RebalanceRecommendationsCard recommendations={rebalanceRecommendations} />

      {/* Problematic Goals Detail */}
      {problematicReports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Metas que Precisam de Ajuste</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {problematicReports.map((report) => (
              <GoalHealthCard key={report.goalId} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for Dashboard
export function GoalHealthSummary() {
  const analysis = useGoalHealthAnalysis();
  const problematicCount = analysis.atRiskGoals + analysis.stuckGoals + analysis.unrealisticGoals;

  if (problematicCount === 0) return null;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {problematicCount} meta{problematicCount > 1 ? 's' : ''} precisa{problematicCount > 1 ? 'm' : ''} de ajuste
              </p>
              <p className="text-xs text-muted-foreground">
                Score de saúde: {analysis.overallHealthScore}%
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            Ver análise
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
