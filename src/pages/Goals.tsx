import { useState } from "react";
import { Plus, Target, ChevronRight, MoreVertical, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoals } from "@/contexts/GoalsContext";
import { useLifeAreas } from "@/contexts/LifeAreasContext";
import { useRoutine } from "@/contexts/RoutineContext";
import { AnnualProgressChart, MonthComparisonCard } from "@/components/history/HistoryComponents";
import { GoalHealthAnalysisPanel } from "@/components/goals/GoalHealthAnalysis";
import { GoalStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<GoalStatus, string> = {
  planned: "bg-secondary text-secondary-foreground",
  active: "bg-primary/20 text-primary",
  completed: "bg-success/20 text-success",
  paused: "bg-warning/20 text-warning",
};

const Goals = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const { goals } = useGoals();
  const { lifeAreas, getLifeAreaById } = useLifeAreas();
  const { routineItems } = useRoutine();

  const filteredGoals = selectedArea 
    ? goals.filter(g => g.lifeAreaId === selectedArea)
    : goals;

  const getLifeArea = (id: string) => getLifeAreaById(id);
  
  const getLinkedHabitsCount = (goalId: string) => 
    routineItems.filter(r => r.linkedGoalId === goalId).length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">Track your SMART goals for 2026</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Saúde & Ajustes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          {/* Life Areas Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedArea === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(null)}
            >
              All Areas
            </Button>
            {lifeAreas.map((area) => (
              <Button
                key={area.id}
                variant={selectedArea === area.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArea(area.id)}
                className="gap-2"
              >
                <div 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </Button>
            ))}
          </div>

          {/* Goals Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => {
              const area = getLifeArea(goal.lifeAreaId);
              const linkedHabits = getLinkedHabitsCount(goal.id);
              
              return (
                <Card key={goal.id} variant="interactive" className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: area?.color }}
                        />
                        <span className="text-xs text-muted-foreground">{area?.name}</span>
                      </div>
                      <Badge className={cn("text-xs", statusColors[goal.status])}>
                        {goal.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                      {goal.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        size="sm"
                        indicatorColor={goal.progress >= 75 ? "success" : goal.progress >= 50 ? "default" : "warning"}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>Due: {formatDate(goal.timeBound)}</span>
                      <div className="flex items-center gap-3">
                        {linkedHabits > 0 && (
                          <span className="text-primary">{linkedHabits} habits linked</span>
                        )}
                        <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Empty State / Add Goal Card */}
            <Card variant="interactive" className="border-dashed flex items-center justify-center min-h-[240px]">
              <CardContent className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Add a new goal</p>
                <p className="text-xs text-muted-foreground">Create a SMART goal to track</p>
              </CardContent>
            </Card>
          </div>

          {/* Annual Progress */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnnualProgressChart module="goals" />
            <MonthComparisonCard module="goals" />
          </div>
        </TabsContent>

        <TabsContent value="health">
          <GoalHealthAnalysisPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;
