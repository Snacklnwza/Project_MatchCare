-- ID 18: ให้แอดมินเชื่อมสภาวะการดูแลกับทักษะ และอธิบายคะแนนจับคู่ได้
begin;

create table public.condition_skills (
  condition_id bigint not null references public.conditions(id) on delete restrict,
  skill_id bigint not null references public.skills(id) on delete restrict,
  primary key (condition_id, skill_id)
);
create index condition_skills_skill_idx on public.condition_skills(skill_id);
alter table public.condition_skills enable row level security;
grant select on public.condition_skills to authenticated;
create policy condition_skills_read on public.condition_skills for select to authenticated using (true);

-- บันทึกทั้งชุดใน transaction เดียว; ล็อกสภาวะก่อนเพื่อกันการบันทึกพร้อมกัน
create function match_internal.save_condition_skills(p_condition_id bigint, p_skill_ids bigint[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception using errcode = '42501', message = 'admin_account_required';
  end if;
  perform 1 from public.conditions where id = p_condition_id and is_active for update;
  if not found then raise exception using errcode = '22023', message = 'condition_not_active'; end if;
  if p_skill_ids is null or exists (
    select 1 from unnest(p_skill_ids) requested(skill_id) where requested.skill_id is null or not exists (
      select 1 from public.skills s where s.id = requested.skill_id and s.is_active
    )
  ) then raise exception using errcode = '22023', message = 'skill_not_active'; end if;
  delete from public.condition_skills where condition_id = p_condition_id;
  insert into public.condition_skills(condition_id, skill_id)
  select p_condition_id, id from (select distinct unnest(p_skill_ids) id) s;
end;
$$;
revoke all on function match_internal.save_condition_skills(bigint,bigint[]) from public, anon, authenticated;
grant execute on function match_internal.save_condition_skills(bigint,bigint[]) to authenticated;
create or replace function public.save_condition_skills(p_condition_id bigint, p_skill_ids bigint[])
returns void language sql security invoker set search_path = '' as $$
  select match_internal.save_condition_skills(p_condition_id,p_skill_ids);
$$;
revoke all on function public.save_condition_skills(bigint,bigint[]) from public, anon, authenticated;
grant execute on function public.save_condition_skills(bigint,bigint[]) to authenticated;

-- ไม่กำหนดความสัมพันธ์ทางสุขภาพให้เอง: แอดมินเลือกเกณฑ์ในคลังกลางก่อน
create function match_internal.rank_caregivers_for_job(p_job_id bigint)
returns table (
  caregiver_id uuid, display_name text, province text, district text,
  experience_years smallint, matched_skills bigint, required_skills bigint,
  matched_condition_skills bigint, required_condition_skills bigint,
  match_score numeric, matching_skills jsonb, missing_skills jsonb,
  matching_condition_skills jsonb, missing_condition_skills jsonb,
  unmapped_conditions bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p join public.job_posts j on j.employer_id = p.id
    where p.id = auth.uid() and p.role = 'employer' and j.id = p_job_id and j.status = 'open'
  ) then raise exception using errcode = '42501', message = 'matching_requires_owned_open_job'; end if;

  return query
  with job_skills as (
    select s.id, s.name from public.job_required_skills js join public.skills s on s.id = js.skill_id
    where js.job_post_id = p_job_id
  ), patient_tags as (
    select pc.condition_id from public.patient_conditions pc join public.job_posts j on j.patient_id = pc.patient_id
    where j.id = p_job_id
  ), condition_requirements as (
    select distinct s.id, s.name from patient_tags pt
    join public.condition_skills cs on cs.condition_id = pt.condition_id
    join public.conditions c on c.id = cs.condition_id and c.is_active
    join public.skills s on s.id = cs.skill_id and s.is_active
  ), counts as (
    select (select count(*) from job_skills) jobs, (select count(*) from condition_requirements) conditions,
      (select count(*) from patient_tags pt where not exists (
        select 1 from public.condition_skills cs join public.skills s on s.id = cs.skill_id and s.is_active
        join public.conditions c on c.id = cs.condition_id and c.is_active
        where cs.condition_id = pt.condition_id
      )) unmapped
  ), candidates as (
    select cp.caregiver_id, pg_catalog.concat_ws(' ', p.first_name, p.last_name) display_name,
      p.province, p.district, cp.experience_years,
      (select count(*) from job_skills s where exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)) job_matches,
      (select count(*) from condition_requirements s where exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)) condition_matches,
      coalesce((select jsonb_agg(s.name order by s.name) from job_skills s where exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)), '[]'::jsonb) job_names,
      coalesce((select jsonb_agg(s.name order by s.name) from job_skills s where not exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)), '[]'::jsonb) job_missing,
      coalesce((select jsonb_agg(s.name order by s.name) from condition_requirements s where exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)), '[]'::jsonb) condition_names,
      coalesce((select jsonb_agg(s.name order by s.name) from condition_requirements s where not exists (select 1 from public.caregiver_skills cs where cs.caregiver_id = cp.caregiver_id and cs.skill_id = s.id)), '[]'::jsonb) condition_missing
    from public.caregiver_profiles cp join public.profiles p on p.id = cp.caregiver_id and p.role = 'caregiver'
    where cp.verification_status = 'verified' and cp.availability_status = 'available'
      and not exists (select 1 from public.job_posts target where target.id=p_job_id
        and match_internal.caregiver_has_conflict(cp.caregiver_id,target.starts_at,target.ends_at,target.id))
  )
  select c.caregiver_id, c.display_name, c.province, c.district, c.experience_years,
    c.job_matches, n.jobs, c.condition_matches, n.conditions,
    round(case
      when n.jobs > 0 and n.conditions > 0 then 70 * c.job_matches::numeric / n.jobs + 30 * c.condition_matches::numeric / n.conditions
      when n.jobs > 0 then 100 * c.job_matches::numeric / n.jobs
      when n.conditions > 0 then 100 * c.condition_matches::numeric / n.conditions
      else 0 end, 1) score,
    c.job_names, c.job_missing, c.condition_names, c.condition_missing, n.unmapped
  from candidates c cross join counts n
  order by score desc, c.experience_years desc, c.caregiver_id;
end;
$$;
revoke all on function match_internal.rank_caregivers_for_job(bigint) from public, anon, authenticated;
grant execute on function match_internal.rank_caregivers_for_job(bigint) to authenticated;
create function public.rank_caregivers_for_job(p_job_id bigint)
returns table (
  caregiver_id uuid, display_name text, province text, district text,
  experience_years smallint, matched_skills bigint, required_skills bigint,
  matched_condition_skills bigint, required_condition_skills bigint,
  match_score numeric, matching_skills jsonb, missing_skills jsonb,
  matching_condition_skills jsonb, missing_condition_skills jsonb,
  unmapped_conditions bigint
)
language sql stable security invoker set search_path = '' as $$
  select * from match_internal.rank_caregivers_for_job(p_job_id)
  order by match_score desc, experience_years desc, caregiver_id;
$$;
revoke all on function public.rank_caregivers_for_job(bigint) from public, anon, authenticated;
grant execute on function public.rank_caregivers_for_job(bigint) to authenticated;
commit;
