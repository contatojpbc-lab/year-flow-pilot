import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { FinancialPlan, ExpenseCategory, Transaction, FinancialGoal, GoalContribution } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  percentOverBudget: number;
  isCritical: boolean;
  message: string;
}

export interface FinanceInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
}

interface FinancesContextType {
  plan: FinancialPlan;
  transactions: Transaction[];
  financialGoals: FinancialGoal[];
  loading: boolean;
  refresh: () => Promise<void>;

  updatePlannedIncome: (amount: number) => Promise<void>;
  updateActualIncome: (amount: number) => Promise<void>;

  addCategory: (category: Omit<ExpenseCategory, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'financialPlanId' | 'actualAmount'>) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<ExpenseCategory>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;

  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'contributions'>) => Promise<void>;
  updateFinancialGoal: (goalId: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteFinancialGoal: (goalId: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, type?: GoalContribution['type'], notes?: string) => Promise<void>;
  simulateInvestmentReturn: (goalId: string) => Promise<void>;

  totalMonthlyAllocated: number;
  totalGoalProgress: number;
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  availableBalance: number;
  savingsRate: number;
  budgetUsedPercent: number;

  criticalCategories: CategoryInsight[];
  insights: FinanceInsight[];
}

const FinancesContext = createContext<FinancesContextType | null>(null);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

function emptyPlan(userId: string): FinancialPlan {
  return {
    id: '',
    userId,
    year: currentYear,
    month: currentMonth,
    plannedIncome: 0,
    actualIncome: 0,
    categories: [],
    createdAt: now,
    updatedAt: now,
  };
}

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    date: new Date(row.transaction_date),
    amount: Number(row.amount),
    type: row.type,
    categoryId: row.category_id ?? undefined,
    description: row.description ?? '',
    isRecurring: row.is_recurring,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapGoal(row: any, contributions: GoalContribution[]): FinancialGoal {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    monthlyContribution: Number(row.monthly_contribution),
    deadline: row.deadline ? new Date(row.deadline) : new Date(),
    type: row.type,
    expectedReturnRate: row.expected_return_rate != null ? Number(row.expected_return_rate) : undefined,
    contributions,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapContribution(row: any): GoalContribution {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    goalId: row.goal_id,
    amount: Number(row.amount),
    date: new Date(row.contribution_date),
    type: row.type,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function FinancesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<FinancialPlan>(emptyPlan(''));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Ensure a financial plan exists for the current month
  const ensurePlan = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from('financial_plans')
      .select('*')
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .maybeSingle();
    if (existing) return existing.id;
    const { data: created, error } = await supabase
      .from('financial_plans')
      .insert({
        user_id: user.id,
        year: currentYear,
        month: currentMonth,
        planned_income: 0,
        actual_income: 0,
      })
      .select('*')
      .single();
    if (error) return null;
    return created.id;
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) {
      setPlan(emptyPlan(''));
      setTransactions([]);
      setFinancialGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const planId = await ensurePlan();
    if (!planId) { setLoading(false); return; }

    const [{ data: planRow }, { data: cats }, { data: txs }, { data: goals }, { data: contribs }] = await Promise.all([
      supabase.from('financial_plans').select('*').eq('id', planId).single(),
      supabase.from('expense_categories').select('*').eq('financial_plan_id', planId).order('created_at', { ascending: true }),
      supabase.from('transactions').select('*').eq('financial_plan_id', planId).order('transaction_date', { ascending: false }),
      supabase.from('financial_goals').select('*').order('created_at', { ascending: true }),
      supabase.from('goal_contributions').select('*').order('contribution_date', { ascending: false }),
    ]);

    const txList = (txs ?? []).map(mapTransaction);
    setTransactions(txList);

    // Compute actualAmount per category from transactions
    const categories: ExpenseCategory[] = (cats ?? []).map((c: any) => {
      const actual = txList
        .filter(t => t.type === 'expense' && t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: c.id,
        userId: c.user_id,
        year: c.year,
        financialPlanId: c.financial_plan_id,
        name: c.name,
        plannedAmount: Number(c.planned_amount),
        actualAmount: actual,
        color: c.color,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      };
    });

    // actualIncome = sum of income transactions (overrides planned actual_income field)
    const actualIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    setPlan({
      id: planRow.id,
      userId: planRow.user_id,
      year: planRow.year,
      month: planRow.month,
      plannedIncome: Number(planRow.planned_income),
      actualIncome: actualIncome > 0 ? actualIncome : Number(planRow.actual_income),
      categories,
      createdAt: new Date(planRow.created_at),
      updatedAt: new Date(planRow.updated_at),
    });

    const contribsByGoal = new Map<string, GoalContribution[]>();
    (contribs ?? []).forEach((c: any) => {
      const m = mapContribution(c);
      const arr = contribsByGoal.get(m.goalId) ?? [];
      arr.push(m);
      contribsByGoal.set(m.goalId, arr);
    });
    setFinancialGoals((goals ?? []).map((g: any) => mapGoal(g, contribsByGoal.get(g.id) ?? [])));
    setLoading(false);
  }, [user, ensurePlan]);

  useEffect(() => { refresh(); }, [refresh]);

  // ============== INCOME ==============
  const updatePlannedIncome = useCallback(async (amount: number) => {
    if (!plan.id) return;
    await supabase.from('financial_plans').update({ planned_income: amount }).eq('id', plan.id);
    await refresh();
  }, [plan.id, refresh]);

  const updateActualIncome = useCallback(async (amount: number) => {
    if (!plan.id) return;
    await supabase.from('financial_plans').update({ actual_income: amount }).eq('id', plan.id);
    await refresh();
  }, [plan.id, refresh]);

  // ============== CATEGORIES ==============
  const addCategory = useCallback(async (data: any) => {
    if (!user || !plan.id) return;
    await supabase.from('expense_categories').insert({
      user_id: user.id,
      financial_plan_id: plan.id,
      name: data.name,
      planned_amount: data.plannedAmount,
      color: data.color,
    });
    await refresh();
  }, [user, plan.id, refresh]);

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<ExpenseCategory>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.plannedAmount !== undefined) payload.planned_amount = updates.plannedAmount;
    if (updates.color !== undefined) payload.color = updates.color;
    if (Object.keys(payload).length === 0) return;
    await supabase.from('expense_categories').update(payload).eq('id', categoryId);
    await refresh();
  }, [refresh]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    // Transactions referencing this category will have category_id set to null (FK on delete set null)
    await supabase.from('expense_categories').delete().eq('id', categoryId);
    await refresh();
  }, [refresh]);

  // ============== TRANSACTIONS ==============
  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !plan.id) return;
    await supabase.from('transactions').insert({
      user_id: user.id,
      financial_plan_id: plan.id,
      transaction_date: data.date.toISOString().slice(0, 10),
      amount: data.amount,
      type: data.type,
      category_id: data.categoryId ?? null,
      description: data.description,
      is_recurring: data.isRecurring,
    });
    await refresh();
  }, [user, plan.id, refresh]);

  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<Transaction>) => {
    const payload: any = {};
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId ?? null;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.date !== undefined) payload.transaction_date = updates.date.toISOString().slice(0, 10);
    if (updates.isRecurring !== undefined) payload.is_recurring = updates.isRecurring;
    if (Object.keys(payload).length === 0) return;
    await supabase.from('transactions').update(payload).eq('id', transactionId);
    await refresh();
  }, [refresh]);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    await supabase.from('transactions').delete().eq('id', transactionId);
    await refresh();
  }, [refresh]);

  // ============== FINANCIAL GOALS ==============
  const addFinancialGoal = useCallback(async (data: Omit<FinancialGoal, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'contributions'>) => {
    if (!user) return;
    await supabase.from('financial_goals').insert({
      user_id: user.id,
      title: data.title,
      type: data.type,
      target_amount: data.targetAmount,
      current_amount: data.currentAmount ?? 0,
      monthly_contribution: data.monthlyContribution ?? 0,
      deadline: data.deadline?.toISOString() ?? null,
      expected_return_rate: data.expectedReturnRate ?? null,
    });
    await refresh();
  }, [user, refresh]);

  const updateFinancialGoal = useCallback(async (goalId: string, updates: Partial<FinancialGoal>) => {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) payload.current_amount = updates.currentAmount;
    if (updates.monthlyContribution !== undefined) payload.monthly_contribution = updates.monthlyContribution;
    if (updates.deadline !== undefined) payload.deadline = updates.deadline?.toISOString() ?? null;
    if (updates.expectedReturnRate !== undefined) payload.expected_return_rate = updates.expectedReturnRate ?? null;
    if (Object.keys(payload).length === 0) return;
    await supabase.from('financial_goals').update(payload).eq('id', goalId);
    await refresh();
  }, [refresh]);

  const deleteFinancialGoal = useCallback(async (goalId: string) => {
    await supabase.from('financial_goals').delete().eq('id', goalId);
    await refresh();
  }, [refresh]);

  const addContribution = useCallback(async (
    goalId: string,
    amount: number,
    type: GoalContribution['type'] = 'manual',
    notes?: string
  ) => {
    if (!user) return;
    const goal = financialGoals.find(g => g.id === goalId);
    if (!goal) return;
    // Insert contribution + bump current_amount in goal
    await supabase.from('goal_contributions').insert({
      user_id: user.id,
      goal_id: goalId,
      amount,
      type,
      notes: notes ?? null,
      contribution_date: new Date().toISOString(),
    });
    await supabase.from('financial_goals')
      .update({ current_amount: goal.currentAmount + amount })
      .eq('id', goalId);
    await refresh();
  }, [user, financialGoals, refresh]);

  const simulateInvestmentReturn = useCallback(async (goalId: string) => {
    const goal = financialGoals.find(g => g.id === goalId);
    if (!goal || goal.type !== 'investment' || !goal.expectedReturnRate) return;
    const monthlyReturn = (goal.currentAmount * goal.expectedReturnRate) / 12;
    if (monthlyReturn > 0) {
      await addContribution(
        goalId,
        monthlyReturn,
        'investment_return',
        `Monthly return at ${(goal.expectedReturnRate * 100).toFixed(1)}% annual rate`
      );
    }
  }, [financialGoals, addContribution]);

  // ============== COMPUTED ==============
  const totalMonthlyAllocated = useMemo(
    () => financialGoals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0),
    [financialGoals]
  );
  const totalGoalProgress = useMemo(() => {
    if (financialGoals.length === 0) return 0;
    const avg = financialGoals.reduce((sum, g) => {
      const p = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return sum + Math.min(p, 100);
    }, 0) / financialGoals.length;
    return Math.round(avg);
  }, [financialGoals]);

  const totalPlanned = useMemo(
    () => plan.categories.reduce((s, c) => s + c.plannedAmount, 0),
    [plan.categories]
  );
  const totalActual = useMemo(
    () => plan.categories.reduce((s, c) => s + c.actualAmount, 0),
    [plan.categories]
  );
  const remaining = totalPlanned - totalActual;
  const availableBalance = plan.actualIncome - totalActual;
  const savingsRate = useMemo(() => {
    const savingsCat = plan.categories.find(c => c.name.toLowerCase().includes('savings') || c.name.toLowerCase().includes('poup'));
    if (!savingsCat || plan.actualIncome === 0) return 0;
    return Math.round((savingsCat.actualAmount / plan.actualIncome) * 100);
  }, [plan.categories, plan.actualIncome]);
  const budgetUsedPercent = totalPlanned === 0 ? 0 : Math.round((totalActual / totalPlanned) * 100);

  const criticalCategories = useMemo<CategoryInsight[]>(() => {
    return plan.categories.map(cat => {
      if (cat.plannedAmount === 0) return null;
      const percentUsed = (cat.actualAmount / cat.plannedAmount) * 100;
      const percentOver = percentUsed - 100;
      if (percentUsed >= 90) {
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          percentOverBudget: Math.max(0, percentOver),
          isCritical: percentUsed > 100,
          message: percentUsed > 100
            ? `${cat.name} exceeded budget by ${Math.round(percentOver)}%`
            : `${cat.name} is at ${Math.round(percentUsed)}% of budget`,
        };
      }
      return null;
    }).filter((i): i is CategoryInsight => i !== null);
  }, [plan.categories]);

  const insights = useMemo<FinanceInsight[]>(() => {
    const result: FinanceInsight[] = [];
    plan.categories.forEach(cat => {
      if (cat.plannedAmount > 0 && cat.actualAmount > cat.plannedAmount) {
        const over = Math.round(((cat.actualAmount - cat.plannedAmount) / cat.plannedAmount) * 100);
        result.push({ type: 'warning', message: `You spent ${over}% more on ${cat.name} this month` });
      }
    });
    const under = plan.categories.find(c => c.plannedAmount > 0 && c.actualAmount > 0 && c.actualAmount < c.plannedAmount * 0.7);
    if (under) {
      const saved = Math.round(((under.plannedAmount - under.actualAmount) / under.plannedAmount) * 100);
      result.push({ type: 'success', message: `Great job! ${under.name} is ${saved}% under budget` });
    }
    if (budgetUsedPercent > 100) {
      result.push({ type: 'warning', message: `Total spending exceeded budget by ${budgetUsedPercent - 100}%` });
    } else if (budgetUsedPercent >= 90) {
      result.push({ type: 'info', message: `You've used ${budgetUsedPercent}% of your total budget` });
    }
    if (savingsRate > 20) {
      result.push({ type: 'success', message: `Excellent! You're saving ${savingsRate}% of your income` });
    } else if (savingsRate < 10 && plan.actualIncome > 0) {
      result.push({ type: 'info', message: `Consider increasing savings (currently ${savingsRate}%)` });
    }
    if (availableBalance < 0) {
      result.push({
        type: 'warning',
        message: `You're overspending! ${Math.abs(availableBalance).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} over income`,
      });
    }
    return result;
  }, [plan.categories, budgetUsedPercent, savingsRate, availableBalance, plan.actualIncome]);

  const value: FinancesContextType = {
    plan, transactions, financialGoals, loading, refresh,
    updatePlannedIncome, updateActualIncome,
    addCategory, updateCategory, deleteCategory,
    addTransaction, updateTransaction, deleteTransaction,
    addFinancialGoal, updateFinancialGoal, deleteFinancialGoal, addContribution, simulateInvestmentReturn,
    totalMonthlyAllocated, totalGoalProgress,
    totalPlanned, totalActual, remaining, availableBalance, savingsRate, budgetUsedPercent,
    criticalCategories, insights,
  };

  return <FinancesContext.Provider value={value}>{children}</FinancesContext.Provider>;
}

export function useFinances() {
  const ctx = useContext(FinancesContext);
  if (!ctx) throw new Error('useFinances must be used within a FinancesProvider');
  return ctx;
}
