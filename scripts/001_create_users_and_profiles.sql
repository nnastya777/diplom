-- Создание таблицы профилей сотрудников
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  position text not null,
  department text not null,
  hire_date date not null,
  role text not null check (role in ('employee', 'manager', 'admin')),
  phone text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Включение RLS
alter table public.profiles enable row level security;

-- Политики доступа для профилей
create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (
    auth.uid() = id OR 
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Триггер для автоматического создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, position, department, hire_date, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Новый сотрудник'),
    coalesce(new.raw_user_meta_data ->> 'position', 'Должность не указана'),
    coalesce(new.raw_user_meta_data ->> 'department', 'Отдел не указан'),
    coalesce((new.raw_user_meta_data ->> 'hire_date')::date, current_date),
    coalesce(new.raw_user_meta_data ->> 'role', 'employee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Триггер для обновления updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
