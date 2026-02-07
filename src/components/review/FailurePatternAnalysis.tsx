import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Calendar,
  Lightbulb,
  Shield,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useFailurePatternAnalysis, 
  FailurePattern, 
  UnproductiveSlot, 
  HistoricalCorrection,
  RiskAlert 
} from "@/hooks/useFailurePatternAnalysis";
import { cn } from "@/lib/utils";

// ============================================
// SUB-COMPONENTS
// ============================================

const SeverityBadge = ({ severity }: { severity: string }) => {
  const config = {
    critical: { label: 'Crítico', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    high: { label: 'Alto', className: 'bg-warning/20 text-warning border-warning/30' },
    medium: { label: 'Médio', className: 'bg-primary/20 text-primary border-primary/30' },
    low: { label: 'Baixo', className: 'bg-muted text-muted-foreground border-border' },
  };
  
  const { label, className } = config[severity as keyof typeof config] || config.low;
  
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

const DayLabel: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const TimeLabel: Record<string, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
  night: 'Madrugada',
};

const PatternCard = ({ pattern }: { pattern: FailurePattern }) => {
  const typeIcon = {
    recurring: <TrendingDown className="h-4 w-4" />,
    temporal: <Clock className="h-4 w-4" />,
    contextual: <Target className="h-4 w-4" />,
  };

  const typeLabel = {
    recurring: 'Recorrente',
    temporal: 'Temporal',
    contextual: 'Contextual',
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              {typeIcon[pattern.type]}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {typeLabel[pattern.type]} • {pattern.frequency}x
              </Badge>
              <h4 className="font-medium text-foreground text-sm leading-tight">
                {pattern.description}
              </h4>
            </div>
          </div>
          <SeverityBadge severity={pattern.severity} />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {pattern.affectedAreas.map((area, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
            <Lightbulb className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              {pattern.suggestedCorrection}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UnproductiveSlotCard = ({ slot }: { slot: UnproductiveSlot }) => {
  const getFailureColor = (rate: number) => {
    if (rate >= 70) return 'text-destructive';
    if (rate >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {DayLabel[slot.dayOfWeek]} • {TimeLabel[slot.timeOfDay]}
            </span>
          </div>
          <span className={cn("font-bold", getFailureColor(slot.failureRate))}>
            {slot.failureRate}% falha
          </span>
        </div>
        
        <Progress 
          value={slot.failureRate} 
          className="h-2 mb-3"
        />
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {slot.commonFailures.map((failure, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {failure}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              {slot.suggestedAction}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CorrectionCard = ({ correction }: { correction: HistoricalCorrection }) => {
  const getSuccessColor = (rate: number) => {
    if (rate >= 75) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Padrão: {correction.pattern}
            </p>
            <h4 className="font-medium text-foreground text-sm">
              {correction.correction}
            </h4>
          </div>
          <div className="text-right">
            <span className={cn("text-lg font-bold", getSuccessColor(correction.successRate))}>
              {correction.successRate}%
            </span>
            <p className="text-xs text-muted-foreground">sucesso</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {correction.timesApplied}x aplicada
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskAlertCard = ({ alert }: { alert: RiskAlert }) => {
  const typeConfig = {
    repetition_risk: { icon: <TrendingDown className="h-4 w-4" />, label: 'Risco de Repetição' },
    pattern_detected: { icon: <AlertCircle className="h-4 w-4" />, label: 'Padrão Detectado' },
    context_warning: { icon: <AlertTriangle className="h-4 w-4" />, label: 'Aviso Contextual' },
    trend_alert: { icon: <Clock className="h-4 w-4" />, label: 'Alerta de Tendência' },
  };

  const { icon, label } = typeConfig[alert.type];
  
  const severityBorder = {
    critical: 'border-l-destructive',
    high: 'border-l-warning',
    medium: 'border-l-primary',
    low: 'border-l-muted-foreground',
  };

  return (
    <Card className={cn("border-l-4", severityBorder[alert.severity])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              alert.severity === 'critical' || alert.severity === 'high' 
                ? 'bg-destructive/10 text-destructive'
                : 'bg-warning/10 text-warning'
            )}>
              {icon}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {label}
              </Badge>
              <h4 className="font-medium text-foreground text-sm">
                {alert.title}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-foreground">{alert.probability}%</span>
            <p className="text-xs text-muted-foreground">probabilidade</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {alert.description}
        </p>
        
        <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
          <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            <span className="font-medium">Ação preventiva:</span> {alert.preventiveAction}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FailurePatternAnalysis = () => {
  const analysis = useFailurePatternAnalysis();
  
  const riskLevelConfig = {
    low: { label: 'Baixo', color: 'text-success', bg: 'bg-success/10' },
    medium: { label: 'Médio', color: 'text-warning', bg: 'bg-warning/10' },
    high: { label: 'Alto', color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  
  const riskConfig = riskLevelConfig[analysis.summary.overallRiskLevel];
  
  // Sort alerts by severity and probability
  const sortedAlerts = [...analysis.riskAlerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.probability - a.probability;
  });

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-destructive via-warning to-primary" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Análise de Padrões de Falha</CardTitle>
          </div>
          <CardDescription>
            Detecte padrões recorrentes e previna erros antes que aconteçam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {analysis.summary.totalPatternsDetected}
              </p>
              <p className="text-xs text-muted-foreground">Padrões Detectados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">
                {analysis.summary.criticalPatterns}
              </p>
              <p className="text-xs text-muted-foreground">Críticos/Altos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-bold text-foreground">
                {DayLabel[analysis.summary.mostProblematicDay]}
              </p>
              <p className="text-xs text-muted-foreground">Dia Mais Difícil</p>
            </div>
            <div className={cn("text-center p-3 rounded-lg", riskConfig.bg)}>
              <p className={cn("text-lg font-bold", riskConfig.color)}>
                {riskConfig.label}
              </p>
              <p className="text-xs text-muted-foreground">Nível de Risco</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts - Most Important */}
      {sortedAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Alertas de Risco Ativos
          </h3>
          <div className="grid gap-3">
            {sortedAlerts
              .filter(a => a.severity === 'critical' || a.severity === 'high')
              .map(alert => (
                <RiskAlertCard key={alert.id} alert={alert} />
              ))
            }
          </div>
        </div>
      )}

      {/* Tabs for detailed analysis */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">
            Padrões
          </TabsTrigger>
          <TabsTrigger value="slots" className="text-xs sm:text-sm">
            Horários
          </TabsTrigger>
          <TabsTrigger value="corrections" className="text-xs sm:text-sm">
            Correções
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs sm:text-sm">
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Padrões de comportamento identificados que levam a falhas recorrentes
          </p>
          <div className="grid gap-3">
            {analysis.patterns.map(pattern => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="slots" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Dias e horários com maior taxa de falha identificados
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.unproductiveSlots.map((slot, i) => (
              <UnproductiveSlotCard key={i} slot={slot} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corrections" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Correções que funcionaram no passado e podem ser reaplicadas
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.historicalCorrections.map(correction => (
              <CorrectionCard key={correction.id} correction={correction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Todos os alertas de risco ordenados por severidade
          </p>
          <div className="grid gap-3">
            {sortedAlerts.map(alert => (
              <RiskAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
