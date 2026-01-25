import { useState } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Pencil, Trash2, X, Check, AlertTriangle, Lightbulb, DollarSign, Target, PiggyBank, LineChart, CreditCard, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFinances } from "@/contexts/FinancesContext";
import { cn } from "@/lib/utils";
import { FinancialGoal } from "@/types";

const Finances = () => {
  const {
    plan,
    transactions,
    financialGoals,
    totalPlanned,
    totalActual,
    remaining,
    availableBalance,
    savingsRate,
    criticalCategories,
    insights,
    totalMonthlyAllocated,
    totalGoalProgress,
    addTransaction,
    updateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteTransaction,
    updatePlannedIncome,
    updateActualIncome,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    addContribution,
    simulateInvestmentReturn,
  } = useFinances();

  // Transaction form state
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [txForm, setTxForm] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Category form state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    plannedAmount: '',
    color: 'hsl(217 91% 60%)',
  });

  // Income editing state
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    planned: plan.plannedIncome.toString(),
    actual: plan.actualIncome.toString(),
  });

  // Financial goal form state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    monthlyContribution: '',
    deadline: '',
    type: 'savings' as FinancialGoal['type'],
    expectedReturnRate: '',
  });

  // Contribution dialog state
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Reset transaction form
  const resetTxForm = () => {
    setTxForm({
      amount: '',
      type: 'expense',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingTransactionId(null);
  };

  // Open edit dialog for a transaction
  const handleEditTransaction = (tx: typeof transactions[0]) => {
    setEditingTransactionId(tx.id);
    setTxForm({
      amount: tx.amount.toString(),
      type: tx.type,
      categoryId: tx.categoryId || '',
      description: tx.description,
      date: new Date(tx.date).toISOString().split('T')[0],
    });
    setTxDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  };

  // Handle add/update transaction
  const handleSaveTransaction = () => {
    if (!txForm.amount || !txForm.description) return;
    
    if (editingTransactionId) {
      // Update existing transaction
      updateTransaction(editingTransactionId, {
        amount: parseFloat(txForm.amount),
        type: txForm.type,
        categoryId: txForm.type === 'expense' ? txForm.categoryId || undefined : undefined,
        description: txForm.description,
        date: new Date(txForm.date),
      });
    } else {
      // Add new transaction
      addTransaction({
        amount: parseFloat(txForm.amount),
        type: txForm.type,
        categoryId: txForm.type === 'expense' ? txForm.categoryId || undefined : undefined,
        description: txForm.description,
        date: new Date(txForm.date),
        isRecurring: false,
      });
    }

    resetTxForm();
    setTxDialogOpen(false);
  };

  // Handle add category
  const handleAddCategory = () => {
    if (!catForm.name || !catForm.plannedAmount) return;
    
    addCategory({
      name: catForm.name,
      plannedAmount: parseFloat(catForm.plannedAmount),
      color: catForm.color,
    });

    setCatForm({
      name: '',
      plannedAmount: '',
      color: 'hsl(217 91% 60%)',
    });
    setCatDialogOpen(false);
  };

  // Handle save income
  const handleSaveIncome = () => {
    const planned = parseFloat(incomeForm.planned);
    const actual = parseFloat(incomeForm.actual);
    if (!isNaN(planned)) updatePlannedIncome(planned);
    if (!isNaN(actual)) updateActualIncome(actual);
    setEditingIncome(false);
  };

  // Handle add financial goal
  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.deadline) return;
    
    addFinancialGoal({
      title: goalForm.title,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: 0,
      monthlyContribution: parseFloat(goalForm.monthlyContribution) || 0,
      deadline: new Date(goalForm.deadline),
      type: goalForm.type,
      expectedReturnRate: goalForm.type === 'investment' && goalForm.expectedReturnRate 
        ? parseFloat(goalForm.expectedReturnRate) / 100 
        : undefined,
    });

    setGoalForm({
      title: '',
      targetAmount: '',
      monthlyContribution: '',
      deadline: '',
      type: 'savings',
      expectedReturnRate: '',
    });
    setGoalDialogOpen(false);
  };

  // Handle add contribution
  const handleAddContribution = () => {
    if (!selectedGoalId || !contributionAmount) return;
    addContribution(selectedGoalId, parseFloat(contributionAmount), 'manual');
    setContributionAmount('');
    setContributionDialogOpen(false);
    setSelectedGoalId(null);
  };

  // Open contribution dialog
  const openContributionDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributionDialogOpen(true);
  };

  // Get icon for goal type
  const getGoalIcon = (type: FinancialGoal['type']) => {
    switch (type) {
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      case 'investment': return <LineChart className="h-4 w-4" />;
      case 'debt_payoff': return <CreditCard className="h-4 w-4" />;
      case 'purchase': return <ShoppingBag className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const colorOptions = [
    { value: 'hsl(217 91% 60%)', label: 'Blue' },
    { value: 'hsl(38 92% 50%)', label: 'Orange' },
    { value: 'hsl(160 84% 45%)', label: 'Green' },
    { value: 'hsl(280 67% 55%)', label: 'Purple' },
    { value: 'hsl(340 82% 52%)', label: 'Pink' },
    { value: 'hsl(0 72% 51%)', label: 'Red' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Insights & Alerts */}
      {(insights.length > 0 || criticalCategories.length > 0) && (
        <div className="space-y-2">
          {criticalCategories.map((cat) => (
            <Alert key={cat.categoryId} variant={cat.isCritical ? "destructive" : "default"} className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2">{cat.message}</AlertDescription>
            </Alert>
          ))}
          {insights.slice(0, 3).map((insight, idx) => (
            <Alert 
              key={idx} 
              variant={insight.type === 'warning' ? 'destructive' : 'default'}
              className={cn(
                "py-2",
                insight.type === 'success' && "border-success/50 bg-success/5",
                insight.type === 'info' && "border-primary/50 bg-primary/5"
              )}
            >
              <Lightbulb className={cn(
                "h-4 w-4",
                insight.type === 'success' && "text-success",
                insight.type === 'info' && "text-primary"
              )} />
              <AlertDescription className="ml-2">{insight.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Finances</h1>
          <p className="text-muted-foreground">January 2026 overview</p>
        </div>
        <div className="flex gap-2">
          {/* Add Category Dialog */}
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    placeholder="e.g., Groceries"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Planned Budget</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={catForm.plannedAmount}
                    onChange={(e) => setCatForm({ ...catForm, plannedAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={catForm.color} onValueChange={(v) => setCatForm({ ...catForm, color: v })}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: catForm.color }} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: opt.value }} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Financial Goal Dialog */}
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Financial Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input
                    placeholder="e.g., Emergency Fund, New Phone, Vacation"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select 
                    value={goalForm.type} 
                    onValueChange={(v: FinancialGoal['type']) => setGoalForm({ ...goalForm, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">
                        <div className="flex items-center gap-2">
                          <PiggyBank className="h-4 w-4" /> Savings
                        </div>
                      </SelectItem>
                      <SelectItem value="investment">
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4 w-4" /> Investment
                        </div>
                      </SelectItem>
                      <SelectItem value="purchase">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" /> Purchase
                        </div>
                      </SelectItem>
                      <SelectItem value="debt_payoff">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Debt Payoff
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Contribution</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={goalForm.monthlyContribution}
                      onChange={(e) => setGoalForm({ ...goalForm, monthlyContribution: e.target.value })}
                    />
                  </div>
                </div>
                {goalForm.type === 'investment' && (
                  <div className="space-y-2">
                    <Label>Expected Annual Return (%)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 12"
                      value={goalForm.expectedReturnRate}
                      onChange={(e) => setGoalForm({ ...goalForm, expectedReturnRate: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used to simulate investment returns
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddGoal}>Create Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add/Edit Transaction Dialog */}
          <Dialog open={txDialogOpen} onOpenChange={(open) => {
            setTxDialogOpen(open);
            if (!open) resetTxForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="glow">
                <Plus className="h-4 w-4 mr-2" />
                Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={txForm.type} onValueChange={(v: 'income' | 'expense') => setTxForm({ ...txForm, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="e.g., Grocery shopping"
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  />
                </div>
                {txForm.type === 'expense' && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={txForm.categoryId} onValueChange={(v) => setTxForm({ ...txForm, categoryId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {plan.categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveTransaction}>
                  {editingTransactionId ? 'Save Changes' : 'Add Transaction'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="glow" className="relative">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Income</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setIncomeForm({
                    planned: plan.plannedIncome.toString(),
                    actual: plan.actualIncome.toString(),
                  });
                  setEditingIncome(!editingIncome);
                }}
              >
                {editingIncome ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              </Button>
            </div>
            {editingIncome ? (
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Actual</Label>
                  <Input
                    type="number"
                    value={incomeForm.actual}
                    onChange={(e) => setIncomeForm({ ...incomeForm, actual: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Planned</Label>
                  <Input
                    type="number"
                    value={incomeForm.planned}
                    onChange={(e) => setIncomeForm({ ...incomeForm, planned: e.target.value })}
                    className="h-8"
                  />
                </div>
                <Button size="sm" onClick={handleSaveIncome} className="w-full">
                  <Check className="h-3 w-3 mr-1" /> Save
                </Button>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(plan.actualIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {formatCurrency(plan.plannedIncome)} planned
                </p>
              </>
            )}
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

        <Card className={cn(
          availableBalance < 0 && "border-destructive/50"
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Available Balance</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              availableBalance >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(availableBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">income minus expenses</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Savings Rate</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              savingsRate >= 20 ? "text-success" : savingsRate >= 10 ? "text-primary" : "text-warning"
            )}>{savingsRate}%</p>
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
            {plan.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories yet. Add one to start tracking!
              </p>
            ) : (
              plan.categories.map((category) => {
                const percent = category.plannedAmount > 0 
                  ? Math.round((category.actualAmount / category.plannedAmount) * 100) 
                  : 0;
                const isOver = category.actualAmount > category.plannedAmount;
                
                return (
                  <div key={category.id} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(percent, 100)} 
                      size="sm"
                      indicatorColor={isOver ? "destructive" : percent > 80 ? "warning" : "default"}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions yet. Add one to start tracking!
              </p>
            ) : (
              transactions.slice(0, 8).map((tx) => {
                const category = plan.categories.find(c => c.id === tx.categoryId);
                const isIncome = tx.type === 'income';
                const isOverBudget = category && category.actualAmount > category.plannedAmount;

                return (
                  <div 
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg group transition-colors",
                      isOverBudget ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isIncome ? "bg-success/20" : isOverBudget ? "bg-destructive/20" : "bg-secondary"
                      )}>
                        {isIncome ? (
                          <ArrowDownRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className={cn("h-4 w-4", isOverBudget ? "text-destructive" : "text-muted-foreground")} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.date)} {category && `• ${category.name}`}
                          {isOverBudget && (
                            <span className="ml-1 text-destructive font-medium">• Over budget</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isIncome ? "text-success" : isOverBudget ? "text-destructive" : "text-foreground"
                      )}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditTransaction(tx)}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteTransaction(tx.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals Progress */}
      {financialGoals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Financial Goals</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalMonthlyAllocated)} allocated monthly • {totalGoalProgress}% avg progress
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {financialGoals.map((goal) => {
              const progress = goal.targetAmount > 0 
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100) 
                : 0;
              const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const monthsRemaining = Math.ceil(daysRemaining / 30);
              const projectedAmount = goal.currentAmount + (goal.monthlyContribution * monthsRemaining);
              const willReachGoal = projectedAmount >= goal.targetAmount;
              
              return (
                <div key={goal.id} className="p-4 rounded-lg bg-secondary/30 space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        goal.type === 'savings' && "bg-success/20 text-success",
                        goal.type === 'investment' && "bg-primary/20 text-primary",
                        goal.type === 'debt_payoff' && "bg-warning/20 text-warning",
                        goal.type === 'purchase' && "bg-secondary text-muted-foreground"
                      )}>
                        {getGoalIcon(goal.type)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{goal.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            goal.type === 'savings' && "bg-success/20 text-success",
                            goal.type === 'investment' && "bg-primary/20 text-primary",
                            goal.type === 'debt_payoff' && "bg-warning/20 text-warning",
                            goal.type === 'purchase' && "bg-secondary text-muted-foreground"
                          )}>
                            {goal.type.replace('_', ' ')}
                          </span>
                          {goal.monthlyContribution > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(goal.monthlyContribution)}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {' '}/ {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openContributionDialog(goal.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                      {goal.type === 'investment' && goal.expectedReturnRate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => simulateInvestmentReturn(goal.id)}
                          title="Simulate monthly return"
                        >
                          <TrendingUp className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteFinancialGoal(goal.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(progress, 100)} 
                    size="sm"
                    indicatorColor={progress >= 100 ? "success" : progress >= 50 ? "default" : "warning"}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {progress}% complete • {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
                    </span>
                    {goal.monthlyContribution > 0 && daysRemaining > 0 && (
                      <span className={cn(
                        willReachGoal ? "text-success" : "text-warning"
                      )}>
                        Projected: {formatCurrency(projectedAmount)} {willReachGoal ? '✓' : '⚠'}
                      </span>
                    )}
                  </div>
                  {goal.contributions && goal.contributions.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Recent contributions</p>
                      <div className="space-y-1">
                        {goal.contributions.slice(-3).reverse().map((contrib) => (
                          <div key={contrib.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatDate(contrib.date)} • {contrib.type === 'investment_return' ? 'Return' : 'Deposit'}
                            </span>
                            <span className="text-success font-medium">+{formatCurrency(contrib.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Contribution Dialog */}
      <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddContribution}>Add Contribution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finances;
