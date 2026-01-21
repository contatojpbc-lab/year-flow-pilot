import { Activity, CheckCircle, Target, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: 'habit' | 'goal' | 'journal' | 'review';
  title: string;
  time: string;
}

const mockActivity: ActivityItem[] = [
  { id: '1', type: 'habit', title: 'Completed morning meditation', time: '2 hours ago' },
  { id: '2', type: 'goal', title: 'Updated "Run Half Marathon" progress', time: '5 hours ago' },
  { id: '3', type: 'journal', title: 'Added journal entry', time: 'Yesterday' },
  { id: '4', type: 'review', title: 'Completed weekly review', time: '2 days ago' },
];

const iconMap = {
  habit: CheckCircle,
  goal: Target,
  journal: BookOpen,
  review: Calendar,
};

const colorMap = {
  habit: 'text-success',
  goal: 'text-primary',
  journal: 'text-info',
  review: 'text-warning',
};

export function RecentActivity() {
  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivity.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${colorMap[item.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
