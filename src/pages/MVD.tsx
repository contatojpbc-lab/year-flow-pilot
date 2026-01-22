import { CheckCircle2, Circle, Plus, GripVertical, Settings2, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMVD } from "@/contexts/MVDContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const MVD = () => {
  const { 
    items, 
    completedItems, 
    toggleItem, 
    allCompleted, 
    completedCount, 
    currentStreak, 
    longestStreak 
  } = useMVD();
  
  const previousAllCompleted = useRef(allCompleted);

  // Show toast when MVD is fully completed
  useEffect(() => {
    if (allCompleted && !previousAllCompleted.current && completedItems.length > 0) {
      toast.success("🎉 MVD Complete!", {
        description: `You're on a ${currentStreak} day streak!`,
      });
    }
    previousAllCompleted.current = allCompleted;
  }, [allCompleted, currentStreak, completedItems.length]);

  const handleToggle = (id: string) => {
    const isCompleting = !completedItems.includes(id);
    toggleItem(id);
    
    if (isCompleting) {
      const remaining = items.length - completedCount - 1;
      if (remaining > 0) {
        toast.success("Item completed!", {
          description: `${remaining} more to complete your MVD`,
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Minimum Viable Day</h1>
          <p className="text-muted-foreground">The non-negotiable actions for a successful day</p>
        </div>
        <Button variant="outline">
          <Settings2 className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Streak Card */}
      <Card variant={currentStreak > 0 ? "glow" : "default"}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center",
              currentStreak > 0 
                ? "bg-warning/20 text-warning" 
                : "bg-secondary text-muted-foreground"
            )}>
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {currentStreak} Day Streak
              </h2>
              <p className="text-sm text-muted-foreground">
                Longest streak: {longestStreak} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card variant={allCompleted ? "glow" : "default"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Today's Status
              </h2>
              <p className="text-muted-foreground">
                {allCompleted 
                  ? "Amazing! You've completed your Minimum Viable Day! 🎉" 
                  : `${items.length - completedCount} more to complete your MVD`
                }
              </p>
            </div>
            <div className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300",
              allCompleted 
                ? "gradient-primary text-primary-foreground shadow-glow animate-pulse" 
                : "bg-secondary text-muted-foreground"
            )}>
              {completedCount}/{items.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MVD Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your MVD Items</h2>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => {
          const isCompleted = completedItems.includes(item.id);
          
          return (
            <Card 
              key={item.id}
              variant={isCompleted ? "default" : "interactive"}
              className={cn(
                "transition-all duration-200",
                isCompleted && "border-success/30 bg-success/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground/50 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>

                  <button
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      "flex-shrink-0 transition-transform hover:scale-110",
                      isCompleted ? "text-success" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-medium",
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {item.title}
                    </span>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="font-medium text-foreground mb-2">What is MVD?</h3>
          <p className="text-sm text-muted-foreground">
            Your Minimum Viable Day is the set of non-negotiable actions that, when completed, 
            mean you've had a successful day regardless of what else happens. Focus on these 
            fundamentals to maintain momentum and build consistency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MVD;
