-- นับงานที่รอยืนยันเป็นงานที่ยังดูแลอยู่ ป้องกันการปิดผู้ป่วยก่อนจบขั้นตอน
drop index public.job_posts_patient_active_idx;
create index job_posts_patient_active_idx
  on public.job_posts (patient_id)
  where status in ('open', 'matched', 'in_progress', 'completion_pending');

create or replace function private.prevent_patient_deactivation_with_job()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $fn$
begin
  if old.is_active and not new.is_active and exists (
    select 1 from public.job_posts
    where patient_id = old.id
      and status in ('open', 'matched', 'in_progress', 'completion_pending')
  ) then
    raise exception using errcode = '23514', message = 'patient_has_active_job';
  end if;
  return new;
end;
$fn$;
