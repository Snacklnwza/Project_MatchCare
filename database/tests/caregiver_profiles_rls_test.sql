-- Test 1: Caregiver สร้างและอ่านโปรไฟล์ของตัวเองได้
-- ข้อมูลทดสอบทั้งหมดจะถูกยกเลิกด้วย rollback

begin;

-- เตรียม profiles ของบัญชีทดสอบ
-- ส่วนนี้ทำงานด้วยสิทธิ์ SQL Editor ก่อนจำลองเป็นผู้ใช้ทั่วไป

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
  'ที่อยู่สมมติสำหรับทดสอบ'
)
on conflict (id)
do update set
  role = 'caregiver',
  first_name = excluded.first_name,
  last_name = excluded.last_name;

-- ลบโปรไฟล์ผู้ดูแลเดิมชั่วคราว เพื่อให้ Test รันซ้ำได้
-- เมื่อ rollback ข้อมูลเดิมจะถูกคืนกลับ

delete from public.caregiver_profiles
where caregiver_id = (
  select id
  from auth.users
  where email = 'caregiver.test@example.com'
);

-- จำลอง JWT ของบัญชี Caregiver

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'caregiver.test@example.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;


-- Caregiver สร้างโปรไฟล์ของตัวเอง

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
values (
  (select auth.uid()),
  'มีประสบการณ์ดูแลผู้สูงอายุ',
  3,
  'available'
);


-- ผลที่ถูกต้อง:
-- own_profile_count = 1
-- verification_status = not_submitted

select
  count(*) as own_profile_count,
  min(verification_status) as verification_status
from public.caregiver_profiles
where caregiver_id = (select auth.uid());


-- ยกเลิกข้อมูลที่สร้างระหว่างทดสอบ

rollback;

-- Test 2: Employer ต้องสร้างโปรไฟล์ผู้ดูแลไม่ได้

begin;

-- ตรวจว่ามีบัญชีทดสอบและเป็น Employer จริง
do $$
begin
  if not exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.email = 'employer.test@example.com'
      and p.role = 'employer'
  ) then
    raise exception 'ไม่พบบัญชีทดสอบ Employer หรือบทบาทไม่ถูกต้อง';
  end if;
end;
$$;

-- จำลองการเข้าสู่ระบบด้วยบัญชี Employer
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

-- ทดลองสร้างโปรไฟล์ผู้ดูแลด้วยบัญชี Employer
do $$
declare
  insert_rejected boolean := false;
begin
  begin
    insert into public.caregiver_profiles (
      caregiver_id,
      bio,
      experience_years,
      availability_status
    )
    values (
      (select auth.uid()),
      'ข้อมูลสมมติสำหรับทดสอบการปฏิเสธ',
      1,
      'available'
    );

  exception
    when insufficient_privilege or check_violation then
      insert_rejected := true;
  end;

  if not insert_rejected then
    raise exception 'TEST FAILED: Employer สร้างโปรไฟล์ผู้ดูแลได้';
  end if;

  perform set_config(
    'test.employer_insert_rejected',
    'true',
    true
  );
end;
$$;

-- ผลที่ถูกต้องต้องเป็น true
select current_setting(
  'test.employer_insert_rejected'
)::boolean as employer_insert_rejected;

rollback;

-- Test 3: Caregiver แก้โปรไฟล์ตัวเองได้
-- และ updated_at ต้องเปลี่ยนอัตโนมัติ

begin;

-- ตรวจว่าบัญชีทดสอบมีบทบาท caregiver
do $$
begin
  if not exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.email = 'caregiver.test@example.com'
      and p.role = 'caregiver'
  ) then
    raise exception 'ไม่พบบัญชีทดสอบ Caregiver หรือบทบาทไม่ถูกต้อง';
  end if;
end;
$$;

-- จำลอง JWT ของ Caregiver
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'caregiver.test@example.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

-- เตรียมข้อมูลด้วยสิทธิ์ SQL Editor
-- ข้อมูลเดิมจะกลับคืนเมื่อ rollback
delete from public.caregiver_profiles
where caregiver_id = (select auth.uid());

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status,
  updated_at
)
values (
  (select auth.uid()),
  'ข้อมูลก่อนแก้ไข',
  1,
  'unavailable',
  '2000-01-01 00:00:00+00'
);

-- เปลี่ยนมาใช้สิทธิ์ผู้ใช้ที่เข้าสู่ระบบ
set local role authenticated;

-- แก้เฉพาะคอลัมน์ที่ผู้ดูแลได้รับอนุญาต
update public.caregiver_profiles
set
  bio = 'มีประสบการณ์ดูแลผู้สูงอายุ',
  experience_years = 5,
  availability_status = 'available'
where caregiver_id = (select auth.uid());

-- ต้องได้ true ทั้งสามคอลัมน์
select
  bio = 'มีประสบการณ์ดูแลผู้สูงอายุ'
    and experience_years = 5
    and availability_status = 'available'
    as profile_updated,

  updated_at > '2000-01-01 00:00:00+00'::timestamptz
    as updated_at_changed,

  verification_status = 'not_submitted'
    as verification_unchanged

from public.caregiver_profiles
where caregiver_id = (select auth.uid());

rollback;

-- Test 4: Caregiver ต้องยืนยันตัวเองไม่ได้

begin;

-- ตรวจบัญชีทดสอบก่อนเริ่ม
do $$
begin
  if not exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.email = 'caregiver.test@example.com'
      and p.role = 'caregiver'
  ) then
    raise exception 'ไม่พบบัญชีทดสอบ Caregiver หรือบทบาทไม่ถูกต้อง';
  end if;
end;
$$;

-- จำลอง JWT ของ Caregiver
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    (
      select id::text
      from auth.users
      where email = 'caregiver.test@example.com'
    ),
    'role',
    'authenticated'
  )::text,
  true
);

-- เตรียมโปรไฟล์ทดสอบด้วยสิทธิ์ SQL Editor
delete from public.caregiver_profiles
where caregiver_id = (select auth.uid());

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
values (
  (select auth.uid()),
  'โปรไฟล์ทดสอบการป้องกันยืนยันตัวเอง',
  2,
  'available'
);

-- ใช้สิทธิ์เดียวกับผู้ใช้ที่เข้าสู่ระบบ
set local role authenticated;

do $$
declare
  update_rejected boolean := false;
begin
  -- ต้องอ่านเจอโปรไฟล์ก่อน เพื่อไม่ให้ทดสอบกับข้อมูลที่ไม่มี
  if not exists (
    select 1
    from public.caregiver_profiles
    where caregiver_id = (select auth.uid())
  ) then
    raise exception 'TEST FAILED: ไม่พบโปรไฟล์ที่จะทดสอบ';
  end if;

  begin
    -- ทดลองปลอมทั้งสถานะ ผู้อนุมัติ และเวลาอนุมัติ
    update public.caregiver_profiles
    set
      verification_status = 'verified',
      verified_by = (select auth.uid()),
      verified_at = now()
    where caregiver_id = (select auth.uid());

  exception
    when insufficient_privilege then
      update_rejected := true;
  end;

  if not update_rejected then
    raise exception 'TEST FAILED: ไม่ได้ปฏิเสธการแก้ข้อมูลยืนยันด้วยสิทธิ์';
  end if;

  perform set_config(
    'test.self_verification_rejected',
    'true',
    true
  );
end;
$$;

-- ต้องได้หนึ่งแถว และ true ทั้งสองช่อง
select
  current_setting(
    'test.self_verification_rejected'
  )::boolean as self_verification_rejected,

  verification_status = 'not_submitted'
    and verified_by is null
    and verified_at is null
    as verification_unchanged

from public.caregiver_profiles
where caregiver_id = (select auth.uid());

rollback;

-- Test 5: Employer อ่านและแก้โปรไฟล์ผู้ดูแลไม่ได้

begin;

-- ตรวจว่าบัญชีทดสอบทั้งสองมีบทบาทถูกต้อง
do $$
begin
  if (
    select count(*)
    from auth.users u
    join public.profiles p on p.id = u.id
    where (
      u.email = 'caregiver.test@example.com'
      and p.role = 'caregiver'
    ) or (
      u.email = 'employer.test@example.com'
      and p.role = 'employer'
    )
  ) <> 2 then
    raise exception 'บัญชีทดสอบไม่ครบ หรือบทบาทไม่ถูกต้อง';
  end if;
end;
$$;

-- เก็บ ID ผู้ดูแลไว้ก่อนเปลี่ยนสิทธิ์
select set_config(
  'test.target_caregiver_id',
  (
    select id::text
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  true
);

-- เตรียมโปรไฟล์ผู้ดูแลด้วยสิทธิ์ SQL Editor
-- เพื่อให้แน่ใจว่ามีข้อมูลจริงให้ทดสอบ
delete from public.caregiver_profiles
where caregiver_id =
  current_setting('test.target_caregiver_id')::uuid;

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
values (
  current_setting('test.target_caregiver_id')::uuid,
  'โปรไฟล์ผู้ดูแลสำหรับทดสอบสิทธิ์',
  3,
  'available'
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

-- ทดลองแก้โปรไฟล์ผู้ดูแลด้วยบัญชี Employer
with updated_other_profile as (
  update public.caregiver_profiles
  set bio = 'ถูกแก้ไขโดยผู้ที่ไม่ใช่เจ้าของ'
  where caregiver_id =
    current_setting('test.target_caregiver_id')::uuid
  returning caregiver_id
)
select
  (
    select count(*)
    from public.caregiver_profiles
    where caregiver_id =
      current_setting('test.target_caregiver_id')::uuid
  ) as other_profiles_visible,

  (
    select count(*)
    from updated_other_profile
  ) as other_profiles_updated;

rollback;

-- Test 6: Caregiver เพิ่ม อ่าน และลบทักษะของตัวเองได้

begin;

-- ตรวจว่ามีบัญชี Caregiver และมีทักษะที่เปิดใช้งาน
do $$
begin
  if not exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.email = 'caregiver.test@example.com'
      and p.role = 'caregiver'
  ) then
    raise exception 'ไม่พบบัญชีทดสอบ Caregiver หรือบทบาทไม่ถูกต้อง';
  end if;

  if not exists (
    select 1
    from public.skills
    where is_active = true
  ) then
    raise exception 'ไม่มีทักษะที่เปิดใช้งานสำหรับทดสอบ';
  end if;
end;
$$;

-- เก็บ ID ที่ต้องใช้ก่อนเปลี่ยนสิทธิ์

select set_config(
  'test.caregiver_id',
  (
    select id::text
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  true
);

select set_config(
  'test.skill_id',
  (
    select min(id)::text
    from public.skills
    where is_active = true
  ),
  true
);

-- เตรียมโปรไฟล์ผู้ดูแลใหม่ภายใน Transaction

delete from public.caregiver_profiles
where caregiver_id =
  current_setting('test.caregiver_id')::uuid;

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
values (
  current_setting('test.caregiver_id')::uuid,
  'โปรไฟล์สำหรับทดสอบทักษะ',
  2,
  'available'
);

-- จำลอง JWT ของ Caregiver

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    current_setting('test.caregiver_id'),
    'role',
    'authenticated'
  )::text,
  true
);

set local role authenticated;

-- เพิ่มทักษะให้ตัวเอง

insert into public.caregiver_skills (
  caregiver_id,
  skill_id
)
values (
  (select auth.uid()),
  current_setting('test.skill_id')::bigint
);

-- จำจำนวนรายการที่อ่านได้หลังเพิ่ม

select set_config(
  'test.skill_visible_count',
  (
    select count(*)::text
    from public.caregiver_skills
    where caregiver_id = (select auth.uid())
      and skill_id =
        current_setting('test.skill_id')::bigint
  ),
  true
);

-- ลบทักษะของตัวเอง และจำจำนวนแถวที่ลบได้

with deleted_skill as (
  delete from public.caregiver_skills
  where caregiver_id = (select auth.uid())
    and skill_id =
      current_setting('test.skill_id')::bigint
  returning caregiver_id
)
select set_config(
  'test.skill_deleted_count',
  count(*)::text,
  true
)
from deleted_skill;

-- ต้องได้ true ทั้งสามช่อง

select
  current_setting('test.skill_visible_count')::integer = 1
    as skill_added_and_visible,

  current_setting('test.skill_deleted_count')::integer = 1
    as skill_deleted,

  not exists (
    select 1
    from public.caregiver_skills
    where caregiver_id = (select auth.uid())
      and skill_id =
        current_setting('test.skill_id')::bigint
  ) as skill_removed;

rollback;

-- Test 7: Employer จัดการทักษะของ Caregiver ไม่ได้

begin;

-- ต้องมีทักษะที่เปิดใช้งานอย่างน้อยสองรายการ
do $$
begin
  if (
    select count(*)
    from public.skills
    where is_active = true
  ) < 2 then
    raise exception 'ต้องมีทักษะที่เปิดใช้งานอย่างน้อยสองรายการ';
  end if;
end;
$$;

-- เก็บ ID ที่ใช้ในการทดสอบ

select set_config(
  'test.target_caregiver_id',
  (
    select id::text
    from auth.users
    where email = 'caregiver.test@example.com'
  ),
  true
);

select set_config(
  'test.existing_skill_id',
  (
    select min(id)::text
    from public.skills
    where is_active = true
  ),
  true
);

select set_config(
  'test.new_skill_id',
  (
    select max(id)::text
    from public.skills
    where is_active = true
  ),
  true
);

-- เตรียมโปรไฟล์และทักษะของ Caregiver ด้วยสิทธิ์ SQL Editor

delete from public.caregiver_profiles
where caregiver_id =
  current_setting('test.target_caregiver_id')::uuid;

insert into public.caregiver_profiles (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
values (
  current_setting('test.target_caregiver_id')::uuid,
  'โปรไฟล์สำหรับทดสอบสิทธิ์ทักษะ',
  3,
  'available'
);

insert into public.caregiver_skills (
  caregiver_id,
  skill_id
)
values (
  current_setting('test.target_caregiver_id')::uuid,
  current_setting('test.existing_skill_id')::bigint
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

-- ทดลองเพิ่มทักษะให้ Caregiver คนอื่น

do $$
declare
  insert_rejected boolean := false;
begin
  begin
    insert into public.caregiver_skills (
      caregiver_id,
      skill_id
    )
    values (
      current_setting('test.target_caregiver_id')::uuid,
      current_setting('test.new_skill_id')::bigint
    );

  exception
    when insufficient_privilege or check_violation then
      insert_rejected := true;
  end;

  if not insert_rejected then
    raise exception 'TEST FAILED: Employer เพิ่มทักษะให้ Caregiver ได้';
  end if;

  perform set_config(
    'test.other_skill_insert_rejected',
    'true',
    true
  );
end;
$$;

-- ทดลองลบทักษะของ Caregiver คนอื่น

with deleted_other_skill as (
  delete from public.caregiver_skills
  where caregiver_id =
    current_setting('test.target_caregiver_id')::uuid
  returning caregiver_id
)
select set_config(
  'test.other_skill_deleted_count',
  count(*)::text,
  true
)
from deleted_other_skill;

-- ต้องได้ true, 0 และ 0

select
  current_setting(
    'test.other_skill_insert_rejected'
  )::boolean as other_skill_insert_rejected,

  (
    select count(*)
    from public.caregiver_skills
    where caregiver_id =
      current_setting('test.target_caregiver_id')::uuid
  ) as other_skills_visible,

  current_setting(
    'test.other_skill_deleted_count'
  )::integer as other_skills_deleted;

rollback;