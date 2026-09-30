-- เก็บเวลาที่ผู้ดูแลแจ้งว่างานเสร็จ และเพิ่มสถานะรอผู้ว่าจ้างยืนยัน
alter table public.job_posts
  add column completion_requested_at timestamptz;

alter table public.job_posts
  drop constraint job_posts_status_valid;

alter table public.job_posts
  add constraint job_posts_status_valid check (
    status in (
      'draft', 'open', 'closed', 'matched', 'in_progress',
      'completion_pending', 'completed', 'cancelled'
    )
  );

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

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress', 'completion_pending') then
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
      or (old.status = 'in_progress' and new.status = 'completion_pending' and exists (
        select 1 from public.match_requests r where r.job_post_id = new.id and r.status = 'accepted'
      ))
      or (old.status = 'completion_pending' and new.status = 'completed' and exists (
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

-- เฉพาะผู้ดูแลที่จับคู่แล้วเท่านั้นที่ขอจบงานได้
create or replace function match_internal.request_job_completion(p_job_id bigint)
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

  if not found or not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'caregiver'
  ) or not exists (
    select 1 from public.match_requests
    where job_post_id = p_job_id and caregiver_id = auth.uid() and status = 'accepted'
  ) then
    raise exception using errcode = '42501', message = 'accepted_caregiver_required';
  end if;

  if v_job.status <> 'in_progress' then
    raise exception using errcode = 'P0001', message = 'job_not_in_progress';
  end if;

  update public.job_posts
  set status = 'completion_pending', completion_requested_at = now()
  where id = p_job_id;

  return p_job_id;
end;
$fn$;

revoke all on function match_internal.request_job_completion(bigint)
from public, anon, authenticated;
grant execute on function match_internal.request_job_completion(bigint)
to authenticated;

create or replace function public.request_job_completion(p_job_id bigint)
returns bigint
language sql
security invoker
set search_path = pg_catalog
as $fn$ select match_internal.request_job_completion(p_job_id); $fn$;

revoke all on function public.request_job_completion(bigint)
from public, anon, authenticated;
grant execute on function public.request_job_completion(bigint)
to authenticated;

-- เฉพาะผู้ว่าจ้างเจ้าของประกาศที่ยืนยันคำขอได้
create or replace function match_internal.confirm_job_completion(p_job_id bigint)
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

  if v_job.status <> 'completion_pending' then
    raise exception using errcode = 'P0001', message = 'job_completion_not_pending';
  end if;

  if v_job.completion_requested_at is null then
    raise exception using errcode = '23514', message = 'completion_request_required';
  end if;

  update public.job_posts
  set status = 'completed', completed_at = now()
  where id = p_job_id;

  return p_job_id;
end;
$fn$;

revoke all on function match_internal.confirm_job_completion(bigint)
from public, anon, authenticated;
grant execute on function match_internal.confirm_job_completion(bigint)
to authenticated;

create or replace function public.confirm_job_completion(p_job_id bigint)
returns bigint
language sql
security invoker
set search_path = pg_catalog
as $fn$ select match_internal.confirm_job_completion(p_job_id); $fn$;

revoke all on function public.confirm_job_completion(bigint)
from public, anon, authenticated;
grant execute on function public.confirm_job_completion(bigint)
to authenticated;
