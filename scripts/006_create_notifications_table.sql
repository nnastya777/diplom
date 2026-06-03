-- Таблица уведомлений
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'warning', 'success', 'error')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Включение RLS
alter table public.notifications enable row level security;

-- Политики доступа
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_insert_system"
  on public.notifications for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Индексы
create index idx_notifications_user_id on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;
