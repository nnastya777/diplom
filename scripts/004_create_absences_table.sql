-- Таблица учета отпусков, больничных и командировок
create table if not exists public.absences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('vacation', 'sick_leave', 'business_trip', 'unpaid_leave', 'other')),
  start_date date not null,
  end_date date not null,
  days_count int generated always as (end_date - start_date + 1) stored,
  status text not null check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  documents jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (end_date >= start_date)
);

-- Включение RLS
alter table public.absences enable row level security;

-- Политики доступа
create policy "absences_select_own_or_manager"
  on public.absences for select
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "absences_insert_own"
  on public.absences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "absences_update_own_or_manager"
  on public.absences for update
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

-- Триггер для обновления updated_at
create trigger absences_updated_at
  before update on public.absences
  for each row
  execute function public.handle_updated_at();

-- Индексы
create index idx_absences_user_id on public.absences(user_id);
create index idx_absences_dates on public.absences(start_date, end_date);
create index idx_absences_status on public.absences(status);
