 import { useMemo } from 'react';
 import { Target, Zap, CheckCircle2, Circle, ArrowRight, Flame } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { useGoals } from '@/contexts/GoalsContext';
 import { useMVD } from '@/contexts/MVDContext';
 import { useLifeAreas } from '@/contexts/LifeAreasContext';
 import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
 import { cn } from '@/lib/utils';

 const daysUntil = (date: Date): number => {
   const now = new Date();
   const target = new Date(date);
   const diffTime = target.getTime() - now.getTime();
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 };

 export const LightModeView = () => {
   const { goals } = useGoals();
   const { items: mvdItems, completedItems, currentStreak, toggleItem } = useMVD();
   const { lifeAreas } = useLifeAreas();
   const recommendations = useSmartRecommendations();

   const criticalActions = useMemo(() => {
     const urgentGoals = goals
       .filter(g => g.status === 'active' && daysUntil(g.timeBound) <= 30)
       .sort((a, b) => daysUntil(a.timeBound) - daysUntil(b.timeBound))
       .slice(0, 2);

     const topRec = recommendations[0];
     const actions: Array<{
       id: string;
       title: string;
       subtitle: string;
       type: 'goal' | 'mvd' | 'recommendation';
       color?: string;
     }> = [];

     if (topRec) {
       actions.push({
         id: topRec.id,
         title: topRec.description,
         subtitle: topRec.reasoning,
         type: 'recommendation',
       });
     }

     urgentGoals.forEach(goal => {
       const area = lifeAreas.find(a => a.id === goal.lifeAreaId);
       actions.push({
         id: goal.id,
         title: goal.title,
         subtitle: `${daysUntil(goal.timeBound)} dias restantes • ${goal.progress}% completo`,
         type: 'goal',
         color: area?.color,
       });
     });

     return actions.slice(0, 3);
   }, [goals, recommendations, lifeAreas]);

   const pendingMVD = mvdItems.filter(item => !completedItems.includes(item.id));
   const completedMVD = mvdItems.filter(item => completedItems.includes(item.id));
   const mvdProgress = mvdItems.length > 0
     ? (completedItems.length / mvdItems.length) * 100
     : 0;

   return (
     <div className="min-h-[60vh] flex flex-col items-center justify-center py-8 animate-fade-in">
       <div className="text-center mb-8">
         <div className="flex items-center justify-center gap-2 mb-2">
           <Zap className="h-6 w-6 text-primary" />
           <h1 className="text-2xl font-bold text-foreground">Modo Execução Leve</h1>
         </div>
         <p className="text-muted-foreground">Foque apenas no que importa hoje.</p>
         {currentStreak > 0 && (
           <Badge variant="outline" className="mt-2 gap-1">
             <Flame className="h-3 w-3 text-warning" />
             {currentStreak} dias de streak
           </Badge>
         )}
       </div>

       <div className="w-full max-w-2xl space-y-6 px-4">
         <Card className="border-primary/20 bg-primary/5">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
               <Target className="h-4 w-4" />
               Ações Críticas do Dia
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             {criticalActions.map((action, index) => (
               <div
                 key={action.id}
                 className={cn(
                   "flex items-start gap-3 p-3 rounded-lg bg-background/80 border transition-all",
                   index === 0 && "ring-1 ring-primary/30"
                 )}
               >
                 <div
                   className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10"
                   style={action.color ? { backgroundColor: `${action.color}20` } : {}}
                 >
                   <span
                     className="text-sm font-bold"
                     style={{ color: action.color || 'hsl(var(--primary))' }}
                   >
                     {index + 1}
                   </span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-medium text-sm text-foreground">{action.title}</h4>
                   <p className="text-xs text-muted-foreground mt-0.5">{action.subtitle}</p>
                 </div>
                 <Button variant="ghost" size="sm" className="h-8 px-2">
                   <ArrowRight className="h-4 w-4" />
                 </Button>
               </div>
             ))}
             {criticalActions.length === 0 && (
               <p className="text-sm text-muted-foreground text-center py-4">
                 Sem ações críticas no momento.
               </p>
             )}
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="text-sm font-medium">MVD do Dia</CardTitle>
               <span className="text-xs text-muted-foreground">
                 {completedItems.length}/{mvdItems.length}
               </span>
             </div>
             <Progress value={mvdProgress} className="h-1.5 mt-2" />
           </CardHeader>
           <CardContent className="space-y-2">
             {pendingMVD.map(item => (
               <button
                 key={item.id}
                 onClick={() => toggleItem(item.id)}
                 className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left group"
               >
                 <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                 <span className="text-sm text-foreground">{item.title}</span>
               </button>
             ))}

             {completedMVD.length > 0 && (
               <div className="pt-2 border-t border-border/50">
                 {completedMVD.map(item => (
                   <button
                     key={item.id}
                     onClick={() => toggleItem(item.id)}
                     className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left opacity-60"
                   >
                     <CheckCircle2 className="h-5 w-5 text-success" />
                     <span className="text-sm text-muted-foreground line-through">{item.title}</span>
                   </button>
                 ))}
               </div>
             )}

             {mvdItems.length === 0 && (
               <p className="text-sm text-muted-foreground text-center py-4">
                 Nenhum item MVD configurado.
               </p>
             )}
           </CardContent>
         </Card>

         <div className="text-center py-6 text-muted-foreground">
           <p className="text-sm italic">"Progresso, não perfeição."</p>
         </div>
       </div>
     </div>
   );
 };
