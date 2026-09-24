-- ใช้บัญชีทดสอบ Employer ที่มีอยู่ ข้อมูลทุกอย่างถูกยกเลิกด้วย rollback
begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select id::text from auth.users where email = 'employer.test@example.com'),
    'role', 'authenticated'
  )::text,
  true
);

set local role authenticated;

do $$
declare
  v_patient public.patients;
  v_condition_id bigint;
  v_skill_id bigint;
  v_rejected boolean;
begin
  select id into v_condition_id
  from public.conditions where is_active = true order by id limit 1;

  select id into v_skill_id
  from public.skills where is_active = true order by id limit 1;

  if v_condition_id is null or v_skill_id is null then
    raise exception 'ต้องมี condition และ skill ที่เปิดใช้งานสำหรับทดสอบ';
  end if;

  -- สร้างผู้ป่วยพร้อมแท็กทั้งสองชนิด
  v_patient := public.save_patient_with_tags(
    null, 'ทดสอบอะตอม', 'สร้าง', '1990-01-01', 'walker', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    array[v_condition_id], array[v_skill_id]
  );

  if not exists (
    select 1 from public.patient_conditions
    where patient_id = v_patient.id and condition_id = v_condition_id
  ) or not exists (
    select 1 from public.patient_required_skills
    where patient_id = v_patient.id and skill_id = v_skill_id
  ) then
    raise exception 'สร้างผู้ป่วยพร้อมแท็กไม่ครบ';
  end if;

  -- แก้ไขและถอดแท็กทั้งหมด
  v_patient := public.save_patient_with_tags(
    v_patient.id, 'ทดสอบอะตอม', 'แก้ไข', '1990-01-01', 'walker', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    '{}'::bigint[], '{}'::bigint[]
  );

  if v_patient.last_name <> 'แก้ไข'
    or exists (select 1 from public.patient_conditions where patient_id = v_patient.id)
    or exists (select 1 from public.patient_required_skills where patient_id = v_patient.id)
  then
    raise exception 'แก้ไขผู้ป่วยหรือถอดแท็กไม่สำเร็จ';
  end if;

  -- แท็กที่ไม่มีจริงต้องทำให้การสร้างทั้งชุดถูกย้อนกลับ
  v_rejected := false;
  begin
    perform public.save_patient_with_tags(
      null, 'ทดสอบอะตอม', 'ต้องย้อนกลับ', '1990-01-01', 'walker', null,
      'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
      '{}'::bigint[], array[-1::bigint]
    );
  exception when others then
    v_rejected := true;
  end;

  if not v_rejected or exists (
    select 1 from public.patients
    where employer_id = (select auth.uid()) and last_name = 'ต้องย้อนกลับ'
  ) then
    raise exception 'การสร้างที่แท็กผิดไม่ถูกย้อนกลับ';
  end if;

  -- แท็กที่ผิดต้องไม่เปลี่ยนข้อมูลผู้ป่วยเดิม
  v_rejected := false;
  begin
    perform public.save_patient_with_tags(
      v_patient.id, 'ทดสอบอะตอม', 'ไม่ควรถูกบันทึก', '1990-01-01', 'walker', null,
      'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
      '{}'::bigint[], array[-1::bigint]
    );
  exception when others then
    v_rejected := true;
  end;

  if not v_rejected or exists (
    select 1 from public.patients
    where id = v_patient.id and last_name = 'ไม่ควรถูกบันทึก'
  ) then
    raise exception 'การแก้ไขที่แท็กผิดไม่ถูกย้อนกลับ';
  end if;
end;
$$;

select true as patient_atomic_save_passed;

rollback;
