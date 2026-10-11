-- จับคู่จากทักษะในประกาศเท่านั้น รายละเอียดสุขภาพมีไว้ให้อ่านก่อนตัดสินใจ
alter table public.patients
  add column chronic_conditions text,
  add constraint patients_chronic_conditions_length
    check (chronic_conditions is null or length(chronic_conditions) <= 1000);

grant update (chronic_conditions) on public.patients to authenticated;

-- บันทึกโรคประจำตัวพร้อมข้อมูลผู้ป่วยและแท็กในธุรกรรมเดียว
create function public.save_patient_with_health_context(
  p_patient_id bigint, p_first_name text, p_last_name text,
  p_birth_date date, p_mobility_status text, p_care_notes text,
  p_province text, p_district text, p_subdistrict text, p_address_detail text,
  p_condition_ids bigint[], p_skill_ids bigint[],
  p_affected_area text, p_affected_side text, p_transfer_assistance text,
  p_chronic_conditions text
)
returns public.patients language plpgsql security invoker set search_path = pg_catalog as $$
declare v_patient public.patients;
begin
  v_patient := public.save_patient_with_care_details(
    p_patient_id, p_first_name, p_last_name, p_birth_date, p_mobility_status,
    p_care_notes, p_province, p_district, p_subdistrict, p_address_detail,
    p_condition_ids, p_skill_ids, p_affected_area, p_affected_side,
    p_transfer_assistance
  );
  update public.patients
  set chronic_conditions = nullif(pg_catalog.btrim(p_chronic_conditions), '')
  where id = v_patient.id and employer_id = (select auth.uid())
  returning * into v_patient;
  if not found then raise exception 'ไม่พบผู้ป่วยที่แก้ไขได้'; end if;
  return v_patient;
end;
$$;
revoke all on function public.save_patient_with_health_context(
  bigint,text,text,date,text,text,text,text,text,text,bigint[],bigint[],text,text,text,text
) from public, anon;
grant execute on function public.save_patient_with_health_context(
  bigint,text,text,date,text,text,text,text,text,text,bigint[],bigint[],text,text,text,text
) to authenticated;

-- คงรูปแบบผลลัพธ์เดิมไว้ แต่คะแนนมาจากทักษะที่ผู้ว่าจ้างเลือกในประกาศ 100%
create or replace function match_internal.rank_caregivers_for_job(p_job_id bigint)
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
  with required as (
    select s.id, s.name from public.job_required_skills js
    join public.skills s on s.id = js.skill_id where js.job_post_id = p_job_id
  ), totals as (select count(*) amount from required), candidates as (
    select cp.caregiver_id, pg_catalog.concat_ws(' ', p.first_name, p.last_name) display_name,
      p.province, p.district, cp.experience_years,
      (select count(*) from required r where exists (
        select 1 from public.caregiver_skills cs
        where cs.caregiver_id = cp.caregiver_id and cs.skill_id = r.id
      )) matched,
      coalesce((select jsonb_agg(r.name order by r.name) from required r where exists (
        select 1 from public.caregiver_skills cs
        where cs.caregiver_id = cp.caregiver_id and cs.skill_id = r.id
      )), '[]'::jsonb) matching_names,
      coalesce((select jsonb_agg(r.name order by r.name) from required r where not exists (
        select 1 from public.caregiver_skills cs
        where cs.caregiver_id = cp.caregiver_id and cs.skill_id = r.id
      )), '[]'::jsonb) missing_names
    from public.caregiver_profiles cp
    join public.profiles p on p.id = cp.caregiver_id and p.role = 'caregiver'
    where cp.verification_status = 'verified' and cp.availability_status = 'available'
      and not exists (select 1 from public.job_posts target where target.id = p_job_id
        and match_internal.caregiver_has_conflict(cp.caregiver_id,target.starts_at,target.ends_at,target.id))
  )
  select c.caregiver_id, c.display_name, c.province, c.district, c.experience_years,
    c.matched, t.amount, 0::bigint, 0::bigint,
    case when t.amount > 0 then round(100 * c.matched::numeric / t.amount, 1) else 0::numeric end,
    c.matching_names, c.missing_names, '[]'::jsonb, '[]'::jsonb, 0::bigint
  from candidates c cross join totals t
  order by 10 desc, c.experience_years desc, c.caregiver_id;
end;
$$;

-- เปิดเฉพาะข้อมูลสุขภาพที่เกี่ยวกับการดูแลงาน ไม่เปิดชื่อหรือที่อยู่เต็มของผู้ป่วย
create or replace function match_internal.get_open_job_details(p_job_id bigint)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'caregiver'
  ) then raise exception using errcode = '42501', message = 'caregiver_account_required'; end if;

  select jsonb_build_object(
    'job_id', j.id, 'title', j.title, 'description', j.description,
    'care_summary', j.care_summary, 'province', j.province, 'district', j.district,
    'starts_at', j.starts_at, 'ends_at', j.ends_at,
    'pay_amount', j.pay_amount, 'pay_unit', j.pay_unit,
    'mobility_status', pt.mobility_status,
    'affected_area', pt.affected_area, 'affected_side', pt.affected_side,
    'transfer_assistance', pt.transfer_assistance,
    'chronic_conditions', pt.chronic_conditions,
    'care_notes', pt.care_notes,
    'care_conditions', coalesce((
      select jsonb_agg(c.name order by c.name)
      from public.patient_conditions pc join public.conditions c on c.id = pc.condition_id
      where pc.patient_id = pt.id
    ), '[]'::jsonb),
    'required_skills', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) order by s.name)
      from public.job_required_skills jrs join public.skills s on s.id = jrs.skill_id
      where jrs.job_post_id = j.id
    ), '[]'::jsonb)
  ) into v_result
  from public.job_posts j join public.patients pt on pt.id = j.patient_id
  where j.id = p_job_id and j.status = 'open';
  return v_result;
end;
$$;
