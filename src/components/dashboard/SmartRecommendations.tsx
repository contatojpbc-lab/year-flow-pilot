 import { Zap, Target, Clock, Compass, ChevronRight, Sparkles } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { useSmartRecommendations, RecommendationType, typeLabels } from '@/hooks/useSmartRecommendations';
 import { mockLifeAreas } from '@/data/mockData';
 import { cn } from '@/lib/utils';
 
 const typeIcons: Record<RecommendationType, React.ElementType> = {
   next_action: Zap,
   high_impact: Target,
   quick_win: Clock,
   strategic: Compass,
 };
 
 const typeColors: Record<RecommendationType, string> = {
   next_action: 'text-primary',
   high_impact: 'text-destructive',
   quick_win: 'text-success',
   strategic: 'text-warning',
 };
 
 const typeBgColors: Record<RecommendationType, string> = {
   next_action: 'bg-primary/10',
   high_impact: 'bg-destructive/10',
   quick_win: 'bg-success/10',
   strategic: 'bg-warning/10',
 };
 
 export const SmartRecommendations = () => {
   const recommendations = useSmartRecommendations();
 
   return (
     <Card className="animate-slide-up">
       <CardHeader className="pb-3">
         <CardTitle className="text-base font-semibold flex items-center gap-2">
           <Sparkles className="h-4 w-4 text-primary" />
           Recomendações Inteligentes
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-3">
         {recommendations.map((rec, index) => {
           const Icon = typeIcons[rec.type];
           const area = rec.linkedAreaId 
             ? mockLifeAreas.find(a => a.id === rec.linkedAreaId)
             : null;
 
           return (
             <div
               key={rec.id}
               className={cn(
                 "group relative rounded-lg border p-3 transition-all hover:bg-accent/50",
                 index === 0 && "ring-1 ring-primary/20 bg-primary/5"
               )}
             >
               {/* Type Badge */}
               <div className="flex items-start justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <div className={cn(
                     "h-7 w-7 rounded-full flex items-center justify-center",
                     typeBgColors[rec.type]
                   )}>
                     <Icon className={cn("h-3.5 w-3.5", typeColors[rec.type])} />
                   </div>
                   <div>
                     <Badge 
                       variant="outline" 
                       className={cn("text-[10px] font-medium", typeColors[rec.type])}
                     >
                       {rec.title}
                     </Badge>
                   </div>
                 </div>
                 {rec.estimatedTime && (
                   <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                     <Clock className="h-3 w-3" />
                     {rec.estimatedTime}
                   </span>
                 )}
               </div>
 
               {/* Action */}
               <h4 className="font-medium text-sm text-foreground mb-1">
                 {rec.description}
               </h4>
 
               {/* Reasoning */}
               <p className="text-xs text-muted-foreground mb-2">
                 {rec.reasoning}
               </p>
 
               {/* Footer */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   {area && (
                     <span 
                       className="text-[10px] px-1.5 py-0.5 rounded"
                       style={{ 
                         backgroundColor: `${area.color}20`,
                         color: area.color 
                       }}
                     >
                       {area.name}
                     </span>
                   )}
                   <div className="flex items-center gap-0.5">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <div 
                         key={i}
                         className={cn(
                           "h-1 w-3 rounded-full",
                           i < Math.ceil(rec.impactScore / 2) 
                             ? "bg-primary" 
                             : "bg-muted"
                         )}
                       />
                     ))}
                     <span className="text-[10px] text-muted-foreground ml-1">
                       impacto
                     </span>
                   </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   {rec.action}
                   <ChevronRight className="h-3 w-3 ml-1" />
                 </Button>
               </div>
             </div>
           );
         })}
 
         {recommendations.length === 0 && (
           <div className="text-center py-6 text-muted-foreground">
             <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
             <p className="text-sm">Nenhuma recomendação disponível.</p>
           </div>
         )}
       </CardContent>
     </Card>
   );
 };