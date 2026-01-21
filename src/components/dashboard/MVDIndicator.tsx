import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MVDItem } from "@/types";

interface MVDIndicatorProps {
  items: MVDItem[];
  completedItems?: string[];
}

export function MVDIndicator({ items, completedItems = [] }: MVDIndicatorProps) {
  const allCompleted = items.every(item => completedItems.includes(item.id));
  const completedCount = items.filter(item => completedItems.includes(item.id)).length;

  return (
    <Card variant={allCompleted ? "glow" : "default"} className="animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Minimum Viable Day</CardTitle>
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            allCompleted 
              ? "bg-success/20 text-success" 
              : "bg-secondary text-muted-foreground"
          )}>
            {completedCount}/{items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          return (
            <div 
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isCompleted ? "bg-success/10" : "bg-secondary/50"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                isCompleted ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
