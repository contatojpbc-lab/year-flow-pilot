import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FinancialPlan } from "@/types";

interface FinanceSnapshotProps {
  plan: FinancialPlan;
}

export function FinanceSnapshot({ plan }: FinanceSnapshotProps) {
  const totalPlanned = plan.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const totalActual = plan.categories.reduce((sum, cat) => sum + cat.actualAmount, 0);
  const budgetUsedPercent = Math.round((totalActual / totalPlanned) * 100);
  const isOverBudget = totalActual > totalPlanned;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalActual)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(totalPlanned)} planned
            </p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOverBudget ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
          }`}>
            {isOverBudget ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(budgetUsedPercent - 100)}%
          </div>
        </div>

        <Progress 
          value={Math.min(budgetUsedPercent, 100)} 
          className="h-2"
          indicatorColor={isOverBudget ? "destructive" : budgetUsedPercent > 80 ? "warning" : "success"}
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          {plan.categories.slice(0, 4).map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{category.name}</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(category.actualAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
