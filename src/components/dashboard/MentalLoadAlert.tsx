 import { Brain, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
 import { useState } from 'react';
 import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { useMentalLoad, MentalLoadState } from '@/hooks/useMentalLoad';
 import { cn } from '@/lib/utils';
 
 const levelConfig: Record<MentalLoadState['level'], {
   label: string;
   color: string;
   bgColor: string;
   borderColor: string;
   icon: typeof AlertTriangle;
 }> = {
   low: {
     label: 'Carga Baixa',
     color: 'text-success',
     bgColor: 'bg-success/5',
     borderColor: 'border-success/30',
     icon: Brain,
   },
   moderate: {
     label: 'Carga Moderada',
     color: 'text-primary',
     bgColor: 'bg-primary/5',
     borderColor: 'border-primary/30',
     icon: Brain,
   },
   high: {
     label: 'Carga Alta',
     color: 'text-warning',
     bgColor: 'bg-warning/5',
     borderColor: 'border-warning/30',
     icon: AlertTriangle,
   },
   critical: {
     label: 'Sobrecarga Mental',
     color: 'text-destructive',
     bgColor: 'bg-destructive/5',
     borderColor: 'border-destructive/30',
     icon: AlertTriangle,
   },
 };
 
 export const MentalLoadAlert = () => {
   const mentalLoad = useMentalLoad();
   const [expanded, setExpanded] = useState(false);
   
   // Only show alert for high or critical levels
   if (mentalLoad.level === 'low' || mentalLoad.level === 'moderate') {
     return null;
   }
 
   const config = levelConfig[mentalLoad.level];
   const Icon = config.icon;
 
   return (
     <Alert className={cn(config.borderColor, config.bgColor, "animate-fade-in")}>
       <Icon className={cn("h-4 w-4", config.color)} />
       <div className="flex-1">
         <div className="flex items-center justify-between">
           <AlertTitle className={cn("flex items-center gap-2", config.color)}>
             {config.label}
             <Badge variant="outline" className={cn("text-xs", config.color, config.borderColor)}>
               {mentalLoad.score}%
             </Badge>
           </AlertTitle>
           <Button
             variant="ghost"
             size="sm"
             className="h-6 w-6 p-0"
             onClick={() => setExpanded(!expanded)}
           >
             {expanded ? (
               <ChevronUp className="h-4 w-4" />
             ) : (
               <ChevronDown className="h-4 w-4" />
             )}
           </Button>
         </div>
         
         <AlertDescription className={cn("text-sm mt-1", config.color, "opacity-90")}>
           {mentalLoad.level === 'critical' 
             ? 'Você está com muitas tarefas simultâneas. Foque apenas no essencial hoje.'
             : 'Sua carga de tarefas está alta. Considere priorizar apenas o mais importante.'
           }
         </AlertDescription>
 
         {expanded && (
           <div className="mt-3 space-y-3 animate-fade-in">
             {/* Factors */}
             {mentalLoad.factors.length > 0 && (
               <div className="space-y-1">
                 <p className="text-xs font-medium text-muted-foreground">Fatores detectados:</p>
                 <ul className="text-xs text-muted-foreground space-y-0.5">
                   {mentalLoad.factors.map((factor, i) => (
                     <li key={i} className="flex items-center gap-1.5">
                       <span className={cn("h-1.5 w-1.5 rounded-full", config.color, "opacity-70")} />
                       {factor}
                     </li>
                   ))}
                 </ul>
               </div>
             )}
 
             {/* Recommendations */}
             {mentalLoad.recommendations.length > 0 && (
               <div className="space-y-1">
                 <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                   <Lightbulb className="h-3 w-3" />
                   Recomendações:
                 </p>
                 <ul className="text-xs text-muted-foreground space-y-0.5">
                   {mentalLoad.recommendations.map((rec, i) => (
                     <li key={i} className="flex items-center gap-1.5">
                       <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                       {rec}
                     </li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
         )}
       </div>
     </Alert>
   );
 };