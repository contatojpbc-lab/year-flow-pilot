import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "glow" | "gradient";
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  variant = "default"
}: StatCardProps) {
  return (
    <Card variant={variant === "glow" ? "glow" : variant === "gradient" ? "elevated" : "default"} className="animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{value}</span>
              {trendValue && (
                <span className={cn(
                  "text-sm font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}>
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            variant === "glow" ? "gradient-primary" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === "glow" ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
