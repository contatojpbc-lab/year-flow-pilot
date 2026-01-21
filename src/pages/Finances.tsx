import { useState } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockFinancialPlan, mockTransactions } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Finances = () => {
  const plan = mockFinancialPlan;
  const transactions = mockTransactions;

  const totalPlanned = plan.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const totalActual = plan.categories.reduce((sum, cat) => sum + cat.actualAmount, 0);
  const remaining = totalPlanned - totalActual;
  const savingsRate = Math.round((plan.categories.find(c => c.name === 'Savings')?.actualAmount || 0) / plan.actualIncome * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground">January 2026 overview</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="glow">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Income</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(plan.actualIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(plan.plannedIncome)} planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalActual)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(totalPlanned)} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Remaining</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              remaining >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(remaining)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">available this month</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="text-sm">Savings Rate</span>
            </div>
            <p className="text-2xl font-bold text-primary">{savingsRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">of income saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Budget Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.categories.map((category) => {
              const percent = Math.round((category.actualAmount / category.plannedAmount) * 100);
              const isOver = category.actualAmount > category.plannedAmount;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        isOver ? "text-destructive" : "text-foreground"
                      )}>
                        {formatCurrency(category.actualAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {' '}/ {formatCurrency(category.plannedAmount)}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percent, 100)} 
                    size="sm"
                    indicatorColor={isOver ? "destructive" : percent > 80 ? "warning" : "default"}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((tx) => {
              const category = plan.categories.find(c => c.id === tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      isIncome ? "bg-success/20" : "bg-secondary"
                    )}>
                      {isIncome ? (
                        <ArrowDownRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)} {category && `• ${category.name}`}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isIncome ? "text-success" : "text-foreground"
                  )}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Finances;
