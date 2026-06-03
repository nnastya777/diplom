-- Таблица учета отработанного времени
create table if not exists public.work_hours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  regular_hours decimal(4,2) default 0 check (regular_hours >= 0 and regular_hours <= 24),
  overtime_hours decimal(4,2) default 0 check (overtime_hours >= 0 and overtime_hours <= 24),
  break_hours decimal(4,2) default 0 check (break_hours >= 0 and break_hours <= 24),
  total_hours decimal(4,2) generated always as (regular_hours + overtime_hours - break_hours) stored,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Включение RLS
alter table public.work_hours enable row level security;

-- Политики доступа (аналогичны attendance)
create policy "work_hours_select_own_or_manager"
  on public.work_hours for select
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "work_hours_insert_own"
  on public.work_hours for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "work_hours_update_own_or_admin"
  on public.work_hours for update
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Триггер для обновления updated_at
create trigger work_hours_updated_at
  before update on public.work_hours
  for each row
  execute function public.handle_updated_at();

-- Индексы
create index idx_work_hours_user_date on public.work_hours(user_id, date desc);
