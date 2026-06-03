-- Таблица для хранения сгенерированных отчетов
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('attendance', 'work_hours', 'absences', 'payroll', 'summary')),
  period_start date not null,
  period_end date not null,
  generated_by uuid not null references public.profiles(id),
  department text,
  employee_ids uuid[],
  data jsonb not null,
  file_url text,
  created_at timestamptz default now()
);

-- Включение RLS
alter table public.reports enable row level security;

-- Политики доступа (только менеджеры и админы)
create policy "reports_select_manager_admin"
  on public.reports for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

create policy "reports_insert_manager_admin"
  on public.reports for insert
  to authenticated
  with check (
    generated_by = auth.uid() AND
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('manager', 'admin')
    )
  );

-- Индексы
create index idx_reports_generated_by on public.reports(generated_by);
create index idx_reports_period on public.reports(period_start, period_end);
create index idx_reports_type on public.reports(type);
