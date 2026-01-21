// Base interface for all entities
export interface BaseEntity {
  id: string;
  userId: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// Life Areas
export interface LifeArea extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  description?: string;
}

// Goals with SMART structure
export type GoalStatus = 'planned' | 'active' | 'completed' | 'paused';

export interface Goal extends BaseEntity {
  title: string;
  description: string;
  lifeAreaId: string;
  status: GoalStatus;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: Date;
  progress: number; // 0-100
  milestones: Milestone[];
}

export interface Milestone extends BaseEntity {
  goalId: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

// Routines and Habits
export interface RoutineItem extends BaseEntity {
  title: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  linkedGoalId?: string;
  isActive: boolean;
  order: number;
}

export interface HabitEntry extends BaseEntity {
  routineItemId: string;
  date: Date;
  completed: boolean;
  notes?: string;
}

// Daily Check-ins
export interface DailyCheckIn extends BaseEntity {
  date: Date;
  completedItems: string[];
  mvdCompleted: boolean;
  mood?: number; // 1-5
  energyLevel?: number; // 1-5
  notes?: string;
}

// Weekly Reviews
export interface WeeklyReview extends BaseEntity {
  weekNumber: number;
  weekStartDate: Date;
  weekEndDate: Date;
  whatWorked: string;
  whatDidntWork: string;
  improvements: string;
  progressReflection: string;
  goalsReviewed: string[];
  overallRating: number; // 1-5
}

// Minimum Viable Day
export interface MVDItem extends BaseEntity {
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
}

// Finances
export interface FinancialPlan extends BaseEntity {
  month: number; // 1-12
  plannedIncome: number;
  actualIncome: number;
  categories: ExpenseCategory[];
}

export interface ExpenseCategory extends BaseEntity {
  financialPlanId: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  color: string;
}

export interface Transaction extends BaseEntity {
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  description: string;
  isRecurring: boolean;
}

export interface FinancialGoal extends BaseEntity {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  type: 'savings' | 'investment' | 'debt_payoff' | 'purchase';
}

// Journal
export interface JournalEntry extends BaseEntity {
  date: Date;
  title?: string;
  content: string;
  mood?: number;
  tags: string[];
  linkedGoalIds?: string[];
}

// Reminders
export type ReminderType = 'goal' | 'routine' | 'review' | 'custom';
export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Reminder extends BaseEntity {
  title: string;
  description?: string;
  type: ReminderType;
  linkedEntityId?: string;
  scheduledDate: Date;
  frequency: ReminderFrequency;
  isActive: boolean;
  notificationSent: boolean;
}

// Settings
export interface UserSettings extends BaseEntity {
  displayName: string;
  email: string;
  timezone: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  weekStartsOn: 'sunday' | 'monday';
  theme: 'dark' | 'light' | 'system';
}

// Dashboard Stats
export interface DashboardStats {
  goalsProgress: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
  todayMVDCompleted: boolean;
  weeklyReviewsDone: number;
  monthlyBudgetUsed: number;
  monthlyBudgetTotal: number;
}
