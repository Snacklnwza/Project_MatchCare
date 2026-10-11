-- รายละเอียดการช่วยเคลื่อนไหวของผู้ป่วย เก็บแยกจากชื่อโรคและแท็กทักษะ
-- ช่องใหม่เป็นทางเลือก เพื่อให้ข้อมูลผู้ป่วยเดิมยังใช้งานได้
alter table public.patients
  add column affected_area text,
  add column affected_side text,
  add column transfer_assistance text,
  add constraint patients_affected_area_valid
    check (affected_area is null or affected_area in ('arm', 'leg', 'arm_and_leg', 'other')),
  add constraint patients_affected_side_valid
    check (affected_side is null or affected_side in ('left', 'right', 'both', 'unknown')),
  add constraint patients_affected_pair_valid
    check ((affected_area is null) = (affected_side is null)),
  add constraint patients_transfer_assistance_valid
    check (transfer_assistance is null or transfer_assistance in ('independent', 'supervision', 'partial', 'full'));

grant update (affected_area, affected_side, transfer_assistance)
on public.patients to authenticated;

-- เรียกการบันทึกเดิมก่อน แล้วบันทึกรายละเอียดเพิ่มในธุรกรรมเดียวกัน
-- ฟังก์ชันเดิมยังอยู่ เพื่อให้ส่วนอื่นของระบบและข้อมูลเก่าไม่สะดุด
create function public.save_patient_with_care_details(
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
  p_skill_ids bigint[],
  p_affected_area text,
  p_affected_side text,
  p_transfer_assistance text
)
returns public.patients
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_patient public.patients;
begin
  v_patient := public.save_patient_with_tags(
    p_patient_id, p_first_name, p_last_name, p_birth_date, p_mobility_status,
    p_care_notes, p_province, p_district, p_subdistrict, p_address_detail,
    p_condition_ids, p_skill_ids
  );

  update public.patients
  set affected_area = p_affected_area,
      affected_side = p_affected_side,
      transfer_assistance = p_transfer_assistance
  where id = v_patient.id and employer_id = (select auth.uid())
  returning * into v_patient;

  if not found then
    raise exception 'ไม่พบผู้ป่วยที่แก้ไขได้';
  end if;

  return v_patient;
end;
$$;

revoke all on function public.save_patient_with_care_details(
  bigint, text, text, date, text, text, text, text, text, text,
  bigint[], bigint[], text, text, text
) from public, anon;
grant execute on function public.save_patient_with_care_details(
  bigint, text, text, date, text, text, text, text, text, text,
  bigint[], bigint[], text, text, text
) to authenticated;
