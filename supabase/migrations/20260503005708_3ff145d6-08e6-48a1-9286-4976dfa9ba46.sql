
-- Journal entries
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  entry_date date not null default current_date,
  title text not null default '',
  content text not null default '',
  mood integer,
  tags text[] not null default '{}',
  linked_goal_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.journal_entries enable row level security;
create policy "Users view own journal_entries" on public.journal_entries for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own journal_entries" on public.journal_entries for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own journal_entries" on public.journal_entries for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own journal_entries" on public.journal_entries for delete to authenticated using (auth.uid() = user_id);
create trigger journal_entries_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();
create index idx_journal_entries_user_date on public.journal_entries(user_id, entry_date desc);

-- Reminders
do $$ begin
  create type public.reminder_type as enum ('goal','routine','review','custom');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.reminder_frequency as enum ('once','daily','weekly','monthly');
exception when duplicate_object then null; end $$;

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  title text not null,
  description text,
  type public.reminder_type not null default 'custom',
  linked_entity_id uuid,
  scheduled_date timestamptz not null default now(),
  frequency public.reminder_frequency not null default 'once',
  is_active boolean not null default true,
  notification_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reminders enable row level security;
create policy "Users view own reminders" on public.reminders for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own reminders" on public.reminders for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own reminders" on public.reminders for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own reminders" on public.reminders for delete to authenticated using (auth.uid() = user_id);
create trigger reminders_updated_at before update on public.reminders for each row execute function public.set_updated_at();

-- Weekly reviews
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  year integer not null default extract(year from now()),
  week_number integer not null,
  week_start_date date not null,
  week_end_date date not null,
  what_worked text not null default '',
  what_didnt_work text not null default '',
  improvements text not null default '',
  progress_reflection text not null default '',
  goals_reviewed uuid[] not null default '{}',
  overall_rating integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.weekly_reviews enable row level security;
create policy "Users view own weekly_reviews" on public.weekly_reviews for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own weekly_reviews" on public.weekly_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own weekly_reviews" on public.weekly_reviews for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own weekly_reviews" on public.weekly_reviews for delete to authenticated using (auth.uid() = user_id);
create trigger weekly_reviews_updated_at before update on public.weekly_reviews for each row execute function public.set_updated_at();
create unique index idx_weekly_reviews_user_week on public.weekly_reviews(user_id, year, week_number);
