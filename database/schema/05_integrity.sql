-- Source: database/schema/15_sprint1_integrity.sql
-- Shared-row locks keep concurrent skill changes and patient closure consistent.
create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress') then
    -- Synchronize with patient deactivation; recheck is_active after acquiring lock.
    perform 1 from public.patients
    where id = new.patient_id and employer_id = new.employer_id and is_active
    for share;
    if not found then
      raise exception using errcode = '23514', message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514',
        message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
    ) then
      raise exception using errcode = '23514',
        message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;


create or replace function private.lock_job_for_skill_change()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare v_id bigint;
begin
  if tg_op = 'DELETE' then v_id := old.job_post_id; else v_id := new.job_post_id; end if;
  perform 1 from public.job_posts
  where id = v_id and employer_id = auth.uid() and status in ('draft','open') for update;
  if not found then raise exception 'ไม่พบประกาศที่แก้ไขทักษะได้'; end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create trigger job_skills_lock_parent before insert or delete on public.job_required_skills
for each row execute function private.lock_job_for_skill_change();

alter table public.job_posts add constraint job_posts_title_length check (length(title) <= 120);
alter table public.job_posts add constraint job_posts_finite_dates check (isfinite(starts_at) and isfinite(ends_at));
-- Honor the UI's maximum of 10 digits at the database boundary as well.
alter table public.profiles add constraint profiles_phone_digits check (phone ~ '^[0-9]{1,10}$') not valid;

-- Source: database/schema/16_sprint1_indexes_and_dates.sql
-- Full indexes support FK checks for both open and historical jobs.
create index job_posts_patient_owner_idx on public.job_posts(patient_id, employer_id);
create index job_posts_cancelled_by_idx on public.job_posts(cancelled_by);

-- Match the Thai calendar day instead of the database server's UTC day.
create or replace function private.validate_patient()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if not isfinite(new.birth_date) or new.birth_date > (now() at time zone 'Asia/Bangkok')::date then
    raise exception using
      errcode = '23514',
      message = 'patient_birth_date_cannot_be_in_future';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = new.employer_id
      and role = 'employer'
  ) then
    raise exception using
      errcode = '23514',
      message = 'patient_owner_must_be_employer';
  end if;

  return new;
end;
$$;
