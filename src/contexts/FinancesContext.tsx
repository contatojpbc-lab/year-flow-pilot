import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FinancialPlan, ExpenseCategory, Transaction } from '@/types';
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
 * 
 * ENTITIES MANAGED:
 * - RendaMensal: plannedIncome / actualIncome in FinancialPlan
 * - CategoriaGasto: ExpenseCategory[]
 * - Gasto: Transaction[]
 * - MetaFinanceira: (future implementation)
 * - Investimento: (future implementation)
 */

interface FinancesContextType {
  // State
  plan: FinancialPlan;
  transactions: Transaction[];
  
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
  
  // Computed values
  totalPlanned: number;
  totalActual: number;
  remaining: number;
  savingsRate: number;
  budgetUsedPercent: number;
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

  // Persist to localStorage
  const persistPlan = useCallback((newPlan: FinancialPlan) => {
    setPlan(newPlan);
    localStorage.setItem('finances-plan', JSON.stringify(newPlan));
  }, []);

  const persistTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('finances-transactions', JSON.stringify(newTransactions));
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

  const savingsRate = useMemo(() => {
    const savingsCategory = plan.categories.find(c => c.name === 'Savings');
    if (!savingsCategory || plan.actualIncome === 0) return 0;
    return Math.round((savingsCategory.actualAmount / plan.actualIncome) * 100);
  }, [plan.categories, plan.actualIncome]);

  const budgetUsedPercent = useMemo(() => {
    if (totalPlanned === 0) return 0;
    return Math.round((totalActual / totalPlanned) * 100);
  }, [totalPlanned, totalActual]);

  const value: FinancesContextType = {
    plan,
    transactions,
    updatePlannedIncome,
    updateActualIncome,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalPlanned,
    totalActual,
    remaining,
    savingsRate,
    budgetUsedPercent,
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
