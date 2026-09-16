-- Test 1: Employer เพิ่มและอ่านผู้ป่วยของตนเองได้
-- ข้อมูลทดสอบจะถูกยกเลิกด้วย rollback

begin;

-- จำลอง JWT ของบัญชี Employer
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'nack123x@gmail.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

insert into public.patients (
  employer_id,
  first_name,
  last_name,
  birth_date,
  mobility_status,
  care_notes,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (select auth.uid()),
  'ผู้ป่วย',
  'ทดสอบ',
  '1950-01-01',
  'walker',
  'ข้อมูลสมมติสำหรับทดสอบ',
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ'
);

-- ผลที่ถูกต้อง: own_patient_count ต้องเท่ากับ 1

select count(*) as own_patient_count
from public.patients
where employer_id = (select auth.uid())
  and first_name = 'ผู้ป่วย'
  and last_name = 'ทดสอบ';

rollback;


-- Test 2: Caregiver ต้องไม่สามารถเพิ่มผู้ป่วยได้

begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'employer.test@example.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

do $$
declare
  insert_rejected boolean := false;
begin
  begin
    insert into public.patients (
      employer_id,
      first_name,
      last_name,
      birth_date,
      mobility_status,
      province,
      district,
      subdistrict,
      address_detail
    )
    values (
      (select auth.uid()),
      'ผู้ป่วย',
      'ไม่มีสิทธิ์',
      '1950-01-01',
      'walker',
      'กรุงเทพมหานคร',
      'บางเขน',
      'อนุสาวรีย์',
      'ที่อยู่สมมติสำหรับทดสอบ'
    );
  exception
    when insufficient_privilege or check_violation then
      insert_rejected := true;
  end;

  if not insert_rejected then
    raise exception 'Test failed: Caregiver created a patient';
  end if;

  raise notice 'PASS: Caregiver cannot create a patient';
end;
$$;

rollback;


-- Test 3: ผู้ใช้บัญชีอื่นต้องอ่านหรือแก้ผู้ป่วยของ Employer ไม่ได้

begin;

-- เตรียมผู้ป่วยของ Employer ด้วยสิทธิ์ SQL Editor
insert into public.patients (
  employer_id,
  first_name,
  last_name,
  birth_date,
  mobility_status,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (
    select id
    from auth.users
    where email = 'nack123x@gmail.com'
  ),
  'ผู้ป่วย',
  'ของผู้ว่าจ้าง',
  '1950-01-01',
  'wheelchair',
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติของผู้ว่าจ้าง'
);

-- เปลี่ยนเป็นบัญชี Caregiver
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'employer.test@example.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

-- ผลที่ถูกต้อง: other_patient_count ต้องเท่ากับ 0
select count(*) as other_patient_count
from public.patients
where last_name = 'ของผู้ว่าจ้าง';

-- ผลที่ถูกต้อง: other_patient_updated ต้องเท่ากับ 0
with updated_other_patient as (
  update public.patients
  set first_name = 'แก้ไขโดยไม่มีสิทธิ์'
  where last_name = 'ของผู้ว่าจ้าง'
  returning id
)
select count(*) as other_patient_updated
from updated_other_patient;

rollback;

-- Test 4: ระบบต้องปฏิเสธวันเกิดในอนาคต

begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'nack123x@gmail.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

do $$
declare
  future_birth_date_rejected boolean := false;
begin
  begin
    insert into public.patients (
      employer_id,
      first_name,
      last_name,
      birth_date,
      mobility_status,
      province,
      district,
      subdistrict,
      address_detail
    )
    values (
      (select auth.uid()),
      'ผู้ป่วย',
      'วันเกิดผิด',
      current_date + 1,
      'walker',
      'กรุงเทพมหานคร',
      'บางเขน',
      'อนุสาวรีย์',
      'ที่อยู่สมมติสำหรับทดสอบ'
    );
  exception
    when check_violation then
      future_birth_date_rejected := true;
  end;

  if not future_birth_date_rejected then
    raise exception 'Test failed: Future birth date was accepted';
  end if;

  raise notice 'PASS: Future birth date was rejected';
end;
$$;

rollback;


-- Test 5: Employer เชื่อมสภาวะและทักษะกับผู้ป่วยของตนเองได้

begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'nack123x@gmail.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

insert into public.patients (
  employer_id,
  first_name,
  last_name,
  birth_date,
  mobility_status,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (select auth.uid()),
  'ผู้ป่วย',
  'เชื่อมตาราง',
  '1950-01-01',
  'bedridden',
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ'
);

insert into public.patient_conditions (
  patient_id,
  condition_id
)
select
  patients.id,
  (
    select min(id)
    from public.conditions
    where is_active = true
  )
from public.patients
where last_name = 'เชื่อมตาราง';

insert into public.patient_required_skills (
  patient_id,
  skill_id
)
select
  patients.id,
  (
    select min(id)
    from public.skills
    where is_active = true
  )
from public.patients
where last_name = 'เชื่อมตาราง';

-- ผลที่ถูกต้อง: ทั้งสองค่าต้องเท่ากับ 1

select
  (
    select count(*)
    from public.patient_conditions
  ) as condition_link_count,
  (
    select count(*)
    from public.patient_required_skills
  ) as required_skill_link_count;

rollback;

-- Test 6: Employer แก้ไขและปิดใช้งานผู้ป่วยของตนเองได้

begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'nack123x@gmail.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

insert into public.patients (
  employer_id,
  first_name,
  last_name,
  birth_date,
  mobility_status,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (select auth.uid()),
  'ผู้ป่วย',
  'แก้ไขและปิดใช้งาน',
  '1950-01-01',
  'walker',
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ'
);

update public.patients
set
  first_name = 'ผู้ป่วยแก้ไขแล้ว',
  mobility_status = 'cane'
where last_name = 'แก้ไขและปิดใช้งาน';

update public.patients
set is_active = false
where last_name = 'แก้ไขและปิดใช้งาน';

select
  count(*) filter (
    where first_name = 'ผู้ป่วยแก้ไขแล้ว'
      and mobility_status = 'cane'
      and is_active = false
  ) as updated_and_deactivated_count,
  count(*) filter (
    where is_active = true
      and last_name = 'แก้ไขและปิดใช้งาน'
  ) as active_patient_count
from public.patients
where last_name = 'แก้ไขและปิดใช้งาน';

rollback;