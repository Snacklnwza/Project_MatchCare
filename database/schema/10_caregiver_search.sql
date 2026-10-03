-- ID 9: ค้นหาข้อมูลสาธารณะของผู้ดูแล กรองก่อนแบ่งหน้า
begin;
create or replace function match_internal.search_caregivers(
  p_province text default null, p_district text default null,
  p_skill_id bigint default null, p_min_experience integer default null,
  p_max_experience integer default null, p_job_id bigint default null,
  p_offset integer default 0, p_limit integer default 21
)
returns table (
  caregiver_id uuid, display_name text, province text, district text,
  experience_years smallint, bio text, skills jsonb,
  matched_skills bigint, required_skills bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'
  ) then
    raise exception using errcode = '42501', message = 'employer_account_required';
  end if;
  if p_job_id is not null and not exists (
    select 1 from public.job_posts j
    where j.id = p_job_id and j.employer_id = auth.uid() and j.status = 'open'
  ) then
    raise exception using errcode = '42501', message = 'matching_requires_owned_open_job';
  end if;
  if p_offset is null or p_offset < 0 or p_limit is null or p_limit not between 1 and 51
    or p_min_experience not between 0 and 80 or p_max_experience not between 0 and 80
    or p_min_experience > p_max_experience then
    raise exception using errcode = '22023', message = 'invalid_caregiver_filter';
  end if;
  -- คำแนะนำตัวเป็นข้อความอิสระ อาจมีเบอร์/LINE จึงไม่ส่งออกก่อนจับคู่
  return query
  select cp.caregiver_id, concat_ws(' ', p.first_name, p.last_name),
    p.province, p.district, cp.experience_years, null::text,
    coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) order by s.name)
      from public.caregiver_skills cs join public.skills s on s.id = cs.skill_id
      where cs.caregiver_id = cp.caregiver_id), '[]'::jsonb),
    (select count(*) from public.caregiver_skills cs
      join public.job_required_skills js on js.skill_id = cs.skill_id
      where cs.caregiver_id = cp.caregiver_id and js.job_post_id = p_job_id),
    (select count(*) from public.job_required_skills js where js.job_post_id = p_job_id)
  from public.caregiver_profiles cp join public.profiles p on p.id = cp.caregiver_id
  where p.role = 'caregiver' and cp.verification_status = 'verified'
    and cp.availability_status = 'available'
    and (p_province is null or p.province = p_province)
    and (p_district is null or p.district = p_district)
    and (p_min_experience is null or cp.experience_years >= p_min_experience)
    and (p_max_experience is null or cp.experience_years <= p_max_experience)
    and (p_skill_id is null or exists (select 1 from public.caregiver_skills cs
      where cs.caregiver_id = cp.caregiver_id and cs.skill_id = p_skill_id))
  order by 8 desc, cp.experience_years desc, cp.caregiver_id
  limit p_limit offset p_offset;
end;
$$;
revoke all on function match_internal.search_caregivers(text,text,bigint,integer,integer,bigint,integer,integer) from public, anon, authenticated;
grant execute on function match_internal.search_caregivers(text,text,bigint,integer,integer,bigint,integer,integer) to authenticated;

create or replace function public.search_caregivers(
  p_province text default null, p_district text default null,
  p_skill_id bigint default null, p_min_experience integer default null,
  p_max_experience integer default null, p_job_id bigint default null,
  p_offset integer default 0, p_limit integer default 21
)
returns table (
  caregiver_id uuid, display_name text, province text, district text,
  experience_years smallint, bio text, skills jsonb,
  matched_skills bigint, required_skills bigint
)
language sql stable security invoker set search_path = '' as $$
  select * from match_internal.search_caregivers(p_province,p_district,p_skill_id,
    p_min_experience,p_max_experience,p_job_id,p_offset,p_limit)
  order by matched_skills desc, experience_years desc, caregiver_id;
$$;
revoke all on function public.search_caregivers(text,text,bigint,integer,integer,bigint,integer,integer) from public, anon, authenticated;
grant execute on function public.search_caregivers(text,text,bigint,integer,integer,bigint,integer,integer) to authenticated;
commit;
