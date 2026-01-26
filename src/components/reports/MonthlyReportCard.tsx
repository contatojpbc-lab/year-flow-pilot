import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  PiggyBank, 
  Wallet, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMonthlyReport, LifeAreaSummary, GoalSummary, FinancialHighlight } from "@/contexts/MonthlyReportContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================
// LIFE AREA SUMMARY COMPONENT
// ============================================

const LifeAreaCard = ({ area }: { area: LifeAreaSummary }) => {
  const TrendIcon = area.trend === 'up' ? TrendingUp : area.trend === 'down' ? TrendingDown : Minus;
  const trendColor = area.trend === 'up' ? 'text-success' : area.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div 
        className="h-3 w-3 rounded-full shrink-0" 
        style={{ backgroundColor: area.color }} 
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground truncate">{area.name}</span>
          <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {area.trendPercentage > 0 && <span>{area.trendPercentage}%</span>}
          </div>
        </div>
        <Progress value={area.overallScore} className="h-1.5" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Score: {area.overallScore}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GOAL ITEM COMPONENT
// ============================================

const GoalItem = ({ goal }: { goal: GoalSummary }) => {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Concluída' },
    on_track: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', label: 'No caminho' },
    behind: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Atrasada' },
    at_risk: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Em risco' },
  };
  
  const config = statusConfig[goal.status];
  const StatusIcon = config.icon;
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
        <StatusIcon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{goal.lifeArea}</span>
          <Progress value={goal.progress} className="flex-1 h-1" />
          <span className="text-xs font-medium">{goal.progress}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FINANCIAL HIGHLIGHT COMPONENT
// ============================================

const FinancialHighlightCard = ({ highlight }: { highlight: FinancialHighlight }) => {
  const iconMap = {
    savings: PiggyBank,
    spending: Wallet,
    budget: Target,
    goal: Target,
  };
  
  const Icon = iconMap[highlight.icon];
  const typeColors = {
    positive: 'border-success/30 bg-success/5',
    negative: 'border-destructive/30 bg-destructive/5',
    neutral: 'border-muted-foreground/30 bg-muted/30',
  };
  const iconColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };
  
  return (
    <div className={cn("p-3 rounded-lg border", typeColors[highlight.type])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColors[highlight.type])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{highlight.title}</span>
            <span className={cn("text-sm font-bold", iconColors[highlight.type])}>
              {highlight.value}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{highlight.description}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN MONTHLY REPORT COMPONENT
// ============================================

export const MonthlyReportCard = () => {
  const { 
    currentReport, 
    reflection, 
    setReflection, 
    saveReport 
  } = useMonthlyReport();
  
  const handleSave = () => {
    saveReport();
    toast.success("Relatório mensal salvo!", {
      description: `Relatório de ${currentReport.monthName} ${currentReport.year}`,
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Relatório Mensal</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentReport.monthName} {currentReport.year}
                </p>
              </div>
            </div>
            <Button variant="glow" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Auto Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Resumo Automático</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {currentReport.autoSummary}
          </p>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'MVD', value: currentReport.metrics.mvdCompletionRate },
          { label: 'Hábitos', value: currentReport.metrics.habitsConsistency },
          { label: 'Metas', value: currentReport.metrics.goalsProgress },
          { label: 'Economia', value: currentReport.metrics.savingsRate },
          { label: 'Orçamento', value: currentReport.metrics.budgetAdherence },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{metric.value}%</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Life Areas Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo por Área da Vida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentReport.lifeAreaSummaries.map(area => (
            <LifeAreaCard key={area.id} area={area} />
          ))}
        </CardContent>
      </Card>
      
      {/* Goals Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Completed Goals */}
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <CardTitle className="text-sm">Metas Concluídas</CardTitle>
              </div>
              <Badge variant="outline" className="text-success">
                {currentReport.completedGoals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.completedGoals.length > 0 ? (
              <div className="space-y-1">
                {currentReport.completedGoals.map(goal => (
                  <GoalItem key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma meta concluída ainda
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* At Risk Goals */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm">Metas em Risco</CardTitle>
              </div>
              <Badge variant="outline" className="text-destructive">
                {currentReport.atRiskGoals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.atRiskGoals.length > 0 ? (
              <div className="space-y-1">
                {currentReport.atRiskGoals.map(goal => (
                  <GoalItem key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma meta em risco 🎉
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* In Progress Goals */}
      {currentReport.inProgressGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Metas em Andamento</CardTitle>
              </div>
              <Badge variant="outline">
                {currentReport.inProgressGoals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {currentReport.inProgressGoals.map(goal => (
                <GoalItem key={goal.id} goal={goal} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Financial Highlights */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Destaques Financeiros</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentReport.financialHighlights.length > 0 ? (
            currentReport.financialHighlights.map((highlight, idx) => (
              <FinancialHighlightCard key={idx} highlight={highlight} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum destaque financeiro este mês
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Manual Reflection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reflexão Pessoal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Escreva suas reflexões sobre o mês
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="O que você aprendeu este mês? Quais foram os maiores desafios? O que você faria diferente?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// COMPACT VERSION FOR DASHBOARD
// ============================================

export const MonthlyReportSummary = () => {
  const { currentReport } = useMonthlyReport();
  
  return (
    <Card variant="interactive" className="animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Relatório de {currentReport.monthName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {currentReport.autoSummary}
        </p>
        
        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{currentReport.metrics.goalsProgress}%</p>
            <p className="text-xs text-muted-foreground">Metas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{currentReport.metrics.mvdCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">MVD</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{currentReport.metrics.savingsRate}%</p>
            <p className="text-xs text-muted-foreground">Economia</p>
          </div>
        </div>
        
        {/* Goals Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>{currentReport.completedGoals.length} concluídas</span>
          </div>
          {currentReport.atRiskGoals.length > 0 && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{currentReport.atRiskGoals.length} em risco</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
