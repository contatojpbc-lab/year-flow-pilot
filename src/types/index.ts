/**
 * ============================================
 * LIFE OS 2026 - DATA MODEL DOCUMENTATION
 * ============================================
 * 
 * This file defines all TypeScript interfaces for the Life OS system.
 * The model is designed for future persistence with yearly comparison support.
 * 
 * ENTITY RELATIONSHIPS:
 * ----------------------
 * 
 * ┌─────────────┐       ┌─────────────┐
 * │   LifeArea  │◄──────│    Goal     │  (Goal belongs to LifeArea)
 * └─────────────┘       └──────┬──────┘
 *                              │
 *                              ▼
 *                       ┌─────────────┐
 *                       │  Milestone  │  (Milestone belongs to Goal)
 *                       └─────────────┘
 * 
 * ┌─────────────┐       ┌─────────────┐
 * │RoutineItem  │───────►│    Goal     │  (Habit can be linked to Goal)
 * │  (Habit)    │       └─────────────┘
 * └──────┬──────┘
 *        │
 *        ▼
 * ┌─────────────┐
 * │ HabitEntry  │  (Daily completion record)
 * └─────────────┘
 * 
 * ┌─────────────┐       ┌─────────────┐
 * │   MVDItem   │───────►│DailyCheckIn │  (MVD completion impacts Streak)
 * └─────────────┘       └─────────────┘
 * 
 * ┌─────────────┐       ┌─────────────────────────────────────┐
 * │WeeklyReview │◄──────│ Consumes: Goals, Habits, MVD, Streak│
 * └─────────────┘       └─────────────────────────────────────┘
 * 
 * BUSINESS RULES:
 * ---------------
 * 1. Goals belong to exactly ONE LifeArea
 * 2. Habits (RoutineItems) can optionally be linked to ONE Goal
 * 3. Completing a linked Habit increases the Goal's progress proportionally
 * 4. MVD completion (100% items) increments the daily Streak
 * 5. Failing to complete MVD resets the Streak to 0
 * 6. Weekly Review automatically aggregates:
 *    - Most consistent habits of the week
 *    - Goals with highest/lowest progress
 *    - Number of days with MVD completed
 * 7. All entities include userId and year for multi-user and yearly comparison
 * 
 * REQUIRED FIELDS (BaseEntity):
 * -----------------------------
 * - id: Unique identifier (UUID)
 * - userId: Owner of the record
 * - year: Year for yearly comparison support
 * - createdAt: Creation timestamp
 * - updatedAt: Last modification timestamp
 */

// ============================================
// BASE ENTITY
// ============================================

/**
 * Base interface for all entities in the system.
 * Provides common fields for identification, ownership, and temporal tracking.
 */
export interface BaseEntity {
  id: string;
  userId: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LIFE AREAS
// ============================================

/**
 * Represents a life area (e.g., Health, Career, Relationships).
 * Goals are organized under life areas for better categorization.
 * 
 * @relationship Has many Goals
 */
export interface LifeArea extends BaseEntity {
  name: string;
  icon: string;
  color: string; // HEX or HSL color for visual representation
  description?: string;
}

// ============================================
// GOALS (SMART)
// ============================================

export type GoalStatus = 'planned' | 'active' | 'completed' | 'paused';

/**
 * Represents a SMART goal within the system.
 * 
 * SMART Criteria:
 * - Specific: Clear and well-defined objective
 * - Measurable: Quantifiable success criteria
 * - Achievable: Realistic and attainable
 * - Relevant: Aligned with life area and values
 * - Time-bound: Has a deadline
 * 
 * @relationship Belongs to LifeArea (via lifeAreaId)
 * @relationship Has many Milestones
 * @relationship Referenced by RoutineItems (habits)
 * @rule Progress increases when linked habits are completed
 */
export interface Goal extends BaseEntity {
  title: string;
  description: string;
  lifeAreaId: string; // Foreign key to LifeArea
  status: GoalStatus;
  // SMART fields
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: Date;
  // Progress tracking
  progress: number; // 0-100 percentage
  milestones: Milestone[];
}

/**
 * Represents a milestone within a goal.
 * Milestones break down goals into smaller, trackable achievements.
 * 
 * @relationship Belongs to Goal (via goalId)
 */
export interface Milestone extends BaseEntity {
  goalId: string; // Foreign key to Goal
  title: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

// ============================================
// ROUTINES AND HABITS
// ============================================

/**
 * Represents a habit or routine item that can be tracked daily.
 * Habits can optionally be linked to a Goal to contribute to its progress.
 * 
 * @relationship Can be linked to Goal (via linkedGoalId) - optional
 * @relationship Has many HabitEntries (daily completions)
 * @rule Completing a habit linked to a goal increases goal progress
 * @rule Unlinked habits only impact the daily streak
 */
export interface RoutineItem extends BaseEntity {
  title: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  linkedGoalId?: string; // Optional foreign key to Goal
  isActive: boolean;
  order: number; // Display order in the routine
}

/**
 * Represents a single completion entry for a habit on a specific date.
 * This enables historical tracking and consistency analysis.
 * 
 * @relationship Belongs to RoutineItem (via routineItemId)
 */
export interface HabitEntry extends BaseEntity {
  routineItemId: string; // Foreign key to RoutineItem
  date: Date;
  completed: boolean;
  notes?: string;
}

// ============================================
// MINIMUM VIABLE DAY (MVD)
// ============================================

/**
 * Represents an item in the Minimum Viable Day checklist.
 * MVD defines the absolute minimum daily actions for maintaining momentum.
 * 
 * @rule MVD resets automatically at midnight each day
 * @rule 100% MVD completion increments the daily streak
 * @rule Incomplete MVD prevents streak advancement
 */
export interface MVDItem extends BaseEntity {
  title: string;
  description?: string;
  order: number; // Display order
  isActive: boolean;
}

/**
 * Represents a daily check-in record, including MVD completion status.
 * Used for tracking daily progress and streak calculations.
 * 
 * @rule mvdCompleted = true only when ALL active MVD items are done
 * @rule Streak logic: consecutive days with mvdCompleted = true
 */
export interface DailyCheckIn extends BaseEntity {
  date: Date;
  completedItems: string[]; // Array of MVDItem IDs completed
  mvdCompleted: boolean; // True only if ALL items completed
  mood?: number; // 1-5 scale
  energyLevel?: number; // 1-5 scale
  notes?: string;
}

/**
 * Streak tracking for MVD completion.
 * Stored separately for efficient queries and persistence.
 */
export interface StreakData {
  userId: string;
  year: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date string
}

// ============================================
// WEEKLY REVIEW
// ============================================

/**
 * Represents a weekly review session with automated and manual data.
 * 
 * AUTOMATED DATA (consumed from the week):
 * - Most consistent habits
 * - Goals with highest/lowest progress gains
 * - Number of MVD-complete days
 * - Auto-generated summary text
 * 
 * MANUAL DATA (user input):
 * - What worked well
 * - What didn't work
 * - Improvements for next week
 * - Progress reflection
 * - Overall rating
 * 
 * @relationship Consumes data from: Goals, RoutineItems, HabitEntries, DailyCheckIn
 */
export interface WeeklyReview extends BaseEntity {
  weekNumber: number; // ISO week number (1-52)
  weekStartDate: Date;
  weekEndDate: Date;
  // Manual reflections
  whatWorked: string;
  whatDidntWork: string;
  improvements: string;
  progressReflection: string;
  // Tracking
  goalsReviewed: string[]; // Array of Goal IDs reviewed
  overallRating: number; // 1-5 stars
}

/**
 * Aggregated weekly statistics for the review.
 * Computed from the week's data, not stored permanently.
 */
export interface WeeklyStats {
  mvdCompletedDays: number; // Out of 7
  totalHabitsCompleted: number;
  avgHabitConsistency: number; // 0-100%
  goalsWithProgress: Array<{
    goalId: string;
    goalTitle: string;
    weeklyGain: number; // Progress gained this week
  }>;
  mostConsistentHabits: Array<{
    habitId: string;
    habitTitle: string;
    completionRate: number; // 0-100%
  }>;
}

// ============================================
// FINANCES
// ============================================

/**
 * Represents a monthly financial plan with income and expense tracking.
 */
export interface FinancialPlan extends BaseEntity {
  month: number; // 1-12
  plannedIncome: number;
  actualIncome: number;
  categories: ExpenseCategory[];
}

/**
 * Represents an expense category within a financial plan.
 */
export interface ExpenseCategory extends BaseEntity {
  financialPlanId: string; // Foreign key to FinancialPlan
  name: string;
  plannedAmount: number;
  actualAmount: number;
  color: string;
}

/**
 * Represents a single financial transaction.
 */
export interface Transaction extends BaseEntity {
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string; // Optional foreign key to ExpenseCategory
  description: string;
  isRecurring: boolean;
}

/**
 * Represents a financial goal (savings, investment, etc.).
 */
export interface FinancialGoal extends BaseEntity {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  type: 'savings' | 'investment' | 'debt_payoff' | 'purchase';
}

// ============================================
// JOURNAL
// ============================================

/**
 * Represents a journal entry for personal reflection.
 * Can be linked to goals for contextual journaling.
 */
export interface JournalEntry extends BaseEntity {
  date: Date;
  title?: string;
  content: string;
  mood?: number; // 1-5 scale
  tags: string[];
  linkedGoalIds?: string[]; // Optional links to related goals
}

// ============================================
// REMINDERS
// ============================================

export type ReminderType = 'goal' | 'routine' | 'review' | 'custom';
export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

/**
 * Represents a reminder/notification in the system.
 * Can be linked to goals, routines, or reviews.
 */
export interface Reminder extends BaseEntity {
  title: string;
  description?: string;
  type: ReminderType;
  linkedEntityId?: string; // Foreign key to related entity
  scheduledDate: Date;
  frequency: ReminderFrequency;
  isActive: boolean;
  notificationSent: boolean;
}

// ============================================
// USER SETTINGS
// ============================================

/**
 * Represents user preferences and settings.
 */
export interface UserSettings extends BaseEntity {
  displayName: string;
  email: string;
  timezone: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  weekStartsOn: 'sunday' | 'monday';
  theme: 'dark' | 'light' | 'system';
}

// ============================================
// DASHBOARD AGGREGATES
// ============================================

/**
 * Aggregated statistics for the dashboard display.
 * Computed on-demand, not stored.
 */
export interface DashboardStats {
  goalsProgress: number; // Average progress across all active goals
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
  todayMVDCompleted: boolean;
  weeklyReviewsDone: number;
  monthlyBudgetUsed: number;
  monthlyBudgetTotal: number;
}

// ============================================
// DATA MODEL VERSION
// ============================================

/**
 * Version tracking for future migrations.
 */
export const DATA_MODEL_VERSION = '1.0.0';

/**
 * Entity relationship summary for quick reference:
 * 
 * LifeArea (1) ─────► (N) Goal
 * Goal (1) ──────────► (N) Milestone
 * Goal (1) ◄────────── (N) RoutineItem (optional link)
 * RoutineItem (1) ───► (N) HabitEntry
 * MVDItem (N) ────────► (1) DailyCheckIn (via completedItems array)
 * WeeklyReview ◄────── Aggregates from all entities
 */
