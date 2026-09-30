-- ให้ผู้ว่าจ้างเริ่มงานได้เมื่อมีผู้ดูแลตอบรับคำเชิญแล้วเท่านั้น
create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $fn$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress') then
    perform 1 from public.patients
    where id = new.patient_id and employer_id = new.employer_id and is_active
    for share;
    if not found then
      raise exception using errcode = '23514', message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514', message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
      or (old.status = 'open' and new.status = 'matched' and exists (
        select 1 from public.match_requests r where r.job_post_id = new.id and r.status = 'accepted'
      ))
      or (old.status = 'matched' and new.status = 'in_progress' and exists (
        select 1 from public.match_requests r where r.job_post_id = new.id and r.status = 'accepted'
      ))
    ) then
      raise exception using errcode = '23514', message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then new.published_at := now(); end if;
  if new.status = 'closed' and old.status is distinct from new.status then new.closed_at := now(); end if;
  return new;
end;
$fn$;

create or replace function match_internal.start_matched_job(p_job_id bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_job public.job_posts;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'login_required';
  end if;

  select * into v_job
  from public.job_posts
  where id = p_job_id
  for update;

  if not found or v_job.employer_id is distinct from auth.uid()
     or not exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'employer'
     ) then
    raise exception using errcode = '42501', message = 'job_owner_required';
  end if;

  if v_job.status <> 'matched' then
    raise exception using errcode = 'P0001', message = 'job_not_ready_to_start';
  end if;

  if not exists (
    select 1 from public.match_requests
    where job_post_id = p_job_id and status = 'accepted'
  ) then
    raise exception using errcode = '23514', message = 'accepted_match_required';
  end if;

  update public.job_posts
  set status = 'in_progress', started_at = now()
  where id = p_job_id;

  return p_job_id;
end;
$fn$;

revoke all on function match_internal.start_matched_job(bigint)
from public, anon, authenticated;
grant execute on function match_internal.start_matched_job(bigint)
to authenticated;

create or replace function public.start_matched_job(p_job_id bigint)
returns bigint
language sql
security invoker
set search_path = pg_catalog
as $fn$
  select match_internal.start_matched_job(p_job_id);
$fn$;

revoke all on function public.start_matched_job(bigint)
from public, anon, authenticated;
grant execute on function public.start_matched_job(bigint)
to authenticated;
