-- ลองบันทึกและแก้ไขรายละเอียดการช่วยเคลื่อนไหว โดยไม่ทิ้งข้อมูลเดิม
begin;
select set_config('test.care_owner', gen_random_uuid()::text, true);
insert into auth.users (id, email)
values (current_setting('test.care_owner')::uuid, 'care-details-owner@example.com');
insert into public.profiles (
  id, role, first_name, last_name, phone, province, district, subdistrict, address_detail
)
values (
  current_setting('test.care_owner')::uuid, 'employer', 'ทดสอบ', 'ผู้ว่าจ้าง',
  '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.care_owner'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

do $$
declare
  old_patient public.patients;
  patient public.patients;
  rejected boolean := false;
begin
  old_patient := public.save_patient_with_tags(
    null, 'ทดสอบ', 'ข้อมูลเดิม', '1950-01-01', 'walker', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    '{}'::bigint[], '{}'::bigint[]
  );
  if old_patient.affected_area is not null or old_patient.transfer_assistance is not null then
    raise exception 'ข้อมูลผู้ป่วยเดิมต้องยังใช้ได้โดยไม่ต้องกรอกรายละเอียดใหม่';
  end if;

  patient := public.save_patient_with_care_details(
    old_patient.id, 'ทดสอบ', 'รายละเอียดใหม่', '1950-01-01', 'walker', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    '{}'::bigint[], '{}'::bigint[], 'arm_and_leg', 'left', 'partial'
  );
  if patient.affected_area <> 'arm_and_leg' or patient.affected_side <> 'left'
    or patient.transfer_assistance <> 'partial' or patient.last_name <> 'รายละเอียดใหม่' then
    raise exception 'บันทึกหรือแก้ไขรายละเอียดการดูแลไม่ครบ';
  end if;

  begin
    perform public.save_patient_with_care_details(
      patient.id, 'ทดสอบ', 'ไม่ควรถูกบันทึก', '1950-01-01', 'walker', null,
      'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
      '{}'::bigint[], '{}'::bigint[], 'arm', 'invalid', 'full'
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected or exists (
    select 1 from public.patients where id = patient.id and last_name = 'ไม่ควรถูกบันทึก'
  ) then
    raise exception 'ค่าที่ผิดต้องไม่บันทึกข้อมูลบางส่วน';
  end if;

  patient := public.save_patient_with_care_details(
    patient.id, 'ทดสอบ', 'ล้างรายละเอียด', '1950-01-01', 'walker', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    '{}'::bigint[], '{}'::bigint[], null, null, null
  );
  if patient.affected_area is not null or patient.affected_side is not null
    or patient.transfer_assistance is not null then
    raise exception 'ล้างรายละเอียดการดูแลไม่สำเร็จ';
  end if;
end;
$$;

select true as patient_care_details_passed;
rollback;
