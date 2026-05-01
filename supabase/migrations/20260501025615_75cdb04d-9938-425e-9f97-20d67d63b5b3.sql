
-- =====================================================
-- 1. ROLES ENUM + user_roles table (security separation)
-- =====================================================
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function (avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 2. PROFILES table
-- =====================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================
-- 3. LIFE_AREAS table (per-user)
-- =====================================================
create table public.life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null default extract(year from now()),
  name text not null,
  icon text not null default 'Sparkles',
  color text not null default 'hsl(160 84% 45%)',
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.life_areas enable row level security;

create policy "Users can view their own life areas"
  on public.life_areas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own life areas"
  on public.life_areas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own life areas"
  on public.life_areas for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own life areas"
  on public.life_areas for delete
  to authenticated
  using (auth.uid() = user_id);

create trigger life_areas_set_updated_at
  before update on public.life_areas
  for each row execute function public.set_updated_at();

create index idx_life_areas_user on public.life_areas(user_id);

-- =====================================================
-- 4. SIGNUP TRIGGER — seed profile + role + default areas
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from now());
begin
  -- Create profile
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  -- Seed 5 default life areas (generic, in Portuguese)
  insert into public.life_areas (user_id, year, name, icon, color, description, sort_order) values
    (new.id, current_year, 'Saúde & Bem-estar',  'Heart',      'hsl(160 84% 45%)', 'Corpo, mente e energia diária',          1),
    (new.id, current_year, 'Carreira & Trabalho','Briefcase',  'hsl(217 91% 60%)', 'Crescimento profissional e impacto',     2),
    (new.id, current_year, 'Finanças',           'DollarSign', 'hsl(38 92% 50%)',  'Renda, gastos e independência financeira',3),
    (new.id, current_year, 'Relacionamentos',    'Users',      'hsl(340 82% 52%)', 'Família, amigos e conexões',             4),
    (new.id, current_year, 'Crescimento Pessoal','Sparkles',   'hsl(280 67% 55%)', 'Aprendizado e evolução interna',         5);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
