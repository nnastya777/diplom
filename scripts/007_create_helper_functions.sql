-- Функция для получения статистики сотрудника за период
create or replace function get_employee_stats(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  total_days int,
  present_days int,
  absent_days int,
  late_days int,
  total_hours decimal,
  overtime_hours decimal,
  vacation_days int,
  sick_days int
)
language plpgsql
security definer
as $$
begin
  return query
  select
    (p_end_date - p_start_date + 1)::int as total_days,
    count(distinct a.date)::int as present_days,
    count(distinct case when a.status = 'absent' then a.date end)::int as absent_days,
    count(distinct case when a.status = 'late' then a.date end)::int as late_days,
    coalesce(sum(wh.total_hours), 0)::decimal as total_hours,
    coalesce(sum(wh.overtime_hours), 0)::decimal as overtime_hours,
    coalesce(sum(case when ab.type = 'vacation' and ab.status = 'approved' then ab.days_count end), 0)::int as vacation_days,
    coalesce(sum(case when ab.type = 'sick_leave' and ab.status = 'approved' then ab.days_count end), 0)::int as sick_days
  from
    generate_series(p_start_date, p_end_date, '1 day'::interval)::date as day
    left join public.attendance a on a.user_id = p_user_id and a.date = day
    left join public.work_hours wh on wh.user_id = p_user_id and wh.date = day
    left join public.absences ab on ab.user_id = p_user_id and day between ab.start_date and ab.end_date;
end;
$$;

-- Функция для проверки конфликтов отпусков
create or replace function check_absence_conflicts(
  p_user_id uuid,
  p_start_date date,
  p_end_date date,
  p_absence_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  conflict_count int;
begin
  select count(*)
  into conflict_count
  from public.absences
  where user_id = p_user_id
    and status in ('pending', 'approved')
    and (p_absence_id is null or id != p_absence_id)
    and (
      (start_date between p_start_date and p_end_date) or
      (end_date between p_start_date and p_end_date) or
      (p_start_date between start_date and end_date) or
      (p_end_date between start_date and end_date)
    );
  
  return conflict_count = 0;
end;
$$;
