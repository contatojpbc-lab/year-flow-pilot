-- ============================================
-- MVD ITEMS
-- ============================================
create table public.mvd_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mvd_items enable row level security;

create policy "Users view own mvd_items" on public.mvd_items for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own mvd_items" on public.mvd_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own mvd_items" on public.mvd_items for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own mvd_items" on public.mvd_items for delete to authenticated using (auth.uid() = user_id);

create trigger mvd_items_set_updated_at before update on public.mvd_items
  for each row execute function public.set_updated_at();

create index idx_mvd_items_user_id on public.mvd_items(user_id);

-- ============================================
-- MVD CHECK-INS (one per day per user)
-- ============================================
create table public.mvd_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  check_in_date date not null,
  completed_item_ids uuid[] not null default '{}',
  mvd_completed boolean not null default false,
  mood integer check (mood between 1 and 5),
  energy_level integer check (energy_level between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, check_in_date)
);

alter table public.mvd_check_ins enable row level security;

create policy "Users view own mvd_check_ins" on public.mvd_check_ins for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own mvd_check_ins" on public.mvd_check_ins for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own mvd_check_ins" on public.mvd_check_ins for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own mvd_check_ins" on public.mvd_check_ins for delete to authenticated using (auth.uid() = user_id);

create trigger mvd_check_ins_set_updated_at before update on public.mvd_check_ins
  for each row execute function public.set_updated_at();

create index idx_mvd_check_ins_user_id_date on public.mvd_check_ins(user_id, check_in_date desc);

-- ============================================
-- FINANCIAL PLANS (one per month per user)
-- ============================================
create table public.financial_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  month integer not null check (month between 1 and 12),
  planned_income numeric not null default 0,
  actual_income numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.financial_plans enable row level security;

create policy "Users view own financial_plans" on public.financial_plans for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own financial_plans" on public.financial_plans for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own financial_plans" on public.financial_plans for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own financial_plans" on public.financial_plans for delete to authenticated using (auth.uid() = user_id);

create trigger financial_plans_set_updated_at before update on public.financial_plans
  for each row execute function public.set_updated_at();

create index idx_financial_plans_user on public.financial_plans(user_id, year, month);

-- ============================================
-- EXPENSE CATEGORIES
-- ============================================
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  financial_plan_id uuid not null references public.financial_plans(id) on delete cascade,
  name text not null,
  planned_amount numeric not null default 0,
  color text not null default 'hsl(217 91% 60%)',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expense_categories enable row level security;

create policy "Users view own expense_categories" on public.expense_categories for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own expense_categories" on public.expense_categories for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own expense_categories" on public.expense_categories for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own expense_categories" on public.expense_categories for delete to authenticated using (auth.uid() = user_id);

create trigger expense_categories_set_updated_at before update on public.expense_categories
  for each row execute function public.set_updated_at();

create index idx_expense_categories_plan on public.expense_categories(financial_plan_id);

-- ============================================
-- TRANSACTIONS
-- ============================================
create type public.transaction_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  financial_plan_id uuid references public.financial_plans(id) on delete set null,
  transaction_date date not null default current_date,
  amount numeric not null,
  type public.transaction_type not null,
  category_id uuid references public.expense_categories(id) on delete set null,
  description text not null default '',
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users view own transactions" on public.transactions for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own transactions" on public.transactions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own transactions" on public.transactions for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own transactions" on public.transactions for delete to authenticated using (auth.uid() = user_id);

create trigger transactions_set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

create index idx_transactions_user on public.transactions(user_id, transaction_date desc);
create index idx_transactions_category on public.transactions(category_id);
create index idx_transactions_plan on public.transactions(financial_plan_id);

-- ============================================
-- FINANCIAL GOALS
-- ============================================
create type public.financial_goal_type as enum ('savings', 'investment', 'debt_payoff', 'purchase');

create table public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  title text not null,
  type public.financial_goal_type not null default 'savings',
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  monthly_contribution numeric not null default 0,
  deadline timestamptz,
  expected_return_rate numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_goals enable row level security;

create policy "Users view own financial_goals" on public.financial_goals for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own financial_goals" on public.financial_goals for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own financial_goals" on public.financial_goals for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own financial_goals" on public.financial_goals for delete to authenticated using (auth.uid() = user_id);

create trigger financial_goals_set_updated_at before update on public.financial_goals
  for each row execute function public.set_updated_at();

create index idx_financial_goals_user on public.financial_goals(user_id);

-- ============================================
-- GOAL CONTRIBUTIONS
-- ============================================
create type public.contribution_type as enum ('manual', 'scheduled', 'investment_return');

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  goal_id uuid not null references public.financial_goals(id) on delete cascade,
  amount numeric not null,
  contribution_date timestamptz not null default now(),
  type public.contribution_type not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goal_contributions enable row level security;

create policy "Users view own goal_contributions" on public.goal_contributions for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own goal_contributions" on public.goal_contributions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own goal_contributions" on public.goal_contributions for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own goal_contributions" on public.goal_contributions for delete to authenticated using (auth.uid() = user_id);

create trigger goal_contributions_set_updated_at before update on public.goal_contributions
  for each row execute function public.set_updated_at();

create index idx_goal_contributions_goal on public.goal_contributions(goal_id);

-- ============================================
-- MONTHLY SNAPSHOTS (HISTORY)
-- ============================================
create table public.monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null,
  month integer not null check (month between 1 and 12),
  -- Goals
  goals_average_progress numeric not null default 0,
  goals_active_count integer not null default 0,
  goals_completed_count integer not null default 0,
  -- Habits
  habits_consistency_rate numeric not null default 0,
  habits_total_completed integer not null default 0,
  -- MVD
  mvd_completion_rate numeric not null default 0,
  mvd_completed_days integer not null default 0,
  mvd_longest_streak integer not null default 0,
  -- Finances
  finances_savings_rate numeric not null default 0,
  finances_budget_adherence numeric not null default 0,
  finances_total_spent numeric not null default 0,
  -- Per-life-area aggregate (jsonb of [{lifeAreaId, name, color, goalsProgress, habitsConsistency, overallScore}])
  life_areas_breakdown jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.monthly_snapshots enable row level security;

create policy "Users view own monthly_snapshots" on public.monthly_snapshots for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own monthly_snapshots" on public.monthly_snapshots for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own monthly_snapshots" on public.monthly_snapshots for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own monthly_snapshots" on public.monthly_snapshots for delete to authenticated using (auth.uid() = user_id);

create trigger monthly_snapshots_set_updated_at before update on public.monthly_snapshots
  for each row execute function public.set_updated_at();

create index idx_monthly_snapshots_user on public.monthly_snapshots(user_id, year, month desc);

-- ============================================
-- UPDATE handle_new_user TO SEED MVD ITEMS
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  current_year integer := extract(year from now());
begin
  -- Profile
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Default user role
  insert into public.user_roles (user_id, role) values (new.id, 'user');

  -- Seed life areas (5)
  insert into public.life_areas (user_id, year, name, icon, color, description, sort_order) values
    (new.id, current_year, 'Saúde & Bem-estar',  'Heart',      'hsl(160 84% 45%)', 'Corpo, mente e energia diária',          1),
    (new.id, current_year, 'Carreira & Trabalho','Briefcase',  'hsl(217 91% 60%)', 'Crescimento profissional e impacto',     2),
    (new.id, current_year, 'Finanças',           'DollarSign', 'hsl(38 92% 50%)',  'Renda, gastos e independência financeira',3),
    (new.id, current_year, 'Relacionamentos',    'Users',      'hsl(340 82% 52%)', 'Família, amigos e conexões',             4),
    (new.id, current_year, 'Crescimento Pessoal','Sparkles',   'hsl(280 67% 55%)', 'Aprendizado e evolução interna',         5);

  -- Seed default MVD items (4)
  insert into public.mvd_items (user_id, year, title, description, sort_order, is_active) values
    (new.id, current_year, 'Mover o corpo por 20+ min', 'Caminhada, corrida ou treino',     1, true),
    (new.id, current_year, 'Beber 8 copos de água',     'Hidratação ao longo do dia',       2, true),
    (new.id, current_year, 'Sem celular na 1ª hora',     'Comece o dia sem distrações',     3, true),
    (new.id, current_year, '7+ horas de sono',           'Dormir cedo, acordar descansado', 4, true);

  return new;
end;
$function$;