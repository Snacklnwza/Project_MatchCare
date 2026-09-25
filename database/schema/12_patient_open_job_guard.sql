-- ID 3 ข้อ 7: ผู้ป่วยที่ผูกกับประกาศ/งานที่ยังดำเนินอยู่ปิดใช้งานไม่ได้

create or replace function private.prevent_patient_deactivation_with_job()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if old.is_active = true and new.is_active = false and exists (
    select 1 from public.job_posts
    where patient_id = old.id
      and status in ('open', 'matched', 'in_progress')
  ) then
    raise exception using errcode = '23514',
      message = 'patient_has_active_job';
  end if;

  return new;
end;
$$;

create trigger patients_prevent_deactivation_with_job
before update of is_active on public.patients
for each row execute function private.prevent_patient_deactivation_with_job();
