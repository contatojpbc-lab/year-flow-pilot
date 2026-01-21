import {
  LifeArea,
  Goal,
  RoutineItem,
  DailyCheckIn,
  WeeklyReview,
  MVDItem,
  FinancialPlan,
  Transaction,
  JournalEntry,
  Reminder,
  DashboardStats
} from '@/types';

const now = new Date();
const userId = 'user-1';
const year = 2026;

export const mockLifeAreas: LifeArea[] = [
  {
    id: 'area-1',
    userId,
    year,
    name: 'Health & Fitness',
    icon: 'Heart',
    color: 'hsl(160 84% 45%)',
    description: 'Physical and mental wellbeing',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'area-2',
    userId,
    year,
    name: 'Career & Work',
    icon: 'Briefcase',
    color: 'hsl(217 91% 60%)',
    description: 'Professional growth and achievements',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'area-3',
    userId,
    year,
    name: 'Finances',
    icon: 'DollarSign',
    color: 'hsl(38 92% 50%)',
    description: 'Financial health and goals',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'area-4',
    userId,
    year,
    name: 'Relationships',
    icon: 'Users',
    color: 'hsl(340 82% 52%)',
    description: 'Family, friends, and connections',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'area-5',
    userId,
    year,
    name: 'Personal Growth',
    icon: 'Sparkles',
    color: 'hsl(280 67% 55%)',
    description: 'Learning and self-improvement',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    userId,
    year,
    title: 'Run a Half Marathon',
    description: 'Complete a half marathon race by end of year',
    lifeAreaId: 'area-1',
    status: 'active',
    specific: 'Complete a 21.1km half marathon race',
    measurable: 'Finish the race, track training progress weekly',
    achievable: 'Currently running 5km, will build up gradually',
    relevant: 'Improves cardiovascular health and mental discipline',
    timeBound: new Date('2026-10-15'),
    progress: 35,
    milestones: [
      { id: 'ms-1', goalId: 'goal-1', userId, year, title: 'Run 10km without stopping', dueDate: new Date('2026-04-01'), completed: true, completedAt: new Date('2026-03-28'), createdAt: now, updatedAt: now },
      { id: 'ms-2', goalId: 'goal-1', userId, year, title: 'Complete 15km training run', dueDate: new Date('2026-07-01'), completed: false, createdAt: now, updatedAt: now },
      { id: 'ms-3', goalId: 'goal-1', userId, year, title: 'Register for race', dueDate: new Date('2026-08-01'), completed: false, createdAt: now, updatedAt: now },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'goal-2',
    userId,
    year,
    title: 'Save Emergency Fund',
    description: 'Build a 6-month emergency fund',
    lifeAreaId: 'area-3',
    status: 'active',
    specific: 'Save $15,000 for emergency fund',
    measurable: 'Track monthly savings, target $1,250/month',
    achievable: 'Based on current income and expenses',
    relevant: 'Financial security and peace of mind',
    timeBound: new Date('2026-12-31'),
    progress: 45,
    milestones: [
      { id: 'ms-4', goalId: 'goal-2', userId, year, title: 'Save first $5,000', dueDate: new Date('2026-04-30'), completed: true, completedAt: new Date('2026-04-15'), createdAt: now, updatedAt: now },
      { id: 'ms-5', goalId: 'goal-2', userId, year, title: 'Reach $10,000', dueDate: new Date('2026-08-31'), completed: false, createdAt: now, updatedAt: now },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'goal-3',
    userId,
    year,
    title: 'Learn Spanish B1',
    description: 'Achieve B1 level Spanish proficiency',
    lifeAreaId: 'area-5',
    status: 'active',
    specific: 'Pass B1 Spanish certification exam',
    measurable: 'Complete lessons, track vocabulary, practice speaking',
    achievable: 'Currently A2 level, 30 min daily practice',
    relevant: 'Travel, cultural connection, brain health',
    timeBound: new Date('2026-09-30'),
    progress: 20,
    milestones: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const mockRoutineItems: RoutineItem[] = [
  { id: 'routine-1', userId, year, title: 'Morning meditation', description: '10 minutes of mindfulness', timeOfDay: 'morning', isActive: true, order: 1, createdAt: now, updatedAt: now },
  { id: 'routine-2', userId, year, title: 'Exercise', description: 'Gym or running', timeOfDay: 'morning', linkedGoalId: 'goal-1', isActive: true, order: 2, createdAt: now, updatedAt: now },
  { id: 'routine-3', userId, year, title: 'Spanish practice', description: '30 minutes Duolingo + speaking', timeOfDay: 'afternoon', linkedGoalId: 'goal-3', isActive: true, order: 3, createdAt: now, updatedAt: now },
  { id: 'routine-4', userId, year, title: 'Read for 30 min', description: 'Non-fiction or learning', timeOfDay: 'evening', isActive: true, order: 4, createdAt: now, updatedAt: now },
  { id: 'routine-5', userId, year, title: 'Evening reflection', description: 'Journal or gratitude', timeOfDay: 'evening', isActive: true, order: 5, createdAt: now, updatedAt: now },
];

export const mockMVDItems: MVDItem[] = [
  { id: 'mvd-1', userId, year, title: 'Move body for 20+ min', order: 1, isActive: true, createdAt: now, updatedAt: now },
  { id: 'mvd-2', userId, year, title: 'Drink 8 glasses of water', order: 2, isActive: true, createdAt: now, updatedAt: now },
  { id: 'mvd-3', userId, year, title: 'No phone first hour', order: 3, isActive: true, createdAt: now, updatedAt: now },
  { id: 'mvd-4', userId, year, title: '7+ hours sleep', order: 4, isActive: true, createdAt: now, updatedAt: now },
];

export const mockDailyCheckIn: DailyCheckIn = {
  id: 'checkin-1',
  userId,
  year,
  date: now,
  completedItems: ['routine-1', 'routine-2', 'routine-4'],
  mvdCompleted: true,
  mood: 4,
  energyLevel: 4,
  notes: 'Great morning run, feeling energized!',
  createdAt: now,
  updatedAt: now,
};

export const mockWeeklyReviews: WeeklyReview[] = [
  {
    id: 'review-1',
    userId,
    year,
    weekNumber: 3,
    weekStartDate: new Date('2026-01-13'),
    weekEndDate: new Date('2026-01-19'),
    whatWorked: 'Morning routine consistency, hitting workout goals',
    whatDidntWork: 'Spanish practice dropped off mid-week',
    improvements: 'Set specific time for Spanish, use calendar blocks',
    progressReflection: 'Solid week overall, need to maintain momentum',
    goalsReviewed: ['goal-1', 'goal-3'],
    overallRating: 4,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockFinancialPlan: FinancialPlan = {
  id: 'plan-1',
  userId,
  year,
  month: 1,
  plannedIncome: 6500,
  actualIncome: 6750,
  categories: [
    { id: 'cat-1', financialPlanId: 'plan-1', userId, year, name: 'Housing', plannedAmount: 1800, actualAmount: 1800, color: 'hsl(217 91% 60%)', createdAt: now, updatedAt: now },
    { id: 'cat-2', financialPlanId: 'plan-1', userId, year, name: 'Food & Dining', plannedAmount: 600, actualAmount: 720, color: 'hsl(38 92% 50%)', createdAt: now, updatedAt: now },
    { id: 'cat-3', financialPlanId: 'plan-1', userId, year, name: 'Transportation', plannedAmount: 300, actualAmount: 280, color: 'hsl(160 84% 45%)', createdAt: now, updatedAt: now },
    { id: 'cat-4', financialPlanId: 'plan-1', userId, year, name: 'Savings', plannedAmount: 1500, actualAmount: 1500, color: 'hsl(280 67% 55%)', createdAt: now, updatedAt: now },
    { id: 'cat-5', financialPlanId: 'plan-1', userId, year, name: 'Entertainment', plannedAmount: 200, actualAmount: 185, color: 'hsl(340 82% 52%)', createdAt: now, updatedAt: now },
  ],
  createdAt: now,
  updatedAt: now,
};

export const mockTransactions: Transaction[] = [
  { id: 'tx-1', userId, year, date: new Date('2026-01-20'), amount: 1800, type: 'expense', categoryId: 'cat-1', description: 'Monthly rent', isRecurring: true, createdAt: now, updatedAt: now },
  { id: 'tx-2', userId, year, date: new Date('2026-01-19'), amount: 85, type: 'expense', categoryId: 'cat-2', description: 'Grocery shopping', isRecurring: false, createdAt: now, updatedAt: now },
  { id: 'tx-3', userId, year, date: new Date('2026-01-18'), amount: 45, type: 'expense', categoryId: 'cat-2', description: 'Dinner out', isRecurring: false, createdAt: now, updatedAt: now },
  { id: 'tx-4', userId, year, date: new Date('2026-01-17'), amount: 6750, type: 'income', description: 'Salary', isRecurring: true, createdAt: now, updatedAt: now },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    userId,
    year,
    date: new Date('2026-01-20'),
    title: 'New beginnings',
    content: "Started the year strong. The morning routine is becoming more natural now. I'm excited about my goals for this year and feel more focused than ever. The half marathon goal feels ambitious but achievable.",
    mood: 4,
    tags: ['motivation', 'goals', 'reflection'],
    linkedGoalIds: ['goal-1'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'journal-2',
    userId,
    year,
    date: new Date('2026-01-15'),
    title: 'Week 2 reflections',
    content: "Hit a small roadblock with Spanish practice this week. Need to find better ways to stay consistent. The financial tracking is going well though - seeing the numbers helps keep me motivated.",
    mood: 3,
    tags: ['challenges', 'learning'],
    linkedGoalIds: ['goal-3'],
    createdAt: now,
    updatedAt: now,
  },
];

export const mockReminders: Reminder[] = [
  { id: 'rem-1', userId, year, title: 'Weekly review', description: 'Complete your weekly review', type: 'review', scheduledDate: new Date('2026-01-26'), frequency: 'weekly', isActive: true, notificationSent: false, createdAt: now, updatedAt: now },
  { id: 'rem-2', userId, year, title: 'Spanish practice', description: 'Time for daily Spanish!', type: 'routine', linkedEntityId: 'routine-3', scheduledDate: now, frequency: 'daily', isActive: true, notificationSent: false, createdAt: now, updatedAt: now },
  { id: 'rem-3', userId, year, title: 'Register for half marathon', type: 'goal', linkedEntityId: 'goal-1', scheduledDate: new Date('2026-07-15'), frequency: 'once', isActive: true, notificationSent: false, createdAt: now, updatedAt: now },
];

export const mockDashboardStats: DashboardStats = {
  goalsProgress: 33,
  activeGoals: 3,
  completedGoals: 0,
  currentStreak: 12,
  longestStreak: 21,
  todayMVDCompleted: true,
  weeklyReviewsDone: 3,
  monthlyBudgetUsed: 4485,
  monthlyBudgetTotal: 6500,
};
