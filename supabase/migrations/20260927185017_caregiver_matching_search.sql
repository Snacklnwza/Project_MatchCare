-- ค้นหาผู้ดูแลสำหรับประกาศที่ผู้เรียกเป็นเจ้าของ
-- match_internal ต้องไม่อยู่ใน Exposed schemas ของ Data API
begin;

create schema if not exists match_internal;
revoke all on schema match_internal from public, anon, authenticated;
grant usage on schema match_internal to authenticated;

create or replace function match_internal.search_caregivers_for_job(p_job_id bigint)
returns table (
  caregiver_id uuid,
  display_name text,
  province text,
  district text,
  experience_years smallint,
  matched_skills bigint,
  required_skills bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
begin
  -- ตรวจทั้งบทบาท เจ้าของประกาศ และสถานะ ก่อนอ่านข้อมูลข้าม RLS
  if v_caller is null or not exists (
    select 1
    from public.profiles p
    join public.job_posts j on j.employer_id = p.id
    where p.id = v_caller and p.role = 'employer'
      and j.id = p_job_id and j.status = 'open'
  ) then
    raise exception using errcode = '42501',
      message = 'matching_requires_owned_open_job';
  end if;

  return query
  with required as (
    select jrs.skill_id
    from public.job_required_skills jrs
    where jrs.job_post_id = p_job_id
  )
  select cp.caregiver_id,
    pg_catalog.concat_ws(' ', p.first_name, p.last_name),
    p.province, p.district, cp.experience_years,
    count(r.skill_id), (select count(*) from required)
  from public.caregiver_profiles cp
  join public.profiles p on p.id = cp.caregiver_id and p.role = 'caregiver'
  left join public.caregiver_skills cs on cs.caregiver_id = cp.caregiver_id
  left join required r on r.skill_id = cs.skill_id
  where cp.verification_status = 'verified'
    and cp.availability_status = 'available'
  group by cp.caregiver_id, p.first_name, p.last_name, p.province, p.district,
    cp.experience_years
  order by count(r.skill_id) desc, cp.experience_years desc, cp.caregiver_id;
end;
$$;

revoke all on function match_internal.search_caregivers_for_job(bigint)
from public, anon, authenticated;
grant execute on function match_internal.search_caregivers_for_job(bigint)
to authenticated;

-- จุดเรียกผ่าน RPC คืนเฉพาะข้อมูลสำหรับการเลือกผู้ดูแล ไม่คืนข้อมูลติดต่อ
create or replace function public.search_caregivers_for_job(p_job_id bigint)
returns table (
  caregiver_id uuid,
  display_name text,
  province text,
  district text,
  experience_years smallint,
  matched_skills bigint,
  required_skills bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from match_internal.search_caregivers_for_job(p_job_id)
  order by matched_skills desc, experience_years desc, caregiver_id;
$$;

revoke all on function public.search_caregivers_for_job(bigint)
from public, anon, authenticated;
grant execute on function public.search_caregivers_for_job(bigint)
to authenticated;

commit;
