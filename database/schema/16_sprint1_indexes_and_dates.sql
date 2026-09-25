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
