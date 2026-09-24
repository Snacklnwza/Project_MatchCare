-- บันทึกข้อมูลผู้ป่วยและแท็กในคำสั่งเดียว เพื่อให้ล้มเหลว/สำเร็จพร้อมกัน
-- SECURITY INVOKER ใช้สิทธิ์และ RLS ของผู้เรียก ไม่ข้ามข้อจำกัดเจ้าของข้อมูล

create or replace function public.save_patient_with_tags(
  p_patient_id bigint,
  p_first_name text,
  p_last_name text,
  p_birth_date date,
  p_mobility_status text,
  p_care_notes text,
  p_province text,
  p_district text,
  p_subdistrict text,
  p_address_detail text,
  p_condition_ids bigint[],
  p_skill_ids bigint[]
)
returns public.patients
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_patient public.patients;
begin
  if (select auth.uid()) is null then
    raise exception 'กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลผู้ป่วย';
  end if;

  if p_patient_id is null then
    insert into public.patients (
      employer_id, first_name, last_name, birth_date, mobility_status,
      care_notes, province, district, subdistrict, address_detail
    )
    values (
      (select auth.uid()), p_first_name, p_last_name, p_birth_date,
      p_mobility_status, p_care_notes, p_province, p_district,
      p_subdistrict, p_address_detail
    )
    returning * into v_patient;
  else
    update public.patients
    set first_name = p_first_name,
        last_name = p_last_name,
        birth_date = p_birth_date,
        mobility_status = p_mobility_status,
        care_notes = p_care_notes,
        province = p_province,
        district = p_district,
        subdistrict = p_subdistrict,
        address_detail = p_address_detail
    where id = p_patient_id
      and employer_id = (select auth.uid())
      and is_active = true
    returning * into v_patient;

    if not found then
      raise exception 'ไม่พบผู้ป่วยที่แก้ไขได้';
    end if;
  end if;

  delete from public.patient_conditions
  where patient_id = v_patient.id
    and not (condition_id = any(coalesce(p_condition_ids, '{}'::bigint[])));

  insert into public.patient_conditions (patient_id, condition_id)
  select v_patient.id, selected.condition_id
  from (
    select distinct unnest(coalesce(p_condition_ids, '{}'::bigint[])) as condition_id
  ) as selected
  on conflict do nothing;

  delete from public.patient_required_skills
  where patient_id = v_patient.id
    and not (skill_id = any(coalesce(p_skill_ids, '{}'::bigint[])));

  insert into public.patient_required_skills (patient_id, skill_id)
  select v_patient.id, selected.skill_id
  from (
    select distinct unnest(coalesce(p_skill_ids, '{}'::bigint[])) as skill_id
  ) as selected
  on conflict do nothing;

  return v_patient;
end;
$$;

revoke all on function public.save_patient_with_tags(
  bigint, text, text, date, text, text, text, text, text, text, bigint[], bigint[]
) from public, anon;

grant execute on function public.save_patient_with_tags(
  bigint, text, text, date, text, text, text, text, text, text, bigint[], bigint[]
) to authenticated;
