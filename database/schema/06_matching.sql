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

-- ID 6: ค้นหาประกาศที่เปิดรับจากฝั่งผู้ดูแล กรองก่อนแบ่งหน้า
-- ส่งเฉพาะข้อมูลประกาศที่ใช้ตัดสินใจสมัคร ไม่ส่งข้อมูลผู้ป่วยหรือที่อยู่ละเอียด
create or replace function match_internal.search_open_jobs(
  p_province text default null,
  p_district text default null,
  p_work_date date default null,
  p_pay_unit text default null,
  p_min_pay numeric default null,
  p_skill_id bigint default null,
  p_offset integer default 0,
  p_limit integer default 21
)
returns table (
  job_id bigint,
  title text,
  description text,
  care_summary text,
  province text,
  district text,
  starts_at timestamptz,
  ends_at timestamptz,
  pay_amount numeric,
  pay_unit text,
  required_skills jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'caregiver'
  ) then
    raise exception using errcode = '42501', message = 'caregiver_account_required';
  end if;

  if p_offset < 0 or p_limit not between 1 and 51
    or (p_pay_unit is not null and p_pay_unit not in ('hour', 'day', 'month', 'total'))
    or (p_min_pay is not null and (p_min_pay < 0 or p_pay_unit is null)) then
    raise exception using errcode = '22023', message = 'invalid_job_search_filter';
  end if;

  return query
  select j.id, j.title, j.description, j.care_summary,
    j.province, j.district, j.starts_at, j.ends_at,
    j.pay_amount, j.pay_unit,
    coalesce((
      select jsonb_agg(
        jsonb_build_object('id', s.id, 'name', s.name) order by s.name
      )
      from public.job_required_skills jrs
      join public.skills s on s.id = jrs.skill_id
      where jrs.job_post_id = j.id
    ), '[]'::jsonb)
  from public.job_posts j
  where j.status = 'open'
    and (p_province is null or j.province = p_province)
    and (p_district is null or j.district = p_district)
    and (p_work_date is null or (
      j.starts_at < ((p_work_date + 1)::timestamp at time zone 'Asia/Bangkok')
      and j.ends_at > (p_work_date::timestamp at time zone 'Asia/Bangkok')
    ))
    and (p_pay_unit is null or j.pay_unit = p_pay_unit)
    and (p_min_pay is null or j.pay_amount >= p_min_pay)
    and (p_skill_id is null or exists (
      select 1 from public.job_required_skills jrs
      where jrs.job_post_id = j.id and jrs.skill_id = p_skill_id
    ))
  order by j.published_at desc nulls last, j.id desc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function match_internal.search_open_jobs(text,text,date,text,numeric,bigint,integer,integer)
from public, anon, authenticated;
grant execute on function match_internal.search_open_jobs(text,text,date,text,numeric,bigint,integer,integer)
to authenticated;

-- หน้าเว็บเรียก RPC ชั้นนี้; ชั้นในตรวจบทบาทก่อนอ่านข้อมูลข้าม RLS
create or replace function public.search_open_jobs(
  p_province text default null,
  p_district text default null,
  p_work_date date default null,
  p_pay_unit text default null,
  p_min_pay numeric default null,
  p_skill_id bigint default null,
  p_offset integer default 0,
  p_limit integer default 21
)
returns table (
  job_id bigint,
  title text,
  description text,
  care_summary text,
  province text,
  district text,
  starts_at timestamptz,
  ends_at timestamptz,
  pay_amount numeric,
  pay_unit text,
  required_skills jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from match_internal.search_open_jobs(
    p_province, p_district, p_work_date, p_pay_unit,
    p_min_pay, p_skill_id, p_offset, p_limit
  );
$$;

revoke all on function public.search_open_jobs(text,text,date,text,numeric,bigint,integer,integer)
from public, anon, authenticated;
grant execute on function public.search_open_jobs(text,text,date,text,numeric,bigint,integer,integer)
to authenticated;

-- เปิดรายละเอียดเฉพาะประกาศที่ยัง open; ถ้าปิดระหว่างดูรายการจะคืน null
create or replace function match_internal.get_open_job_details(p_job_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'caregiver'
  ) then
    raise exception using errcode = '42501', message = 'caregiver_account_required';
  end if;

  select jsonb_build_object(
    'job_id', j.id,
    'title', j.title,
    'description', j.description,
    'care_summary', j.care_summary,
    'province', j.province,
    'district', j.district,
    'starts_at', j.starts_at,
    'ends_at', j.ends_at,
    'pay_amount', j.pay_amount,
    'pay_unit', j.pay_unit,
    'required_skills', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', s.id, 'name', s.name) order by s.name
      )
      from public.job_required_skills jrs
      join public.skills s on s.id = jrs.skill_id
      where jrs.job_post_id = j.id
    ), '[]'::jsonb)
  ) into v_result
  from public.job_posts j
  where j.id = p_job_id and j.status = 'open';

  return v_result;
end;
$$;

revoke all on function match_internal.get_open_job_details(bigint)
from public, anon, authenticated;
grant execute on function match_internal.get_open_job_details(bigint)
to authenticated;

create or replace function public.get_open_job_details(p_job_id bigint)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select match_internal.get_open_job_details(p_job_id);
$$;

revoke all on function public.get_open_job_details(bigint)
from public, anon, authenticated;
grant execute on function public.get_open_job_details(bigint)
to authenticated;

commit;
