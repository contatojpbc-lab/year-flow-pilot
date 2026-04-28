import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, TrendingUp, AlertTriangle, CheckCircle2, Clock, DollarSign, Target, Sparkles, History, ChevronRight, Lightbulb } from "lucide-react";
import { useDecisionSupport, Decision, DecisionOption } from "@/hooks/useDecisionSupport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  career: 'Carreira', finance: 'Finanças', health: 'Saúde',
  relationship: 'Relacionamento', personal: 'Pessoal', business: 'Negócios',
};

const importanceColors: Record<string, string> = {
  low: 'text-muted-foreground', medium: 'text-primary',
  high: 'text-warning', critical: 'text-destructive',
};

export const DecisionSupportPanel = () => {
  const { decisions, stats, calculateOptionScore, getBestOption, decideOption } = useDecisionSupport();
  const [selectedId, setSelectedId] = useState<string | null>(decisions.find(d => d.status === 'pending')?.id ?? null);

  const pending = decisions.filter(d => d.status === 'pending');
  const history = decisions.filter(d => d.status === 'decided');
  const selected = decisions.find(d => d.id === selectedId);

  const handleDecide = (decisionId: string, optionId: string, optionName: string) => {
    decideOption(decisionId, optionId);
    toast.success(`Decisão registrada: ${optionName}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de decisões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.decided}</p>
                <p className="text-xs text-muted-foreground">Decididas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de acerto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <AlertTriangle className="h-4 w-4 mr-2" /> Pendentes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" /> Histórico ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Decision List */}
            <div className="space-y-3">
              {pending.map(d => (
                <Card
                  key={d.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedId === d.id && "border-primary"
                  )}
                  onClick={() => setSelectedId(d.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{categoryLabels[d.category]}</Badge>
                      <span className={cn("text-xs font-medium uppercase", importanceColors[d.importance])}>
                        {d.importance}
                      </span>
                    </div>
                    <h4 className="font-medium text-foreground text-sm mb-1">{d.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{d.options.length} opções</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pending.length === 0 && (
                <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma decisão pendente.
                </CardContent></Card>
              )}
            </div>

            {/* Decision Detail */}
            <div className="lg:col-span-2 space-y-4">
              {selected && selected.status === 'pending' ? (
                <DecisionDetail
                  decision={selected}
                  calculateOptionScore={calculateOptionScore}
                  getBestOption={getBestOption}
                  onDecide={handleDecide}
                />
              ) : (
                <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">
                  Selecione uma decisão para analisar
                </CardContent></Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.map(d => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{categoryLabels[d.category]}</Badge>
                      {d.outcome && (
                        <Badge variant={d.outcome === 'success' ? 'default' : 'secondary'} className="text-xs">
                          {d.outcome === 'success' ? 'Sucesso' : d.outcome === 'partial' ? 'Parcial' : d.outcome === 'failure' ? 'Falha' : 'Em avaliação'}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground text-sm">{d.title}</h4>
                    {d.outcomeNotes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{d.outcomeNotes}"</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {d.decidedAt && new Date(d.decidedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DetailProps {
  decision: Decision;
  calculateOptionScore: (o: DecisionOption) => number;
  getBestOption: (d: Decision) => DecisionOption | null;
  onDecide: (decisionId: string, optionId: string, optionName: string) => void;
}

const DecisionDetail = ({ decision, calculateOptionScore, getBestOption, onDecide }: DetailProps) => {
  const best = getBestOption(decision);
  const recommended = decision.options.find(o => o.id === decision.recommendedOptionId) ?? best;

  return (
    <>
      <Card variant="glow">
        <CardHeader>
          <CardTitle className="text-base">{decision.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{decision.description}</p>
        </CardHeader>
      </Card>

      {/* AI Recommendation */}
      {recommended && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Recomendação Baseada em Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{recommended.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {decision.recommendationReason ?? 'Maior score composto entre as opções avaliadas.'}
                </p>
              </div>
              <Badge className="text-base px-3 py-1">
                {calculateOptionScore(recommended)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options Comparison */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Scale className="h-4 w-4" /> Comparação de opções
        </h3>
        {decision.options.map(opt => {
          const score = calculateOptionScore(opt);
          const isRecommended = opt.id === decision.recommendedOptionId;
          const roi = opt.moneyCost > 0 ? ((opt.moneyReturn / opt.moneyCost)).toFixed(1) : '∞';
          return (
            <Card key={opt.id} className={cn(isRecommended && "border-primary/40")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{opt.name}</h4>
                      {isRecommended && <Badge variant="default" className="text-xs">Recomendado</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{score}</div>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Tempo</p>
                      <p className="font-medium text-foreground">{opt.timeCost}h/sem</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Custo / Retorno</p>
                      <p className="font-medium text-foreground">
                        R${(opt.moneyCost / 1000).toFixed(1)}k → R${(opt.moneyReturn / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-medium text-foreground">{roi}x</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <ScoreBar label="Impacto" value={opt.impactScore} />
                  <ScoreBar label="Alinhamento" value={opt.alignmentScore} />
                  <ScoreBar label="Risco" value={opt.riskScore} inverted />
                  <ScoreBar label="Esforço" value={opt.effortScore} inverted />
                </div>

                <div className="grid md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="text-xs font-semibold text-success mb-1">Prós</p>
                    <ul className="space-y-0.5">
                      {opt.pros.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground">✓ {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">Contras</p>
                    <ul className="space-y-0.5">
                      {opt.cons.map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground">✗ {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isRecommended ? "glow" : "outline"}
                  className="w-full"
                  onClick={() => onDecide(decision.id, opt.id, opt.name)}
                >
                  Escolher esta opção
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Future Scenarios */}
      {decision.scenarios.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Simulação de consequências futuras</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {decision.scenarios.map((s, i) => {
              const opt = decision.options.find(o => o.id === s.optionId);
              return (
                <div key={i} className="border-l-2 border-primary/30 pl-3 py-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">
                      {opt?.name} <span className="text-xs text-muted-foreground">• {s.timeframe}</span>
                    </p>
                    <Badge variant="outline" className="text-xs">{s.probability}% prob.</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{s.outcome}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Impacto $: </span>
                      <span className="font-medium text-success">+R${(s.financialImpact / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Life Score: </span>
                      <span className={cn("font-medium", s.lifeScoreImpact >= 0 ? "text-success" : "text-destructive")}>
                        {s.lifeScoreImpact >= 0 ? '+' : ''}{s.lifeScoreImpact}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </>
  );
};

const ScoreBar = ({ label, value, inverted = false }: { label: string; value: number; inverted?: boolean }) => {
  const displayValue = inverted ? 100 - value : value;
  const colorClass = displayValue >= 70 ? 'bg-success' : displayValue >= 40 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all", colorClass)} style={{ width: `${displayValue}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right">{value}</span>
    </div>
  );
};
