import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FlaskConical, TrendingUp, DollarSign, Activity, Brain, Plus, Trash2, Target, Zap, Trophy } from "lucide-react";
import { useLifeSimulator, ScenarioInputs, ScenarioResult } from "@/hooks/useLifeSimulator";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const colorMap = {
  primary: { stroke: 'hsl(var(--primary))', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  success: { stroke: 'hsl(var(--success))', bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  warning: { stroke: 'hsl(var(--warning))', bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  destructive: { stroke: 'hsl(var(--destructive))', bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

const formatCurrency = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return `R$${v}`;
};

export const LifeSimulatorPanel = () => {
  const { scenarios, results, updateScenario, addScenario, removeScenario } = useLifeSimulator();
  const [activeId, setActiveId] = useState(scenarios[0].id);

  const activeScenario = scenarios.find(s => s.id === activeId) ?? scenarios[0];
  const activeResult = results.find(r => r.scenario.id === activeId) ?? results[0];

  // Build comparison chart data
  const maxYears = Math.max(...results.map(r => r.scenario.years));
  const netWorthChartData = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    const point: any = { year: `Ano ${year}` };
    results.forEach(r => {
      const proj = r.projections.find(p => p.year === year);
      if (proj) point[r.scenario.name] = proj.netWorth;
    });
    return point;
  });

  const lifeScoreChartData = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    const point: any = { year: `Ano ${year}` };
    results.forEach(r => {
      const proj = r.projections.find(p => p.year === year);
      if (proj) point[r.scenario.name] = proj.lifeScore;
    });
    return point;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="glow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Simulador de Cenários de Vida</h2>
                <p className="text-sm text-muted-foreground">
                  Teste versões do seu futuro e compare o impacto de hábitos e finanças no longo prazo
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={addScenario}>
              <Plus className="h-4 w-4 mr-2" /> Novo cenário
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(r => {
          const c = colorMap[r.scenario.color];
          const isActive = r.scenario.id === activeId;
          return (
            <Card
              key={r.scenario.id}
              className={cn("cursor-pointer transition-all", isActive && c.border, isActive && "border-2")}
              onClick={() => setActiveId(r.scenario.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", c.bg.replace('/10', ''))} style={{ backgroundColor: c.stroke }} />
                      <h4 className="font-semibold text-foreground text-sm truncate">{r.scenario.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.scenario.description}</p>
                  </div>
                  {scenarios.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); removeScenario(r.scenario.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Patrimônio final</p>
                    <p className={cn("text-lg font-bold", c.text)}>{formatCurrency(r.finalNetWorth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Life Score</p>
                    <p className={cn("text-lg font-bold", c.text)}>{r.finalLifeScore}</p>
                  </div>
                </div>
                {r.financialFreedomYear && (
                  <Badge variant="outline" className={cn("text-xs", c.text)}>
                    <Trophy className="h-3 w-3 mr-1" /> Liberdade em {r.financialFreedomYear}a
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Charts */}
      <Tabs defaultValue="wealth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wealth"><DollarSign className="h-4 w-4 mr-2" />Patrimônio</TabsTrigger>
          <TabsTrigger value="life"><Activity className="h-4 w-4 mr-2" />Life Score</TabsTrigger>
          <TabsTrigger value="comparison"><TrendingUp className="h-4 w-4 mr-2" />Comparação final</TabsTrigger>
        </TabsList>

        <TabsContent value="wealth">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução do patrimônio líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={netWorthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Legend />
                  {results.map(r => (
                    <Line
                      key={r.scenario.id}
                      type="monotone"
                      dataKey={r.scenario.name}
                      stroke={colorMap[r.scenario.color].stroke}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="life">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução do Life Score (impacto dos hábitos)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={lifeScoreChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend />
                  {results.map(r => (
                    <Line
                      key={r.scenario.id}
                      type="monotone"
                      dataKey={r.scenario.name}
                      stroke={colorMap[r.scenario.color].stroke}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultado final por cenário</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={results.map(r => ({
                  name: r.scenario.name,
                  Investido: r.totalInvested,
                  Retorno: r.totalReturns,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Legend />
                  <Bar dataKey="Investido" stackId="a" fill="hsl(var(--muted-foreground))" />
                  <Bar dataKey="Retorno" stackId="a" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Scenario Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Ajustar: {activeScenario.name}
            </CardTitle>
            <div className="flex gap-1">
              {scenarios.map(s => (
                <Button
                  key={s.id}
                  variant={s.id === activeId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveId(s.id)}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Financial */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" /> Finanças
              </h4>
              <SliderField
                label="Renda mensal" value={activeScenario.monthlyIncome}
                min={2000} max={50000} step={500} format={formatCurrency}
                onChange={v => updateScenario(activeId, { monthlyIncome: v })}
              />
              <SliderField
                label="Crescimento da renda (a.a.)" value={activeScenario.incomeGrowthRate}
                min={0} max={20} step={1} format={v => `${v}%`}
                onChange={v => updateScenario(activeId, { incomeGrowthRate: v })}
              />
              <SliderField
                label="Despesas mensais" value={activeScenario.monthlyExpenses}
                min={1000} max={40000} step={500} format={formatCurrency}
                onChange={v => updateScenario(activeId, { monthlyExpenses: v })}
              />
              <SliderField
                label="Investimento mensal" value={activeScenario.monthlyInvestment}
                min={0} max={20000} step={250} format={formatCurrency}
                onChange={v => updateScenario(activeId, { monthlyInvestment: v })}
              />
              <SliderField
                label="Retorno dos investimentos (a.a.)" value={activeScenario.investmentReturnRate}
                min={0} max={20} step={0.5} format={v => `${v}%`}
                onChange={v => updateScenario(activeId, { investmentReturnRate: v })}
              />
            </div>

            {/* Habits */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Hábitos
              </h4>
              <SliderField
                label="Deep work (h/semana)" value={activeScenario.deepWorkHoursPerWeek}
                min={0} max={40} step={1} format={v => `${v}h`}
                onChange={v => updateScenario(activeId, { deepWorkHoursPerWeek: v })}
              />
              <SliderField
                label="Exercício (dias/semana)" value={activeScenario.exerciseDaysPerWeek}
                min={0} max={7} step={1} format={v => `${v}d`}
                onChange={v => updateScenario(activeId, { exerciseDaysPerWeek: v })}
              />
              <SliderField
                label="Sono (h/noite)" value={activeScenario.sleepHoursPerNight}
                min={4} max={10} step={0.5} format={v => `${v}h`}
                onChange={v => updateScenario(activeId, { sleepHoursPerNight: v })}
              />
              <SliderField
                label="Aprendizado (h/semana)" value={activeScenario.learningHoursPerWeek}
                min={0} max={20} step={0.5} format={v => `${v}h`}
                onChange={v => updateScenario(activeId, { learningHoursPerWeek: v })}
              />
              <SliderField
                label="Horizonte de simulação (anos)" value={activeScenario.years}
                min={1} max={30} step={1} format={v => `${v} anos`}
                onChange={v => updateScenario(activeId, { years: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year-by-year breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Projeção ano a ano: {activeScenario.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left py-2 px-2">Ano</th>
                  <th className="text-right py-2 px-2">Renda</th>
                  <th className="text-right py-2 px-2">Despesas</th>
                  <th className="text-right py-2 px-2">Fluxo</th>
                  <th className="text-right py-2 px-2">Patrimônio</th>
                  <th className="text-right py-2 px-2">Life Score</th>
                </tr>
              </thead>
              <tbody>
                {activeResult.projections.map(p => (
                  <tr key={p.year} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium">{p.year}</td>
                    <td className="text-right py-2 px-2">{formatCurrency(p.income)}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">{formatCurrency(p.expenses)}</td>
                    <td className={cn("text-right py-2 px-2 font-medium", p.cashFlow >= 0 ? "text-success" : "text-destructive")}>
                      {formatCurrency(p.cashFlow)}
                    </td>
                    <td className="text-right py-2 px-2 font-bold">{formatCurrency(p.netWorth)}</td>
                    <td className="text-right py-2 px-2">
                      <Badge variant="outline" className="text-xs">{p.lifeScore}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

const SliderField = ({ label, value, min, max, step, format, onChange }: SliderFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <span className="text-sm font-medium text-foreground">{format(value)}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);
