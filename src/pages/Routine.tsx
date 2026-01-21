import { useState, useCallback } from "react";
import { CheckCircle2, Circle, Sun, Cloud, Moon, Plus, Flame, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockRoutineItems } from "@/data/mockData";
import { useGoals } from "@/contexts/GoalsContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const timeOfDayIcons = {
  morning: Sun,
  afternoon: Cloud,
  evening: Moon,
  anytime: Circle,
};

const Routine = () => {
  const [completedItems, setCompletedItems] = useState<string[]>(['routine-1', 'routine-2']);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { goals, updateGoalProgress, getProgressPerHabit, getGoalById } = useGoals();

  const toggleItem = useCallback((id: string, linkedGoalId?: string) => {
    const isCompleting = !completedItems.includes(id);
    
    setCompletedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

    // Update goal progress if habit is linked to a goal
    if (linkedGoalId) {
      const progressDelta = getProgressPerHabit(linkedGoalId);
      const goal = getGoalById(linkedGoalId);
      
      if (isCompleting) {
        updateGoalProgress(linkedGoalId, progressDelta);
        if (goal) {
          toast.success(`+${progressDelta.toFixed(1)}% progress on "${goal.title}"`, {
            description: "Keep building momentum!",
          });
        }
      } else {
        updateGoalProgress(linkedGoalId, -progressDelta);
        if (goal) {
          toast.info(`Progress adjusted on "${goal.title}"`, {
            description: "Habit unmarked",
          });
        }
      }
    } else if (isCompleting) {
      toast.success("Habit completed!", {
        description: "Great job keeping your streak!",
      });
    }
  }, [completedItems, updateGoalProgress, getProgressPerHabit, getGoalById]);

  const filteredRoutines = selectedTime 
    ? mockRoutineItems.filter(r => r.timeOfDay === selectedTime)
    : mockRoutineItems;

  const completedCount = completedItems.length;
  const totalCount = mockRoutineItems.length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);

  const getGoalTitle = (id: string) => goals.find(g => g.id === id)?.title;
  const getGoalProgress = (id: string) => goals.find(g => g.id === id)?.progress;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Daily Routine</h1>
          <p className="text-muted-foreground">Build consistent habits, one day at a time</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats Bar */}
      <Card variant="glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                <span className="text-lg font-bold text-foreground">12 day streak</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed today
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">{completionPercent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedTime === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTime(null)}
        >
          All
        </Button>
        {Object.entries(timeOfDayIcons).map(([time, Icon]) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTime(time)}
            className="capitalize gap-2"
          >
            <Icon className="h-4 w-4" />
            {time}
          </Button>
        ))}
      </div>

      {/* Routine Items */}
      <div className="space-y-3">
        {filteredRoutines.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          const TimeIcon = timeOfDayIcons[item.timeOfDay];
          const linkedGoal = item.linkedGoalId ? getGoalTitle(item.linkedGoalId) : null;
          const linkedGoalProgress = item.linkedGoalId ? getGoalProgress(item.linkedGoalId) : null;

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
                  <button
                    onClick={() => toggleItem(item.id, item.linkedGoalId)}
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
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {item.title}
                      </span>
                      {linkedGoal && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Link2 className="h-3 w-3" />
                          {linkedGoal}
                          <span className="text-primary font-semibold ml-1">
                            {linkedGoalProgress?.toFixed(0)}%
                          </span>
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TimeIcon className="h-4 w-4" />
                    <span className="text-xs capitalize">{item.timeOfDay}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Routine;
