 import { Moon, Sun, Zap, ZapOff } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { useExecutionMode } from '@/contexts/ExecutionModeContext';
 import { cn } from '@/lib/utils';
 
 export const ExecutionModeToggle = () => {
   const { isLightMode, toggleMode } = useExecutionMode();
 
   return (
     <Button
       variant={isLightMode ? "default" : "outline"}
       size="sm"
       onClick={toggleMode}
       className={cn(
         "gap-2 transition-all",
         isLightMode && "bg-primary/90 hover:bg-primary shadow-lg"
       )}
     >
       {isLightMode ? (
         <>
           <Zap className="h-4 w-4" />
           <span className="hidden sm:inline">Modo Leve</span>
           <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary-foreground/20">
             ON
           </Badge>
         </>
       ) : (
         <>
           <ZapOff className="h-4 w-4" />
           <span className="hidden sm:inline">Modo Normal</span>
         </>
       )}
     </Button>
   );
 };