import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FinancialPlan, ExpenseCategory, Transaction, FinancialGoal, GoalContribution } from '@/types';
import { mockFinancialPlan, mockTransactions } from '@/data/mockData';

/**
 * ============================================
 * FINANCES CONTEXT - DATA MANAGEMENT
 * ============================================
 * 
 * BUSINESS RULES:
 * 1. User defines total monthly income (RendaMensal)
 * 2. User creates expense categories with planned budget (CategoriaGasto)
 * 3. User records daily expenses (Gasto)
 * 4. Each expense automatically impacts category's actualAmount
 * 5. System shows planned vs actual comparison
 * 6. Automatic insights generated based on spending patterns
 * 
 * ENTITIES MANAGED:
 * - RendaMensal: plannedIncome / actualIncome in FinancialPlan
 * - CategoriaGasto: ExpenseCategory[]
 * - Gasto: Transaction[]
 * - MetaFinanceira: FinancialGoal[]
 * - Investimento: (future implementation)
 */

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
  // State
  plan: FinancialPlan;
  transactions: Transaction[];
  financialGoals: FinancialGoal[];
  
  // Income operations
  updatePlannedIncome: (amount: number) => void;
  updateActualIncome: (amount: number) => void;
  
  // Category operations
  addCategory: (category: Omit<ExpenseCategory, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'financialPlanId' | 'actualAmount'>) => void;
  updateCategory: (categoryId: string, updates: Partial<ExpenseCategory>) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (transactionId: string) => void;
  
  // Financial goals operations
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'contributions'>) => void;
  updateFinancialGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (goalId: string) => void;
  addContribution: (goalId: string, amount: number, type?: GoalContribution['type'], notes?: string) => void;
  simulateInvestmentReturn: (goalId: string) => void;
  
  // Computed goal values
  totalMonthlyAllocated: number;
  totalGoalProgress: number;
  
  // Computed values
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  availableBalance: number;
  savingsRate: number;
  budgetUsedPercent: number;
  
  // Insights
  criticalCategories: CategoryInsight[];
  insights: FinanceInsight[];
}

const FinancesContext = createContext<FinancesContextType | null>(null);

export function FinancesProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const userId = 'user-1';
  const year = 2026;

  // Initialize from mock data
  const [plan, setPlan] = useState<FinancialPlan>(() => {
    const stored = localStorage.getItem('finances-plan');
    return stored ? JSON.parse(stored) : mockFinancialPlan;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('finances-transactions');
    return stored ? JSON.parse(stored) : mockTransactions;
  });

  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => {
    const stored = localStorage.getItem('finances-goals');
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  const persistPlan = useCallback((newPlan: FinancialPlan) => {
    setPlan(newPlan);
    localStorage.setItem('finances-plan', JSON.stringify(newPlan));
  }, []);

  const persistTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('finances-transactions', JSON.stringify(newTransactions));
  }, []);

  const persistFinancialGoals = useCallback((newGoals: FinancialGoal[]) => {
    setFinancialGoals(newGoals);
    localStorage.setItem('finances-goals', JSON.stringify(newGoals));
  }, []);

  // ============================================
  // INCOME OPERATIONS
  // ============================================

  const updatePlannedIncome = useCallback((amount: number) => {
    const updated = { ...plan, plannedIncome: amount, updatedAt: new Date() };
    persistPlan(updated);
  }, [plan, persistPlan]);

  const updateActualIncome = useCallback((amount: number) => {
    const updated = { ...plan, actualIncome: amount, updatedAt: new Date() };
    persistPlan(updated);
  }, [plan, persistPlan]);

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  const addCategory = useCallback((categoryData: Omit<ExpenseCategory, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'financialPlanId' | 'actualAmount'>) => {
    const newCategory: ExpenseCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      userId,
      year,
      financialPlanId: plan.id,
      actualAmount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const updated = {
      ...plan,
      categories: [...plan.categories, newCategory],
      updatedAt: now,
    };
    persistPlan(updated);
  }, [plan, persistPlan, now, userId, year]);

  const updateCategory = useCallback((categoryId: string, updates: Partial<ExpenseCategory>) => {
    const updated = {
      ...plan,
      categories: plan.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates, updatedAt: now } : cat
      ),
      updatedAt: now,
    };
    persistPlan(updated);
  }, [plan, persistPlan, now]);

  const deleteCategory = useCallback((categoryId: string) => {
    const updated = {
      ...plan,
      categories: plan.categories.filter(cat => cat.id !== categoryId),
      updatedAt: now,
    };
    persistPlan(updated);
    // Also remove transactions linked to this category
    const updatedTransactions = transactions.filter(tx => tx.categoryId !== categoryId);
    persistTransactions(updatedTransactions);
  }, [plan, transactions, persistPlan, persistTransactions, now]);

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  /**
   * Add a new transaction.
   * RULE: Each expense automatically updates the category's actualAmount
   */
  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `tx-${Date.now()}`,
      userId,
      year,
      createdAt: now,
      updatedAt: now,
    };

    // Update transactions
    const updatedTransactions = [newTransaction, ...transactions];
    persistTransactions(updatedTransactions);

    // If it's an expense with a category, update the category's actualAmount
    if (transactionData.type === 'expense' && transactionData.categoryId) {
      const updatedPlan = {
        ...plan,
        categories: plan.categories.map(cat => {
          if (cat.id === transactionData.categoryId) {
            return {
              ...cat,
              actualAmount: cat.actualAmount + transactionData.amount,
              updatedAt: now,
            };
          }
          return cat;
        }),
        updatedAt: now,
      };
      persistPlan(updatedPlan);
    }

    // If it's income, update actualIncome
    if (transactionData.type === 'income') {
      const updatedPlan = {
        ...plan,
        actualIncome: plan.actualIncome + transactionData.amount,
        updatedAt: now,
      };
      persistPlan(updatedPlan);
    }
  }, [transactions, plan, persistTransactions, persistPlan, now, userId, year]);

  const updateTransaction = useCallback((transactionId: string, updates: Partial<Transaction>) => {
    const oldTransaction = transactions.find(tx => tx.id === transactionId);
    if (!oldTransaction) return;

    const updatedTransactions = transactions.map(tx =>
      tx.id === transactionId ? { ...tx, ...updates, updatedAt: now } : tx
    );
    persistTransactions(updatedTransactions);

    // Recalculate category amounts if category or amount changed
    if (oldTransaction.type === 'expense' && oldTransaction.categoryId) {
      // Subtract old amount from old category
      let updatedCategories = plan.categories.map(cat => {
        if (cat.id === oldTransaction.categoryId) {
          return { ...cat, actualAmount: cat.actualAmount - oldTransaction.amount };
        }
        return cat;
      });

      // Add new amount to new/same category
      const newCategoryId = updates.categoryId ?? oldTransaction.categoryId;
      const newAmount = updates.amount ?? oldTransaction.amount;
      updatedCategories = updatedCategories.map(cat => {
        if (cat.id === newCategoryId) {
          return { ...cat, actualAmount: cat.actualAmount + newAmount, updatedAt: now };
        }
        return cat;
      });

      persistPlan({ ...plan, categories: updatedCategories, updatedAt: now });
    }
  }, [transactions, plan, persistTransactions, persistPlan, now]);

  const deleteTransaction = useCallback((transactionId: string) => {
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;

    const updatedTransactions = transactions.filter(tx => tx.id !== transactionId);
    persistTransactions(updatedTransactions);

    // If expense, subtract from category
    if (transaction.type === 'expense' && transaction.categoryId) {
      const updatedPlan = {
        ...plan,
        categories: plan.categories.map(cat => {
          if (cat.id === transaction.categoryId) {
            return {
              ...cat,
              actualAmount: Math.max(0, cat.actualAmount - transaction.amount),
              updatedAt: now,
            };
          }
          return cat;
        }),
        updatedAt: now,
      };
      persistPlan(updatedPlan);
    }

    // If income, subtract from actualIncome
    if (transaction.type === 'income') {
      const updatedPlan = {
        ...plan,
        actualIncome: Math.max(0, plan.actualIncome - transaction.amount),
        updatedAt: now,
      };
      persistPlan(updatedPlan);
    }
  }, [transactions, plan, persistTransactions, persistPlan, now]);

  // ============================================
  // FINANCIAL GOALS OPERATIONS
  // ============================================

  const addFinancialGoal = useCallback((goalData: Omit<FinancialGoal, 'id' | 'userId' | 'year' | 'createdAt' | 'updatedAt' | 'contributions'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      userId,
      year,
      contributions: [],
      createdAt: now,
      updatedAt: now,
    };
    persistFinancialGoals([...financialGoals, newGoal]);
  }, [financialGoals, persistFinancialGoals, now, userId, year]);

  const updateFinancialGoal = useCallback((goalId: string, updates: Partial<FinancialGoal>) => {
    const updated = financialGoals.map(goal =>
      goal.id === goalId ? { ...goal, ...updates, updatedAt: now } : goal
    );
    persistFinancialGoals(updated);
  }, [financialGoals, persistFinancialGoals, now]);

  const deleteFinancialGoal = useCallback((goalId: string) => {
    persistFinancialGoals(financialGoals.filter(goal => goal.id !== goalId));
  }, [financialGoals, persistFinancialGoals]);

  /**
   * Add a contribution to a financial goal
   * Updates the goal's currentAmount automatically
   */
  const addContribution = useCallback((goalId: string, amount: number, type: GoalContribution['type'] = 'manual', notes?: string) => {
    const newContribution: GoalContribution = {
      id: `contrib-${Date.now()}`,
      userId,
      year,
      goalId,
      amount,
      date: now,
      type,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    const updated = financialGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          currentAmount: goal.currentAmount + amount,
          contributions: [...goal.contributions, newContribution],
          updatedAt: now,
        };
      }
      return goal;
    });
    persistFinancialGoals(updated);
  }, [financialGoals, persistFinancialGoals, now, userId, year]);

  /**
   * Simulate investment return based on expectedReturnRate
   * Calculates monthly return (annual rate / 12)
   */
  const simulateInvestmentReturn = useCallback((goalId: string) => {
    const goal = financialGoals.find(g => g.id === goalId);
    if (!goal || goal.type !== 'investment' || !goal.expectedReturnRate) return;

    // Monthly return = (current amount * annual rate) / 12
    const monthlyReturn = (goal.currentAmount * goal.expectedReturnRate) / 12;
    
    if (monthlyReturn > 0) {
      addContribution(goalId, monthlyReturn, 'investment_return', `Monthly return at ${(goal.expectedReturnRate * 100).toFixed(1)}% annual rate`);
    }
  }, [financialGoals, addContribution]);

  // Total monthly amount allocated to all financial goals
  const totalMonthlyAllocated = useMemo(() => 
    financialGoals.reduce((sum, goal) => sum + (goal.monthlyContribution || 0), 0),
    [financialGoals]
  );

  // Average progress across all financial goals
  const totalGoalProgress = useMemo(() => {
    if (financialGoals.length === 0) return 0;
    const avgProgress = financialGoals.reduce((sum, goal) => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0) / financialGoals.length;
    return Math.round(avgProgress);
  }, [financialGoals]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const totalPlanned = useMemo(() => 
    plan.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0),
    [plan.categories]
  );

  const totalActual = useMemo(() => 
    plan.categories.reduce((sum, cat) => sum + cat.actualAmount, 0),
    [plan.categories]
  );

  const remaining = useMemo(() => 
    totalPlanned - totalActual,
    [totalPlanned, totalActual]
  );

  // Available balance = actual income - actual expenses
  const availableBalance = useMemo(() => 
    plan.actualIncome - totalActual,
    [plan.actualIncome, totalActual]
  );

  const savingsRate = useMemo(() => {
    const savingsCategory = plan.categories.find(c => c.name === 'Savings');
    if (!savingsCategory || plan.actualIncome === 0) return 0;
    return Math.round((savingsCategory.actualAmount / plan.actualIncome) * 100);
  }, [plan.categories, plan.actualIncome]);

  const budgetUsedPercent = useMemo(() => {
    if (totalPlanned === 0) return 0;
    return Math.round((totalActual / totalPlanned) * 100);
  }, [totalPlanned, totalActual]);

  // ============================================
  // INSIGHTS & ALERTS
  // ============================================

  // Critical categories: over 90% of budget or already exceeded
  const criticalCategories = useMemo<CategoryInsight[]>(() => {
    return plan.categories
      .map(cat => {
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
      })
      .filter((item): item is CategoryInsight => item !== null);
  }, [plan.categories]);

  // Generate automatic insights
  const insights = useMemo<FinanceInsight[]>(() => {
    const result: FinanceInsight[] = [];
    
    // Check for over-budget categories
    plan.categories.forEach(cat => {
      if (cat.plannedAmount > 0 && cat.actualAmount > cat.plannedAmount) {
        const percentOver = Math.round(((cat.actualAmount - cat.plannedAmount) / cat.plannedAmount) * 100);
        result.push({
          type: 'warning',
          message: `You spent ${percentOver}% more on ${cat.name} this month`,
        });
      }
    });

    // Check for under-budget categories (positive feedback)
    const underBudgetCategories = plan.categories.filter(cat => 
      cat.plannedAmount > 0 && cat.actualAmount < cat.plannedAmount * 0.7 && cat.actualAmount > 0
    );
    if (underBudgetCategories.length > 0) {
      const cat = underBudgetCategories[0];
      const percentSaved = Math.round(((cat.plannedAmount - cat.actualAmount) / cat.plannedAmount) * 100);
      result.push({
        type: 'success',
        message: `Great job! ${cat.name} is ${percentSaved}% under budget`,
      });
    }

    // Overall budget health
    if (budgetUsedPercent > 100) {
      result.push({
        type: 'warning',
        message: `Total spending exceeded budget by ${budgetUsedPercent - 100}%`,
      });
    } else if (budgetUsedPercent >= 90) {
      result.push({
        type: 'info',
        message: `You've used ${budgetUsedPercent}% of your total budget`,
      });
    }

    // Savings rate insight
    if (savingsRate > 20) {
      result.push({
        type: 'success',
        message: `Excellent! You're saving ${savingsRate}% of your income`,
      });
    } else if (savingsRate < 10 && plan.actualIncome > 0) {
      result.push({
        type: 'info',
        message: `Consider increasing savings (currently ${savingsRate}%)`,
      });
    }

    // Available balance insight
    if (availableBalance < 0) {
      result.push({
        type: 'warning',
        message: `You're overspending! ${Math.abs(availableBalance).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} over income`,
      });
    }

    return result;
  }, [plan.categories, budgetUsedPercent, savingsRate, availableBalance, plan.actualIncome]);

  const value: FinancesContextType = {
    plan,
    transactions,
    financialGoals,
    updatePlannedIncome,
    updateActualIncome,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    addContribution,
    simulateInvestmentReturn,
    totalPlanned,
    totalActual,
    remaining,
    availableBalance,
    savingsRate,
    budgetUsedPercent,
    totalMonthlyAllocated,
    totalGoalProgress,
    criticalCategories,
    insights,
  };

  return (
    <FinancesContext.Provider value={value}>
      {children}
    </FinancesContext.Provider>
  );
}

export function useFinances() {
  const context = useContext(FinancesContext);
  if (!context) {
    throw new Error('useFinances must be used within a FinancesProvider');
  }
  return context;
}
