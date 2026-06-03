-- Таблица учета явок/неявок
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null check (status in ('present', 'absent', 'late', 'early_leave', 'remote')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Включение RLS
alter table public.attendance enable row level security;

-- Политики доступа
create policy "attendance_select_own_or_manager"
  on public.attendance for select
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "attendance_insert_own"
  on public.attendance for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "attendance_update_own_or_admin"
  on public.attendance for update
  to authenticated
  using (
    user_id = auth.uid() OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "attendance_delete_admin"
  on public.attendance for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Триггер для обновления updated_at
create trigger attendance_updated_at
  before update on public.attendance
  for each row
  execute function public.handle_updated_at();

-- Индексы для оптимизации запросов
create index idx_attendance_user_date on public.attendance(user_id, date desc);
create index idx_attendance_date on public.attendance(date desc);
