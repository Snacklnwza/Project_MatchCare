-- Test 1: ผู้ใช้ที่ล็อกอินสร้างและอ่านโปรไฟล์ของตัวเองได้
-- ข้อมูลทั้งหมดอยู่ใน Transaction และจะถูกยกเลิกด้วย rollback

begin;

-- จำลอง JWT ของบัญชี Employer
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

-- จำลองการเรียกฐานข้อมูลจากผู้ใช้ที่ล็อกอิน
set local role authenticated;

-- สร้างโปรไฟล์โดยใช้ ID ของผู้ใช้ที่กำลังล็อกอิน
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (select auth.uid()),
  'employer',
  'ผู้ว่าจ้าง',
  'ทดสอบ',
  '0800000000',
  null,
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ'
);

-- ต้องเห็นโปรไฟล์ของตัวเอง 1 แถว
select
  id,
  role,
  first_name,
  last_name
from public.profiles;

-- ยกเลิกข้อมูลที่สร้างระหว่างการทดสอบ
rollback;


-- Test 2: Employer ต้องมองไม่เห็นโปรไฟล์ของ Caregiver

begin;

-- เตรียมข้อมูลสองบัญชีก่อนจำลองเป็นผู้ใช้ทั่วไป
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail
)
values
(
  (
    select id
    from auth.users
    where email = 'employer.test@example.com'
  ),
  'employer',
  'ผู้ว่าจ้าง',
  'ทดสอบ',
  '0800000000',
  null,
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติของผู้ว่าจ้าง'
),
(
  (
    select id
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  'caregiver',
  'ผู้ดูแล',
  'ทดสอบ',
  '0811111111',
  null,
  'กรุงเทพมหานคร',
  'บางกะปิ',
  'หัวหมาก',
  'ที่อยู่สมมติของผู้ดูแล'
);

-- จำลองว่า Employer กำลังล็อกอิน
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

-- แม้ไม่มี WHERE แต่ RLS ต้องเหลือเฉพาะ Employer 1 แถว
select
  id,
  role,
  first_name,
  last_name
from public.profiles;

rollback;

-- Test 3: Employer แก้โปรไฟล์ตัวเองได้ แต่แก้ Caregiver ไม่ได้

begin;

-- เตรียมโปรไฟล์ทดสอบสองบัญชี
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail
)
values
(
  (
    select id
    from auth.users
    where email = 'employer.test@example.com'
  ),
  'employer',
  'ผู้ว่าจ้าง',
  'ทดสอบ',
  '0800000000',
  null,
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติของผู้ว่าจ้าง'
),
(
  (
    select id
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  'caregiver',
  'ผู้ดูแล',
  'ทดสอบ',
  '0811111111',
  null,
  'กรุงเทพมหานคร',
  'บางกะปิ',
  'หัวหมาก',
  'ที่อยู่สมมติของผู้ดูแล'
);

-- เก็บ ID ของ Caregiver ไว้ก่อนเปลี่ยนเป็น authenticated
select set_config(
  'test.caregiver_id',
  (
    select id::text
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  true
);

-- จำลอง JWT ของ Employer
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

-- ต้องแก้โปรไฟล์ตัวเองได้ 1 แถว
with updated_own_profile as (
  update public.profiles
  set first_name = 'ผู้ว่าจ้างแก้ไขแล้ว'
  where id = (select auth.uid())
  returning id
)
select count(*) as own_rows_updated
from updated_own_profile;

-- ต้องแก้โปรไฟล์ Caregiver ได้ 0 แถว
with updated_other_profile as (
  update public.profiles
  set first_name = 'ถูกแก้โดยผู้อื่น'
  where id = current_setting('test.caregiver_id')::uuid
  returning id
)
select count(*) as other_rows_updated
from updated_other_profile;

rollback;

-- Test 4: ผู้ใช้ทั่วไปต้องสร้างโปรไฟล์ role = admin ไม่ได้

begin;

-- จำลอง JWT ของ Employer
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

-- ค่าเริ่มต้นคือยังไม่ทราบว่าฐานข้อมูลปฏิเสธหรือไม่
select set_config(
  'test.admin_insert_rejected',
  'false',
  true
);

set local role authenticated;

-- ทดลองสร้างโปรไฟล์ตัวเองเป็น Admin
-- exception จะจับ Error ที่เราคาดหวังไว้ เพื่อให้ Test ทำงานต่อได้
do $$
begin
  begin
    insert into public.profiles (
      id,
      role,
      first_name,
      last_name,
      phone,
      line_id,
      province,
      district,
      subdistrict,
      address_detail
    )
    values (
      (select auth.uid()),
      'admin',
      'ผู้ดูแลระบบ',
      'ปลอม',
      '0899999999',
      null,
      'กรุงเทพมหานคร',
      'บางเขน',
      'อนุสาวรีย์',
      'ที่อยู่สมมติสำหรับทดสอบ'
    );

  exception
    when insufficient_privilege then
      perform set_config(
        'test.admin_insert_rejected',
        'true',
        true
      );
  end;
end;
$$ language plpgsql;

-- ต้องได้ true จึงถือว่าผ่าน
select
  current_setting(
    'test.admin_insert_rejected'
  )::boolean as admin_insert_rejected;

rollback;

-- Test 5: ผู้ที่ยังไม่ล็อกอินต้องอ่าน profiles ไม่ได้

begin;

-- เตรียมโปรไฟล์หนึ่งแถวก่อนจำลองเป็น anon
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail
)
values (
  (
    select id
    from auth.users
    where email = 'employer.test@example.com'
  ),
  'employer',
  'ผู้ว่าจ้าง',
  'ทดสอบ',
  '0800000000',
  null,
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ'
);

-- ค่าเริ่มต้นคือยังไม่ทราบว่าการอ่านถูกปฏิเสธหรือไม่
select set_config(
  'test.anon_select_rejected',
  'false',
  true
);

-- จำลองผู้ใช้ที่ยังไม่ล็อกอิน
set local role anon;

-- ทดลองอ่าน profiles และจับ Error ที่คาดไว้
do $$
begin
  begin
    perform 1
    from public.profiles;

  exception
    when insufficient_privilege then
      perform set_config(
        'test.anon_select_rejected',
        'true',
        true
      );
  end;
end;
$$ language plpgsql;

-- ต้องได้ true จึงถือว่าผ่าน
select
  current_setting(
    'test.anon_select_rejected'
  )::boolean as anon_select_rejected;

rollback;

-- Test 6: updated_at ต้องเปลี่ยนอัตโนมัติเมื่อแก้ไขโปรไฟล์

begin;

-- เตรียมข้อมูลโดยกำหนด updated_at เป็นเวลาเก่า
-- เพื่อให้ตรวจได้ชัดว่า Trigger เปลี่ยนค่าแล้ว
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail,
  updated_at
)
values (
  (
    select id
    from auth.users
    where email = 'employer.test@example.com'
  ),
  'employer',
  'ผู้ว่าจ้าง',
  'ก่อนแก้ไข',
  '0800000000',
  null,
  'กรุงเทพมหานคร',
  'บางเขน',
  'อนุสาวรีย์',
  'ที่อยู่สมมติสำหรับทดสอบ',
  '2000-01-01 00:00:00+00'
);

-- จำลอง JWT ของบัญชี Employer
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

-- จำลองคำสั่งที่ส่งมาจาก Frontend หลังล็อกอิน
set local role authenticated;

-- แก้ไขเฉพาะข้อมูลที่ผู้ใช้ได้รับอนุญาต
update public.profiles
set last_name = 'หลังแก้ไข'
where id = (select auth.uid());

-- ทั้งสองคอลัมน์ต้องได้ true
select
  last_name = 'หลังแก้ไข'
    as profile_updated,
  updated_at > '2000-01-01 00:00:00+00'::timestamptz
    as updated_at_changed
from public.profiles
where id = (select auth.uid());

-- คืนฐานข้อมูลกลับสู่สภาพก่อนทดสอบ
rollback;