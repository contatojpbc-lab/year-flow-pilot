-- Subscription status enum
create type public.subscription_status as enum ('trial', 'active', 'expired');

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  trial_ends_at timestamptz not null default (now() + interval '30 days'),
  status subscription_status not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users view own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on public.subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.subscriptions for update
  to authenticated
  using (auth.uid() = user_id);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Update handle_new_user to also seed subscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_year integer := extract(year from now());
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_roles (user_id, role) values (new.id, 'user');

  insert into public.subscriptions (user_id, trial_ends_at, status)
  values (new.id, now() + interval '30 days', 'trial');

  insert into public.life_areas (user_id, year, name, icon, color, description, sort_order) values
    (new.id, current_year, 'Saúde & Bem-estar',  'Heart',      'hsl(160 84% 45%)', 'Corpo, mente e energia diária',          1),
    (new.id, current_year, 'Carreira & Trabalho','Briefcase',  'hsl(217 91% 60%)', 'Crescimento profissional e impacto',     2),
    (new.id, current_year, 'Finanças',           'DollarSign', 'hsl(38 92% 50%)',  'Renda, gastos e independência financeira',3),
    (new.id, current_year, 'Relacionamentos',    'Users',      'hsl(340 82% 52%)', 'Família, amigos e conexões',             4),
    (new.id, current_year, 'Crescimento Pessoal','Sparkles',   'hsl(280 67% 55%)', 'Aprendizado e evolução interna',         5);

  insert into public.mvd_items (user_id, year, title, description, sort_order, is_active) values
    (new.id, current_year, 'Mover o corpo por 20+ min', 'Caminhada, corrida ou treino',     1, true),
    (new.id, current_year, 'Beber 8 copos de água',     'Hidratação ao longo do dia',       2, true),
    (new.id, current_year, 'Sem celular na 1ª hora',     'Comece o dia sem distrações',     3, true),
    (new.id, current_year, '7+ horas de sono',           'Dormir cedo, acordar descansado', 4, true);

  return new;
end;
$function$;

-- Backfill subscriptions for existing users
insert into public.subscriptions (user_id, trial_ends_at, status)
select id, now() + interval '30 days', 'trial'
from auth.users
where id not in (select user_id from public.subscriptions);
