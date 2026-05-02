-- ============================================
-- GOALS (SMART)
-- ============================================
create type public.goal_status as enum ('planned', 'active', 'completed', 'paused');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  life_area_id uuid references public.life_areas(id) on delete set null,
  title text not null,
  description text not null default '',
  status public.goal_status not null default 'planned',
  specific text not null default '',
  measurable text not null default '',
  achievable text not null default '',
  relevant text not null default '',
  time_bound timestamptz,
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can view their own goals" on public.goals
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own goals" on public.goals
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own goals" on public.goals
  for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own goals" on public.goals
  for delete to authenticated using (auth.uid() = user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create index idx_goals_user_id on public.goals(user_id);
create index idx_goals_life_area_id on public.goals(life_area_id);

-- ============================================
-- MILESTONES
-- ============================================
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.milestones enable row level security;

create policy "Users can view their own milestones" on public.milestones
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own milestones" on public.milestones
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own milestones" on public.milestones
  for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own milestones" on public.milestones
  for delete to authenticated using (auth.uid() = user_id);

create trigger milestones_set_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

create index idx_milestones_goal_id on public.milestones(goal_id);
create index idx_milestones_user_id on public.milestones(user_id);

-- ============================================
-- ROUTINE ITEMS (HABITS)
-- ============================================
create type public.time_of_day as enum ('morning', 'afternoon', 'evening', 'anytime');

create table public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  title text not null,
  description text,
  time_of_day public.time_of_day not null default 'anytime',
  linked_goal_id uuid references public.goals(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routine_items enable row level security;

create policy "Users can view their own routine items" on public.routine_items
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own routine items" on public.routine_items
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own routine items" on public.routine_items
  for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own routine items" on public.routine_items
  for delete to authenticated using (auth.uid() = user_id);

create trigger routine_items_set_updated_at
  before update on public.routine_items
  for each row execute function public.set_updated_at();

create index idx_routine_items_user_id on public.routine_items(user_id);
create index idx_routine_items_linked_goal_id on public.routine_items(linked_goal_id);

-- ============================================
-- HABIT ENTRIES (Daily completions)
-- ============================================
create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  routine_item_id uuid not null references public.routine_items(id) on delete cascade,
  entry_date date not null,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (routine_item_id, entry_date)
);

alter table public.habit_entries enable row level security;

create policy "Users can view their own habit entries" on public.habit_entries
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own habit entries" on public.habit_entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own habit entries" on public.habit_entries
  for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own habit entries" on public.habit_entries
  for delete to authenticated using (auth.uid() = user_id);

create trigger habit_entries_set_updated_at
  before update on public.habit_entries
  for each row execute function public.set_updated_at();

create index idx_habit_entries_user_id on public.habit_entries(user_id);
create index idx_habit_entries_routine_item_id on public.habit_entries(routine_item_id);
create index idx_habit_entries_date on public.habit_entries(entry_date);