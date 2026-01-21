import { Bell, Plus, Clock, Target, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { mockReminders } from "@/data/mockData";
import { cn } from "@/lib/utils";

const typeIcons = {
  goal: Target,
  routine: Clock,
  review: Calendar,
  custom: Bell,
};

const typeColors = {
  goal: "text-primary",
  routine: "text-info",
  review: "text-warning",
  custom: "text-muted-foreground",
};

const Reminders = () => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(target);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
          <p className="text-muted-foreground">Stay on track with scheduled notifications</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-2" />
          New Reminder
        </Button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {mockReminders.map((reminder) => {
          const TypeIcon = typeIcons[reminder.type];
          
          return (
            <Card key={reminder.id} variant="interactive">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center bg-secondary",
                    typeColors[reminder.type]
                  )}>
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{reminder.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {reminder.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {reminder.frequency}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {reminder.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(reminder.scheduledDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch checked={reminder.isActive} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {mockReminders.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No reminders yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first reminder to stay on track
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reminders;
