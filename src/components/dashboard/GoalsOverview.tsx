import { Target, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Goal, LifeArea } from "@/types";
import { Link } from "react-router-dom";

interface GoalsOverviewProps {
  goals: Goal[];
  lifeAreas: LifeArea[];
}

export function GoalsOverview({ goals, lifeAreas }: GoalsOverviewProps) {
  const getLifeArea = (id: string) => lifeAreas.find(area => area.id === id);

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Active Goals
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/goals" className="text-xs text-muted-foreground hover:text-foreground">
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active goals yet</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/goals">Create your first goal</Link>
            </Button>
          </div>
        ) : (
          goals.slice(0, 3).map((goal) => {
            const area = getLifeArea(goal.lifeAreaId);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: area?.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{goal.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress 
                  value={goal.progress} 
                  className="h-2"
                  indicatorColor={goal.progress >= 75 ? "success" : goal.progress >= 50 ? "default" : "warning"}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
