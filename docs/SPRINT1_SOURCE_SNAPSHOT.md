# MatchCare — Sprint 1 Source Snapshot

สร้างใหม่ด้วย `node scripts/generate-review-snapshot.mjs` หลังแก้โค้ด เอกสารนี้เป็นสำเนาเพื่ออ่าน ไม่ใช่ไฟล์ที่นำไปรันโดยตรง

อ่านผลตรวจและข้อจำกัดใน [SPRINT1_CODE_REVIEW.md](SPRINT1_CODE_REVIEW.md) ก่อน บางหน้าเป็น placeholder ของ Sprint ถัดไป

รวมโค้ดแอป, config, SQL, tests และ scripts ไม่รวม .env, credentials, dependency, lockfile, ภาพ, build output และ JSON ข้อมูลพื้นที่ขนาดใหญ่ SHA-256 คำนวณหลังปรับ newline เป็น LF

## รายการไฟล์

1. [database/archive/migrations/001_patient_normal_mobility.sql](../database/archive/migrations/001_patient_normal_mobility.sql)
2. [database/schema/01_core.sql](../database/schema/01_core.sql)
3. [database/schema/02_patients.sql](../database/schema/02_patients.sql)
4. [database/schema/03_caregivers.sql](../database/schema/03_caregivers.sql)
5. [database/schema/04_jobs.sql](../database/schema/04_jobs.sql)
6. [database/schema/05_integrity.sql](../database/schema/05_integrity.sql)
7. [database/schema/06_matching.sql](../database/schema/06_matching.sql)
8. [database/schema/07_caregiver_documents.sql](../database/schema/07_caregiver_documents.sql)
9. [database/schema/08_invitations.sql](../database/schema/08_invitations.sql)
10. [database/tests/caregiver_profiles_rls_test.sql](../database/tests/caregiver_profiles_rls_test.sql)
11. [database/tests/job_posts_id4_test.sql](../database/tests/job_posts_id4_test.sql)
12. [database/tests/matching_search_test.sql](../database/tests/matching_search_test.sql)
13. [database/tests/patient_atomic_save_test.sql](../database/tests/patient_atomic_save_test.sql)
14. [database/tests/patients_rls_test.sql](../database/tests/patients_rls_test.sql)
15. [database/tests/profiles_rls_test.sql](../database/tests/profiles_rls_test.sql)
16. [database/tests/run-local.mjs](../database/tests/run-local.mjs)
17. [database/tests/skills_crud_test.sql](../database/tests/skills_crud_test.sql)
18. [database/tests/skills_rls_test.sql](../database/tests/skills_rls_test.sql)
19. [database/tests/sprint1_integration_test.sql](../database/tests/sprint1_integration_test.sql)
20. [database/tests/workflow_integration_test.sql](../database/tests/workflow_integration_test.sql)
21. [frontend/index.html](../frontend/index.html)
22. [frontend/package.json](../frontend/package.json)
23. [frontend/scripts/generate-geography.mjs](../frontend/scripts/generate-geography.mjs)
24. [frontend/src/App.jsx](../frontend/src/App.jsx)
25. [frontend/src/components/CaregiverMatches.jsx](../frontend/src/components/CaregiverMatches.jsx)
26. [frontend/src/components/DocumentList.jsx](../frontend/src/components/DocumentList.jsx)
27. [frontend/src/components/Footer.jsx](../frontend/src/components/Footer.jsx)
28. [frontend/src/components/JobForm.jsx](../frontend/src/components/JobForm.jsx)
29. [frontend/src/components/JobManager.jsx](../frontend/src/components/JobManager.jsx)
30. [frontend/src/components/LandingNavbar.jsx](../frontend/src/components/LandingNavbar.jsx)
31. [frontend/src/components/LoginForm.jsx](../frontend/src/components/LoginForm.jsx)
32. [frontend/src/components/Navbar.jsx](../frontend/src/components/Navbar.jsx)
33. [frontend/src/components/PatientForm.jsx](../frontend/src/components/PatientForm.jsx)
34. [frontend/src/components/PatientManager.jsx](../frontend/src/components/PatientManager.jsx)
35. [frontend/src/components/ProfileSetupForm.jsx](../frontend/src/components/ProfileSetupForm.jsx)
36. [frontend/src/components/RegisterForm.jsx](../frontend/src/components/RegisterForm.jsx)
37. [frontend/src/hooks/useRemoteList.js](../frontend/src/hooks/useRemoteList.js)
38. [frontend/src/lib/jobs.js](../frontend/src/lib/jobs.js)
39. [frontend/src/lib/patients.js](../frontend/src/lib/patients.js)
40. [frontend/src/lib/supabase.js](../frontend/src/lib/supabase.js)
41. [frontend/src/lib/workflow.js](../frontend/src/lib/workflow.js)
42. [frontend/src/main.jsx](../frontend/src/main.jsx)
43. [frontend/src/pages/AdminDashboard.jsx](../frontend/src/pages/AdminDashboard.jsx)
44. [frontend/src/pages/AdminVerifications.jsx](../frontend/src/pages/AdminVerifications.jsx)
45. [frontend/src/pages/CaregiverDashboard.jsx](../frontend/src/pages/CaregiverDashboard.jsx)
46. [frontend/src/pages/CaregiverDocuments.jsx](../frontend/src/pages/CaregiverDocuments.jsx)
47. [frontend/src/pages/CaregiverProfile.jsx](../frontend/src/pages/CaregiverProfile.jsx)
48. [frontend/src/pages/EmployerDashboard.jsx](../frontend/src/pages/EmployerDashboard.jsx)
49. [frontend/src/pages/Invitations.jsx](../frontend/src/pages/Invitations.jsx)
50. [frontend/src/pages/LandingPage.jsx](../frontend/src/pages/LandingPage.jsx)
51. [frontend/src/pages/RoleDashboard.jsx](../frontend/src/pages/RoleDashboard.jsx)
52. [frontend/src/styles/App.css](../frontend/src/styles/App.css)
53. [frontend/src/styles/CaregiverDashboard.css](../frontend/src/styles/CaregiverDashboard.css)
54. [frontend/src/styles/Workflow.css](../frontend/src/styles/Workflow.css)
55. [frontend/src/styles/index.css](../frontend/src/styles/index.css)
56. [frontend/vite.config.js](../frontend/vite.config.js)
57. [scripts/generate-review-snapshot.mjs](../scripts/generate-review-snapshot.mjs)

## database/archive/migrations/001_patient_normal_mobility.sql

SHA-256: `26bc0140c672b8fb58b31657c5edf6cdff02c1f146a244ccc4adac9bc0492494`

````sql
-- รันครั้งเดียวกับฐานข้อมูล MatchCare เดิมที่สร้างก่อนเพิ่มค่า `normal`
-- ฐานข้อมูลที่ติดตั้งใหม่มีค่านี้อยู่แล้วใน schema/02_patients.sql
begin;

alter table public.patients
  drop constraint if exists patients_mobility_status_valid;

alter table public.patients
  add constraint patients_mobility_status_valid
  check (mobility_status in ('normal', 'bedridden', 'wheelchair', 'walker', 'cane'));

commit;
````

## database/schema/01_core.sql

SHA-256: `615b399675799eb3194ccb099bc908cc9ba87b3f1b9d89ad4a638292be5b3071`

````sql
-- ที่มา: database/prototypes/skills_setup.sql
-- ต้นแบบฐานข้อมูล MatchCare
-- ข้อมูลทักษะหลักสำหรับผู้ดูแลและความต้องการของประกาศงาน
create table
  public.skills (
    id bigint generated always as identity primary key,
    name text not null unique,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now (),
    constraint skills_name_not_blank check (length (btrim (name)) > 0)
  );

insert into
  public.skills (name)
values
  ('การดูแลผู้ป่วยติดเตียง'),
  ('การดูดเสมหะ'),
  ('การช่วยทำกายภาพบำบัด'),
  ('การให้อาหารทางสายยาง'),
  ('การปฐมพยาบาลเบื้องต้น');

-- ความปลอดภัย: อนุญาตให้ผู้ใช้ระบบอ่านเฉพาะทักษะที่เปิดใช้งาน
alter table public.skills enable row level security;

revoke all privileges on table public.skills
from
  anon,
  authenticated;

grant usage on schema public to anon,
authenticated;

grant
select
  on table public.skills to anon,
  authenticated;

create policy "skills_select_active" on public.skills for
select
  to anon,
  authenticated using (is_active = true);

-- ตรวจสอบข้อมูลทักษะหลังจากสร้างตาราง
select
  id,
  name,
  description,
  is_active,
  created_at
from
  public.skills
order by
  id;

-- ที่มา: database/schema/01_profiles.sql
-- ตารางข้อมูลผู้ใช้งานของ MatchCare
-- ข้อมูลบัญชี อีเมล และรหัสผ่านจัดการโดย Supabase Auth

create table public.profiles (
  id uuid primary key
    references auth.users(id) on delete cascade,

  role text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  line_id text,

  province text not null,
  district text not null,
  subdistrict text not null,
  address_detail text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_role_valid
    check (role in ('employer', 'caregiver', 'admin')),

  constraint profiles_first_name_not_blank
    check (length(btrim(first_name)) > 0),

  constraint profiles_last_name_not_blank
    check (length(btrim(last_name)) > 0),

  constraint profiles_phone_not_blank
    check (length(btrim(phone)) > 0),

  constraint profiles_line_id_not_blank
    check (line_id is null or length(btrim(line_id)) > 0),

  constraint profiles_address_not_blank
    check (
      length(btrim(province)) > 0
      and length(btrim(district)) > 0
      and length(btrim(subdistrict)) > 0
      and length(btrim(address_detail)) > 0
    )
);

-- เปิด RLS ทันทีเพื่อป้องกัน Frontend เข้าถึงข้อมูลโดยไม่มี Policy

alter table public.profiles
enable row level security;

-- กำหนดสิทธิ์ระดับตาราง
-- RLS Policy ที่จะเพิ่มภายหลังจะเป็นตัวกำหนดว่าเข้าถึงแถวใดได้

revoke all privileges
on table public.profiles
from anon, authenticated;

grant select, insert, update
on table public.profiles
to authenticated;

-- ที่มา: database/schema/02_profiles_policies.sql
-- จำกัดสิทธิ์ระดับคอลัมน์ของตาราง profiles
-- ผู้ใช้ห้ามแก้ id, role, created_at และ updated_at ด้วยตนเอง

revoke insert, update
on table public.profiles
from authenticated;

grant insert (
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
on table public.profiles
to authenticated;

grant update (
  first_name,
  last_name,
  phone,
  line_id,
  province,
  district,
  subdistrict,
  address_detail
)
on table public.profiles
to authenticated;


-- ผู้ใช้ที่ล็อกอินแล้วอ่านได้เฉพาะโปรไฟล์ของตัวเอง

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);


-- ผู้ใช้สร้างได้เฉพาะโปรไฟล์ของตัวเอง
-- Frontend สร้างบทบาท admin ไม่ได้

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and role in ('employer', 'caregiver')
);


-- ผู้ใช้แก้ไขได้เฉพาะโปรไฟล์ของตัวเอง
-- สิทธิ์ระดับคอลัมน์ด้านบนป้องกันไม่ให้แก้ id และ role

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);

-- ที่มา: database/schema/03_updated_at_trigger.sql
-- Schema สำหรับเก็บฟังก์ชันภายในฐานข้อมูล
-- Frontend ไม่ควรเรียกใช้ฟังก์ชันเหล่านี้โดยตรง
create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

-- ฟังก์ชันกำหนด updated_at เป็นเวลาปัจจุบันก่อนแก้ไขข้อมูล
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at()
from public, anon, authenticated;

-- ลบ Trigger เดิมก่อน เพื่อให้รันไฟล์ซ้ำระหว่างพัฒนาได้
drop trigger if exists profiles_set_updated_at
on public.profiles;

-- เรียกฟังก์ชันทุกครั้งก่อน UPDATE ตาราง profiles
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();
````

## database/schema/02_patients.sql

SHA-256: `c618d7b0fc5986c351db0670ccfc738545e7cbaa04f119e0e6404602b93fb5f1`

````sql
-- ที่มา: database/schema/04_patient_tables.sql
-- รายการสภาวะและความต้องการดูแลสำหรับเลือกให้ผู้ป่วย
-- เป็นข้อมูลตัวอย่างสำหรับระบบ ไม่ใช่คำวินิจฉัยทางการแพทย์

create table public.conditions (
  id bigint generated by default as identity primary key,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint conditions_name_not_blank
    check (length(btrim(name)) > 0),

  constraint conditions_description_not_blank
    check (
      description is null
      or length(btrim(description)) > 0
    )
);

create unique index conditions_name_unique
on public.conditions (lower(btrim(name)));

alter table public.conditions
enable row level security;

-- ข้อมูลผู้ป่วยที่อยู่ภายใต้การดูแลของ Employer

create table public.patients (
  id bigint generated by default as identity primary key,

  employer_id uuid not null
    references public.profiles(id) on delete restrict,

  first_name text not null,
  last_name text not null,
  birth_date date not null,
  mobility_status text not null,
  care_notes text,

  province text not null,
  district text not null,
  subdistrict text not null,
  address_detail text not null,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint patients_id_employer_unique
    unique (id, employer_id),

  constraint patients_first_name_not_blank
    check (length(btrim(first_name)) > 0),

  constraint patients_last_name_not_blank
    check (length(btrim(last_name)) > 0),

  constraint patients_mobility_status_valid
    check (
      mobility_status in (
        'normal',
        'bedridden',
        'wheelchair',
        'walker',
        'cane'
      )
    ),

  constraint patients_care_notes_not_blank
    check (
      care_notes is null
      or length(btrim(care_notes)) > 0
    ),

  constraint patients_address_not_blank
    check (
      length(btrim(province)) > 0
      and length(btrim(district)) > 0
      and length(btrim(subdistrict)) > 0
      and length(btrim(address_detail)) > 0
    )
);

create index patients_employer_id_idx
on public.patients (employer_id);

alter table public.patients
enable row level security;

-- ตรวจข้อมูลที่ Check Constraint แบบปกติครอบคลุมไม่ได้

create or replace function private.validate_patient()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if new.birth_date > current_date then
    raise exception using
      errcode = '23514',
      message = 'patient_birth_date_cannot_be_in_future';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = new.employer_id
      and role = 'employer'
  ) then
    raise exception using
      errcode = '23514',
      message = 'patient_owner_must_be_employer';
  end if;

  return new;
end;
$$;

create trigger patients_validate
before insert or update of birth_date, employer_id
on public.patients
for each row
execute function private.validate_patient();


-- ใช้ฟังก์ชัน updated_at ที่สร้างไว้ใน 03_updated_at_trigger.sql

create trigger conditions_set_updated_at
before update on public.conditions
for each row
execute function private.set_updated_at();

create trigger patients_set_updated_at
before update on public.patients
for each row
execute function private.set_updated_at();

-- เชื่อมผู้ป่วยกับสภาวะที่ต้องดูแล

create table public.patient_conditions (
  patient_id bigint not null
    references public.patients(id) on delete cascade,

  condition_id bigint not null
    references public.conditions(id) on delete restrict,

  created_at timestamptz not null default now(),

  primary key (patient_id, condition_id)
);

create index patient_conditions_condition_id_idx
on public.patient_conditions (condition_id);

alter table public.patient_conditions
enable row level security;


-- เชื่อมผู้ป่วยกับทักษะที่ต้องการจากผู้ดูแล

create table public.patient_required_skills (
  patient_id bigint not null
    references public.patients(id) on delete cascade,

  skill_id bigint not null
    references public.skills(id) on delete restrict,

  created_at timestamptz not null default now(),

  primary key (patient_id, skill_id)
);

create index patient_required_skills_skill_id_idx
on public.patient_required_skills (skill_id);

alter table public.patient_required_skills
enable row level security;

-- ที่มา: database/schema/05_patient_policies.sql
-- สิทธิ์อ่านรายการสภาวะที่เปิดใช้งาน
-- RLS Policy ด้านล่างจะกรองแถวที่อ่านได้อีกชั้น

revoke all privileges
on table public.conditions
from anon, authenticated;

grant select
on table public.conditions
to anon, authenticated;


-- ผู้ใช้ที่เข้าสู่ระบบสามารถจัดการข้อมูลผู้ป่วยผ่าน RLS
-- ไม่อนุญาตให้แก้ id, employer_id และเวลาของระบบ

revoke all privileges
on table public.patients
from anon, authenticated;

grant select, insert
on table public.patients
to authenticated;

grant update (
  first_name,
  last_name,
  birth_date,
  mobility_status,
  care_notes,
  province,
  district,
  subdistrict,
  address_detail,
  is_active
)
on table public.patients
to authenticated;

grant usage, select
on sequence public.patients_id_seq
to authenticated;


-- ตารางเชื่อมจัดการได้ผ่าน RLS ของเจ้าของผู้ป่วย

revoke all privileges
on table
  public.patient_conditions,
  public.patient_required_skills
from anon, authenticated;

grant select, insert, delete
on table
  public.patient_conditions,
  public.patient_required_skills
to authenticated;

-- ทุกคนอ่านได้เฉพาะสภาวะที่เปิดใช้งาน

create policy conditions_select_active
on public.conditions
for select
to anon, authenticated
using (
  is_active = true
);


-- Employer อ่านได้เฉพาะผู้ป่วยของตนเอง

create policy patients_select_own
on public.patients
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = employer_id
);


-- Employer เพิ่มผู้ป่วยให้บัญชีของตนเองเท่านั้น

create policy patients_insert_own
on public.patients
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = employer_id
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'employer'
  )
);


-- Employer แก้ไขหรือปิดใช้งานผู้ป่วยของตนเองเท่านั้น

create policy patients_update_own
on public.patients
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = employer_id
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = employer_id
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'employer'
  )
);

-- Employer อ่านสภาวะของผู้ป่วยที่ตนเองเป็นเจ้าของได้

create policy patient_conditions_select_own
on public.patient_conditions
for select
to authenticated
using (
  exists (
    select 1
    from public.patients
    where patients.id = patient_conditions.patient_id
      and patients.employer_id = (select auth.uid())
  )
);


-- Employer เพิ่มได้เฉพาะสภาวะที่เปิดใช้งาน
-- และต้องเป็นผู้ป่วยของตนเอง

create policy patient_conditions_insert_own
on public.patient_conditions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.patients
    where patients.id = patient_conditions.patient_id
      and patients.employer_id = (select auth.uid())
      and patients.is_active = true
  )
  and exists (
    select 1
    from public.conditions
    where conditions.id = patient_conditions.condition_id
      and conditions.is_active = true
  )
);


-- Employer ลบความสัมพันธ์ได้เฉพาะผู้ป่วยของตนเอง

create policy patient_conditions_delete_own
on public.patient_conditions
for delete
to authenticated
using (
  exists (
    select 1
    from public.patients
    where patients.id = patient_conditions.patient_id
      and patients.employer_id = (select auth.uid())
  )
);

-- Employer อ่านทักษะที่ผู้ป่วยของตนเองต้องการได้

create policy patient_required_skills_select_own
on public.patient_required_skills
for select
to authenticated
using (
  exists (
    select 1
    from public.patients
    where patients.id = patient_required_skills.patient_id
      and patients.employer_id = (select auth.uid())
  )
);


-- Employer เพิ่มได้เฉพาะทักษะที่เปิดใช้งาน
-- และต้องเป็นผู้ป่วยของตนเอง

create policy patient_required_skills_insert_own
on public.patient_required_skills
for insert
to authenticated
with check (
  exists (
    select 1
    from public.patients
    where patients.id = patient_required_skills.patient_id
      and patients.employer_id = (select auth.uid())
      and patients.is_active = true
  )
  and exists (
    select 1
    from public.skills
    where skills.id = patient_required_skills.skill_id
      and skills.is_active = true
  )
);


-- Employer ลบความสัมพันธ์ได้เฉพาะผู้ป่วยของตนเอง

create policy patient_required_skills_delete_own
on public.patient_required_skills
for delete
to authenticated
using (
  exists (
    select 1
    from public.patients
    where patients.id = patient_required_skills.patient_id
      and patients.employer_id = (select auth.uid())
  )
);

-- ที่มา: database/schema/06_patient_seed.sql
-- ข้อมูลตัวอย่างสำหรับใช้พัฒนาและทดสอบ MatchCare
-- ไม่ใช่มาตรฐานหรือคำวินิจฉัยทางการแพทย์

insert into public.conditions (
  name,
  description
)
values
  (
    'ต้องการความช่วยเหลือในกิจวัตรประจำวัน',
    'ต้องการผู้ช่วยในการทำกิจวัตรพื้นฐานประจำวัน'
  ),
  (
    'มีข้อจำกัดด้านการเคลื่อนไหว',
    'ต้องการความช่วยเหลือหรืออุปกรณ์ในการเคลื่อนไหว'
  ),
  (
    'ต้องเฝ้าระวังเป็นพิเศษ',
    'ต้องการผู้ดูแลคอยสังเกตอาการและความปลอดภัย'
  )
on conflict do nothing;

-- ที่มา: database/schema/09_patient_atomic_save.sql
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
````

## database/schema/03_caregivers.sql

SHA-256: `5f9bceab1536f010367f73fd7923fa1dbfe95d35484c427c1c5fec079b68be59`

````sql
-- ที่มา: database/schema/07_caregiver_tables.sql
create table public.caregiver_profiles (
    caregiver_id uuid primary key references public.profiles(id) on delete cascade,
    bio text,
    experience_years smallint not null default 0,
    availability_status text not null default 'unavailable',
    verification_status text not null default 'not_submitted',
    verified_by uuid references public.profiles(id) on delete
    set
        null,
        verified_at timestamptz,
        rejection_reason text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        constraint caregiver_experience_valid check (
            experience_years between 0
            and 80
        ),
        constraint caregiver_availability_valid check (
            availability_status in ('available', 'unavailable')
        ),
        constraint caregiver_verification_valid check (
            verification_status in (
                'not_submitted',
                'pending',
                'verified',
                'rejected'
            )
        ),
        constraint caregiver_verified_fields_valid check (
            verification_status <> 'verified'
            or (
                verified_by is not null
                and verified_at is not null
            )
        ),
        constraint caregiver_rejection_reason_valid check (
            verification_status <> 'rejected'
            or (
                rejection_reason is not null
                and length(btrim(rejection_reason)) > 0
            )
        )
);

create index caregiver_profiles_verified_by_idx
on public.caregiver_profiles (verified_by);

alter table
    public.caregiver_profiles enable row level security;

revoke all privileges on table public.caregiver_profiles
from
    anon,
    authenticated;

-- ตรวจว่าเจ้าของโปรไฟล์เป็นผู้ใช้บทบาท caregiver จริง
create or replace function private.validate_caregiver_profile()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = new.caregiver_id
      and role = 'caregiver'
  ) then
    raise exception using
      errcode = '23514',
      message = 'caregiver_profile_owner_must_be_caregiver';
  end if;

  return new;
end;
$$;

revoke all
on function private.validate_caregiver_profile()
from public, anon, authenticated;

drop trigger if exists caregiver_profiles_validate
on public.caregiver_profiles;

create trigger caregiver_profiles_validate
before insert or update of caregiver_id
on public.caregiver_profiles
for each row
execute function private.validate_caregiver_profile();


-- เปลี่ยน updated_at อัตโนมัติเมื่อแก้โปรไฟล์

drop trigger if exists caregiver_profiles_set_updated_at
on public.caregiver_profiles;

create trigger caregiver_profiles_set_updated_at
before update
on public.caregiver_profiles
for each row
execute function private.set_updated_at();

-- เชื่อมผู้ดูแลกับทักษะที่มี

create table public.caregiver_skills (
  caregiver_id uuid not null
    references public.caregiver_profiles(caregiver_id)
    on delete cascade,

  skill_id bigint not null
    references public.skills(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  primary key (caregiver_id, skill_id)
);

-- ช่วยให้ค้นหาผู้ดูแลตามทักษะได้เร็วขึ้น

create index caregiver_skills_skill_id_idx
on public.caregiver_skills (skill_id);

-- เปิดการควบคุมสิทธิ์รายแถว

alter table public.caregiver_skills
enable row level security;

-- ปิดสิทธิ์เริ่มต้นก่อน แล้วค่อยกำหนดในไฟล์ Policy

revoke all privileges
on table public.caregiver_skills
from anon, authenticated;

-- ที่มา: database/schema/08_caregiver_policies.sql
-- ผู้ใช้ที่เข้าสู่ระบบอ่านข้อมูลผ่าน RLS ได้
-- ไม่ให้สิทธิ์ลบโปรไฟล์ผู้ดูแล

grant select
on table public.caregiver_profiles
to authenticated;


-- ผู้ดูแลเพิ่มได้เฉพาะข้อมูลโปรไฟล์ของตนเอง
-- ไม่อนุญาตให้กำหนดสถานะการยืนยันเอง

grant insert (
  caregiver_id,
  bio,
  experience_years,
  availability_status
)
on table public.caregiver_profiles
to authenticated;


-- ผู้ดูแลแก้ได้เฉพาะข้อมูลแนะนำตัว ประสบการณ์ และความพร้อม
-- ไม่มี verification_status จึงแก้สถานะยืนยันเองไม่ได้

grant update (
  bio,
  experience_years,
  availability_status
)
on table public.caregiver_profiles
to authenticated;


-- อ่านได้เฉพาะโปรไฟล์ผู้ดูแลของตัวเอง

create policy caregiver_profiles_select_own
on public.caregiver_profiles
for select
to authenticated
using (
  (select auth.uid()) = caregiver_id
);


-- สร้างได้เฉพาะโปรไฟล์ของตัวเอง
-- และบัญชีใน profiles ต้องมีบทบาท caregiver

create policy caregiver_profiles_insert_own
on public.caregiver_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = caregiver_id
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'caregiver'
  )
);


-- แก้ไขได้เฉพาะโปรไฟล์ของตัวเอง

create policy caregiver_profiles_update_own
on public.caregiver_profiles
for update
to authenticated
using (
  (select auth.uid()) = caregiver_id
)
with check (
  (select auth.uid()) = caregiver_id
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'caregiver'
  )
);

-- ผู้ใช้ที่เข้าสู่ระบบจัดการความสัมพันธ์ทักษะผ่าน RLS
-- ไม่มีสิทธิ์ update เพราะแก้ทักษะด้วยการเพิ่มหรือลบรายการ

grant select, insert, delete
on table public.caregiver_skills
to authenticated;


-- Caregiver อ่านได้เฉพาะทักษะของตัวเอง

create policy caregiver_skills_select_own
on public.caregiver_skills
for select
to authenticated
using (
  caregiver_id = (select auth.uid())
);


-- Caregiver เพิ่มทักษะให้ตัวเองได้
-- และเลือกได้เฉพาะทักษะที่ยังเปิดใช้งาน

create policy caregiver_skills_insert_own
on public.caregiver_skills
for insert
to authenticated
with check (
  caregiver_id = (select auth.uid())
  and exists (
    select 1
    from public.skills
    where skills.id = caregiver_skills.skill_id
      and skills.is_active = true
  )
);


-- Caregiver ลบทักษะออกจากโปรไฟล์ตัวเองได้

create policy caregiver_skills_delete_own
on public.caregiver_skills
for delete
to authenticated
using (
  caregiver_id = (select auth.uid())
);
````

## database/schema/04_jobs.sql

SHA-256: `837b779a4ce05bc426e13c79249ce9f402c01cd0cd9c11c2c431f7c1048b9d5a`

````sql
-- ที่มา: database/schema/10_job_posts.sql
-- ID 4: ประกาศรับสมัครผู้ดูแลและทักษะที่ต้องการ
-- เก็บที่อยู่ในประกาศเป็น snapshot; ห้ามเปิดเผยตารางนี้ทั้งแถวแก่ผู้ใช้ทั่วไป

create table public.job_posts (
  id bigint generated by default as identity primary key,
  employer_id uuid not null references public.profiles(id) on delete restrict,
  patient_id bigint not null,
  title text not null,
  description text not null,
  care_summary text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  pay_amount numeric(10, 2) not null,
  pay_unit text not null,
  province text not null,
  district text not null,
  subdistrict text not null,
  address_detail text not null,
  status text not null default 'draft',
  published_at timestamptz,
  closed_at timestamptz,
  cancellation_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete restrict,
  started_at timestamptz,
  completion_requested_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint job_posts_patient_owner_fk
    foreign key (patient_id, employer_id)
    references public.patients(id, employer_id) on delete restrict,
  constraint job_posts_title_not_blank check (length(btrim(title)) > 0),
  constraint job_posts_description_not_blank check (length(btrim(description)) > 0),
  constraint job_posts_care_summary_not_blank check (length(btrim(care_summary)) > 0),
  constraint job_posts_dates_valid check (ends_at > starts_at),
  constraint job_posts_pay_positive check (pay_amount > 0),
  constraint job_posts_pay_unit_valid
    check (pay_unit in ('hour', 'day', 'month', 'total')),
  constraint job_posts_location_not_blank check (
    length(btrim(province)) > 0
    and length(btrim(district)) > 0
    and length(btrim(subdistrict)) > 0
    and length(btrim(address_detail)) > 0
  ),
  constraint job_posts_status_valid check (
    status in (
      'draft', 'open', 'closed', 'matched',
      'in_progress', 'completion_pending', 'completed', 'cancelled'
    )
  )
);

create index job_posts_employer_created_idx
on public.job_posts (employer_id, created_at desc);

create index job_posts_patient_active_idx
on public.job_posts (patient_id)
where status in ('open', 'matched', 'in_progress', 'completion_pending');

create index job_posts_open_location_idx
on public.job_posts (province, district, starts_at)
where status = 'open';

alter table public.job_posts enable row level security;

create trigger job_posts_set_updated_at
before update on public.job_posts
for each row execute function private.set_updated_at();

-- ป้องกันการเปิดประกาศของผู้ป่วยที่ปิดใช้งาน และกำหนดสถานะที่ ID 4 ใช้ได้
create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient then
    if not exists (
      select 1 from public.patients
      where id = new.patient_id
        and employer_id = new.employer_id
        and is_active = true
    ) then
      raise exception using errcode = '23514',
        message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514',
        message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
    ) then
      raise exception using errcode = '23514',
        message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

create trigger job_posts_validate
before insert or update on public.job_posts
for each row execute function private.validate_job_post();

create table public.job_required_skills (
  job_post_id bigint not null references public.job_posts(id) on delete restrict,
  skill_id bigint not null references public.skills(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (job_post_id, skill_id)
);

create index job_required_skills_skill_id_idx
on public.job_required_skills (skill_id);

alter table public.job_required_skills enable row level security;

-- ตรวจตอนจบ transaction เพื่อให้เพิ่มประกาศและหลายทักษะพร้อมกันได้
create or replace function private.require_open_job_skill()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_job_id bigint;
begin
  if tg_table_name = 'job_posts' then
    v_job_id := new.id;
  else
    v_job_id := old.job_post_id;
  end if;

  if exists (
    select 1 from public.job_posts
    where id = v_job_id and status = 'open'
  ) and not exists (
    select 1 from public.job_required_skills
    where job_post_id = v_job_id
  ) then
    raise exception using errcode = '23514',
      message = 'open_job_requires_skill';
  end if;

  return null;
end;
$$;

create constraint trigger job_posts_require_skill
after insert or update of status on public.job_posts
deferrable initially deferred
for each row execute function private.require_open_job_skill();

create constraint trigger job_required_skills_require_skill
after delete on public.job_required_skills
deferrable initially deferred
for each row execute function private.require_open_job_skill();

-- ที่มา: database/schema/11_job_policies.sql
-- เจ้าของอ่านและจัดการประกาศของตน; ยังไม่เปิดตารางที่มีที่อยู่ละเอียดให้ผู้อื่นอ่าน

revoke all privileges on table public.job_posts from anon, authenticated;

grant select on table public.job_posts to authenticated;

grant insert (
  employer_id, patient_id, title, description, care_summary,
  starts_at, ends_at, pay_amount, pay_unit,
  province, district, subdistrict, address_detail, status
) on table public.job_posts to authenticated;

grant update (
  patient_id, title, description, care_summary,
  starts_at, ends_at, pay_amount, pay_unit,
  province, district, subdistrict, address_detail, status
) on table public.job_posts to authenticated;

grant usage, select on sequence public.job_posts_id_seq to authenticated;

create policy job_posts_select_own
on public.job_posts for select to authenticated
using ((select auth.uid()) = employer_id);

create policy job_posts_insert_own
on public.job_posts for insert to authenticated
with check (
  (select auth.uid()) = employer_id
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'employer'
  )
);

create policy job_posts_update_own
on public.job_posts for update to authenticated
using (
  (select auth.uid()) = employer_id
  and status in ('draft', 'open')
)
with check (
  (select auth.uid()) = employer_id
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'employer'
  )
);

-- ทักษะของประกาศอ่าน/เพิ่ม/ลบได้เฉพาะเจ้าของประกาศที่ยังแก้ไขได้
revoke all privileges on table public.job_required_skills from anon, authenticated;
grant select, insert, delete on table public.job_required_skills to authenticated;

create policy job_required_skills_select_own
on public.job_required_skills for select to authenticated
using (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
  )
);

create policy job_required_skills_insert_own
on public.job_required_skills for insert to authenticated
with check (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
      and status in ('draft', 'open')
  )
  and exists (
    select 1 from public.skills
    where id = job_required_skills.skill_id and is_active = true
  )
);

create policy job_required_skills_delete_own
on public.job_required_skills for delete to authenticated
using (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
      and status in ('draft', 'open')
  )
);

-- ที่มา: database/schema/12_patient_open_job_guard.sql
-- ID 3 ข้อ 7: ผู้ป่วยที่ผูกกับประกาศ/งานที่ยังดำเนินอยู่ปิดใช้งานไม่ได้

create or replace function private.prevent_patient_deactivation_with_job()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if old.is_active = true and new.is_active = false and exists (
    select 1 from public.job_posts
    where patient_id = old.id
      and status in ('open', 'matched', 'in_progress', 'completion_pending')
  ) then
    raise exception using errcode = '23514',
      message = 'patient_has_active_job';
  end if;

  return new;
end;
$$;

create trigger patients_prevent_deactivation_with_job
before update of is_active on public.patients
for each row execute function private.prevent_patient_deactivation_with_job();

-- ที่มา: database/schema/13_job_atomic_save.sql
-- สร้างประกาศกับทักษะใน transaction เดียว ภายใต้สิทธิ์/RLS ของผู้เรียก
create or replace function public.create_job_with_tags(
  p_patient_id bigint, p_title text, p_description text, p_care_summary text,
  p_starts_at timestamptz, p_ends_at timestamptz, p_pay_amount numeric,
  p_pay_unit text, p_skill_ids bigint[]
)
returns bigint language plpgsql security invoker set search_path = pg_catalog
as $$
declare
  v_job_id bigint;
  v_patient public.patients;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'employer') then
    raise exception 'เฉพาะผู้ว่าจ้างเท่านั้นที่สร้างประกาศได้';
  end if;

  -- ล็อกผู้ป่วยจนจบ transaction เพื่อไม่ให้ถูกปิดพร้อมกับเปิดประกาศ
  select * into v_patient from public.patients
  where id = p_patient_id and employer_id = auth.uid() and is_active for share;
  if not found then raise exception 'ไม่พบผู้ป่วยที่ใช้งานอยู่ในความดูแลของคุณ'; end if;
  if length(p_title) > 120 or nullif(btrim(p_title), '') is null
    or nullif(btrim(p_description), '') is null
    or nullif(btrim(p_care_summary), '') is null then
    raise exception 'กรุณากรอกข้อมูลประกาศให้ครบ และหัวข้อไม่เกิน 120 ตัวอักษร';
  end if;
  if coalesce(cardinality(p_skill_ids), 0) = 0 or exists (
    select 1 from unnest(p_skill_ids) requested(skill_id)
    left join public.skills skill on skill.id = requested.skill_id and skill.is_active
    where skill.id is null
  ) then raise exception 'กรุณาเลือกทักษะที่ใช้งานอยู่อย่างน้อย 1 รายการ'; end if;
  if p_starts_at is null or p_ends_at is null or not isfinite(p_starts_at)
    or not isfinite(p_ends_at) or p_ends_at <= p_starts_at then
    raise exception 'วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน';
  end if;
  if p_pay_amount is null or p_pay_amount <= 0 or p_pay_amount > 99999999.99
    or p_pay_unit is null or p_pay_unit not in ('hour', 'day', 'month', 'total') then
    raise exception 'ค่าตอบแทนหรือหน่วยค่าตอบแทนไม่ถูกต้อง';
  end if;

  insert into public.job_posts (
    employer_id, patient_id, title, description, care_summary,
    starts_at, ends_at, pay_amount, pay_unit,
    province, district, subdistrict, address_detail, status
  ) values (
    auth.uid(), v_patient.id, btrim(p_title), btrim(p_description), btrim(p_care_summary),
    p_starts_at, p_ends_at, p_pay_amount, p_pay_unit,
    v_patient.province, v_patient.district, v_patient.subdistrict, v_patient.address_detail, 'draft'
  ) returning id into v_job_id;

  insert into public.job_required_skills(job_post_id, skill_id)
  select v_job_id, skill_id from (select distinct unnest(p_skill_ids) skill_id) requested;
  update public.job_posts set status = 'open' where id = v_job_id;
  return v_job_id;
end;
$$;
revoke all on function public.create_job_with_tags(bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) from public, anon;
grant execute on function public.create_job_with_tags(bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) to authenticated;

-- ที่มา: database/schema/14_job_atomic_update.sql
create or replace function public.update_job_with_tags(
  p_job_id bigint,
  p_patient_id bigint,
  p_title text,
  p_description text,
  p_care_summary text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_pay_amount numeric,
  p_pay_unit text,
  p_skill_ids bigint[]
)
returns bigint
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_patient public.patients;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  -- ล็อกประกาศเพื่อไม่ให้แก้ไขและปิดพร้อมกัน
  perform 1 from public.job_posts
  where id = p_job_id and employer_id = auth.uid() and status in ('draft', 'open')
  for update;
  if not found then raise exception 'ไม่พบประกาศที่แก้ไขได้ กรุณาโหลดรายการใหม่'; end if;
  select * into v_patient from public.patients
  where id = p_patient_id and employer_id = auth.uid() and is_active for share;
  if not found then raise exception 'กรุณาเลือกผู้ป่วยที่ใช้งานอยู่ของคุณ'; end if;
  if coalesce(length(btrim(p_title)), 0) = 0 or length(p_title) > 120
    or coalesce(length(btrim(p_description)), 0) = 0
    or coalesce(length(btrim(p_care_summary)), 0) = 0 then
    raise exception 'กรุณากรอกหัวข้อไม่เกิน 120 ตัวอักษร รายละเอียด และสรุปการดูแล';
  end if;
  if p_starts_at is null or p_ends_at is null or not isfinite(p_starts_at)
    or not isfinite(p_ends_at) or p_ends_at <= p_starts_at then
    raise exception 'วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน';
  end if;
  if p_pay_amount is null or p_pay_amount <= 0 or p_pay_amount > 99999999.99
    or p_pay_unit is null or p_pay_unit not in ('hour','day','month','total') then
    raise exception 'ค่าตอบแทนหรือหน่วยค่าตอบแทนไม่ถูกต้อง';
  end if;
  if coalesce(cardinality(p_skill_ids), 0) = 0 or exists (
    select 1 from unnest(p_skill_ids) requested(id)
    left join public.skills s on s.id = requested.id and s.is_active
    where s.id is null
  ) then raise exception 'กรุณาเลือกทักษะที่ใช้งานอยู่อย่างน้อย 1 รายการ'; end if;
  update public.job_posts set patient_id = p_patient_id, title = btrim(p_title),
    description = btrim(p_description), care_summary = btrim(p_care_summary),
    starts_at = p_starts_at, ends_at = p_ends_at, pay_amount = p_pay_amount,
    pay_unit = p_pay_unit, province = v_patient.province, district = v_patient.district,
    subdistrict = v_patient.subdistrict, address_detail = v_patient.address_detail
  where id = p_job_id and employer_id = auth.uid();
  -- เพิ่มชุดใหม่ก่อนลบชุดเก่า; ถ้าล้มเหลว transaction จะย้อนกลับทั้งชุด
  insert into public.job_required_skills(job_post_id, skill_id)
  select p_job_id, id from (select distinct unnest(p_skill_ids) id) ids
  on conflict do nothing;
  delete from public.job_required_skills
  where job_post_id = p_job_id and not (skill_id = any(p_skill_ids));
  return p_job_id;
end;
$$;

revoke all on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) from public, anon;
grant execute on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) to authenticated;

create or replace function public.close_job(p_job_id bigint)
returns bigint language plpgsql security invoker set search_path = pg_catalog
as $$
declare v_id bigint;
begin
  update public.job_posts set status = 'closed'
  where id = p_job_id and employer_id = auth.uid() and status in ('draft', 'open')
  returning id into v_id;
  if v_id is null then raise exception 'ไม่พบประกาศที่ปิดได้ กรุณาโหลดรายการใหม่'; end if;
  return v_id;
end;
$$;
revoke all on function public.close_job(bigint) from public, anon;
grant execute on function public.close_job(bigint) to authenticated;
````

## database/schema/05_integrity.sql

SHA-256: `def9762fc691a611f04b91872be5eb9720cc499707e10ac2b721783d8a4024b7`

````sql
-- ที่มา: database/schema/15_sprint1_integrity.sql
-- ล็อกแถวข้อมูลที่เกี่ยวข้อง เพื่อให้การแก้ทักษะพร้อมกันและการปิดข้อมูลผู้ป่วยไม่ขัดแย้งกัน
create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress') then
    -- ทำงานให้สอดคล้องกับการปิดใช้งานผู้ป่วย และตรวจ `is_active` อีกครั้งหลังได้ล็อก
    perform 1 from public.patients
    where id = new.patient_id and employer_id = new.employer_id and is_active
    for share;
    if not found then
      raise exception using errcode = '23514', message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514',
        message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
    ) then
      raise exception using errcode = '23514',
        message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;


create or replace function private.lock_job_for_skill_change()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare v_id bigint;
begin
  if tg_op = 'DELETE' then v_id := old.job_post_id; else v_id := new.job_post_id; end if;
  perform 1 from public.job_posts
  where id = v_id and employer_id = auth.uid() and status in ('draft','open') for update;
  if not found then raise exception 'ไม่พบประกาศที่แก้ไขทักษะได้'; end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create trigger job_skills_lock_parent before insert or delete on public.job_required_skills
for each row execute function private.lock_job_for_skill_change();

alter table public.job_posts add constraint job_posts_title_length check (length(title) <= 120);
alter table public.job_posts add constraint job_posts_finite_dates check (isfinite(starts_at) and isfinite(ends_at));
-- จำกัดเบอร์โทรไม่เกิน 10 หลักในฐานข้อมูลให้ตรงกับ UI
alter table public.profiles add constraint profiles_phone_digits check (phone ~ '^[0-9]{1,10}$') not valid;

-- ที่มา: database/schema/16_sprint1_indexes_and_dates.sql
-- ดัชนีช่วยตรวจ FK ของทั้งประกาศที่เปิดอยู่และประกาศย้อนหลัง
create index job_posts_patient_owner_idx on public.job_posts(patient_id, employer_id);
create index job_posts_cancelled_by_idx on public.job_posts(cancelled_by);

-- ใช้วันตามเวลาไทย แทนวันตามเวลา UTC ของเซิร์ฟเวอร์ฐานข้อมูล
create or replace function private.validate_patient()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if not isfinite(new.birth_date) or new.birth_date > (now() at time zone 'Asia/Bangkok')::date then
    raise exception using
      errcode = '23514',
      message = 'patient_birth_date_cannot_be_in_future';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = new.employer_id
      and role = 'employer'
  ) then
    raise exception using
      errcode = '23514',
      message = 'patient_owner_must_be_employer';
  end if;

  return new;
end;
$$;
````

## database/schema/06_matching.sql

SHA-256: `a80bc675338a67ff055eff4a82c0136b424afa86ccf9d0538d9cef51a9a41c3d`

````sql
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
````

## database/schema/07_caregiver_documents.sql

SHA-256: `07298f593ca3b6e1991f4f9de5d2f4a3589fe94839bd37b73949b0af8c432e39`

````sql
-- เอกสารและ Storage ส่วนตัว พร้อม RPC ส่งเอกสารและตรวจอนุมัติ
-- ไม่ให้เขียน metadata หรือผลตรวจโดยตรง
begin;

create table if not exists public.caregiver_documents (
  id bigint generated always as identity primary key,
  caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete cascade,
  document_type text not null check (document_type in ('identity', 'care_certificate', 'other')),
  storage_path text not null unique check (btrim(storage_path) <> ''),
  original_file_name text not null check (btrim(original_file_name) <> ''),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint caregiver_documents_review_fields_valid check (
    (review_status = 'pending' and reviewed_by is null and reviewed_at is null and rejection_reason is null)
    or (review_status = 'approved' and reviewed_by is not null and reviewed_at is not null and rejection_reason is null)
    or (review_status = 'rejected' and reviewed_by is not null and reviewed_at is not null
      and rejection_reason is not null and btrim(rejection_reason) <> '')
  )
);

create index if not exists caregiver_documents_caregiver_idx
on public.caregiver_documents(caregiver_id, created_at desc);
create index if not exists caregiver_documents_reviewer_idx
on public.caregiver_documents(reviewed_by);

alter table public.caregiver_documents enable row level security;
revoke all on public.caregiver_documents from public, anon, authenticated;
grant select on public.caregiver_documents to authenticated;

create policy caregiver_documents_read on public.caregiver_documents
for select to authenticated using (
  caregiver_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create trigger caregiver_documents_updated_at
before update on public.caregiver_documents
for each row execute function private.set_updated_at();

-- เก็บไฟล์ไม่เกิน 5 MB ต่อไฟล์ ใช้ชื่อ path เป็น UUIDผู้ใช้/UUIDไฟล์.นามสกุล
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('caregiver-documents', 'caregiver-documents', false, 5242880,
  array['image/jpeg', 'image/png', 'application/pdf']);

-- ผู้ดูแลอัปโหลดในโฟลเดอร์ตนเองได้ เมื่อมี caregiver_profiles แล้ว
create policy caregiver_documents_upload on storage.objects
for insert to authenticated with check (
  bucket_id = 'caregiver-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and exists (
    select 1 from public.profiles p
    join public.caregiver_profiles cp on cp.caregiver_id = p.id
    where p.id = (select auth.uid()) and p.role = 'caregiver'
  )
);

-- เจ้าของอ่านไฟล์ตนเอง; แอดมินอ่านเฉพาะไฟล์ที่มีรายการเอกสารส่งเข้าระบบแล้ว
create policy caregiver_documents_download on storage.objects
for select to authenticated using (
  bucket_id = 'caregiver-documents'
  and (
    (owner_id = (select auth.uid())::text
      and (storage.foldername(name))[1] = (select auth.uid())::text)
    or (
      exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      and exists (select 1 from public.caregiver_documents d where d.storage_path = name)
    )
  )
);

-- ไม่ให้ overwrite หรือลบไฟล์ที่ส่งตรวจ ป้องกันเปลี่ยนเนื้อหาหลังอนุมัติ

-- submit_caregiver_document: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.submit_caregiver_document(p_path text, p_type text, p_name text, p_mime text)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_id bigint; v_status text;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver') then
   raise exception using errcode='42501', message='caregiver_required'; end if;
 select verification_status into v_status from public.caregiver_profiles where caregiver_id=auth.uid() for update;
 if not found or v_status='verified' then raise exception 'profile_missing_or_already_verified'; end if;
 if p_type not in ('identity','care_certificate','other') or p_type is null or p_name is null or length(btrim(p_name)) not between 1 and 255 then
   raise exception 'invalid_document'; end if;
 if not exists(select 1 from storage.objects o where o.bucket_id='caregiver-documents' and o.name=p_path
   and o.owner_id=auth.uid()::text and split_part(o.name,'/',1)=auth.uid()::text
   and o.metadata->>'mimetype'=p_mime and (o.metadata->>'size')::bigint between 1 and 5242880) then
   raise exception 'uploaded_file_not_found'; end if;
 insert into public.caregiver_documents(caregiver_id,document_type,storage_path,original_file_name,mime_type)
 values(auth.uid(),p_type,p_path,p_name,p_mime) returning id into v_id;
 update public.caregiver_profiles set verification_status='pending',verified_by=null,verified_at=null,rejection_reason=null where caregiver_id=auth.uid();
 return v_id;
end;
$fn$;
revoke all on function match_internal.submit_caregiver_document(text,text,text,text) from public, anon, authenticated;
grant execute on function match_internal.submit_caregiver_document(text,text,text,text) to authenticated;
create or replace function public.submit_caregiver_document(p_path text, p_type text, p_name text, p_mime text)
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.submit_caregiver_document(p_path, p_type, p_name, p_mime); $fn$;
revoke all on function public.submit_caregiver_document(text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_caregiver_document(text,text,text,text) to authenticated;

-- list_verification_queue: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.list_verification_queue()
returns table(caregiver_id uuid, display_name text, verification_status text) language plpgsql stable security definer set search_path = ''
as $fn$

begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
   raise exception using errcode='42501',message='admin_required'; end if;
 return query select cp.caregiver_id,concat_ws(' ',p.first_name,p.last_name),cp.verification_status
 from public.caregiver_profiles cp join public.profiles p on p.id=cp.caregiver_id
 where cp.verification_status='pending' order by cp.updated_at,cp.caregiver_id;
end;
$fn$;
revoke all on function match_internal.list_verification_queue() from public, anon, authenticated;
grant execute on function match_internal.list_verification_queue() to authenticated;
create or replace function public.list_verification_queue()
returns table(caregiver_id uuid, display_name text, verification_status text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_verification_queue(); $fn$;
revoke all on function public.list_verification_queue() from public, anon, authenticated;
grant execute on function public.list_verification_queue() to authenticated;

-- review_caregiver: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.review_caregiver(p_caregiver_id uuid, p_approve boolean, p_reason text)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_status text;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
   raise exception using errcode='42501',message='admin_required'; end if;
 if p_caregiver_id=auth.uid() or p_approve is null then raise exception 'invalid_review'; end if;
 select verification_status into v_status from public.caregiver_profiles where caregiver_id=p_caregiver_id for update;
 if v_status is distinct from 'pending' then raise exception 'review_no_longer_pending'; end if;
 if not p_approve and (p_reason is null or length(btrim(p_reason)) not between 1 and 1000) then raise exception 'rejection_reason_required'; end if;
 if p_approve and not exists(select 1 from public.caregiver_documents d join storage.objects o
   on o.bucket_id='caregiver-documents' and o.name=d.storage_path
   where d.caregiver_id=p_caregiver_id and d.document_type='identity' and d.review_status='pending') then
   raise exception 'identity_document_required'; end if;
 update public.caregiver_documents set review_status=case when p_approve then 'approved' else 'rejected' end,
 reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=case when p_approve then null else btrim(p_reason) end
 where caregiver_id=p_caregiver_id and review_status='pending';
 update public.caregiver_profiles set verification_status=case when p_approve then 'verified' else 'rejected' end,
 verified_by=case when p_approve then auth.uid() else null end,
 verified_at=case when p_approve then now() else null end,
 rejection_reason=case when p_approve then null else btrim(p_reason) end where caregiver_id=p_caregiver_id;
end;
$fn$;
revoke all on function match_internal.review_caregiver(uuid,boolean,text) from public, anon, authenticated;
grant execute on function match_internal.review_caregiver(uuid,boolean,text) to authenticated;
create or replace function public.review_caregiver(p_caregiver_id uuid, p_approve boolean, p_reason text)
returns void language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.review_caregiver(p_caregiver_id, p_approve, p_reason); $fn$;
revoke all on function public.review_caregiver(uuid,boolean,text) from public, anon, authenticated;
grant execute on function public.review_caregiver(uuid,boolean,text) to authenticated;

commit;
````

## database/schema/08_invitations.sql

SHA-256: `13107ec94ca7c5365e9ae696b42699e2a8b50bd2dd9819cdea72954e9e4fa17a`

````sql
-- ระบบคำเชิญ: สิทธิ์เปลี่ยนสถานะอยู่ใน RPC เท่านั้น
begin;
create table public.match_requests (
 id bigint generated always as identity primary key,
 job_post_id bigint not null references public.job_posts(id) on delete restrict,
 caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete restrict,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','not_selected')),
 created_at timestamptz not null default now(), responded_at timestamptz,
 unique(job_post_id,caregiver_id)
);
create unique index match_requests_one_accepted on public.match_requests(job_post_id) where status='accepted';
create index match_requests_caregiver_idx on public.match_requests(caregiver_id,created_at desc);
alter table public.match_requests enable row level security;
revoke all on public.match_requests from public,anon,authenticated;
grant select on public.match_requests to authenticated;
create policy match_requests_read on public.match_requests for select to authenticated using (
 caregiver_id=(select auth.uid()) or exists(select 1 from public.job_posts j where j.id=job_post_id and j.employer_id=(select auth.uid()))
);

create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress', 'completion_pending') then
    -- ทำงานให้สอดคล้องกับการปิดใช้งานผู้ป่วย และตรวจ `is_active` อีกครั้งหลังได้ล็อก
    perform 1 from public.patients
    where id = new.patient_id and employer_id = new.employer_id and is_active
    for share;
    if not found then
      raise exception using errcode = '23514', message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514',
        message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
      or (old.status = 'open' and new.status = 'matched' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
      or (old.status = 'matched' and new.status = 'in_progress' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
      or (old.status = 'in_progress' and new.status = 'completion_pending' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
      or (old.status = 'completion_pending' and new.status = 'completed' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
    ) then
      raise exception using errcode = '23514',
        message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

-- invite_caregiver: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.invite_caregiver(p_job_id bigint, p_caregiver_id uuid)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_job public.job_posts; v_id bigint;
begin
 select * into v_job from public.job_posts where id=p_job_id for update;
 if auth.uid() is null or v_job.employer_id is distinct from auth.uid() or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
 raise exception using errcode='42501',message='job_owner_required'; end if;
 if v_job.status<>'open' then raise exception 'job_not_open'; end if;
 perform 1 from public.caregiver_profiles cp join public.profiles p on p.id=cp.caregiver_id
 where cp.caregiver_id=p_caregiver_id and p.role='caregiver' and cp.verification_status='verified' and cp.availability_status='available' for share of cp;
 if not found then raise exception 'caregiver_not_eligible'; end if;
 insert into public.match_requests(job_post_id,caregiver_id) values(p_job_id,p_caregiver_id)
 on conflict(job_post_id,caregiver_id) do nothing returning id into v_id;
 if v_id is null then raise exception 'invitation_already_exists'; end if;
 return v_id;
end;
$fn$;
revoke all on function match_internal.invite_caregiver(bigint,uuid) from public, anon, authenticated;
grant execute on function match_internal.invite_caregiver(bigint,uuid) to authenticated;
create or replace function public.invite_caregiver(p_job_id bigint, p_caregiver_id uuid)
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.invite_caregiver(p_job_id, p_caregiver_id); $fn$;
revoke all on function public.invite_caregiver(bigint,uuid) from public, anon, authenticated;
grant execute on function public.invite_caregiver(bigint,uuid) to authenticated;

-- respond_to_invitation: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.respond_to_invitation(p_request_id bigint, p_accept boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_request public.match_requests; v_job public.job_posts; v_job_id bigint;
begin
 if auth.uid() is null or p_accept is null then raise exception using errcode='42501',message='caregiver_required'; end if;
 select job_post_id into v_job_id from public.match_requests where id=p_request_id and caregiver_id=auth.uid();
 if v_job_id is null then raise exception using errcode='42501',message='invitation_owner_required'; end if;
 -- ทุกคำตอบล็อกประกาศก่อนคำเชิญ เพื่อกันการตอบรับสองคนพร้อมกัน
 select * into v_job from public.job_posts where id=v_job_id for update;
 select * into v_request from public.match_requests where id=p_request_id for update;
 if v_request.status<>'pending' or v_job.status<>'open' then raise exception 'invitation_no_longer_open'; end if;
 if not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver') then raise exception using errcode='42501',message='caregiver_required'; end if;
 if p_accept then
   perform 1 from public.caregiver_profiles where caregiver_id=auth.uid() and verification_status='verified' and availability_status='available' for share;
   if not found then raise exception 'caregiver_not_eligible'; end if;
 end if;
 update public.match_requests set status=case when p_accept then 'accepted' else 'rejected' end,responded_at=now() where id=p_request_id;
 if p_accept then
   update public.job_posts set status='matched' where id=v_job_id;
   update public.match_requests set status='not_selected',responded_at=now() where job_post_id=v_job_id and status='pending';
 end if;
end;
$fn$;
revoke all on function match_internal.respond_to_invitation(bigint,boolean) from public, anon, authenticated;
grant execute on function match_internal.respond_to_invitation(bigint,boolean) to authenticated;
create or replace function public.respond_to_invitation(p_request_id bigint, p_accept boolean)
returns void language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.respond_to_invitation(p_request_id, p_accept); $fn$;
revoke all on function public.respond_to_invitation(bigint,boolean) from public, anon, authenticated;
grant execute on function public.respond_to_invitation(bigint,boolean) to authenticated;

-- list_my_invitations: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.list_my_invitations()
returns table(request_id bigint, job_post_id bigint, caregiver_id uuid, title text, description text, province text, district text, starts_at timestamptz, ends_at timestamptz, pay_amount numeric, pay_unit text, status text, job_status text, caregiver_name text) language plpgsql stable security definer set search_path = ''
as $fn$

begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 return query select r.id,j.id,r.caregiver_id,j.title,j.description,j.province,j.district,j.starts_at,j.ends_at,j.pay_amount,j.pay_unit,r.status,j.status,concat_ws(' ',p.first_name,p.last_name)
 from public.match_requests r join public.job_posts j on j.id=r.job_post_id join public.profiles p on p.id=r.caregiver_id
 where (r.caregiver_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='caregiver'))
 or (j.employer_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='employer'))
 order by r.created_at desc,r.id desc;
end;
$fn$;
revoke all on function match_internal.list_my_invitations() from public, anon, authenticated;
grant execute on function match_internal.list_my_invitations() to authenticated;
create or replace function public.list_my_invitations()
returns table(request_id bigint, job_post_id bigint, caregiver_id uuid, title text, description text, province text, district text, starts_at timestamptz, ends_at timestamptz, pay_amount numeric, pay_unit text, status text, job_status text, caregiver_name text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_my_invitations(); $fn$;
revoke all on function public.list_my_invitations() from public, anon, authenticated;
grant execute on function public.list_my_invitations() to authenticated;

-- get_match_contact: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.get_match_contact(p_request_id bigint)
returns table(display_name text, phone text, line_id text, province text, district text, subdistrict text, address_detail text) language plpgsql stable security definer set search_path = ''
as $fn$

declare v_request public.match_requests; v_job public.job_posts; v_other uuid;
begin
 select * into v_request from public.match_requests where id=p_request_id;
 select * into v_job from public.job_posts where id=v_request.job_post_id;
 if auth.uid() is null or v_request.status is distinct from 'accepted' or (auth.uid() is distinct from v_request.caregiver_id and auth.uid() is distinct from v_job.employer_id) then
 raise exception using errcode='42501',message='accepted_match_required'; end if;
 v_other:=case when auth.uid()=v_request.caregiver_id then v_job.employer_id else v_request.caregiver_id end;
 return query select concat_ws(' ',p.first_name,p.last_name),p.phone,p.line_id,v_job.province,v_job.district,v_job.subdistrict,v_job.address_detail from public.profiles p where p.id=v_other;
end;
$fn$;
revoke all on function match_internal.get_match_contact(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_match_contact(bigint) to authenticated;
create or replace function public.get_match_contact(p_request_id bigint)
returns table(display_name text, phone text, line_id text, province text, district text, subdistrict text, address_detail text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_match_contact(p_request_id); $fn$;
revoke all on function public.get_match_contact(bigint) from public, anon, authenticated;
grant execute on function public.get_match_contact(bigint) to authenticated;

-- เมื่อปิดประกาศ ยุติคำเชิญค้างด้วย
create or replace function private.close_pending_invitations() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='closed' and old.status is distinct from new.status then
 update public.match_requests set status='not_selected',responded_at=now() where job_post_id=new.id and status='pending';
 end if; return new;
end; $$;
revoke all on function private.close_pending_invitations() from public,anon,authenticated;
create trigger job_close_invitations after update of status on public.job_posts for each row execute function private.close_pending_invitations();

-- เริ่มงานได้เมื่อเจ้าของประกาศมีผู้ดูแลตอบรับแล้ว
create or replace function match_internal.start_matched_job(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or v_job.employer_id is distinct from auth.uid()
   or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
   raise exception using errcode='42501',message='job_owner_required';
 end if;
 if v_job.status <> 'matched' then raise exception 'job_not_ready_to_start'; end if;
 if not exists(select 1 from public.match_requests where job_post_id=p_job_id and status='accepted') then
   raise exception using errcode='23514',message='accepted_match_required';
 end if;
 update public.job_posts set status='in_progress',started_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.start_matched_job(bigint) from public,anon,authenticated;
grant execute on function match_internal.start_matched_job(bigint) to authenticated;
create or replace function public.start_matched_job(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.start_matched_job(p_job_id); $fn$;
revoke all on function public.start_matched_job(bigint) from public,anon,authenticated;
grant execute on function public.start_matched_job(bigint) to authenticated;

-- ผู้ดูแลแจ้งจบงานของคู่ที่ตอบรับแล้ว
create or replace function match_internal.request_job_completion(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver')
   or not exists(select 1 from public.match_requests where job_post_id=p_job_id and caregiver_id=auth.uid() and status='accepted') then
   raise exception using errcode='42501',message='accepted_caregiver_required';
 end if;
 if v_job.status <> 'in_progress' then raise exception 'job_not_in_progress'; end if;
 update public.job_posts set status='completion_pending',completion_requested_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.request_job_completion(bigint) from public,anon,authenticated;
grant execute on function match_internal.request_job_completion(bigint) to authenticated;
create or replace function public.request_job_completion(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.request_job_completion(p_job_id); $fn$;
revoke all on function public.request_job_completion(bigint) from public,anon,authenticated;
grant execute on function public.request_job_completion(bigint) to authenticated;

-- ผู้ว่าจ้างเจ้าของประกาศยืนยันปิดงาน
create or replace function match_internal.confirm_job_completion(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or v_job.employer_id is distinct from auth.uid()
   or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
   raise exception using errcode='42501',message='job_owner_required';
 end if;
 if v_job.status <> 'completion_pending' then raise exception 'job_completion_not_pending'; end if;
 if v_job.completion_requested_at is null then raise exception using errcode='23514',message='completion_request_required'; end if;
 update public.job_posts set status='completed',completed_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.confirm_job_completion(bigint) from public,anon,authenticated;
grant execute on function match_internal.confirm_job_completion(bigint) to authenticated;
create or replace function public.confirm_job_completion(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.confirm_job_completion(p_job_id); $fn$;
revoke all on function public.confirm_job_completion(bigint) from public,anon,authenticated;
grant execute on function public.confirm_job_completion(bigint) to authenticated;
commit;
````

## database/tests/caregiver_profiles_rls_test.sql

SHA-256: `9a4f04936ea389d098720c3d94dfde763a71fd5fbc7206ef5f8d61037efb0261`

````sql
-- ทดสอบ 1: Caregiver สร้างและอ่านโปรไฟล์ของตัวเองได้
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

-- ทดสอบ 2: Employer ต้องสร้างโปรไฟล์ผู้ดูแลไม่ได้

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

-- ทดสอบ 3: Caregiver แก้โปรไฟล์ตัวเองได้
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

-- ทดสอบ 4: Caregiver ต้องยืนยันตัวเองไม่ได้

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

-- ทดสอบ 5: Employer อ่านและแก้โปรไฟล์ผู้ดูแลไม่ได้

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

-- ทดสอบ 6: Caregiver เพิ่ม อ่าน และลบทักษะของตัวเองได้

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

-- ทดสอบ 7: Employer จัดการทักษะของ Caregiver ไม่ได้

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
````

## database/tests/job_posts_id4_test.sql

SHA-256: `f2632b6db72ec565bc796756d12af59054e79a335350a17956d447d334a153b1`

````sql
-- ทดสอบ ID 4 ด้วยข้อมูลชั่วคราว: คำสั่งสุดท้าย rollback ทุกแถว
begin;

select set_config(
  'test.employer_id',
  (select id::text from auth.users where email = 'employer.test@example.com'),
  true
);
select set_config(
  'test.caregiver_id',
  (select id::text from auth.users where email = 'caregiver.test@example.com'),
  true
);
select set_config(
  'test.other_employer_id',
  (select id::text from public.profiles
   where role = 'employer'
     and id <> current_setting('test.employer_id')::uuid
   limit 1),
  true
);
select set_config(
  'test.skill_id',
  (select id::text from public.skills where is_active = true order by id limit 1),
  true
);

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

with new_patient as (
  insert into public.patients (
    employer_id, first_name, last_name, birth_date, mobility_status,
    province, district, subdistrict, address_detail
  ) values (
    (select auth.uid()), 'ทดสอบ', 'ประกาศงาน', '1950-01-01', 'walker',
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
  ) returning id
)
select set_config('test.patient_id', id::text, true) from new_patient;

with new_job as (
  insert into public.job_posts (
    employer_id, patient_id, title, description, care_summary,
    starts_at, ends_at, pay_amount, pay_unit,
    province, district, subdistrict, address_detail
  ) values (
    (select auth.uid()), current_setting('test.patient_id')::bigint,
    'ประกาศทดสอบ', 'รายละเอียดงานสมมติ', 'ดูแลการเคลื่อนไหว',
    now() + interval '1 day', now() + interval '2 days', 1200, 'day',
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
  ) returning id
)
select set_config('test.job_id', id::text, true) from new_job;

insert into public.job_required_skills (job_post_id, skill_id)
values (
  current_setting('test.job_id')::bigint,
  current_setting('test.skill_id')::bigint
);

update public.job_posts set status = 'open'
where id = current_setting('test.job_id')::bigint;
set constraints job_posts_require_skill immediate;

do $$
begin
  if not exists (
    select 1 from public.job_posts
    where id = current_setting('test.job_id')::bigint
      and status = 'open' and published_at is not null
  ) then
    raise exception 'เปิดประกาศไม่สำเร็จ';
  end if;

  begin
    update public.patients set is_active = false
    where id = current_setting('test.patient_id')::bigint;
    raise exception 'ปิดผู้ป่วยทั้งที่มีประกาศเปิดอยู่ได้';
  exception
    when check_violation then
      perform set_config('test.patient_guard_passed', 'true', true);
  end;
end;
$$;

-- ผู้ดูแลอ่านประกาศที่มีที่อยู่ละเอียดไม่ได้ และสร้างประกาศไม่ได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.caregiver_id'),
    'role', 'authenticated'
  )::text,
  true
);

do $$
begin
  if exists (select 1 from public.job_posts
             where id = current_setting('test.job_id')::bigint) then
    raise exception 'ผู้ดูแลอ่านประกาศส่วนตัวได้';
  end if;

  begin
    insert into public.job_posts (
      employer_id, patient_id, title, description, care_summary,
      starts_at, ends_at, pay_amount, pay_unit,
      province, district, subdistrict, address_detail
    ) values (
      (select auth.uid()), current_setting('test.patient_id')::bigint,
      'ไม่ควรสร้างได้', 'รายละเอียด', 'สรุป',
      now() + interval '1 day', now() + interval '2 days', 100, 'day',
      'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
    );
    raise exception 'ผู้ดูแลสร้างประกาศได้';
  exception
    when others then
      if sqlerrm in ('ผู้ดูแลสร้างประกาศได้') then
        raise;
      end if;
      perform set_config('test.caregiver_rejected', 'true', true);
  end;
end;
$$;

-- ผู้ว่าจ้างรายอื่นมองไม่เห็นและแก้ไขประกาศนี้ไม่ได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.other_employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
select set_config(
  'test.other_owner_hidden',
  ((select count(*) from public.job_posts
    where id = current_setting('test.job_id')::bigint) = 0)::text,
  true
);
with changed as (
  update public.job_posts set title = 'แก้ไขข้ามบัญชี'
  where id = current_setting('test.job_id')::bigint
  returning id
)
select set_config('test.other_owner_update_count', count(*)::text, true)
from changed;

-- เจ้าของปิดประกาศแล้วจึงปิดผู้ป่วยได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
update public.job_posts set status = 'closed'
where id = current_setting('test.job_id')::bigint;
update public.patients set is_active = false
where id = current_setting('test.patient_id')::bigint;

select
  current_setting('test.patient_guard_passed')::boolean as patient_guard_passed,
  current_setting('test.caregiver_rejected')::boolean as caregiver_rejected,
  current_setting('test.other_owner_hidden')::boolean as other_owner_hidden,
  current_setting('test.other_owner_update_count')::integer = 0
    as other_owner_update_rejected,
  (select status = 'closed' and closed_at is not null
   from public.job_posts where id = current_setting('test.job_id')::bigint)
    as job_closed,
  (select is_active = false
   from public.patients where id = current_setting('test.patient_id')::bigint)
    as patient_deactivated_after_close;

rollback;
````

## database/tests/matching_search_test.sql

SHA-256: `e20ddd1cf42f7e7d2f99dc8a8733fa729b12918e0f95e252391819aa22a61103`

````sql
-- รันหลังติดตั้ง 06_matching.sql; ข้อมูลสมมติทั้งหมดถูก rollback
begin;
select set_config('test.owner', gen_random_uuid()::text, true);
select set_config('test.other', gen_random_uuid()::text, true);
select set_config('test.full', gen_random_uuid()::text, true);
select set_config('test.partial', gen_random_uuid()::text, true);
select set_config('test.unverified', gen_random_uuid()::text, true);
select set_config('test.unavailable', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.owner','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.profiles(id, role, first_name, last_name, phone, province, district, subdistrict, address_detail)
select current_setting(k)::uuid,
  case when k in ('test.owner','test.other') then 'employer' else 'caregiver' end,
  'ทดสอบ', k, '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ข้อมูลสมมติ'
from unnest(array['test.owner','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.caregiver_profiles(caregiver_id, availability_status, verification_status, verified_by, verified_at)
select current_setting(k)::uuid,
  case when k = 'test.unavailable' then 'unavailable' else 'available' end,
  case when k = 'test.unverified' then 'not_submitted' else 'verified' end,
  case when k <> 'test.unverified' then current_setting('test.owner')::uuid end,
  case when k <> 'test.unverified' then now() end
from unnest(array['test.full','test.partial','test.unverified','test.unavailable']) k;

-- สร้างประกาศด้วยสิทธิ์ผู้ว่าจ้างจริง
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare p public.patients; j bigint; tags bigint[];
begin
  select array_agg(id order by id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  if cardinality(tags) is distinct from 2 then raise exception 'ต้องมีทักษะที่เปิดใช้งานสองรายการ'; end if;
  perform set_config('test.tags', tags::text, true);
  p := public.save_patient_with_tags(null,'ทดสอบ','จับคู่','1950-01-01','walker',null,
    'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',tags);
  j := public.create_job_with_tags(p.id,'ทดสอบจับคู่','รายละเอียด','การดูแล',now()+interval '1 day',now()+interval '2 days',1000,'day',tags);
  perform set_config('test.job',j::text,true);
end $$;
reset role;
insert into public.caregiver_skills(caregiver_id, skill_id)
select current_setting(k)::uuid, tag
from unnest(array['test.full','test.partial','test.unverified','test.unavailable']) k
cross join unnest(current_setting('test.tags')::bigint[]) tag
where k <> 'test.partial' or tag = (current_setting('test.tags')::bigint[])[1];
set local role authenticated;
do $$
declare counts bigint[];
begin
  select array_agg(s.matched_skills order by s.matched_skills desc) into counts
  from public.search_caregivers_for_job(current_setting('test.job')::bigint) s
  where s.caregiver_id in (current_setting('test.full')::uuid,current_setting('test.partial')::uuid);
  if counts is distinct from array[2,1]::bigint[] then raise exception 'คะแนนทักษะผิด'; end if;
  if exists(select 1 from public.search_caregivers_for_job(current_setting('test.job')::bigint) s
    where s.caregiver_id in (current_setting('test.unverified')::uuid,current_setting('test.unavailable')::uuid))
  then raise exception 'พบผู้ดูแลที่ไม่ผ่านเงื่อนไข'; end if;
  if exists(select 1 from public.search_caregivers_for_job(current_setting('test.job')::bigint) s where s.required_skills <> 2)
  then raise exception 'จำนวนทักษะประกาศผิด'; end if;
end $$;

-- ผู้ว่าจ้างอื่น ผู้ดูแล และผู้ไม่มี session ต้องถูกปฏิเสธ
do $$
declare k text;
begin
  foreach k in array array['test.other','test.full'] loop
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting(k),'role','authenticated')::text,true);
    begin
      perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
      raise exception 'ผู้ไม่มีสิทธิ์ค้นหาได้';
    exception when insufficient_privilege then null; end;
  end loop;
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
    raise exception 'ไม่มี session แต่ค้นหาได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
select public.close_job(current_setting('test.job')::bigint);
do $$ begin
  begin
    perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
    raise exception 'ประกาศปิดแล้วแต่ค้นหาได้';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.search_caregivers_for_job(bigint)','EXECUTE')
    or has_function_privilege('anon','match_internal.search_caregivers_for_job(bigint)','EXECUTE')
  then raise exception 'anon เรียกฟังก์ชันได้'; end if;
end $$;
select 'matching_search_tests_passed' as result;
rollback;
````

## database/tests/patient_atomic_save_test.sql

SHA-256: `03741d172a6fb3a911f2c96cb49d3cb55d943d829e85c3e2c106ef354c42685f`

````sql
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
````

## database/tests/patients_rls_test.sql

SHA-256: `16d658d81ef50c631cf03ddbe5147d26e7274c266be0a7f77764c8a745e9ea1a`

````sql
-- ทดสอบ 1: Employer เพิ่มและอ่านผู้ป่วยของตนเองได้
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


-- ทดสอบ 2: Caregiver ต้องไม่สามารถเพิ่มผู้ป่วยได้

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


-- ทดสอบ 3: ผู้ใช้บัญชีอื่นต้องอ่านหรือแก้ผู้ป่วยของ Employer ไม่ได้

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

-- ทดสอบ 4: ระบบต้องปฏิเสธวันเกิดในอนาคต

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
      (now() at time zone 'Asia/Bangkok')::date + 1,
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


-- ทดสอบ 5: Employer เชื่อมสภาวะและทักษะกับผู้ป่วยของตนเองได้

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

-- ทดสอบ 6: Employer แก้ไขและปิดใช้งานผู้ป่วยของตนเองได้

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
````

## database/tests/profiles_rls_test.sql

SHA-256: `1d163fc2d5e87f68ee29002605cedf9d93c13f852f80983d804ae70647b27797`

````sql
-- ทดสอบ 1: ผู้ใช้ที่ล็อกอินสร้างและอ่านโปรไฟล์ของตัวเองได้
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


-- ทดสอบ 2: Employer ต้องมองไม่เห็นโปรไฟล์ของ Caregiver

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

-- ทดสอบ 3: Employer แก้โปรไฟล์ตัวเองได้ แต่แก้ Caregiver ไม่ได้

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

-- ทดสอบ 4: ผู้ใช้ทั่วไปต้องสร้างโปรไฟล์ role = admin ไม่ได้

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

-- ทดสอบ 5: ผู้ที่ยังไม่ล็อกอินต้องอ่าน profiles ไม่ได้

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

-- ทดสอบ 6: updated_at ต้องเปลี่ยนอัตโนมัติเมื่อแก้ไขโปรไฟล์

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
````

## database/tests/run-local.mjs

SHA-256: `9ee5e4d7ad47967b78a6b593373073c8ac492a6ba3d8df76481d5b1d116e881c`

````javascript
import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('../../', import.meta.url)))
const db = new PGlite()

// จำลองเฉพาะโครงสร้างที่ SQL ใช้ ไม่ใช่บริการ Auth/Storage HTTP จริง
const testEnvironment = `
  create role anon;
  create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id), name text,
    owner_id text, metadata jsonb, unique (bucket_id, name)
  );
  alter table storage.objects enable row level security;
  grant usage on schema storage to authenticated, anon;
  grant select, insert, update, delete on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[]
  language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1]
  $$;
`

async function runFile(folder, file) {
  await db.exec(fs.readFileSync(`${folder}/${file}`, 'utf8'))
  console.log('PASS', `${folder}/${file}`)
}

try {
  await db.exec(testEnvironment)
  const schemas = fs.readdirSync('database/schema')
    .filter((file) => file.endsWith('.sql'))
    .sort()
  for (const file of schemas) await runFile('database/schema', file)

  const tests = [
    'matching_search_test.sql',
    'workflow_integration_test.sql',
    'sprint1_integration_test.sql',
  ]
  for (const file of tests) await runFile('database/tests', file)
} catch (error) {
  console.error('FAIL', error.message, error.detail ?? '')
  process.exitCode = 1
} finally {
  await db.close()
}
````

## database/tests/skills_crud_test.sql

SHA-256: `443e523726051345369d7b14bd7f2d6a76f65f5f109825c3e01e636dccf5f2f3`

````sql
-- ทดสอบ CRUD ของตาราง skills ด้วยข้อมูลจำลอง
-- ให้รันทีละส่วนตามลำดับ ไม่ควรรันทั้งไฟล์ระหว่างเก็บหลักฐาน


-- CREATE: เพิ่มข้อมูลจำลอง

insert into public.skills (name, description)
values ('Medication Assistance (Demo)', 'ข้อมูลจำลองสำหรับทดสอบ CRUD')
returning id, name, description, is_active;


-- READ: อ่านข้อมูลจำลอง

select
  id,
  name,
  description,
  is_active
from public.skills
where name = 'Medication Assistance (Demo)';


-- UPDATE: แก้ไขคำอธิบายของข้อมูลจำลอง

update public.skills
set description = 'แก้ไขข้อมูลจำลองสำเร็จ'
where name = 'Medication Assistance (Demo)'
returning id, name, description, is_active;


-- DELETE: ลบเฉพาะข้อมูลจำลอง

delete from public.skills
where name = 'Medication Assistance (Demo)'
returning id, name;


-- ตรวจสอบว่าข้อมูลจำลองถูกลบแล้ว

select
  id,
  name
from public.skills
where name = 'Medication Assistance (Demo)';
````

## database/tests/skills_rls_test.sql

SHA-256: `bddb6921abb2ac7baf11ef9e7b4dd49303d44f5cf72af11fc9a26b293f6955c7`

````sql
-- ทดสอบว่า RLS แสดงเฉพาะทักษะที่เปิดใช้งาน

begin;

update public.skills
set is_active = false
where name = 'การปฐมพยาบาลเบื้องต้น';

set local role anon;

select
  id,
  name,
  is_active
from public.skills
order by id;

rollback;


-- ตรวจสอบสิทธิ์ของผู้ใช้ Frontend

select
  (
    select is_active
    from public.skills
    where name = 'การปฐมพยาบาลเบื้องต้น'
  ) as first_aid_restored,

  has_table_privilege(
    'anon',
    'public.skills',
    'select'
  ) as anon_can_select,

  has_table_privilege(
    'anon',
    'public.skills',
    'insert'
  ) as anon_can_insert,

  has_table_privilege(
    'authenticated',
    'public.skills',
    'select'
  ) as authenticated_can_select,

  has_table_privilege(
    'authenticated',
    'public.skills',
    'insert'
  ) as authenticated_can_insert;
````

## database/tests/sprint1_integration_test.sql

SHA-256: `4fe1d4b5ce3c7c187bc631b0a1d4d36f69a211cb1d33bd8b56f9fccffd956b7b`

````sql
-- ชุดทดสอบการทำงานร่วมกันที่รันซ้ำได้ ข้อมูลทดสอบทั้งหมดถูก rollback และเลข sequence อาจข้ามได้
begin;
select set_config('test.owner', gen_random_uuid()::text, true);
select set_config('test.other', gen_random_uuid()::text, true);
select set_config('test.caregiver', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(key)::uuid, current_setting(key) || '@example.com'
from unnest(array['test.owner','test.other','test.caregiver']) key;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
set local role authenticated;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'employer','ทดสอบ','สปรินต์หนึ่ง','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'profile isolation failed'; end if;
  begin
    update public.profiles set role='admin' where id=auth.uid();
    raise exception 'role escalation allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set phone='12345678901' where id=auth.uid();
    raise exception 'long phone allowed';
  exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'employer','อื่น','สปรินต์หนึ่ง','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
do $$ begin
  begin
    insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
    values(auth.uid(),'admin','ทดสอบ','ผู้ดูแล','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
    raise exception 'admin signup allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'caregiver','ทดสอบ','ผู้ดูแล','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
do $$
declare p public.patients; j bigint; skills bigint[]; before_count bigint; rejected boolean;
begin
  select array_agg(id) into skills from (select id from public.skills where is_active order by id limit 2) s;
  if cardinality(skills) < 2 then raise exception 'Need two active skill fixtures'; end if;
  p := public.save_patient_with_tags(null,'ทดสอบ','ผู้ป่วย','1950-01-01','walker',null,
    'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',skills);
  perform set_config('test.patient',p.id::text,true);
  -- ใช้วันตามเวลาเดียวกับ `validate_patient` รวมถึงช่วงเที่ยงคืนที่วัน UTC และวันไทยต่างกัน
  update public.patients set birth_date=(now() at time zone 'Asia/Bangkok')::date where id=p.id;
  begin
    update public.patients set birth_date=(now() at time zone 'Asia/Bangkok')::date+1 where id=p.id;
    raise exception 'future birthday allowed';
  exception when check_violation then null; end;
  update public.patients set birth_date='1950-01-01' where id=p.id;
  j := public.create_job_with_tags(p.id,'ทดสอบประกาศ','รายละเอียด','การดูแล',now()+interval '1 day',now()+interval '2 days',1200,'day',skills);
  perform set_config('test.job',j::text,true);
  if not exists(select 1 from public.job_posts where id=j and status='open' and published_at is not null)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 2 then raise exception 'create failed'; end if;
  perform public.update_job_with_tags(j,p.id,'แก้ไขประกาศ','รายละเอียดใหม่','สรุปใหม่',now()+interval '2 days',now()+interval '3 days',1500,'day',array[skills[2]]);
  if not exists(select 1 from public.job_posts where id=j and title='แก้ไขประกาศ' and pay_amount=1500)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 1 then raise exception 'update failed'; end if;
  -- แท็กไม่ถูกต้อง ค่าตอบแทนเป็นศูนย์ วันเริ่มหลังวันสิ้นสุด หรือข้อความว่าง ต้องไม่เปลี่ยนประกาศเดิม
  for i in 1..4 loop
    rejected := false;
    begin
      perform public.update_job_with_tags(j,p.id,case when i=4 then ' ' else 'ห้ามบันทึก' end,'รายละเอียด','สรุป',now(),
        case when i=3 then now()-interval '1 day' else now()+interval '1 day' end,
        case when i=2 then 0 else 100 end,'day',case when i=1 then array[-1::bigint] else skills end);
    exception when raise_exception or check_violation then rejected := true; end;
    if not rejected then raise exception 'invalid update accepted case %',i; end if;
  end loop;
  if not exists(select 1 from public.job_posts where id=j and title='แก้ไขประกาศ' and pay_amount=1500)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 1 then raise exception 'atomic rollback failed'; end if;
  select count(*) into before_count from public.job_posts;
  rejected := false;
  begin
    perform public.create_job_with_tags(p.id,'ผิดพลาด','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day','{}');
  exception when raise_exception then rejected:=true; end;
  if not rejected or (select count(*) from public.job_posts) <> before_count then raise exception 'empty skills accepted'; end if;
  begin
    update public.patients set is_active=false where id=p.id;
    raise exception 'active patient deactivated';
  exception when check_violation then null; end;
  -- การตรวจ constraint ทันทีต้องยืนยันด้วยว่ายังเหลือทักษะอย่างน้อยหนึ่งรายการ
  begin
    delete from public.job_required_skills where job_post_id=j;
    set constraints all immediate;
    raise exception 'last skill removed';
  exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
do $$ declare rejected boolean:=false; begin
  if exists(select 1 from public.patients) or exists(select 1 from public.job_posts) then raise exception 'cross account data visible'; end if;
  begin perform public.close_job(current_setting('test.job')::bigint);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'cross owner close allowed'; end if;
  rejected:=false;
  begin perform public.update_job_with_tags(current_setting('test.job')::bigint,current_setting('test.patient')::bigint,
    'ข้ามบัญชี','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day',array[1::bigint]);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'cross owner update allowed'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
do $$ declare rejected boolean:=false; begin
  begin perform public.create_job_with_tags(current_setting('test.patient')::bigint,'งาน','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day',array[1::bigint]);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'caregiver created job'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
do $$ declare j bigint:=current_setting('test.job')::bigint; rejected boolean:=false; begin
  perform public.close_job(j);
  if not exists(select 1 from public.job_posts where id=j and status='closed' and closed_at is not null) then raise exception 'close failed'; end if;
  begin perform public.close_job(j); exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'stale close gave success'; end if;
  update public.patients set is_active=false where id=current_setting('test.patient')::bigint;
  if not found then raise exception 'patient deactivation after close failed'; end if;
end $$;
set constraints all immediate;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.profiles; raise exception 'anon can read profiles'; exception when insufficient_privilege then null; end;
  begin perform public.close_job(1); raise exception 'anon can call close'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select true as profiles_and_roles_passed, true as patient_guard_passed,
 true as job_create_update_close_passed, true as atomic_rollback_passed,
 true as cross_account_passed, true as anon_denied;
rollback;
````

## database/tests/workflow_integration_test.sql

SHA-256: `21c9cae17bc95682dae037f1ee995fed567ade6784e24f57f8847c2ab408d5cf`

````sql
-- ทดสอบด้วยข้อมูลสมมติเท่านั้น; รันหลัง schema 01–08 และ rollback ทุกแถว
-- storage.objects ด้านล่างเป็น metadata จำลอง ไม่ใช่การอัปโหลดไฟล์ผ่าน Storage API
begin;
select set_config('test.employer',gen_random_uuid()::text,true);
select set_config('test.other',gen_random_uuid()::text,true);
select set_config('test.caregiver',gen_random_uuid()::text,true);
select set_config('test.second',gen_random_uuid()::text,true);
select set_config('test.admin',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.employer','test.other','test.caregiver','test.second','test.admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,case when k='test.admin' then 'admin' when k in ('test.caregiver','test.second') then 'caregiver' else 'employer' end,
'ทดสอบ',k,'0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ'
from unnest(array['test.employer','test.other','test.caregiver','test.second','test.admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status)
values(current_setting('test.caregiver')::uuid,'available'),(current_setting('test.second')::uuid,'available');

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
set local role authenticated;
-- ห้ามอัปโหลดเข้าโฟลเดอร์คนอื่น และห้ามยืนยันตนเอง
do $$ begin
  begin
    insert into storage.objects(bucket_id,name,owner_id,metadata)
    values('caregiver-documents',current_setting('test.second')||'/fake.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
    raise exception 'cross-owner upload allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.review_caregiver(auth.uid(),true,null);
    raise exception 'self approval allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity.pdf','identity','เอกสารสมมติ.pdf','application/pdf');
do $$ begin
  if not exists(select 1 from public.caregiver_profiles where verification_status='pending') then raise exception 'submission not pending'; end if;
  begin
    update public.caregiver_documents set review_status='approved';
    raise exception 'direct document approval allowed';
  exception when insufficient_privilege then null; end;
end $$;

-- ผู้ว่าจ้างดูเอกสารไม่ได้ และส่งไฟล์เองไม่ได้
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ begin
  if exists(select 1 from public.caregiver_documents) then raise exception 'employer sees documents'; end if;
  if exists(select 1 from storage.objects where bucket_id='caregiver-documents') then raise exception 'employer sees private files'; end if;
  begin
    insert into storage.objects(bucket_id,name,owner_id,metadata)
    values('caregiver-documents',auth.uid()::text||'/employer.pdf',auth.uid()::text,'{}');
    raise exception 'employer upload allowed';
  exception when insufficient_privilege then null; end;
end $$;

-- แอดมินเห็นคิวและไฟล์ที่ส่งแล้ว; ทดสอบปฏิเสธและส่งใหม่
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.list_verification_queue() where caregiver_id=current_setting('test.caregiver')::uuid) then raise exception 'queue missing'; end if;
  if not exists(select 1 from storage.objects where name=current_setting('test.caregiver')||'/identity.pdf') then raise exception 'admin cannot read submitted file'; end if;
  begin
    perform public.review_caregiver(current_setting('test.caregiver')::uuid,false,' ');
    raise exception 'empty rejection reason allowed';
  exception when raise_exception then
    if sqlerrm <> 'rejection_reason_required' then raise; end if;
  end;
end $$;
select public.review_caregiver(current_setting('test.caregiver')::uuid,false,'กรุณาส่งภาพที่ชัดขึ้น');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity-new.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity-new.pdf','identity','เอกสารใหม่.pdf','application/pdf');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
select public.review_caregiver(current_setting('test.caregiver')::uuid,true,null);

-- ผู้ดูแลคนที่สองส่งเอกสารและได้รับอนุมัติ
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity.pdf','identity','ทดสอบสอง.pdf','application/pdf');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
select public.review_caregiver(current_setting('test.second')::uuid,true,null);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ declare p public.patients; j bigint; tags bigint[]; r bigint;
begin
  select array_agg(id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  p:=public.save_patient_with_tags(null,'ทดสอบ','ผู้ป่วย','1950-01-01','walker',null,'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',tags);
  j:=public.create_job_with_tags(p.id,'งานทดสอบจับคู่','รายละเอียด','ดูแล',now()+interval '1 day',now()+interval '2 days',1000,'day',tags);
  perform set_config('test.job',j::text,true);
  if not exists(select 1 from public.search_caregivers_for_job(j) where caregiver_id=current_setting('test.caregiver')::uuid) then raise exception 'approved caregiver missing from search'; end if;
  r:=public.invite_caregiver(j,current_setting('test.caregiver')::uuid);
  perform set_config('test.request',r::text,true);
  r:=public.invite_caregiver(j,current_setting('test.second')::uuid);
  perform set_config('test.second_request',r::text,true);
  begin
    perform public.invite_caregiver(j,current_setting('test.caregiver')::uuid);
    raise exception 'duplicate invite allowed';
  exception when raise_exception then if sqlerrm <> 'invitation_already_exists' then raise; end if; end;
  begin
    perform public.get_match_contact(current_setting('test.request')::bigint);
    raise exception 'contact visible before acceptance';
  exception when insufficient_privilege then null; end;
end $$;

-- คนอื่นเชิญแทนเจ้าของหรือตอบรับแทนไม่ได้
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
do $$ begin
  begin
    perform public.invite_caregiver(current_setting('test.job')::bigint,current_setting('test.caregiver')::uuid);
    raise exception 'foreign job invite allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.respond_to_invitation(current_setting('test.request')::bigint,true);
    raise exception 'foreign invitation acceptance allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
select public.respond_to_invitation(current_setting('test.request')::bigint,true);
do $$ begin
  if (select count(*) from public.match_requests where job_post_id=current_setting('test.job')::bigint and status='accepted') <> 1 then
    raise exception 'expected exactly one accepted caregiver for a job';
  end if;
  if not exists(select 1 from public.get_match_contact(current_setting('test.request')::bigint) where phone='0800000000') then raise exception 'accepted contact missing'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.list_my_invitations() where request_id=current_setting('test.second_request')::bigint and status='not_selected') then raise exception 'other invite still pending'; end if;
  begin
    perform public.respond_to_invitation(current_setting('test.second_request')::bigint,true);
    raise exception 'second acceptance allowed';
  exception when raise_exception then if sqlerrm <> 'invitation_no_longer_open' then raise; end if; end;
  begin
    perform public.get_match_contact(current_setting('test.request')::bigint);
    raise exception 'third party contact visible';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='matched') then raise exception 'job not matched'; end if;
  if not exists(select 1 from public.get_match_contact(current_setting('test.request')::bigint)) then raise exception 'employer contact missing'; end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
  begin
    perform public.start_matched_job(current_setting('test.job')::bigint);
    raise exception 'another employer started the job';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if public.start_matched_job(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'start did not return job id';
  end if;
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='in_progress' and started_at is not null) then
    raise exception 'job did not enter in_progress';
  end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
  begin
    perform public.request_job_completion(current_setting('test.job')::bigint);
    raise exception 'unmatched caregiver requested completion';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
  if public.request_job_completion(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'completion request did not return job id';
  end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='completion_pending' and completion_requested_at is not null) then
    raise exception 'job did not enter completion_pending';
  end if;
  begin
    update public.patients set is_active=false where id=(select patient_id from public.job_posts where id=current_setting('test.job')::bigint);
    raise exception 'patient deactivation allowed while job awaits completion';
  exception when check_violation then
    if sqlerrm <> 'patient_has_active_job' then raise; end if;
  end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
  begin
    perform public.confirm_job_completion(current_setting('test.job')::bigint);
    raise exception 'caregiver confirmed own completion request';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if public.confirm_job_completion(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'employer confirmation did not return job id';
  end if;
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='completed' and completed_at is not null) then
    raise exception 'job did not enter completed';
  end if;
  begin
    perform public.confirm_job_completion(current_setting('test.job')::bigint);
    raise exception 'duplicate completion confirmation allowed';
  exception when raise_exception then if sqlerrm <> 'job_completion_not_pending' then raise; end if; end;
  begin
    perform public.start_matched_job(current_setting('test.job')::bigint);
    raise exception 'duplicate start allowed';
  exception when raise_exception then if sqlerrm <> 'job_not_ready_to_start' then raise; end if; end;
end $$;
-- ทดสอบปฏิเสธคำเชิญและปิดประกาศอีกงานหนึ่ง
do $$ declare j bigint; p bigint; tags bigint[];
begin
  select patient_id into p from public.job_posts where id=current_setting('test.job')::bigint;
  select array_agg(id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  j:=public.create_job_with_tags(p,'งานทดสอบปิด','รายละเอียด','ดูแล',now()+interval '3 days',now()+interval '4 days',1000,'day',tags);
  perform set_config('test.closed_job',j::text,true);
  perform set_config('test.decline',public.invite_caregiver(j,current_setting('test.caregiver')::uuid)::text,true);
  perform set_config('test.close_pending',public.invite_caregiver(j,current_setting('test.second')::uuid)::text,true);
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
select public.respond_to_invitation(current_setting('test.decline')::bigint,false);
do $$ begin
  if not exists(select 1 from public.list_my_invitations() where request_id=current_setting('test.decline')::bigint and status='rejected') then raise exception 'decline failed'; end if;
  begin
    perform public.get_match_contact(current_setting('test.decline')::bigint);
    raise exception 'rejected contact visible';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
select public.close_job(current_setting('test.closed_job')::bigint);
do $$ begin
  if not exists(select 1 from public.match_requests where id=current_setting('test.close_pending')::bigint and status='not_selected') then raise exception 'closing left pending invitations'; end if;
end $$;
-- ไม่มี session ต้องไม่ได้รับข้อมูล แม้เรียกด้วย role authenticated
select set_config('request.jwt.claims','{}',true);
do $$ begin
  begin
    perform public.list_my_invitations();
    raise exception 'anonymous invitation read allowed';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.review_caregiver(uuid,boolean,text)','execute')
    or has_function_privilege('anon','public.respond_to_invitation(bigint,boolean)','execute') then raise exception 'anon execute granted'; end if;
end $$;
reset role;
select 'workflow_integration_passed' as result;
rollback;
````

## frontend/index.html

SHA-256: `07f295c018a3ab08adaac091828e5361e78a3e4ac29941b02eb5dc7816aa83af`

````html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/png" href="/src/assets/navbar/logo.png" />
    <title>MatchCare</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

## frontend/package.json

SHA-256: `77c467d54834c4eb70c0311fb9c3c562b59222bd8a59554cdf9952f7b8efb1fe`

````json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "generate:geography": "node scripts/generate-geography.mjs"
  },
  "dependencies": {
    "@supabase/supabase-js": "2.115.0",
    "@vercel/speed-insights": "^2.0.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
````

## frontend/scripts/generate-geography.mjs

SHA-256: `6d9608e31d8cb4a1c59662affa28f7d8e030c1a934f2ec7cff4ffdb5e5d64c6f`

````javascript
// Generate only the Thai location fields used by the forms.
// Source and license: src/data/geography.json and src/data/thailand-geography-json.LICENSE.txt.
import { readFileSync, writeFileSync } from 'node:fs'
const source = new URL('../src/data/geography.json', import.meta.url)
const output = new URL('../src/data/geography-options.json', import.meta.url)
const locations = {}
for (const row of JSON.parse(readFileSync(source, 'utf8'))) {
  const districts = locations[row.provinceNameTh] ??= {}
  const subdistricts = districts[row.districtNameTh] ??= []
  if (!subdistricts.includes(row.subdistrictNameTh)) subdistricts.push(row.subdistrictNameTh)
}
writeFileSync(output, JSON.stringify(locations) + '\n')
console.log(`Generated ${Object.keys(locations).length} provinces`)
````

## frontend/src/App.jsx

SHA-256: `0ed09349a3f74781ce63196c3d72d26c74742038b0b21414ecc6cb62be66d8a3`

````jsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './styles/App.css'
import LoginForm from './components/LoginForm'
import { supabase } from './lib/supabase'
import RegisterForm from './components/RegisterForm'
import RoleDashboard from './pages/RoleDashboard'
import LandingPage from './pages/LandingPage'
import { SpeedInsights } from '@vercel/speed-insights/react'

const ProfileSetupForm = lazy(() => import('./components/ProfileSetupForm'))

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authMode, setAuthMode] = useState('landing')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const manualSignOutRef = useRef(false)
  const [profileRetry, setProfileRetry] = useState(0)
  const [loadedUserId, setLoadedUserId] = useState(null)

  // Query profiles outside the Auth callback to avoid holding the auth lock.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        if (currentSession) setAuthError('')
        if (event === 'SIGNED_OUT') {
          setAuthMode(manualSignOutRef.current ? 'landing' : 'login')
          if (!manualSignOutRef.current)
            setAuthError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
          manualSignOutRef.current = false
        }
        setAuthLoading(false)
      },
    )
    return () => authListener.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      setProfile(null)
      setProfileError('')
      if (!userId) {
        setProfileLoading(false)
        return
      }
      setProfileLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name')
          .eq('id', userId)
          .maybeSingle()
        if (error) throw error
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setProfileError('ไม่สามารถโหลดโปรไฟล์ได้ กรุณาลองใหม่')
      } finally {
        if (!cancelled) {
          setLoadedUserId(userId)
          setProfileLoading(false)
        }
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [userId, profileRetry])

  async function handleSignOut() {
    setAuthError('')
    manualSignOutRef.current = true

    const { error: signOutError } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (signOutError) {
      manualSignOutRef.current = false
      setAuthError('ไม่สามารถออกจากระบบได้')
    }
  }
  if (authLoading) {
    return <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
  }
  const isProfilePending =
    profileLoading || (session && loadedUserId !== session.user.id)
  const isLandingPage = !session && authMode === 'landing'

  return (
    <main
      className={`app-shell${session && profile ? ' app-shell-dashboard' : ''}${isLandingPage ? ' app-shell-landing' : ''}`}
    >
      {isLandingPage && (
        <LandingPage
          onLogin={() => setAuthMode('login')}
          onRegister={() => setAuthMode('register')}
        />
      )}

      {session ? (
        <section className="auth-status">
          {isProfilePending && <p>กำลังโหลดข้อมูลโปรไฟล์...</p>}

          {profileError && (
            <div role="alert">
              <p>{profileError}</p>
              <button
                type="button"
                onClick={() => setProfileRetry((key) => key + 1)}
              >
                ลองใหม่
              </button>
              <button type="button" onClick={handleSignOut}>
                ออกจากระบบ
              </button>
            </div>
          )}

          {!isProfilePending && !profileError && profile && (
            <RoleDashboard
              key={profile.id}
              profile={profile}
              onSignOut={handleSignOut}
            />
          )}

          {!isProfilePending && !profileError && !profile && (
            <Suspense fallback={<p>กำลังโหลดแบบฟอร์ม...</p>}>
            <ProfileSetupForm
              userId={session.user.id}
              email={session.user.email}
              onSignOut={handleSignOut}
              onProfileCreated={() => setProfileRetry((key) => key + 1)}
            />
            </Suspense>
          )}

          {profile &&
            !['employer', 'caregiver', 'admin'].includes(profile.role) && (
              <button type="button" onClick={handleSignOut}>
                ออกจากระบบ
              </button>
            )}

          {authError && <p role="alert">{authError}</p>}
        </section>
      ) : !isLandingPage ? (
        <section className="auth-panel">
          {authError && <p role="alert">{authError}</p>}

          {authMode === 'login' ? (
            <LoginForm
              onBack={() => setAuthMode('landing')}
              onRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm
              onBack={() => setAuthMode('landing')}
              onLogin={() => setAuthMode('login')}
            />
          )}
        </section>
      ) : null}

      <SpeedInsights />
    </main>
  )
}

export default App
````

## frontend/src/components/CaregiverMatches.jsx

SHA-256: `3536fd7f11762af63a55cf05642171a88c163139c443d7b9a94e618067d4cf49`

````jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callWorkflow, workflowError } from '../lib/workflow'

export default function CaregiverMatches({ job, onBack }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState([])
  const [notice, setNotice] = useState('')
  const [inviteError, setInviteError] = useState('')
  const sending = useRef(false)

  async function invite(caregiver) {
    if (
      sending.current ||
      !window.confirm(
        `ส่งคำเชิญสำหรับ “${job.title}” ให้ ${caregiver.display_name}?`,
      )
    )
      return
    sending.current = true
    setSendingId(caregiver.caregiver_id)
    setNotice('')
    setInviteError('')
    try {
      await callWorkflow('invite_caregiver', {
        p_job_id: job.id,
        p_caregiver_id: caregiver.caregiver_id,
      })
      setSentIds((ids) => [...ids, caregiver.caregiver_id])
      setNotice('ส่งคำเชิญแล้ว ติดตามได้ที่เมนูคำเชิญที่ส่ง')
    } catch (issue) {
      setInviteError(workflowError(issue))
      if (issue.message === 'invitation_already_exists')
        setSentIds((ids) => [...ids, caregiver.caregiver_id])
    } finally {
      sending.current = false
      setSendingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function search() {
      setLoading(true)
      setError('')
      setResults([])
      try {
        const { data, error: queryError } = await supabase.rpc(
          'search_caregivers_for_job',
          { p_job_id: job.id },
        )
        if (queryError) throw queryError
        if (!cancelled) setResults(data ?? [])
      } catch (queryError) {
        if (!cancelled)
          setError(
            queryError.code === '42501'
              ? 'ค้นหาได้เฉพาะประกาศของคุณที่ยังเปิดรับสมัคร กรุณากลับไปตรวจสอบประกาศ'
              : 'ไม่สามารถค้นหาผู้ดูแลได้ กรุณาลองอีกครั้ง',
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    search()
    return () => {
      cancelled = true
    }
  }, [job.id, retry])

  return (
    <section className="job-manager" aria-labelledby="matches-heading">
      <button type="button" className="secondary-button" onClick={onBack}>
        ← กลับไปประกาศงาน
      </button>
      <h2 id="matches-heading">ผู้ดูแลสำหรับ “{job.title}”</h2>
      {notice && <p role="status">{notice}</p>}
      {inviteError && <p role="alert">{inviteError}</p>}
      <p>
        ผู้ดูแลที่ยืนยันแล้วและพร้อมรับงาน เรียงตามทักษะที่ตรงกับประกาศมากที่สุด
      </p>
      {loading ? (
        <p role="status">กำลังค้นหาผู้ดูแล...</p>
      ) : error ? (
        <div className="form-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="job-empty" role="status">
          <h3>ยังไม่พบผู้ดูแลที่พร้อมรับงาน</h3>
          <p>
            ขณะนี้ยังไม่มีผู้ดูแลที่ผ่านการยืนยันและเปิดรับงาน
            ลองค้นหาอีกครั้งภายหลัง
          </p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            ค้นหาอีกครั้ง
          </button>
        </div>
      ) : (
        <>
          <p role="status">พบผู้ดูแล {results.length} คน</p>
          <ol className="caregiver-match-list">
            {results.map((caregiver) => (
              <li className="job-card" key={caregiver.caregiver_id}>
                <div className="job-heading">
                  <h3>{caregiver.display_name}</h3>
                  <span className="job-status job-status-open">
                    ตรง {caregiver.matched_skills} จาก{' '}
                    {caregiver.required_skills} ทักษะ
                  </span>
                </div>
                <p>
                  อ.{caregiver.district} จ.{caregiver.province}
                </p>
                <p>ประสบการณ์ดูแล {caregiver.experience_years} ปี</p>
                <p>ยืนยันแล้ว · พร้อมรับงาน</p>
                <button
                  type="button"
                  disabled={
                    sendingId !== null ||
                    sentIds.includes(caregiver.caregiver_id)
                  }
                  onClick={() => invite(caregiver)}
                >
                  {sentIds.includes(caregiver.caregiver_id)
                    ? 'ส่งคำเชิญแล้ว'
                    : sendingId === caregiver.caregiver_id
                      ? 'กำลังส่ง...'
                      : 'เชิญให้ดูแลงานนี้'}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
````

## frontend/src/components/DocumentList.jsx

SHA-256: `f1c4c3e935fb92c38ce3118d1427768f19e2b380581dffdf0dc511edc631bc3f`

````jsx
import { useCallback, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import {
  loadDocuments,
  downloadDocument,
  documentLabels,
  reviewLabels,
} from '../lib/workflow'

export default function DocumentList({ caregiverId }) {
  const loader = useCallback(() => loadDocuments(caregiverId), [caregiverId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const [downloadError, setDownloadError] = useState('')
  const [downloading, setDownloading] = useState(null)
  async function download(document) {
    setDownloading(document.id)
    setDownloadError('')
    try {
      await downloadDocument(document)
    } catch {
      setDownloadError('ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setDownloading(null)
    }
  }
  if (loading) return <p role="status">กำลังโหลดเอกสาร...</p>
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={reload}>
          ลองอีกครั้ง
        </button>
      </div>
    )
  return (
    <div>
      {downloadError && <p role="alert">{downloadError}</p>}
      {!data.length && <p>ยังไม่มีเอกสารที่ส่งตรวจ</p>}
      <ul className="workflow-list">
        {data.map((document) => (
          <li key={document.id}>
            <div>
              <strong>{documentLabels[document.document_type]}</strong>
              <p>{document.original_file_name}</p>
              <span className="workflow-badge">
                {reviewLabels[document.review_status]}
              </span>
              {document.rejection_reason && (
                <p>เหตุผล: {document.rejection_reason}</p>
              )}
            </div>
            <button
              type="button"
              className="secondary-button"
              disabled={downloading !== null}
              onClick={() => download(document)}
            >
              {downloading === document.id ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
````

## frontend/src/components/Footer.jsx

SHA-256: `bf137cd22d9d570106a32d5acd35e34c4b1c0ef947171b615b1cd431ed032246`

````jsx
import logo from '../assets/navbar/logo.png'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <strong>MatchCare</strong>
        </div>
        <p>© 2026 MatchCare Healthcare Matching. สงวนลิขสิทธิ์</p>
        <nav aria-label="ข้อมูลเว็บไซต์">
          <span>นโยบายความเป็นส่วนตัว</span>
          <span>ข้อตกลงการใช้งาน</span>
          <span>ติดต่อเรา</span>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
````

## frontend/src/components/JobForm.jsx

SHA-256: `bd47a6f8cf05f22d79c5d1462abf36441a2900b9266d6ab041896ccd5000e007`

````jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toLocalDateTime } from '../lib/jobs'
import { formatPatientAge } from '../lib/patients'

function JobForm({ job = null, onCancel, onSaved }) {
  const savingRef = useRef(false)
  const [retryOptions, setRetryOptions] = useState(0)
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState(job ? String(job.patient_id) : '')
  const [title, setTitle] = useState(job?.title ?? '')
  const [description, setDescription] = useState(job?.description ?? '')
  const [careSummary, setCareSummary] = useState(job?.care_summary ?? '')
  const [startsAt, setStartsAt] = useState(toLocalDateTime(job?.starts_at))
  const [endsAt, setEndsAt] = useState(toLocalDateTime(job?.ends_at))
  const [payAmount, setPayAmount] = useState(job?.pay_amount ?? '')
  const [payUnit, setPayUnit] = useState(job?.pay_unit ?? '')
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [patientError, setPatientError] = useState('')
  const [skills, setSkills] = useState([])
  const [selectedSkillIds, setSelectedSkillIds] = useState(
    job?.job_required_skills?.map((item) => item.skill_id) ?? [],
  )
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [skillError, setSkillError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPatients() {
      setLoadingPatients(true)
      setPatientError('')
      const { data, error: queryError } = await supabase
        .from('patients')
        .select(
          'id, first_name, last_name, birth_date, province, district, subdistrict, address_detail',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        setPatientError('ไม่สามารถโหลดรายชื่อผู้ป่วยได้')
      } else {
        setPatients(data ?? [])
      }
      setLoadingPatients(false)
    }

    loadPatients()
    return () => {
      cancelled = true
    }
  }, [retryOptions])
  useEffect(() => {
    let cancelled = false

    async function loadSkills() {
      setLoadingSkills(true)
      setSkillError('')
      const { data, error: queryError } = await supabase
        .from('skills')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (cancelled) return

      if (queryError) {
        setSkillError('ไม่สามารถโหลดรายการทักษะได้')
      } else {
        setSkills(data ?? [])
      }
      setLoadingSkills(false)
    }

    loadSkills()
    return () => {
      cancelled = true
    }
  }, [retryOptions])
  function toggleSkill(skillId) {
    setSelectedSkillIds((currentIds) =>
      currentIds.includes(skillId)
        ? currentIds.filter((id) => id !== skillId)
        : [...currentIds, skillId],
    )
  }
  const selectedPatient = patients.find(
    (patient) => String(patient.id) === patientId,
  )
  async function handleSubmit(event) {
    event.preventDefault()
    if (savingRef.current) return
    setFormError('')

    if (selectedSkillIds.length === 0) {
      setFormError('กรุณาเลือกทักษะอย่างน้อย 1 รายการ')
      return
    }
    const startTime = new Date(startsAt).getTime()
    const endTime = new Date(endsAt).getTime()

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      endTime <= startTime
    ) {
      setFormError('วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน')
      return
    }

    const amount = Number(payAmount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999.99) {
      setFormError('ค่าตอบแทนต้องมากกว่า 0 และไม่เกิน 99,999,999.99 บาท')
      return
    }
    if (!selectedPatient) {
      setFormError('กรุณาเลือกผู้ป่วย')
      return
    }

    if ([title, description, careSummary].some((value) => !value.trim())) {
      setFormError('กรุณากรอกหัวข้อ รายละเอียด และสรุปการดูแล')
      return
    }

    if (!payUnit) {
      setFormError('กรุณาเลือกหน่วยค่าตอบแทน')
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const { data, error: saveError } = await supabase.rpc(
        job ? 'update_job_with_tags' : 'create_job_with_tags',
        {
          ...(job ? { p_job_id: job.id } : {}),
          p_patient_id: selectedPatient.id,
          p_title: title.trim(),
          p_description: description.trim(),
          p_care_summary: careSummary.trim(),
          p_starts_at: new Date(startsAt).toISOString(),
          p_ends_at: new Date(endsAt).toISOString(),
          p_pay_amount: amount,
          p_pay_unit: payUnit,
          p_skill_ids: selectedSkillIds,
        },
      )

      if (saveError) throw saveError
      if (!data)
        throw new Error('ไม่ได้รับผลการบันทึก กรุณาตรวจสอบรายการอีกครั้ง')
      onSaved()
    } catch (error) {
      setFormError(`บันทึกประกาศไม่สำเร็จ: ${error?.message ?? 'กรุณาลองใหม่'}`)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }
  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h2>{job ? 'แก้ไขประกาศงาน' : 'สร้างประกาศงาน'}</h2>
      <p>เลือกผู้ป่วย ระบุการดูแล วันเวลา และค่าตอบแทนให้ครบถ้วน</p>
      {(patientError || skillError) && (
        <button type="button" onClick={() => setRetryOptions((key) => key + 1)}>
          โหลดตัวเลือกใหม่
        </button>
      )}
      <fieldset className="job-form-fields" disabled={saving}>
        {loadingPatients ? (
          <p>กำลังโหลดรายชื่อผู้ป่วย...</p>
        ) : patientError ? (
          <p role="alert">{patientError}</p>
        ) : patients.length === 0 ? (
          <p>ยังไม่มีผู้ป่วยที่ใช้งานอยู่ กรุณาเพิ่มผู้ป่วยก่อนสร้างประกาศ</p>
        ) : (
          <>
            <label htmlFor="job-patient">ผู้ป่วยที่ต้องการจ้างผู้ดูแลให้</label>

            <select
              id="job-patient"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
            >
              <option value="">เลือกผู้ป่วย</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} ({formatPatientAge(patient.birth_date)})
                </option>
              ))}
            </select>
          </>
        )}
        {selectedPatient && (
          <p>
            สถานที่ดูแล: {selectedPatient.subdistrict} อ.
            {selectedPatient.district} จ.{selectedPatient.province}
          </p>
        )}
        <label htmlFor="job-title">หัวข้อประกาศ</label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
        />
        <label htmlFor="job-description">รายละเอียดประกาศงาน</label>
        <textarea
          id="job-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          required
        />
        <label htmlFor="job-care-summary">สรุปการดูแลที่ต้องการ</label>
        <textarea
          id="job-care-summary"
          value={careSummary}
          onChange={(event) => setCareSummary(event.target.value)}
          rows={3}
          required
        />
        <label htmlFor="job-starts-at">วันเวลาเริ่มงาน</label>
        <input
          id="job-starts-at"
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          required
        />

        <label htmlFor="job-ends-at">วันเวลาสิ้นสุดงาน</label>
        <input
          id="job-ends-at"
          type="datetime-local"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          min={startsAt || undefined}
          required
        />
        <label htmlFor="job-pay-amount">ค่าตอบแทน (บาท)</label>
        <input
          id="job-pay-amount"
          type="number"
          min="0.01"
          max="99999999.99"
          step="0.01"
          value={payAmount}
          onChange={(event) => setPayAmount(event.target.value)}
          required
        />

        <label htmlFor="job-pay-unit">คิดค่าตอบแทน</label>
        <select
          id="job-pay-unit"
          value={payUnit}
          onChange={(event) => setPayUnit(event.target.value)}
          required
        >
          <option value="">เลือกหน่วย</option>
          <option value="hour">ต่อชั่วโมง</option>
          <option value="day">ต่อวัน</option>
          <option value="month">ต่อเดือน</option>
          <option value="total">เหมาทั้งงาน</option>
        </select>
        <fieldset>
          <legend>ทักษะผู้ดูแลที่ต้องการ</legend>

          {loadingSkills ? (
            <p>กำลังโหลดทักษะ...</p>
          ) : skillError ? (
            <p role="alert">{skillError}</p>
          ) : skills.length === 0 ? (
            <p>ไม่มีทักษะให้เลือกในขณะนี้</p>
          ) : (
            skills.map((skill) => (
              <label key={skill.id}>
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
                {skill.name}
              </label>
            ))
          )}
        </fieldset>
      </fieldset>
      {formError && (
        <p role="alert" className="form-error">
          {formError}
        </p>
      )}
      <div className="job-actions">
        <button
          type="submit"
          disabled={
            saving ||
            loadingPatients ||
            loadingSkills ||
            !!patientError ||
            !!skillError ||
            !patients.length ||
            !skills.length
          }
        >
          {saving ? 'กำลังบันทึก...' : job ? 'บันทึกการแก้ไข' : 'สร้างประกาศ'}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={saving}
          onClick={onCancel}
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}

export default JobForm
````

## frontend/src/components/JobManager.jsx

SHA-256: `f98d866d39c2a63dccdb9e192206638e6a5ac331917b871add187321dc124d35`

````jsx
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import JobForm from './JobForm'
import CaregiverMatches from './CaregiverMatches'

function JobManager() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filter, setFilter] = useState('all')
  const [closingId, setClosingId] = useState(null)
  const closingRef = useRef(false)
  const [matchingJob, setMatchingJob] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      setLoading(true)
      setError('')
      try {
        const { data, error: queryError } = await supabase
          .from('job_posts')
          .select(
            'id, patient_id, title, description, care_summary, starts_at, ends_at, pay_amount, pay_unit, status, province, district, subdistrict, address_detail, job_required_skills(skill_id, skills(name))',
          )
          .order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (!cancelled) setJobs(data ?? [])
      } catch {
        if (!cancelled) setError('ไม่สามารถโหลดประกาศงานได้ กรุณาลองใหม่')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadJobs()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  async function closeJob(job) {
    if (
      closingRef.current ||
      !window.confirm(
        `ปิดรับสมัครประกาศ “${job.title}” ใช่หรือไม่? หลังปิดจะไม่แสดงในงานที่เปิดรับและแก้ไขไม่ได้`,
      )
    )
      return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: closeError } = await supabase.rpc('close_job', {
        p_job_id: job.id,
      })
      if (closeError) throw closeError
      if (!data) throw new Error('ไม่พบประกาศที่ปิดได้')
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status: 'closed' } : item,
        ),
      )
      setSuccessMessage('ปิดประกาศสำเร็จ')
    } catch (closeError) {
      setError(`ปิดประกาศไม่สำเร็จ: ${closeError.message ?? 'กรุณาลองใหม่'}`)
    } finally {
      closingRef.current = false
      setClosingId(null)
    }
  }

  async function startJob(job) {
    if (
      closingRef.current ||
      !window.confirm(`เริ่มงานดูแลผู้ป่วยตามประกาศ “${job.title}” ใช่หรือไม่?`)
    ) return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: startError } = await supabase.rpc('start_matched_job', {
        p_job_id: job.id,
      })
      if (startError) throw startError
      if (!data) throw new Error('ไม่พบประกาศที่พร้อมเริ่มงาน')
      setJobs((current) => current.map((item) =>
        item.id === job.id
          ? { ...item, status: 'in_progress', started_at: new Date().toISOString() }
          : item,
      ))
      setSuccessMessage('เริ่มงานแล้ว')
    } catch {
      setError('เริ่มงานไม่สำเร็จ สถานะอาจเปลี่ยนแล้ว กรุณาโหลดรายการใหม่')
    } finally {
      closingRef.current = false
      setClosingId(null)
    }
  }

  async function confirmCompletion(job) {
    if (
      closingRef.current ||
      !window.confirm(`ผู้ดูแลแจ้งว่างาน “${job.title}” เสร็จแล้ว ยืนยันจบงานใช่หรือไม่?`)
    ) return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: confirmError } = await supabase.rpc('confirm_job_completion', {
        p_job_id: job.id,
      })
      if (confirmError) throw confirmError
      if (!data) throw new Error('ไม่พบคำขอจบงานที่รอยืนยัน')
      setJobs((current) => current.map((item) =>
        item.id === job.id
          ? { ...item, status: 'completed', completed_at: new Date().toISOString() }
          : item,
      ))
      setSuccessMessage('ยืนยันจบงานแล้ว')
    } catch {
      setError('ยืนยันจบงานไม่สำเร็จ สถานะอาจเปลี่ยนแล้ว กรุณาโหลดรายการใหม่')
    } finally {
      closingRef.current = false
      setClosingId(null)
    }
  }

  function openForm(job = null) {
    setEditingJob(job)
    setSuccessMessage('')
    setError('')
    setShowForm(true)
  }

  if (matchingJob) return (
    <CaregiverMatches job={matchingJob} onBack={() => {
      setMatchingJob(null)
      setRefreshKey((value) => value + 1)
    }} />
  )

  if (showForm)
    return (
      <JobForm
        key={editingJob?.id ?? 'new'}
        job={editingJob}
        onCancel={() => setShowForm(false)}
        onSaved={() => {
          setShowForm(false)
          setSuccessMessage(
            editingJob ? 'แก้ไขประกาศสำเร็จ' : 'สร้างประกาศสำเร็จ',
          )
          setRefreshKey((current) => current + 1)
        }}
      />
    )

  const visibleJobs = jobs.filter(
    (job) => filter === 'all' || job.status === filter,
  )
  return (
    <section className="job-manager" aria-labelledby="jobs-heading">
      <div className="job-heading">
        <div>
          <h2 id="jobs-heading">ประกาศงานของฉัน</h2>
          <p>จัดการประกาศและความต้องการดูแลของคุณ</p>
        </div>
        <button
          type="button"
          disabled={closingId !== null}
          onClick={() => openForm()}
        >
          + สร้างประกาศ
        </button>
      </div>
      {successMessage && (
        <p className="success-notice" role="status">
          {successMessage}
        </p>
      )}
      {error && (
        <div className="form-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
            โหลดรายการใหม่
          </button>
        </div>
      )}
      <label className="job-filter">
        แสดงประกาศ
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="open">เปิดรับสมัคร</option>
          <option value="matched">จับคู่สำเร็จ</option>
          <option value="in_progress">กำลังดำเนินงาน</option>
          <option value="completion_pending">รอยืนยันจบงาน</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="closed">ปิดรับสมัคร</option>
        </select>
      </label>
      {loading ? (
        <p role="status">กำลังโหลดประกาศงาน...</p>
      ) : !error && visibleJobs.length === 0 ? (
        <div className="job-empty">
          <h3>ยังไม่มีประกาศในรายการนี้</h3>
          <p>เริ่มสร้างประกาศโดยเลือกผู้ป่วยและทักษะที่ต้องการ</p>
        </div>
      ) : (
        <div className="job-list">
          {visibleJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-heading">
                <h3>{job.title}</h3>
                <span className={`job-status job-status-${job.status}`}>
                  {jobStatusLabels[job.status] ?? job.status}
                </span>
              </div>
              <p className="job-description">{job.description}</p>
              <p>
                <strong>การดูแล:</strong> {job.care_summary}
              </p>
              <p>
                <strong>สถานที่:</strong> {job.subdistrict} อ.{job.district} จ.
                {job.province}
              </p>
              <p>
                <strong>วันเวลา:</strong> {formatJobDate(job.starts_at)} –{' '}
                {formatJobDate(job.ends_at)}
              </p>
              <p>
                <strong>ค่าตอบแทน:</strong>{' '}
                {Number(job.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[job.pay_unit]}
              </p>
              <div className="job-tags">
                {job.job_required_skills?.map((item) => (
                  <span key={item.skill_id}>
                    {item.skills?.name ?? 'ทักษะที่ปิดใช้งาน'}
                  </span>
                ))}
              </div>
              {job.status === 'matched' && (
                <div className="job-actions">
                  <button type="button" disabled={closingId !== null}
                    onClick={() => startJob(job)}>
                    {closingId === job.id ? 'กำลังเริ่มงาน...' : 'เริ่มงาน'}
                  </button>
                </div>
              )}
              {job.status === 'completion_pending' && (
                <div className="job-actions">
                  <button type="button" disabled={closingId !== null}
                    onClick={() => confirmCompletion(job)}>
                    {closingId === job.id ? 'กำลังยืนยัน...' : 'ยืนยันจบงาน'}
                  </button>
                </div>
              )}
              {['draft', 'open'].includes(job.status) && (
                <div className="job-actions">
                  {job.status === 'open' && (
                    <button type="button" disabled={closingId !== null}
                      onClick={() => setMatchingJob(job)}>
                      หาผู้ดูแลสำหรับประกาศนี้
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={closingId !== null}
                    onClick={() => openForm(job)}
                  >
                    แก้ไขประกาศ
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={closingId !== null}
                    onClick={() => closeJob(job)}
                  >
                    {closingId === job.id ? 'กำลังปิด...' : 'ปิดประกาศ'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
export default JobManager
````

## frontend/src/components/LandingNavbar.jsx

SHA-256: `b68598600aae9a8607fcaad952c4382ece3b67888f04aa7ddd228710f3f1e785`

````jsx
import logo from '../assets/navbar/logo.png'

function LandingNavbar({ onLogin, onRegister }) {
  return (
    <header className="landing-navbar">
      <div className="landing-navbar-inner">
        <button
          className="navbar-brand"
          type="button"
          aria-label="MatchCare หน้าหลัก"
        >
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <span>MatchCare</span>
        </button>

        <nav className="landing-auth-actions" aria-label="บัญชีผู้ใช้">
          <button
            className="landing-login-button"
            type="button"
            onClick={onLogin}
          >
            เข้าสู่ระบบ
          </button>
          <button
            className="landing-register-button"
            type="button"
            onClick={onRegister}
          >
            สมัครสมาชิก
          </button>
        </nav>
      </div>
    </header>
  )
}

export default LandingNavbar
````

## frontend/src/components/LoginForm.jsx

SHA-256: `9d11977aa0bf27190c6d76574bc1065ecd4842eb67245238771d6b12aa1fcd18`

````jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/navbar/logo.png'

function LoginForm({ onBack, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        throw signInError
      }
    } catch {
      setError('ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบอีเมลและรหัสผ่าน')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form auth-card" onSubmit={handleSubmit}>
      <button className="auth-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        ย้อนกลับ
      </button>

      <div className="auth-card-header">
        <span className="auth-card-logo" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
        <h2>เข้าสู่ระบบ</h2>
        <p>ยินดีต้อนรับกลับสู่ MatchCare</p>
      </div>

      <label htmlFor="email">อีเมล</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        placeholder="example@email.com"
        required
        disabled={loading}
      />

      <label htmlFor="password">รหัสผ่าน</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        placeholder="กรอกรหัสผ่าน"
        required
        disabled={loading}
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>

      <p className="auth-switch-copy">
        ยังไม่มีบัญชี?{' '}
        <button type="button" onClick={onRegister}>
          สมัครสมาชิก
        </button>
      </p>
    </form>
  )
}

export default LoginForm
````

## frontend/src/components/Navbar.jsx

SHA-256: `fb6ee09ee0c73a3310da69fcaa96909e32dcbc82e6a6fec02ba09d0b8e6a21c9`

````jsx
import logo from '../assets/navbar/logo.png'
import bell from '../assets/navbar/bell.svg'
import chevron from '../assets/navbar/chevron.svg'

const menuItemsByRole = {
  employer: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'patients', label: 'ผู้ป่วยของฉัน' },
    { id: 'jobs', label: 'ประกาศงาน' },
    { id: 'caregivers', label: 'ค้นหาผู้ดูแล' },
    { id: 'invitations', label: 'คำเชิญที่ส่ง' },
    { id: 'history', label: 'ประวัติการจ้างงาน' },
  ],
  caregiver: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'jobs', label: 'ค้นหางาน' },
    { id: 'applications', label: 'งานที่สมัคร' },
    { id: 'invitations', label: 'คำเชิญและงานของฉัน' },
  ],
  admin: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'verifications', label: 'ตรวจสอบผู้ดูแล' },
    { id: 'users', label: 'จัดการผู้ใช้' },
  ],
}

function Navbar({ profile, activePage, onSelect, onSignOut }) {
  const role = profile.role
  const menuItems = menuItemsByRole[role] ?? []
  const roleLabel = {
    employer: 'ผู้ว่าจ้าง',
    caregiver: 'ผู้ดูแล',
    admin: 'ผู้ดูแลระบบ',
  }[role]

  return (
    <header className="top-navbar">
      <div className="top-navbar-inner">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => onSelect('dashboard')}
          aria-label="MatchCare หน้าหลัก"
        >
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <span>MatchCare</span>
        </button>
        <nav className="role-navigation" aria-label="เมนูหลัก">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activePage === item.id ? 'active' : ''}
              aria-current={activePage === item.id ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="navbar-account">
          <details className="navbar-dropdown">
            <summary className="notification-toggle" aria-label="การแจ้งเตือน">
              <img src={bell} alt="" />
            </summary>
            <div className="navbar-popover">
              <strong>การแจ้งเตือน</strong>
              <p>ระบบแจ้งเตือนยังไม่เปิดใช้งาน</p>
            </div>
          </details>
          <details className="navbar-dropdown">
            <summary className="account-toggle">
              <span className="account-name">
                คุณ{profile.first_name || 'ผู้ใช้งาน'}
              </span>
              <span className="account-role">({roleLabel})</span>
              <img src={chevron} alt="" />
            </summary>
            <div className="navbar-popover account-menu">
              {role === 'caregiver' && (
                <button
                  type="button"
                  aria-current={activePage === 'profile' ? 'page' : undefined}
                  onClick={(event) => {
                    event.currentTarget.closest('details').open = false
                    onSelect('profile')
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                  โปรไฟล์ผู้ดูแล
                </button>
              )}
              {role === 'caregiver' && (
                <button
                  type="button"
                  aria-current={activePage === 'documents' ? 'page' : undefined}
                  onClick={(event) => {
                    event.currentTarget.closest('details').open = false
                    onSelect('documents')
                  }}
                >
                  เอกสารยืนยันตัวตน
                </button>
              )}
              {role === 'caregiver' && <hr />}
              <button
                className="account-signout"
                type="button"
                onClick={onSignOut}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4" />
                </svg>
                ออกจากระบบ
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}

export default Navbar
````

## frontend/src/components/PatientForm.jsx

SHA-256: `0b67be3294cb97ea6bc6da174cf1aadb2d109e8f95c4d9d7e2818647b5c95774`

````jsx
import { useEffect, useRef, useState } from 'react'
import geography from '../data/geography-options.json'
import { toLocalDateTime } from '../lib/jobs'
import { supabase } from '../lib/supabase'

const provinces = Object.keys(geography)

function PatientForm({ patient = null, onCancel, onSaved }) {
  const submitting = useRef(false)
  const [firstName, setFirstName] = useState(patient?.first_name ?? '')
  const [lastName, setLastName] = useState(patient?.last_name ?? '')
  const [birthDate, setBirthDate] = useState(patient?.birth_date ?? '')
  const [mobilityStatus, setMobilityStatus] = useState(
    patient?.mobility_status ?? '',
  )
  const [careNotes, setCareNotes] = useState(patient?.care_notes ?? '')
  const [province, setProvince] = useState(patient?.province ?? '')
  const [district, setDistrict] = useState(patient?.district ?? '')
  const [subdistrict, setSubdistrict] = useState(patient?.subdistrict ?? '')
  const [addressDetail, setAddressDetail] = useState(
    patient?.address_detail ?? '',
  )
  const [conditions, setConditions] = useState([])
  const [skills, setSkills] = useState([])
  const [selectedConditionIds, setSelectedConditionIds] = useState(
    patient?.patient_conditions?.map((item) => item.condition_id) ?? [],
  )
  const [selectedSkillIds, setSelectedSkillIds] = useState(
    patient?.patient_required_skills?.map((item) => item.skill_id) ?? [],
  )
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [optionsError, setOptionsError] = useState(false)
  const [retryOptions, setRetryOptions] = useState(0)
  const formRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    formRef.current?.querySelector('input')?.focus()
    function handleKey(event) {
      if (event.key === 'Escape' && !submitting.current) {
        event.preventDefault()
        onCancel()
      }
      if (event.key !== 'Tab') return
      const controls = [
        ...formRef.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
        ),
      ]
      const first = controls[0],
        last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus()
    }
  }, [onCancel])

  useEffect(() => {
    let cancelled = false
    async function loadOptions() {
      setOptionsLoading(true)
      setOptionsError(false)
      setError('')

      const [conditionResult, skillResult] = await Promise.all([
        supabase
          .from('conditions')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('skills')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
      ])

      if (cancelled) return
      if (conditionResult.error || skillResult.error) {
        setOptionsError(true)
        setError(
          conditionResult.error?.message ||
            skillResult.error?.message ||
            'ไม่สามารถโหลดตัวเลือกได้',
        )
      } else {
        setConditions(conditionResult.data ?? [])
        setSkills(skillResult.data ?? [])
      }

      setOptionsLoading(false)
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [retryOptions])

  function toggleSelectedId(id, setSelectedIds) {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    )
  }

  const districts = Object.keys(geography[province] ?? {})
  const subdistricts = geography[province]?.[district] ?? []

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    for (const field of form.querySelectorAll(
      'input[required], textarea[required], select[required]',
    )) {
      field.setCustomValidity(
        field.value.trim() ? '' : 'กรุณากรอกข้อมูลช่องนี้',
      )
    }
    if (!form.reportValidity()) return
    submitting.current = true
    setSaving(true)
    setError('')

    try {
      const { data, error: saveError } = await supabase.rpc(
        'save_patient_with_tags',
        {
          p_patient_id: patient?.id ?? null,
          p_first_name: firstName.trim(),
          p_last_name: lastName.trim(),
          p_birth_date: birthDate,
          p_mobility_status: mobilityStatus,
          p_care_notes: careNotes.trim() || null,
          p_province: province,
          p_district: district,
          p_subdistrict: subdistrict,
          p_address_detail: addressDetail.trim(),
          p_condition_ids: selectedConditionIds,
          p_skill_ids: selectedSkillIds,
        },
      )

      if (!data && !saveError)
        throw new Error('ไม่ได้รับข้อมูลผู้ป่วยที่บันทึก')
      if (saveError) {
        throw saveError
      }

      onSaved({
        ...data,
        patient_conditions: selectedConditionIds.map((conditionId) => ({
          condition_id: conditionId,
        })),
        patient_required_skills: selectedSkillIds.map((skillId) => ({
          skill_id: skillId,
        })),
      })
    } catch (submitError) {
      setError(submitError.message || 'ไม่สามารถบันทึกข้อมูลผู้ป่วยได้')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <form
      ref={formRef}
      className="patient-form"
      onSubmit={handleSubmit}
      onInvalid={(event) => {
        const field = event.target
        setFieldErrors((errors) => ({
          ...errors,
          [field.id]: field.validity.rangeOverflow
            ? 'วันเกิดต้องไม่อยู่ในอนาคต'
            : field.validity.customError
              ? field.validationMessage
              : 'กรุณากรอกหรือเลือกข้อมูลช่องนี้ให้ถูกต้อง',
        }))
      }}
      onInput={(event) => {
        if (event.target.tagName === 'SELECT') return
        event.target.setCustomValidity?.('')
        setFieldErrors((errors) => ({ ...errors, [event.target.id]: '' }))
      }}
    >
      <div className="patient-form-header">
        <h3>{patient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยใหม่'}</h3>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="ปิดฟอร์ม"
        >
          ✕
        </button>
      </div>

      <label htmlFor="patient-first-name">ชื่อผู้ป่วย</label>
      <input
        id="patient-first-name"
        aria-invalid={Boolean(fieldErrors['patient-first-name'])}
        aria-describedby={
          fieldErrors['patient-first-name']
            ? 'patient-first-name-error'
            : undefined
        }
        type="text"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        required
      />
      {fieldErrors['patient-first-name'] && (
        <small className="field-error" id="patient-first-name-error">
          {fieldErrors['patient-first-name']}
        </small>
      )}

      <label htmlFor="patient-last-name">นามสกุลผู้ป่วย</label>
      <input
        id="patient-last-name"
        aria-invalid={Boolean(fieldErrors['patient-last-name'])}
        aria-describedby={
          fieldErrors['patient-last-name']
            ? 'patient-last-name-error'
            : undefined
        }
        type="text"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        required
      />
      {fieldErrors['patient-last-name'] && (
        <small className="field-error" id="patient-last-name-error">
          {fieldErrors['patient-last-name']}
        </small>
      )}

      <label htmlFor="patient-birth-date">วัน/เดือน/ปีเกิด</label>
      <input
        id="patient-birth-date"
        aria-invalid={Boolean(fieldErrors['patient-birth-date'])}
        aria-describedby={
          fieldErrors['patient-birth-date']
            ? 'patient-birth-date-error'
            : undefined
        }
        type="date"
        value={birthDate}
        max={toLocalDateTime(new Date()).split('T')[0]}
        onChange={(event) => setBirthDate(event.target.value)}
        required
      />
      {fieldErrors['patient-birth-date'] && (
        <small className="field-error" id="patient-birth-date-error">
          {fieldErrors['patient-birth-date']}
        </small>
      )}

      <label htmlFor="patient-mobility-status">สถานะการเคลื่อนไหว</label>
      <select
        id="patient-mobility-status"
        aria-invalid={Boolean(fieldErrors['patient-mobility-status'])}
        aria-describedby={
          fieldErrors['patient-mobility-status']
            ? 'patient-mobility-status-error'
            : undefined
        }
        value={mobilityStatus}
        onChange={(event) => {
          event.target.setCustomValidity('')
          setMobilityStatus(event.target.value)
          setFieldErrors((errors) => ({
            ...errors,
            'patient-mobility-status': '',
          }))
        }}
        required
      >
        <option value="">เลือกสถานะการเคลื่อนไหว</option>
        <option value="normal">เคลื่อนไหวได้ปกติ</option>
        <option value="bedridden">ผู้ป่วยติดเตียง</option>
        <option value="wheelchair">ใช้รถเข็น</option>
        <option value="walker">ใช้เครื่องช่วยเดิน</option>
        <option value="cane">ใช้ไม้เท้า</option>
      </select>
      {fieldErrors['patient-mobility-status'] && (
        <small className="field-error" id="patient-mobility-status-error">
          {fieldErrors['patient-mobility-status']}
        </small>
      )}

      <fieldset className="patient-option-group">
        <legend>สภาวะหรือโรคประจำตัว</legend>

        {optionsLoading ? (
          <p>กำลังโหลดสภาวะ...</p>
        ) : (
          conditions.map((condition) => (
            <label key={condition.id}>
              <input
                type="checkbox"
                checked={selectedConditionIds.includes(condition.id)}
                onChange={() =>
                  toggleSelectedId(condition.id, setSelectedConditionIds)
                }
              />
              {condition.name}
            </label>
          ))
        )}
      </fieldset>

      <fieldset className="patient-option-group">
        <legend>ทักษะผู้ดูแลที่ต้องการ</legend>

        {optionsLoading ? (
          <p>กำลังโหลดทักษะ...</p>
        ) : (
          skills.map((skill) => (
            <label key={skill.id}>
              <input
                type="checkbox"
                checked={selectedSkillIds.includes(skill.id)}
                onChange={() => toggleSelectedId(skill.id, setSelectedSkillIds)}
              />
              {skill.name}
            </label>
          ))
        )}
      </fieldset>

      <label htmlFor="patient-province">จังหวัด</label>
      <select
        id="patient-province"
        aria-invalid={Boolean(fieldErrors['patient-province'])}
        aria-describedby={
          fieldErrors['patient-province'] ? 'patient-province-error' : undefined
        }
        value={province}
        onChange={(event) => {
          event.target.setCustomValidity('')
          setProvince(event.target.value)
          setDistrict('')
          setSubdistrict('')
          setFieldErrors((errors) => ({ ...errors, 'patient-province': '' }))
        }}
        required
      >
        <option value="">เลือกจังหวัด</option>
        {provinces.map((provinceName) => (
          <option key={provinceName} value={provinceName}>
            {provinceName}
          </option>
        ))}
      </select>
      {fieldErrors['patient-province'] && (
        <small className="field-error" id="patient-province-error">
          {fieldErrors['patient-province']}
        </small>
      )}

      <label htmlFor="patient-district">อำเภอ/เขต</label>
      <select
        id="patient-district"
        aria-invalid={Boolean(fieldErrors['patient-district'])}
        aria-describedby={
          fieldErrors['patient-district'] ? 'patient-district-error' : undefined
        }
        value={district}
        onChange={(event) => {
          event.target.setCustomValidity('')
          setDistrict(event.target.value)
          setSubdistrict('')
          setFieldErrors((errors) => ({ ...errors, 'patient-district': '' }))
        }}
        disabled={!province}
        required
      >
        <option value="">เลือกอำเภอ/เขต</option>
        {districts.map((districtName) => (
          <option key={districtName} value={districtName}>
            {districtName}
          </option>
        ))}
      </select>
      {fieldErrors['patient-district'] && (
        <small className="field-error" id="patient-district-error">
          {fieldErrors['patient-district']}
        </small>
      )}

      <label htmlFor="patient-subdistrict">ตำบล/แขวง</label>
      <select
        id="patient-subdistrict"
        aria-invalid={Boolean(fieldErrors['patient-subdistrict'])}
        aria-describedby={
          fieldErrors['patient-subdistrict']
            ? 'patient-subdistrict-error'
            : undefined
        }
        value={subdistrict}
        onChange={(event) => {
          event.target.setCustomValidity('')
          setSubdistrict(event.target.value)
          setFieldErrors((errors) => ({ ...errors, 'patient-subdistrict': '' }))
        }}
        disabled={!district}
        required
      >
        <option value="">เลือกตำบล/แขวง</option>
        {subdistricts.map((subdistrictName) => (
          <option key={subdistrictName} value={subdistrictName}>
            {subdistrictName}
          </option>
        ))}
      </select>
      {fieldErrors['patient-subdistrict'] && (
        <small className="field-error" id="patient-subdistrict-error">
          {fieldErrors['patient-subdistrict']}
        </small>
      )}

      <label htmlFor="patient-address-detail">รายละเอียดที่อยู่</label>
      <textarea
        id="patient-address-detail"
        aria-invalid={Boolean(fieldErrors['patient-address-detail'])}
        aria-describedby={
          fieldErrors['patient-address-detail']
            ? 'patient-address-detail-error'
            : undefined
        }
        value={addressDetail}
        onChange={(event) => setAddressDetail(event.target.value)}
        required
      />
      {fieldErrors['patient-address-detail'] && (
        <small className="field-error" id="patient-address-detail-error">
          {fieldErrors['patient-address-detail']}
        </small>
      )}

      <label htmlFor="patient-care-notes">
        รายละเอียดการดูแลเพิ่มเติม (ไม่บังคับ)
      </label>
      <textarea
        id="patient-care-notes"
        value={careNotes}
        onChange={(event) => setCareNotes(event.target.value)}
      />

      {error && <p role="alert">{error}</p>}
      {optionsError && (
        <button type="button" onClick={() => setRetryOptions((key) => key + 1)}>
          โหลดตัวเลือกใหม่
        </button>
      )}

      <div className="patient-form-actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          ยกเลิก
        </button>

        <button
          type="submit"
          disabled={saving || optionsLoading || optionsError}
        >
          {saving
            ? 'กำลังบันทึก...'
            : patient
              ? 'บันทึกการแก้ไข'
              : 'บันทึกข้อมูลผู้ป่วย'}
        </button>
      </div>
    </form>
  )
}

export default PatientForm
````

## frontend/src/components/PatientManager.jsx

SHA-256: `783e793ef20277558be3f62118189a5fcff9dc1a03998d431e2c1a080d879a1f`

````jsx
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatPatientAge } from '../lib/patients'
const PatientForm = lazy(() => import('./PatientForm'))

const mobilityLabels = {
  normal: 'เคลื่อนไหวได้ปกติ',
  bedridden: 'ผู้ป่วยติดเตียง',
  wheelchair: 'ใช้รถเข็น',
  walker: 'ใช้เครื่องช่วยเดิน',
  cane: 'ใช้ไม้เท้า',
}

function PatientManager() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)

  const deactivating = useRef(false)
  const [busyId, setBusyId] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    async function loadPatients() {
      setLoading(true)
      setLoadError('')

      const { data, error: queryError } = await supabase
        .from('patients')
        .select(
          `
                        id,
                        first_name,
                        last_name,
                        birth_date,
                        mobility_status,
                        care_notes,
                        province,
                        district,
                        subdistrict,
                        address_detail,
                        patient_conditions(condition_id),
                        patient_required_skills(skill_id)
                    `,
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (queryError) {
        setLoadError(queryError.message)
        setPatients([])
      } else {
        setPatients(data ?? [])
      }

      setLoading(false)
    }

    loadPatients()
  }, [retry])

  useEffect(() => {
    if (feedback?.type !== 'success') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [feedback])

  function handlePatientSaved(savedPatient) {
    const wasEditing = Boolean(editingPatient)

    setPatients((currentPatients) => {
      const patientExists = currentPatients.some(
        (patient) => patient.id === savedPatient.id,
      )

      if (patientExists) {
        return currentPatients.map((patient) =>
          patient.id === savedPatient.id ? savedPatient : patient,
        )
      }

      return [savedPatient, ...currentPatients]
    })

    setEditingPatient(null)
    setShowForm(false)
    setFeedback({
      type: 'success',
      message: wasEditing
        ? 'แก้ไขข้อมูลผู้ป่วยสำเร็จ'
        : 'เพิ่มข้อมูลผู้ป่วยสำเร็จ',
    })
  }

  async function handleDeactivate(patient) {
    if (deactivating.current) return
    const confirmed = window.confirm(
      `ต้องการปิดใช้งานข้อมูลของ ${patient.first_name} ใช่หรือไม่`,
    )

    if (!confirmed) {
      return
    }

    setFeedback(null)

    deactivating.current = true
    setBusyId(patient.id)
    try {
      const { data, error: updateError } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', patient.id)
        .eq('is_active', true)
        .select('id')
        .single()

      if (updateError) {
        setFeedback({
          type: 'error',
          message: updateError.message.includes('patient_has_active_job')
            ? 'ปิดใช้งานผู้ป่วยไม่ได้ เพราะยังมีประกาศงานที่เปิดอยู่ กรุณาปิดประกาศก่อน'
            : `ไม่สามารถปิดใช้งานผู้ป่วยได้: ${updateError.message}`,
        })
        return
      }

      if (!data) throw new Error('ไม่พบผู้ป่วยที่ปิดใช้งานได้')
      setPatients((currentPatients) =>
        currentPatients.filter(
          (currentPatient) => currentPatient.id !== patient.id,
        ),
      )
      setFeedback({
        type: 'success',
        message: 'ปิดใช้งานข้อมูลผู้ป่วยสำเร็จ',
      })
    } catch {
      setFeedback({
        type: 'error',
        message: 'ไม่สามารถปิดใช้งานผู้ป่วยได้ กรุณาลองใหม่',
      })
    } finally {
      deactivating.current = false
      setBusyId(null)
    }
  }

  if (loading) {
    return <p>กำลังโหลดข้อมูลผู้ป่วย...</p>
  }

  if (loadError) {
    return (
      <div role="alert">
        <p>ไม่สามารถโหลดข้อมูลผู้ป่วย: {loadError}</p>
        <button type="button" onClick={() => setRetry((key) => key + 1)}>
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <section className="patient-manager">
      <h2>รายชื่อผู้ป่วยในการดูแล</h2>

      {feedback && (
        <div
          className={`patient-feedback patient-feedback-${feedback.type}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="ปิดข้อความแจ้งเตือน"
          >
            ✕
          </button>
        </div>
      )}

      <div className="patient-grid">
        {patients.map((patient) => (
          <article className="patient-card" key={patient.id}>
            <h3>
              {patient.first_name} {patient.last_name}
            </h3>

            <p>{formatPatientAge(patient.birth_date)}</p>

            <p>
              {mobilityLabels[patient.mobility_status] ??
                patient.mobility_status}
            </p>

            <p>
              อ.{patient.district} จ.{patient.province}
            </p>
            <div className="patient-card-actions">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null)
                  setEditingPatient(patient)
                  setShowForm(true)
                }}
              >
                แก้ไข
              </button>

              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => handleDeactivate(patient)}
              >
                ปิดใช้งาน
              </button>
            </div>
          </article>
        ))}

        <button
          className="add-patient-card"
          type="button"
          onClick={() => {
            setFeedback(null)
            setEditingPatient(null)
            setShowForm(true)
          }}
        >
          <span aria-hidden="true">＋</span>
          เพิ่มผู้ป่วยของคุณ
        </button>
      </div>

      {showForm && (
        <div className="patient-form-overlay">
          <div
            className="patient-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              editingPatient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยใหม่'
            }
          >
            <Suspense fallback={<p>กำลังโหลดแบบฟอร์ม...</p>}>
            <PatientForm
              patient={editingPatient}
              onCancel={() => {
                setEditingPatient(null)
                setShowForm(false)
              }}
              onSaved={handlePatientSaved}
            />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  )
}
export default PatientManager
````

## frontend/src/components/ProfileSetupForm.jsx

SHA-256: `baa329ce5856fe63fb28f0a51a9d2dd4a1f1e86968c0c03397cf82c27aea068e`

````jsx
import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import geography from '../data/geography-options.json'
import logo from '../assets/navbar/logo.png'

const provinces = Object.keys(geography)

function ProfileSetupForm({ userId, email, onSignOut, onProfileCreated }) {
  const submitting = useRef(false)
  const [role, setRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [lineId, setLineId] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [subdistrict, setSubdistrict] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const districts = Object.keys(geography[province] ?? {})
  const subdistricts = geography[province]?.[district] ?? []

  function handlePhoneChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digitsOnly)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    for (const field of form.querySelectorAll(
      'input[required], textarea[required], select[required]',
    )) {
      field.setCustomValidity(
        field.value.trim() ? '' : 'กรุณากรอกข้อมูลช่องนี้',
      )
    }
    if (!form.reportValidity()) return
    submitting.current = true
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        line_id: lineId.trim() || null,
        province: province.trim(),
        district: district.trim(),
        subdistrict: subdistrict.trim(),
        address_detail: addressDetail.trim(),
      })

      if (insertError) {
        throw insertError
      }

      await onProfileCreated()
    } catch (insertError) {
      setError(insertError.message || 'ไม่สามารถสร้างโปรไฟล์ได้')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <form
      className="profile-setup-form"
      onSubmit={handleSubmit}
      onInput={(event) => event.target.setCustomValidity?.('')}
    >
      <header className="profile-setup-header">
        <span className="auth-card-logo" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
        <div>
          <h2>ตั้งค่าโปรไฟล์</h2>
          <p>กรอกข้อมูลส่วนตัวก่อนเริ่มใช้งาน MatchCare</p>
        </div>
      </header>

      <div className="profile-account-notice">
        <span>
          เข้าสู่ระบบด้วย <strong>{email}</strong>
        </span>
        <button type="button" onClick={onSignOut}>
          เปลี่ยนบัญชี
        </button>
      </div>

      <fieldset className="profile-role-options">
        <legend>
          เลือกประเภทบัญชี <span>*</span>
        </legend>
        <div className="profile-role-grid">
          <label className={role === 'employer' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === 'employer'}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span>
              <strong>ผู้ว่าจ้าง</strong>
              <small>ต้องการค้นหาผู้ดูแล</small>
            </span>
          </label>

          <label className={role === 'caregiver' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="caregiver"
              checked={role === 'caregiver'}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span>
              <strong>ผู้ดูแล</strong>
              <small>ต้องการค้นหางานดูแล</small>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="profile-form-row">
        <div className="profile-field">
          <label htmlFor="profile-first-name">
            ชื่อ <span>*</span>
          </label>
          <input
            id="profile-first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            placeholder="ชื่อจริง"
            required
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-last-name">
            นามสกุล <span>*</span>
          </label>
          <input
            id="profile-last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            placeholder="นามสกุล"
            required
          />
        </div>
      </div>

      <div className="profile-form-row">
        <div className="profile-field">
          <label htmlFor="profile-phone">
            เบอร์โทรศัพท์ <span>*</span>
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            inputMode="numeric"
            maxLength={10}
            pattern="[0-9]{9,10}"
            title="กรอกเบอร์โทรศัพท์ 9–10 หลัก"
            autoComplete="tel"
            placeholder="08XXXXXXXX"
            required
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-line-id">
            Line ID <small>(ไม่บังคับ)</small>
          </label>
          <input
            id="profile-line-id"
            type="text"
            value={lineId}
            onChange={(event) => setLineId(event.target.value)}
            placeholder="Line ID"
          />
        </div>
      </div>

      <section
        className="profile-address-section"
        aria-labelledby="profile-address-heading"
      >
        <h3 id="profile-address-heading">พื้นที่อยู่อาศัย</h3>
        <div className="profile-location-grid">
          <div className="profile-field">
            <label htmlFor="profile-province">
              จังหวัด <span>*</span>
            </label>
            <select
              id="profile-province"
              value={province}
              onChange={(event) => {
                setProvince(event.target.value)
                setDistrict('')
                setSubdistrict('')
              }}
              required
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map((provinceName) => (
                <option key={provinceName} value={provinceName}>
                  {provinceName}
                </option>
              ))}
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-district">
              อำเภอ/เขต <span>*</span>
            </label>
            <select
              id="profile-district"
              value={district}
              onChange={(event) => {
                setDistrict(event.target.value)
                setSubdistrict('')
              }}
              disabled={!province}
              required
            >
              <option value="">เลือกอำเภอ/เขต</option>
              {districts.map((districtName) => (
                <option key={districtName} value={districtName}>
                  {districtName}
                </option>
              ))}
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-subdistrict">
              ตำบล/แขวง <span>*</span>
            </label>
            <select
              id="profile-subdistrict"
              value={subdistrict}
              onChange={(event) => setSubdistrict(event.target.value)}
              disabled={!district}
              required
            >
              <option value="">เลือกตำบล/แขวง</option>
              {subdistricts.map((subdistrictName) => (
                <option key={subdistrictName} value={subdistrictName}>
                  {subdistrictName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-address-detail">
            รายละเอียดที่อยู่ <span>*</span>
          </label>
          <textarea
            id="profile-address-detail"
            value={addressDetail}
            onChange={(event) => setAddressDetail(event.target.value)}
            autoComplete="street-address"
            placeholder="บ้านเลขที่ ถนน หรือรายละเอียดเพิ่มเติม"
            required
          />
        </div>
      </section>

      {error && <p role="alert">{error}</p>}

      <button
        className="profile-submit-button"
        type="submit"
        disabled={loading}
      >
        {loading ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน'}
      </button>
    </form>
  )
}

export default ProfileSetupForm
````

## frontend/src/components/RegisterForm.jsx

SHA-256: `2af0063e1aebe29071314bc4f59ad0169287ff76370ef567070779b281650396`

````jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/navbar/logo.png'

function RegisterForm({ onBack, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        setMessage('สมัครสมาชิกสำเร็จ')
      } else {
        setMessage(
          'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี หากเคยสมัครแล้วให้เข้าสู่ระบบด้วยบัญชีเดิม',
        )
      }
    } catch (signUpError) {
      setError(
        signUpError.status === 429 || signUpError.code === 'over_email_send_rate_limit'
          ? 'ส่งอีเมลยืนยันถี่เกินไป กรุณารอสักครู่ก่อนลองใหม่'
          : 'ไม่สามารถสมัครสมาชิกได้ หากเคยสมัครแล้วให้เข้าสู่ระบบ หรือลองใหม่ภายหลัง',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form auth-card" onSubmit={handleSubmit}>
      <button className="auth-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        ย้อนกลับ
      </button>

      <div className="auth-card-header">
        <span className="auth-card-logo" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
        <h2>สมัครสมาชิก</h2>
        <p>สร้างบัญชีเพื่อเริ่มใช้งาน MatchCare</p>
      </div>

      <label htmlFor="register-email">อีเมล</label>
      <input
        id="register-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        placeholder="example@email.com"
        required
      />

      <label htmlFor="register-password">รหัสผ่าน</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
        minLength={8}
        required
      />

      <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
        placeholder="ระบุรหัสผ่านอีกครั้ง"
        minLength={8}
        required
      />

      <p className="auth-info-notice">
        <span aria-hidden="true">ⓘ</span>
        หลังยืนยันอีเมล คุณจะได้เลือกประเภทบัญชีและกรอกข้อมูลโปรไฟล์
      </p>

      <label className="auth-terms">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          required
        />
        <span>
          ฉันยอมรับ <strong>ข้อตกลงการใช้งาน</strong> และ{' '}
          <strong>นโยบายความเป็นส่วนตัว</strong>
        </span>
      </label>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={loading || !acceptedTerms}>
        {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
      </button>

      <p className="auth-switch-copy">
        มีบัญชีอยู่แล้ว?{' '}
        <button type="button" onClick={onLogin}>
          เข้าสู่ระบบ
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
````

## frontend/src/hooks/useRemoteList.js

SHA-256: `12a9ebd158a85951dc78f4e1860f02eba0cf36cd72db00a04b5014ff83a0d887`

````javascript
import { useEffect, useState, useCallback } from 'react'

// loader ต้องมี reference คงที่ (ประกาศนอก component หรือใช้ useCallback)
export default function useRemoteList(loader) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    setVersion((value) => value + 1)
  }, [])
  useEffect(() => {
    let active = true
    loader()
      .then((rows) => {
        if (active) setData(rows ?? [])
      })
      .catch(() => {
        if (active) setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loader, version])
  return { data, loading, error, reload }
}
````

## frontend/src/lib/jobs.js

SHA-256: `73b1c4b4077153996a5c3916569fd4e5fd3498d15e27b12ef5192790aa986eb6`

````javascript
export const jobStatusLabels = {
  draft: 'ฉบับร่าง',
  open: 'เปิดรับสมัคร',
  closed: 'ปิดรับสมัคร',
  matched: 'จับคู่สำเร็จ',
  in_progress: 'กำลังดำเนินงาน',
  completion_pending: 'รอผู้ว่าจ้างยืนยันจบงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}
export const payUnitLabels = {
  hour: 'ต่อชั่วโมง',
  day: 'ต่อวัน',
  month: 'ต่อเดือน',
  total: 'เหมาทั้งงาน',
}

// datetime-local ต้องเป็นเวลาท้องถิ่น ไม่ใช่เวลา UTC ที่ใช้เก็บในฐานข้อมูล
export function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
export function formatJobDate(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
````

## frontend/src/lib/patients.js

SHA-256: `1b0af30b866174df7ba824619021cb9da207f18499db58aa985b4ff541a73568`

````javascript
const bangkokCalendar = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export function getPatientAge(birthDate, asOf = new Date()) {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null
  }

  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number)
  const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`)
  if (
    parsedBirthDate.getUTCFullYear() !== birthYear ||
    parsedBirthDate.getUTCMonth() + 1 !== birthMonth ||
    parsedBirthDate.getUTCDate() !== birthDay
  ) {
    return null
  }

  const today = Object.fromEntries(
    bangkokCalendar
      .formatToParts(asOf)
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => [part.type, Number(part.value)]),
  )
  const age =
    today.year -
    birthYear -
    (today.month < birthMonth ||
    (today.month === birthMonth && today.day < birthDay)
      ? 1
      : 0)

  return age >= 0 ? age : null
}

export function formatPatientAge(birthDate) {
  const age = getPatientAge(birthDate)
  return age === null ? 'ไม่ระบุอายุ' : `อายุ ${age} ปี`
}
````

## frontend/src/lib/supabase.js

SHA-256: `d2a1857e371d571d4ca10d86228cfa1309e1be6c4ef1477ec56edb1cf608fdb9`

````javascript
import { createClient } from '@supabase/supabase-js'

// อ่านค่าการเชื่อมต่อที่ตั้งไว้ใน .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// แจ้งสาเหตุให้ชัดเจนหากยังไม่ได้ตั้งค่า
if (!supabaseUrl || !supabaseKey) {
  throw new Error('กรุณาตั้งค่า Supabase URL และ Publishable Key ใน .env.local')
}

// สร้าง Client ส่วนกลางให้ไฟล์อื่นนำไปใช้
export const supabase = createClient(supabaseUrl, supabaseKey)
````

## frontend/src/lib/workflow.js

SHA-256: `25401bb6ce86e5fdcfb0d720514c99cc296f3b3d65e8a8a06e2ec23aedb1cb7b`

````javascript
import { supabase } from './supabase'

export const documentLabels = {
  identity: 'เอกสารยืนยันตัวตน',
  care_certificate: 'ใบรับรองการดูแล',
  other: 'เอกสารอื่น ๆ',
}
export const reviewLabels = {
  pending: 'รอตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่ผ่านการตรวจสอบ',
}
export const invitationLabels = {
  pending: 'รอคำตอบ',
  accepted: 'จับคู่สำเร็จ',
  rejected: 'ปฏิเสธแล้ว',
  not_selected: 'คำเชิญสิ้นสุดแล้ว',
}
const messages = {
  invitation_already_exists: 'ส่งคำเชิญให้ผู้ดูแลคนนี้แล้ว',
  caregiver_not_eligible: 'ผู้ดูแลต้องผ่านการยืนยันและเปิดพร้อมรับงาน',
  job_not_open: 'ประกาศนี้ไม่ได้เปิดรับสมัครแล้ว',
  invitation_no_longer_open: 'คำเชิญนี้สิ้นสุดแล้ว กรุณาโหลดรายการใหม่',
  identity_document_required: 'ต้องมีเอกสารยืนยันตัวตนที่ส่งตรวจในรอบนี้',
  rejection_reason_required: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ',
  review_no_longer_pending: 'รายการนี้ถูกตรวจสอบแล้ว กรุณาโหลดใหม่',
  profile_missing_or_already_verified:
    'ต้องบันทึกโปรไฟล์ก่อนส่งเอกสาร และส่งได้เฉพาะบัญชีที่ยังไม่อนุมัติ',
  uploaded_file_not_found: 'ไม่พบไฟล์อัปโหลดที่ถูกต้อง กรุณาส่งใหม่',
}
export function workflowError(error) {
  if (error?.code === '42501')
    return 'คุณไม่มีสิทธิ์ดำเนินการนี้ หรือสถานะรายการเปลี่ยนไปแล้ว'
  return messages[error?.message] ?? 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่'
}
export async function callWorkflow(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}
export const loadInvitations = () => callWorkflow('list_my_invitations')
export const loadVerificationQueue = () =>
  callWorkflow('list_verification_queue')
export async function loadDocuments(caregiverId) {
  const { data, error } = await supabase
    .from('caregiver_documents')
    .select(
      'id, document_type, storage_path, original_file_name, review_status, rejection_reason, created_at',
    )
    .eq('caregiver_id', caregiverId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function uploadDocument(userId, file, type) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  }
  if (
    !file ||
    !extensions[file.type] ||
    file.size < 1 ||
    file.size > 5 * 1024 * 1024
  ) {
    throw new Error('เลือกไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5 MB')
  }
  const path = userId + '/' + crypto.randomUUID() + '.' + extensions[file.type]
  const { error } = await supabase.storage
    .from('caregiver-documents')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  await callWorkflow('submit_caregiver_document', {
    p_path: path,
    p_type: type,
    p_name: file.name,
    p_mime: file.type,
  })
}
export async function downloadDocument(document) {
  const { data, error } = await supabase.storage
    .from('caregiver-documents')
    .download(document.storage_path)
  if (error) throw error
  const url = URL.createObjectURL(data)
  const link = window.document.createElement('a')
  link.href = url
  link.download = document.original_file_name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
````

## frontend/src/main.jsx

SHA-256: `e77ba0e014b48b9a73253e51fcaae0f21888574a1b59a5f31ae34c04f22ada97`

````jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````

## frontend/src/pages/AdminDashboard.jsx

SHA-256: `2c0af64bc6bc37f2ef947a2ddea6c0b2b1cfa9a2fe918b214b6e6ec8645f26bf`

````jsx
function AdminDashboard({ profile }) {
  return (
    <section className="role-dashboard">
      <h2>หน้าหลักผู้ดูแลระบบ</h2>

      <p>
        ยินดีต้อนรับ คุณ{profile.first_name} {profile.last_name}
      </p>

      <p>คุณสามารถตรวจสอบและอนุมัติข้อมูลผู้ดูแลได้จากหน้านี้</p>
    </section>
  )
}

export default AdminDashboard
````

## frontend/src/pages/AdminVerifications.jsx

SHA-256: `06652478b5775d5e525264b27911f426208375ff86297bfae9a2c888482265c1`

````jsx
import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import DocumentList from '../components/DocumentList'
import {
  loadVerificationQueue,
  callWorkflow,
  workflowError,
} from '../lib/workflow'

export default function AdminVerifications() {
  const { data, loading, error, reload } = useRemoteList(loadVerificationQueue)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const busy = useRef(false)
  async function review(approve) {
    if (busy.current) return
    setActionError('')
    setMessage('')
    if (!approve && !reason.trim()) {
      setActionError('กรุณาระบุเหตุผลที่ไม่อนุมัติ')
      return
    }
    if (
      !window.confirm(
        approve
          ? 'ยืนยันว่าได้ตรวจเอกสารและอนุมัติผู้ดูแลคนนี้?'
          : 'ส่งผลไม่อนุมัติพร้อมเหตุผลให้ผู้ดูแล?',
      )
    )
      return
    busy.current = true
    setSaving(true)
    try {
      await callWorkflow('review_caregiver', {
        p_caregiver_id: selected.caregiver_id,
        p_approve: approve,
        p_reason: reason.trim(),
      })
      setMessage(approve ? 'อนุมัติผู้ดูแลแล้ว' : 'ส่งผลตรวจพร้อมเหตุผลแล้ว')
      setSelected(null)
      setReason('')
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">พื้นที่แอดมิน</p>
        <h1>ตรวจสอบผู้ดูแล</h1>
        <p>ตรวจเอกสารยืนยันตัวตนก่อนอนุมัติให้ผู้ดูแลปรากฏในผลค้นหา</p>
      </header>
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดคิวตรวจสอบ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && !data.length && (
        <div className="workflow-card">
          <h2>ตรวจสอบครบแล้ว</h2>
          <p>ขณะนี้ไม่มีผู้ดูแลรอตรวจสอบ</p>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-columns">
          <ul className="workflow-list">
            {data.map((person) => (
              <li key={person.caregiver_id}>
                <div>
                  <strong>{person.display_name}</strong>
                  <p>รอการตรวจสอบ</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setSelected(person)
                    setReason('')
                    setActionError('')
                  }}
                >
                  ตรวจเอกสาร
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <section className="workflow-card">
              <h2>{selected.display_name}</h2>
              <DocumentList
                key={selected.caregiver_id}
                caregiverId={selected.caregiver_id}
              />
              <label htmlFor="review-reason">เหตุผลกรณีไม่อนุมัติ</label>
              <textarea
                id="review-reason"
                maxLength={1000}
                value={reason}
                disabled={saving}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="workflow-actions">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => review(true)}
                >
                  อนุมัติผู้ดูแล
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => review(false)}
                >
                  ไม่อนุมัติ
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
````

## frontend/src/pages/CaregiverDashboard.jsx

SHA-256: `76a308b88e0a870fa5b33bc252f9bfda7487ee9c7e002f0f32502dfa3bff37c0`

````jsx
import profileIllustration from '../assets/dashboard/caregiver-profile.svg'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/CaregiverDashboard.css'

const verificationLabels = {
  not_submitted: 'ยังไม่ได้ส่งยืนยัน',
  pending: 'รอการตรวจสอบ',
  verified: 'ยืนยันแล้ว',
  rejected: 'ต้องแก้ไขเอกสาร',
}

function CaregiverDashboard({ profile, onNavigate }) {
  const [info, setInfo] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const [details, tags] = await Promise.all([
          supabase
            .from('caregiver_profiles')
            .select('bio, availability_status, verification_status')
            .eq('caregiver_id', profile.id)
            .maybeSingle(),
          supabase
            .from('caregiver_skills')
            .select('skill_id, skills(name)')
            .eq('caregiver_id', profile.id),
        ])
        if (details.error || tags.error) throw new Error('load_failed')
        if (active) {
          setInfo(details.data)
          setSkills(tags.data ?? [])
        }
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [profile.id, retry])
  function openProfile() {
    onNavigate('profile')
  }

  const verified = info?.verification_status === 'verified'
  const available = info?.availability_status === 'available'
  const steps = [
    {
      done: Boolean(info?.bio?.trim()),
      title: 'แนะนำตัวให้ผู้ว่าจ้างรู้จัก',
      text: 'เพิ่มประสบการณ์และแนวทางการดูแลของคุณ',
    },
    {
      done: skills.length > 0,
      title: 'เพิ่มทักษะการดูแล',
      text: 'ช่วยให้ผู้ว่าจ้างพบคุณจากทักษะที่ตรงกับงาน',
    },
    {
      done: verified,
      title: 'ยืนยันตัวตนผู้ดูแล',
      text: 'ต้องผ่านการตรวจสอบก่อนปรากฏในผลค้นหา',
    },
  ]
  return (
    <section className="care-home" aria-labelledby="care-home-title">
      <header className="care-home-heading">
        <div>
          <p className="care-eyebrow">พื้นที่ของผู้ดูแล</p>
          <h1 id="care-home-title">สวัสดี คุณ{profile.first_name}</h1>
          <p>ดูแลโปรไฟล์ให้พร้อม สำหรับโอกาสดูแลครั้งต่อไป</p>
        </div>
        <button type="button" className="care-outline" onClick={openProfile}>
          ดูโปรไฟล์ของฉัน ↗
        </button>
      </header>
      <div className="care-welcome">
        <div>
          <span className="care-eyebrow">เริ่มต้นจากความใส่ใจ</span>
          <h2>
            ให้ทักษะของคุณ
            <br />
            ได้พบกับคนที่ต้องการการดูแล
          </h2>
          <p>แนะนำตัวและเพิ่มทักษะ เพื่อให้ผู้ว่าจ้างรู้จักคุณมากขึ้น</p>
          <button type="button" onClick={openProfile}>
            จัดการโปรไฟล์ <span aria-hidden="true">→</span>
          </button>
        </div>
        <img className="care-art" src={profileIllustration} alt="" />
      </div>
      {loading && <p role="status">กำลังโหลดภาพรวมของคุณ...</p>}
      {!loading && error && (
        <div className="care-panel" role="alert">
          <p>โหลดภาพรวมไม่สำเร็จ</p>
          <button
            className="care-outline"
            type="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="care-summary" aria-label="ภาพรวมโปรไฟล์">
            <article className="care-stat">
              <span>สถานะรับงาน</span>
              <strong>
                <i className={available ? 'care-dot ready' : 'care-dot'} />
                {available ? 'พร้อมรับงาน' : 'ยังไม่พร้อมรับงาน'}
              </strong>
              <small>ปรับสถานะได้ในหน้าโปรไฟล์</small>
            </article>
            <article className="care-stat">
              <span>การยืนยันตัวตน</span>
              <strong>
                {verificationLabels[
                  info?.verification_status ?? 'not_submitted'
                ] ?? 'ไม่ทราบสถานะ'}
              </strong>
              <small>
                {verified
                  ? 'ผ่านการตรวจสอบแล้ว'
                  : 'ยืนยันเพื่อให้ผู้ว่าจ้างค้นพบคุณ'}
              </small>
            </article>
            <article className="care-stat">
              <span>ทักษะในโปรไฟล์</span>
              <strong>{skills.length} ทักษะ</strong>
              <small>ใช้ประกอบการจับคู่กับประกาศงาน</small>
            </article>
          </div>
          <div className="care-columns">
            <section className="care-panel">
              <div className="care-panel-heading">
                <h2>เตรียมตัวให้พร้อมรับโอกาส</h2>
                <span>
                  {steps.filter((step) => step.done).length}/3 ขั้นตอน
                </span>
              </div>
              <ol className="care-checklist">
                {steps.map((step, index) => (
                  <li key={step.title}>
                    <span
                      className={step.done ? 'care-step complete' : 'care-step'}
                      aria-label={step.done ? 'เสร็จแล้ว' : 'ยังไม่เสร็จ'}
                    >
                      {step.done ? '✓' : index + 1}
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {!verified && (
                <button
                  type="button"
                  className="care-outline"
                  onClick={() => onNavigate('documents')}
                >
                  ส่งเอกสารยืนยันตัวตน
                </button>
              )}
            </section>
            <section className="care-panel">
              <div className="care-panel-heading">
                <h2>ทักษะของคุณ</h2>
                <button
                  className="care-text"
                  type="button"
                  onClick={openProfile}
                >
                  แก้ไข
                </button>
              </div>
              <p className="care-muted">
                สิ่งที่คุณถนัด ช่วยให้เราเชื่อมคุณกับงานที่เหมาะสม
              </p>
              {skills.length ? (
                <ul className="care-tags">
                  {skills.map((skill) => (
                    <li key={skill.skill_id}>
                      {skill.skills?.name ?? 'ทักษะการดูแล'}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="care-empty">
                  <strong>คุณถนัดดูแลด้านไหนบ้าง?</strong>
                  <p>เพิ่มทักษะแรกเพื่อเริ่มเตรียมโปรไฟล์ของคุณ</p>
                  <button
                    type="button"
                    className="care-outline"
                    onClick={openProfile}
                  >
                    + เพิ่มทักษะการดูแล
                  </button>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export default CaregiverDashboard
````

## frontend/src/pages/CaregiverDocuments.jsx

SHA-256: `2165d4eed05620a7cd0149c7654ddfc9135414b1870f6c249c6b0309a9c6d10f`

````jsx
import { useRef, useState } from 'react'
import DocumentList from '../components/DocumentList'
import { documentLabels, uploadDocument, workflowError } from '../lib/workflow'

export default function CaregiverDocuments({ profile }) {
  const [type, setType] = useState('identity')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [version, setVersion] = useState(0)
  const busy = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    setError('')
    setSuccess('')
    if (
      !file ||
      !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) ||
      file.size < 1 ||
      file.size > 5242880 ||
      file.name.length > 255
    ) {
      setError(
        'เลือกไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5 MB และชื่อไม่เกิน 255 ตัวอักษร',
      )
      return
    }
    busy.current = true
    setSaving(true)
    try {
      await uploadDocument(profile.id, file, type)
      setSuccess('ส่งเอกสารแล้ว แอดมินจะตรวจสอบข้อมูลของคุณ')
      setVersion((value) => value + 1)
      setFile(null)
      setType('identity')
      event.target.reset()
    } catch (issue) {
      setError(workflowError(issue))
    } finally {
      setSaving(false)
      busy.current = false
    }
  }
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">
          เตรียมพร้อมรับงาน · ขั้นตอนยืนยันตัวตน
        </p>
        <h1>เอกสารของฉัน</h1>
        <p>
          ส่งเอกสารยืนยันตัวตนก่อน
          เพื่อให้แอดมินตรวจสอบและเปิดการค้นพบโปรไฟล์ของคุณ
        </p>
      </header>
      <div className="workflow-columns">
        <form className="workflow-card" onSubmit={submit}>
          <h2>ส่งเอกสารตรวจสอบ</h2>
          <p>
            บันทึกโปรไฟล์ผู้ดูแลก่อนส่งเอกสาร
            ใช้ข้อมูลสมมติสำหรับการทดสอบโครงการ
          </p>
          <label htmlFor="document-type">ประเภทเอกสาร</label>
          <select
            id="document-type"
            value={type}
            disabled={saving}
            onChange={(event) => setType(event.target.value)}
          >
            {Object.entries(documentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="document-file">เลือกไฟล์</label>
          <input
            id="document-file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            disabled={saving}
            required
            onChange={(event) => setFile(event.target.files[0] ?? null)}
          />
          <p className="workflow-hint">
            JPG, PNG หรือ PDF · สูงสุด 5 MB ต่อไฟล์
            <br />
            เอกสารเปิดดูได้เฉพาะคุณและแอดมินที่ตรวจสอบ
          </p>
          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}
          <button type="submit" disabled={saving}>
            {saving ? 'กำลังส่งเอกสาร...' : 'ส่งให้แอดมินตรวจสอบ'}
          </button>
        </form>
        <section className="workflow-card">
          <h2>เอกสารที่ส่งแล้ว</h2>
          <DocumentList key={version} caregiverId={profile.id} />
        </section>
      </div>
    </section>
  )
}
````

## frontend/src/pages/CaregiverProfile.jsx

SHA-256: `348ddbc1f4b043b06ee5f4ecdd314fb88def9c46a215d2d60895b74b3a4dde9a`

````jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function CaregiverProfile({ profile }) {
    const [caregiverData, setCaregiverData] = useState(null)
    const [bio, setBio] = useState('')
    const [experienceYears, setExperienceYears] = useState('0')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retryKey, setRetryKey] = useState(0)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [saveSuccess, setSaveSuccess] = useState('')
    const [skills, setSkills] = useState([])
    const [selectedSkillIds, setSelectedSkillIds] = useState([])
    const [skillsLoading, setSkillsLoading] = useState(true)
    const [skillsError, setSkillsError] = useState('')
    const [skillsRetry, setSkillsRetry] = useState(0)
    const [availabilitySaving, setAvailabilitySaving] = useState(false)
    const [availabilityError, setAvailabilityError] = useState('')

    useEffect(() => {
        let active = true

        async function loadCaregiverData() {
            setLoading(true)
            setError('')

            const { data, error: loadError } = await supabase
                .from('caregiver_profiles')
                .select('bio, experience_years, availability_status, verification_status')
                .eq('caregiver_id', profile.id)
                .maybeSingle()

            if (!active) return

            if (loadError) {
                setError('โหลดข้อมูลผู้ดูแลไม่สำเร็จ')
            } else {
                setCaregiverData(data)
                setBio(data?.bio ?? '')
                setExperienceYears(String(data?.experience_years ?? 0))
            }
            setLoading(false)
        }

        loadCaregiverData()

        return () => {
            active = false
        }
    }, [profile.id, retryKey])
    useEffect(() => {
        let active = true

        async function loadSkills() {
            setSkillsLoading(true)
            setSkillsError('')

            const [skillsResult, selectedResult] = await Promise.all([
                supabase
                    .from('skills')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name'),
                supabase
                    .from('caregiver_skills')
                    .select('skill_id')
                    .eq('caregiver_id', profile.id),
            ])

            if (!active) return

            if (skillsResult.error || selectedResult.error) {
                setSkillsError('โหลดรายการทักษะไม่สำเร็จ')
            } else {
                setSkills(skillsResult.data ?? [])
                setSelectedSkillIds(
                    (selectedResult.data ?? []).map((item) => item.skill_id),
                )
            }
            setSkillsLoading(false)
        }

        loadSkills()

        return () => {
            active = false
        }
    }, [profile.id, skillsRetry])

    async function handleSubmit(event) {
        event.preventDefault()
        setSaveError('')
        setSaveSuccess('')

        const years = Number(experienceYears)

        if (!bio.trim()) {
            setSaveError('กรุณากรอกคำแนะนำตัว')
            return
        }

        if (
            experienceYears.trim() === '' ||
            !Number.isInteger(years) ||
            years < 0 ||
            years > 80
        ) {
            setSaveError('ประสบการณ์ต้องเป็นจำนวนเต็ม 0–80 ปี')
            return
        }
        if (skillsLoading || skillsError) {
            setSaveError('กรุณารอให้โหลดทักษะสำเร็จก่อน')
            return
        }
        setSaving(true)

        try {
            const values = {
                bio: bio.trim(),
                experience_years: years,
            }

            const query = caregiverData
                ? supabase
                    .from('caregiver_profiles')
                    .update(values)
                    .eq('caregiver_id', profile.id)
                : supabase
                    .from('caregiver_profiles')
                    .insert({ caregiver_id: profile.id, ...values })

            const { data, error: saveFailure } = await query
                .select('bio, experience_years, availability_status, verification_status')
                .single()

            if (saveFailure) throw saveFailure

            setCaregiverData(data)
            const { data: savedSkills, error: readError } = await supabase
                .from('caregiver_skills')
                .select('skill_id')
                .eq('caregiver_id', profile.id)

            if (readError) throw readError

            const savedIds = new Set((savedSkills ?? []).map((item) => item.skill_id))
            const toAdd = selectedSkillIds.filter((id) => !savedIds.has(id))
            const toRemove = [...savedIds].filter(
                (id) => !selectedSkillIds.includes(id),
            )

            if (toAdd.length > 0) {
                const { error: addError } = await supabase
                    .from('caregiver_skills')
                    .insert(
                        toAdd.map((skillId) => ({
                            caregiver_id: profile.id,
                            skill_id: skillId,
                        })),
                    )
                if (addError) throw addError
            }

            if (toRemove.length > 0) {
                const { error: removeError } = await supabase
                    .from('caregiver_skills')
                    .delete()
                    .eq('caregiver_id', profile.id)
                    .in('skill_id', toRemove)
                if (removeError) throw removeError
            }
            setSaveSuccess('บันทึกโปรไฟล์แล้ว')
        } catch {
            setSaveError('บันทึกข้อมูลไม่ครบ กรุณาลองใหม่')
        } finally {
            setSaving(false)
        }
    }
    async function handleAvailabilityToggle() {
        if (!caregiverData || saving || availabilitySaving) return

        const previousStatus = caregiverData.availability_status
        const nextStatus =
            previousStatus === 'available' ? 'unavailable' : 'available'

        setAvailabilityError('')
        setAvailabilitySaving(true)
        setCaregiverData((current) => ({
            ...current,
            availability_status: nextStatus,
        }))

        try {
            const { data, error: updateError } = await supabase
                .from('caregiver_profiles')
                .update({ availability_status: nextStatus })
                .eq('caregiver_id', profile.id)
                .select('availability_status')
                .single()

            if (updateError) throw updateError

            setCaregiverData((current) => ({
                ...current,
                availability_status: data.availability_status,
            }))
        } catch {
            setCaregiverData((current) => ({
                ...current,
                availability_status: previousStatus,
            }))
            setAvailabilityError('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่')
        } finally {
            setAvailabilitySaving(false)
        }
    }
    return (

        <section className="role-dashboard caregiver-profile">
            <h2>โปรไฟล์ผู้ดูแล</h2>
            <p>คุณ{profile.first_name} {profile.last_name}</p>
            {loading && <p>กำลังโหลดข้อมูลผู้ดูแล...</p>}
            {error && (
                <div role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
                        ลองใหม่
                    </button>
                </div>
            )}
            {!loading && !error && (
                <form className="caregiver-profile-form" onSubmit={handleSubmit}>
                    <p>{caregiverData ? 'แก้ไขโปรไฟล์ผู้ดูแล' : 'สร้างโปรไฟล์ผู้ดูแล'}</p>
                    <label htmlFor="caregiver-bio">แนะนำตัว</label>
                    <textarea
                        id="caregiver-bio"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                    />

                    <label htmlFor="caregiver-experience">ประสบการณ์ดูแล (ปี)</label>
                    <input
                        id="caregiver-experience"
                        type="number"
                        min="0"
                        max="80"
                        step="1"
                        value={experienceYears}
                        onChange={(event) => setExperienceYears(event.target.value)}
                    />
                    <fieldset>
                        <legend>ทักษะการดูแล</legend>
                        {skillsLoading && <p>กำลังโหลดทักษะ...</p>}
                        {skillsError && (
                            <div role="alert">
                                <p>{skillsError}</p>
                                <button type="button" onClick={() => setSkillsRetry((key) => key + 1)}>
                                    ลองใหม่
                                </button>
                            </div>
                        )}
                        {!skillsLoading && !skillsError && (
                            <ul>
                                {skills.map((skill) => (
                                    <li key={skill.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedSkillIds.includes(skill.id)}
                                                onChange={() =>
                                                    setSelectedSkillIds((current) =>
                                                        current.includes(skill.id)
                                                            ? current.filter((id) => id !== skill.id)
                                                            : [...current, skill.id],
                                                    )
                                                }
                                            />
                                            {skill.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>
                    {saveError && <p role="alert">{saveError}</p>}
                    {saveSuccess && <p role="status">{saveSuccess}</p>}
                    <button
                        type="submit"
                        disabled={saving || availabilitySaving || skillsLoading || Boolean(skillsError)}
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
                    </button>
                </form>
            )}
            {!loading && !error && (
                <div className="caregiver-profile-availability">
                    <label>
                        <input
                            type="checkbox"
                            role="switch"
                            checked={caregiverData?.availability_status === 'available'}
                            onChange={handleAvailabilityToggle}
                            disabled={!caregiverData || saving || availabilitySaving}
                        />
                        พร้อมรับงาน
                    </label>
                    <p>
                        {caregiverData
                            ? caregiverData.availability_status === 'available'
                                ? 'สถานะ: พร้อมรับงาน'
                                : 'สถานะ: ยังไม่พร้อมรับงาน'
                            : 'บันทึกโปรไฟล์ก่อนเปลี่ยนสถานะ'}
                    </p>
                    {availabilityError && <p role="alert">{availabilityError}</p>}
                </div>
            )}
        </section>
    )
}

export default CaregiverProfile
````

## frontend/src/pages/EmployerDashboard.jsx

SHA-256: `707b806e38b5e49e3744b84bb726748915b9519765f8149dbaf51b10e5711ddc`

````jsx
import { useEffect, useState } from 'react'
import addIcon from '../assets/dashboard/add.svg'
import careIcon from '../assets/dashboard/care.svg'
import emptyJobsIcon from '../assets/dashboard/empty-jobs.svg'
import locationIcon from '../assets/dashboard/location.svg'
import patientIcon from '../assets/dashboard/patient.svg'
import { supabase } from '../lib/supabase'
import { formatJobDate, payUnitLabels } from '../lib/jobs'
import { formatPatientAge } from '../lib/patients'

const mobilityLabels = {
  normal: 'เคลื่อนไหวได้ปกติ',
  bedridden: 'ผู้ป่วยติดเตียง',
  wheelchair: 'ใช้รถเข็น',
  walker: 'ใช้เครื่องช่วยเดิน',
  cane: 'ใช้ไม้เท้า',
}

function EmployerDashboard({ onNavigate }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      try {
        const { data, error: queryError } = await supabase
          .from('job_posts')
          .select(
            'id, title, starts_at, pay_amount, pay_unit, province, district',
          )
          .eq('status', 'open')
          .order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (!cancelled) setJobs(data ?? [])
      } catch {
        if (!cancelled)
          setJobsError(
            'ไม่สามารถโหลดประกาศงานได้ กรุณาเปิดหน้าประกาศงานเพื่อลองใหม่',
          )
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }
    loadJobs()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    async function loadPatients() {
      const { data, error: queryError } = await supabase
        .from('patients')
        .select(
          'id, first_name, last_name, birth_date, mobility_status, district, province',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (queryError) {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้')
      } else {
        setPatients(data ?? [])
      }

      setLoading(false)
    }

    loadPatients()
  }, [])

  return (
    <section className="employer-dashboard" aria-label="ภาพรวมผู้ว่าจ้าง">
      <aside className="dashboard-patients">
        <div className="dashboard-section-heading">
          <h2>รายชื่อผู้ป่วยในการดูแล</h2>
        </div>

        {loading && (
          <p className="dashboard-state">กำลังโหลดข้อมูลผู้ป่วย...</p>
        )}
        {error && (
          <p className="dashboard-state" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="dashboard-state dashboard-empty-patients">
            <p>ยังไม่มีข้อมูลผู้ป่วยในการดูแล</p>
            <button type="button" onClick={() => onNavigate('patients')}>
              เพิ่มผู้ป่วย
            </button>
          </div>
        )}

        <div className="dashboard-patient-list">
          {patients.map((patient) => (
            <article className="dashboard-patient-card" key={patient.id}>
              <div className="dashboard-patient-header">
                <span className="dashboard-patient-avatar">
                  <img src={patientIcon} alt="" />
                </span>
                <div>
                  <h3>
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p>ผู้ป่วยในการดูแล · {formatPatientAge(patient.birth_date)}</p>
                </div>
              </div>
              <p className="dashboard-patient-detail">
                <img src={careIcon} alt="" />
                {mobilityLabels[patient.mobility_status] ??
                  patient.mobility_status}
              </p>
              <p className="dashboard-patient-detail">
                <img src={locationIcon} alt="" />
                อ.{patient.district} จ.{patient.province}
              </p>
            </article>
          ))}
        </div>
      </aside>

      <section className="dashboard-jobs">
        <h2>ประกาศงานที่เปิดรับ</h2>
        {jobsLoading ? (
          <p role="status">กำลังโหลดประกาศงาน...</p>
        ) : jobsError ? (
          <p role="alert">{jobsError}</p>
        ) : jobs.length > 0 ? (
          <div className="job-list">
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>
                  อ.{job.district} จ.{job.province}
                </p>
                <p>เริ่มงาน {formatJobDate(job.starts_at)}</p>
                <p>
                  {Number(job.pay_amount).toLocaleString('th-TH')} บาท{' '}
                  {payUnitLabels[job.pay_unit]}
                </p>
                <button type="button" onClick={() => onNavigate('jobs')}>
                  จัดการประกาศ
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-jobs">
            <span className="dashboard-empty-icon">
              <img src={emptyJobsIcon} alt="" />
            </span>
            <p className="dashboard-empty-title">
              คุณยังไม่มีประกาศงานที่เปิดรับในขณะนี้
            </p>
            <p className="dashboard-empty-description">
              เริ่มสร้างประกาศงานแรกของคุณเพื่อค้นหาผู้ดูแลที่เหมาะสม
              <br />
              สำหรับคนที่คุณรัก
            </p>
            <button type="button" onClick={() => onNavigate('jobs')}>
              <img src={addIcon} alt="" />
              ไปที่หน้าประกาศงาน
            </button>
          </div>
        )}
      </section>
    </section>
  )
}

export default EmployerDashboard
````

## frontend/src/pages/Invitations.jsx

SHA-256: `ac1517c67ef583306bbc36453fe4658e7b19fdcd3095307bbb2065d38f9745eb`

````jsx
import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import {
  loadInvitations,
  callWorkflow,
  workflowError,
  invitationLabels,
} from '../lib/workflow'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'

export default function Invitations({ profile }) {
  const { data, loading, error, reload } = useRemoteList(loadInvitations)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState(null)
  const busy = useRef(false)
  async function respond(request, accept) {
    if (
      busy.current ||
      !window.confirm(
        accept
          ? 'ยืนยันรับงานนี้? ประกาศจะจับคู่กับคุณทันที'
          : 'ยืนยันปฏิเสธคำเชิญนี้?',
      )
    )
      return
    busy.current = true
    setBusyId(request.request_id)
    setActionError('')
    setMessage('')
    setContact(null)
    try {
      await callWorkflow('respond_to_invitation', {
        p_request_id: request.request_id,
        p_accept: accept,
      })
      setMessage(
        accept
          ? 'จับคู่สำเร็จแล้ว คุณสามารถเปิดข้อมูลติดต่อเพื่อนัดหมายได้'
          : 'ปฏิเสธคำเชิญแล้ว',
      )
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
      reload()
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }
  async function showContact(requestId) {
    if (busy.current) return
    busy.current = true
    setBusyId(requestId)
    setActionError('')
    setContact(null)
    try {
      const rows = await callWorkflow('get_match_contact', {
        p_request_id: requestId,
      })
      if (!rows?.length) throw new Error('missing_contact')
      setContact({ requestId, ...rows[0] })
    } catch (issue) {
      setActionError(workflowError(issue))
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }
  async function requestCompletion(request) {
    if (
      busy.current ||
      !window.confirm(`แจ้งผู้ว่าจ้างว่างาน “${request.title}” เสร็จแล้วใช่หรือไม่?`)
    ) return
    busy.current = true
    setBusyId(request.request_id)
    setActionError('')
    setMessage('')
    try {
      await callWorkflow('request_job_completion', { p_job_id: request.job_post_id })
      setMessage('ส่งคำขอจบงานแล้ว รอผู้ว่าจ้างยืนยัน')
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
      reload()
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">การจับคู่งาน</p>
        <h1>
          {profile.role === 'caregiver' ? 'คำเชิญและงานของฉัน' : 'คำเชิญที่ส่ง'}
        </h1>
        <p>ข้อมูลติดต่อจะแสดงให้ทั้งสองฝ่ายเมื่อผู้ดูแลตอบรับงานแล้วเท่านั้น</p>
      </header>
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดคำเชิญ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && !data.length && (
        <div className="workflow-card">
          <h2>ยังไม่มีคำเชิญ</h2>
          <p>
            {profile.role === 'caregiver'
              ? 'เมื่อผู้ว่าจ้างส่งคำเชิญมา คุณจะเห็นรายละเอียดและตอบรับได้ที่นี่'
              : 'ไปที่ประกาศงาน แล้วเลือกหาผู้ดูแลเพื่อส่งคำเชิญ'}
          </p>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-stack">
          {data.map((request) => (
            <article className="workflow-card" key={request.request_id}>
              <div className="workflow-heading">
                <h2>{request.title}</h2>
                <span className="workflow-badge">
                  {invitationLabels[request.status]}
                </span>
              </div>
              {request.status === 'accepted' && (
                <p role="status">
                  สถานะงาน: {jobStatusLabels[request.job_status] ?? request.job_status}
                </p>
              )}
              {profile.role === 'caregiver' && request.status === 'accepted' &&
                request.job_status === 'completion_pending' && (
                  <p role="status">ส่งคำขอแล้ว กำลังรอผู้ว่าจ้างยืนยันจบงาน</p>
                )}
              {profile.role === 'employer' && (
                <p>ผู้ดูแล: {request.caregiver_name}</p>
              )}
              <p>{request.description}</p>
              <p>
                อ.{request.district} จ.{request.province}
              </p>
              <p>
                {formatJobDate(request.starts_at)} –{' '}
                {formatJobDate(request.ends_at)}
              </p>
              <p>
                {Number(request.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[request.pay_unit]}
              </p>
              {profile.role === 'caregiver' &&
                request.status === 'pending' &&
                request.job_status === 'open' && (
                  <div className="workflow-actions">
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => respond(request, true)}
                    >
                      ตอบรับงาน
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyId !== null}
                      onClick={() => respond(request, false)}
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                )}
              {request.status === 'accepted' && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => showContact(request.request_id)}
                >
                  ดูข้อมูลติดต่อ
                </button>
              )}
              {profile.role === 'caregiver' && request.status === 'accepted' &&
                request.job_status === 'in_progress' && (
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => requestCompletion(request)}
                  >
                    {busyId === request.request_id ? 'กำลังส่งคำขอ...' : 'แจ้งจบงาน'}
                  </button>
                )}
              {contact?.requestId === request.request_id && (
                <section
                  className="workflow-contact"
                  aria-label="ข้อมูลติดต่อคู่ที่จับสำเร็จ"
                >
                  <h3>{contact.display_name}</h3>
                  <p>โทร: {contact.phone || 'ไม่ได้ระบุ'}</p>
                  <p>LINE: {contact.line_id || 'ไม่ได้ระบุ'}</p>
                  <p>
                    สถานที่ดูแล: {contact.address_detail} {contact.subdistrict}{' '}
                    {contact.district} {contact.province}
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setContact(null)}
                  >
                    ซ่อนข้อมูลติดต่อ
                  </button>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
````

## frontend/src/pages/LandingPage.jsx

SHA-256: `46c87b4051081385ad800cf3c6b4ba030109d8e08e50308791719b49cd5a91dd`

````jsx
import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'
import caregiverHero from '../assets/landing/caregiver-hero.png'
import searchIcon from '../assets/landing/search.svg'
import documentIcon from '../assets/landing/document.svg'
import heartIcon from '../assets/landing/heart.svg'

const steps = [
  {
    title: '1. ค้นหาและจับคู่',
    description: 'ระบบจะกรองผู้ดูแลที่มีทักษะตรงกับอาการของผู้ป่วย',
    icon: searchIcon,
    className: 'landing-step-search',
  },
  {
    title: '2. ตรวจสอบประวัติ',
    description: 'ผู้ดูแลทุกคนผ่านการยืนยันตัวตนและเอกสารวิชาชีพ',
    icon: documentIcon,
    className: 'landing-step-document',
  },
  {
    title: '3. เริ่มการดูแล',
    description: 'อุ่นใจกับบริการที่ได้มาตรฐาน พร้อมระบบรีวิวหลังจบงาน',
    icon: heartIcon,
    className: 'landing-step-heart',
  },
]

function LandingPage({ onLogin, onRegister }) {
  return (
    <div className="landing-page">
      <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1>
              หาผู้ดูแลที่ใช่ ด้วยความ
              <br />
              ใส่ใจที่เรามี
            </h1>
            <p>
              แพลตฟอร์มจับคู่ผู้ดูแลผู้ป่วยและผู้สูงอายุที่ผ่านการตรวจสอบประวัติ
              และใบรับรองวิชาชีพ เพื่อความอุ่นใจของครอบครัวคุณ
            </p>
            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-button"
                onClick={onRegister}
              >
                ค้นหาผู้ดูแล (สำหรับผู้ว่าจ้าง)
              </button>
              <button
                type="button"
                className="landing-caregiver-button"
                onClick={onRegister}
              >
                สมัครเป็นผู้ดูแล
              </button>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <span className="landing-glow landing-glow-green" />
            <span className="landing-glow landing-glow-blue" />
            <div className="landing-image-frame">
              <img src={caregiverHero} alt="ผู้ดูแลกำลังพูดคุยกับผู้สูงอายุ" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-how-it-works"
        aria-labelledby="how-it-works-heading"
      >
        <div className="landing-section-heading">
          <h2 id="how-it-works-heading">ทำงานอย่างไร?</h2>
          <span />
        </div>
        <div className="landing-step-list">
          {steps.map((step) => (
            <article className="landing-step-card" key={step.title}>
              <div className={`landing-step-icon ${step.className}`}>
                <img src={step.icon} alt="" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
````

## frontend/src/pages/RoleDashboard.jsx

SHA-256: `7b4361fbcc15557b3272f25094423a32329f7ecf534430477e031e353fb497ec`

````jsx
import { useState } from 'react'
import Navbar from '../components/Navbar'
import AdminDashboard from './AdminDashboard'
import CaregiverDashboard from './CaregiverDashboard'
import CaregiverProfile from './CaregiverProfile'
import EmployerDashboard from './EmployerDashboard'
import PatientManager from '../components/PatientManager'
import Footer from '../components/Footer'
import JobManager from '../components/JobManager'
import CaregiverDocuments from './CaregiverDocuments'
import AdminVerifications from './AdminVerifications'
import Invitations from './Invitations'
import '../styles/Workflow.css'

const pageDetails = {
  employer: {
    history: {
      title: 'ประวัติการจ้างงาน',
      emptyMessage: 'ระบบประวัติการจ้างงานยังไม่เปิดใช้งาน',
    },
    patients: {
      title: 'ข้อมูลผู้ป่วย',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ป่วย',
    },
    jobs: {
      title: 'ประกาศงาน',
      emptyMessage: 'ยังไม่มีประกาศงาน',
    },
    caregivers: {
      title: 'ค้นหาผู้ดูแล',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ดูแล',
    },
  },
  caregiver: {
    profile: {
      title: 'โปรไฟล์ผู้ดูแล',
      emptyMessage: 'ยังไม่มีข้อมูลโปรไฟล์ผู้ดูแล',
    },
    jobs: {
      title: 'ค้นหางาน',
      emptyMessage: 'ยังไม่มีประกาศงาน',
    },
    applications: {
      title: 'งานที่สมัคร',
      emptyMessage: 'ยังไม่มีรายการสมัครงาน',
    },
  },
  admin: {
    verifications: {
      title: 'ตรวจสอบผู้ดูแล',
      emptyMessage: 'ไม่มีผู้ดูแลที่รอการตรวจสอบ',
    },
    users: {
      title: 'จัดการผู้ใช้',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ใช้',
    },
  },
}

function RoleDashboard({ profile, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard')

  let dashboard

  if (profile.role === 'employer') {
    dashboard = <EmployerDashboard onNavigate={setActivePage} />
  } else if (profile.role === 'caregiver') {
    dashboard = (
      <CaregiverDashboard profile={profile} onNavigate={setActivePage} />
    )
  } else if (profile.role === 'admin') {
    dashboard = <AdminDashboard profile={profile} />
  } else {
    return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
  }

  const selectedPage = pageDetails[profile.role]?.[activePage]
  let content = (
    <section className="role-dashboard">
      <h2>{selectedPage?.title}</h2>
      <p>{selectedPage?.emptyMessage}</p>
    </section>
  )

  if (activePage === 'dashboard') {
    content = dashboard
  } else if (profile.role === 'employer' && activePage === 'patients') {
    content = <PatientManager />
  } else if (profile.role === 'employer' && activePage === 'jobs') {
    content = <JobManager />
  } else if (profile.role === 'caregiver' && activePage === 'profile') {
    content = <CaregiverProfile profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'documents') {
    content = <CaregiverDocuments profile={profile} />
  } else if (profile.role === 'admin' && activePage === 'verifications') {
    content = <AdminVerifications />
  } else if (
    ['employer', 'caregiver'].includes(profile.role) &&
    activePage === 'invitations'
  ) {
    content = <Invitations profile={profile} />
  }

  return (
    <>
      <Navbar
        profile={profile}
        onSignOut={onSignOut}
        activePage={activePage}
        onSelect={setActivePage}
      />
      {content}
      <Footer />
    </>
  )
}

export default RoleDashboard
````

## frontend/src/styles/App.css

SHA-256: `a7a520be4947d3d7cea65b3e1c8330c296844d4415b60b146ff8b09861244d2d`

````css
.app-shell {
  width: min(calc(100% - 64px), 1480px);
  margin: 0 auto;
  padding: 48px 0;
}

.app-shell-landing {
  width: 100%;
  max-width: none;
  padding: 0;
}

.landing-page {
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
  color: #171d19;
  font-family: 'Prompt', 'Noto Sans Thai', system-ui, sans-serif;
}

.landing-navbar {
  position: relative;
  z-index: 10;
  border-bottom: 1px solid #eef2ef;
  background: #ffffff;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
}

.landing-navbar-inner {
  box-sizing: border-box;
  width: min(calc(100% - 48px), 1480px);
  min-height: 71px;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.landing-auth-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.landing-auth-actions button,
.landing-hero-actions button {
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 9999px;
  font: 600 14px/20px inherit;
  cursor: pointer;
}

.landing-login-button {
  border: 1px solid #6d7a72;
  background: #ffffff;
  color: #006948;
}

.landing-register-button {
  border: 1px solid #006948;
  background: #006948;
  color: #ffffff;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
}

.landing-hero {
  background: linear-gradient(180deg, rgb(220 252 231 / 30%) 0%, #ffffff 100%);
}

.landing-hero-inner {
  box-sizing: border-box;
  width: min(calc(100% - 48px), 1480px);
  min-height: 638px;
  margin: 0 auto;
  padding: 86px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.landing-hero-copy h1 {
  margin: 0;
  color: #171d19;
  font-size: clamp(40px, 4.4vw, 56px);
  line-height: 1.2;
  letter-spacing: -1.1px;
}

.landing-hero-copy > p {
  max-width: 576px;
  margin: 24px 0 0;
  color: #64748b;
  font-size: 18px;
  line-height: 1.5;
}

.landing-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}

.landing-hero-actions button {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
  line-height: 24px;
}

.landing-primary-button {
  border: 1px solid #006948;
  background: #006948;
  color: #ffffff;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
}

.landing-caregiver-button {
  border: 1px solid #cce5ff;
  background: #cce5ff;
  color: #006398;
}

.landing-hero-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
}

.landing-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(32px);
}

.landing-glow-green {
  top: -30px;
  right: -40px;
  width: 128px;
  height: 128px;
  background: #85f8c4;
  opacity: 0.5;
}

.landing-glow-blue {
  bottom: -30px;
  left: -32px;
  width: 160px;
  height: 160px;
  background: #5bb8fe;
  opacity: 0.3;
}

.landing-image-frame {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  padding: 9px;
  overflow: hidden;
  border: 1px solid #e4eae4;
  border-radius: 32px;
  background: #ffffff;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 10%),
    0 8px 10px -6px rgb(0 0 0 / 10%);
  transform: rotate(2deg);
}

.landing-image-frame img {
  display: block;
  width: 100%;
  aspect-ratio: 574 / 428.25;
  border-radius: 12px;
  object-fit: cover;
}

.landing-how-it-works {
  box-sizing: border-box;
  width: min(calc(100% - 48px), 1480px);
  min-height: 566px;
  margin: 0 auto;
  padding: 80px 0;
}

.landing-section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.landing-section-heading h2 {
  margin: 0;
  font-size: 40px;
  line-height: 1.5;
  text-align: center;
}

.landing-section-heading span {
  width: 96px;
  height: 4px;
  border-radius: 9999px;
  background: #006948;
}

.landing-step-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
  margin-top: 64px;
}

.landing-step-card {
  box-sizing: border-box;
  min-height: 262px;
  padding: 32px 16px 24px;
  border: 1px solid #e4eae4;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
  text-align: center;
}

.landing-step-icon {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
}

.landing-step-icon img {
  max-width: 30px;
  max-height: 30px;
}
.landing-step-search {
  background: #cce5ff;
}
.landing-step-document {
  background: #dcfce7;
}
.landing-step-heart {
  background: #ffdad7;
}

.landing-step-card h3 {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.6;
}

.landing-step-card p {
  margin: 0 auto;
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
}

.landing-page .app-footer {
  margin: 0;
}

.landing-page .app-footer-inner {
  width: min(calc(100% - 48px), 1480px);
}

.landing-page button:hover {
  filter: brightness(0.96);
}
.landing-page button:focus-visible {
  outline: 3px solid #5bb8fe;
  outline-offset: 3px;
}

@media (max-width: 980px) {
  .landing-hero-inner {
    grid-template-columns: 1fr;
    padding-top: 64px;
  }

  .landing-hero-copy {
    text-align: center;
  }

  .landing-hero-copy > p {
    margin-right: auto;
    margin-left: auto;
  }
  .landing-hero-actions {
    justify-content: center;
  }
  .landing-hero-visual {
    width: min(100%, 640px);
    margin: 12px auto 0;
  }
  .landing-step-list {
    grid-template-columns: 1fr;
  }
  .landing-how-it-works {
    padding-top: 64px;
    padding-bottom: 64px;
  }
}

@media (max-width: 600px) {
  .landing-navbar-inner {
    width: 100%;
    padding: 12px 16px;
  }
  .landing-auth-actions {
    gap: 8px;
  }
  .landing-auth-actions button {
    padding: 8px 12px;
  }
  .landing-hero-inner {
    width: 100%;
    padding: 48px 20px 64px;
  }
  .landing-hero-copy h1 {
    font-size: 38px;
  }
  .landing-hero-copy > p {
    font-size: 16px;
  }
  .landing-hero-actions {
    flex-direction: column;
  }
  .landing-hero-actions button {
    width: 100%;
  }
  .landing-how-it-works {
    width: 100%;
    padding: 56px 16px;
  }
  .landing-section-heading h2 {
    font-size: 32px;
  }
}

.auth-panel {
  width: min(100%, 576px);
  margin: 0 auto;
  font-family: 'Prompt', 'Noto Sans Thai', system-ui, sans-serif;
}

.app-header {
  margin-bottom: 32px;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 8px;
  color: #176b42;
}

.app-header p {
  margin: 0;
  color: #52645b;
}

.auth-form {
  display: grid;
  gap: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #dbe7e2;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(22 101 52 / 8%);
}

.auth-form input,
.auth-form button {
  box-sizing: border-box;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  font: inherit;
}

.auth-form input {
  border: 1px solid #b8c9c1;
}

.auth-form button {
  border: 0;
  color: #ffffff;
  background: #20a85b;
  cursor: pointer;
}

.auth-form button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  box-sizing: border-box;
  padding: 32px;
  margin: 0;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.auth-card .auth-back-button {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 400;
}

.auth-back-button span {
  font-size: 24px;
  line-height: 1;
}

.auth-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0 16px;
  text-align: center;
}

.auth-card-logo {
  position: relative;
  display: block;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.auth-card-logo img {
  position: absolute;
  width: 191.66%;
  height: 191.66%;
  left: -45.83%;
  top: -27.22%;
}

.auth-card-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 24px;
  line-height: 1.5;
}

.auth-card-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.auth-card > label:not(.auth-terms) {
  margin: 14px 0 6px;
  color: #1e293b;
  font-size: 14px;
}

.auth-card > input {
  min-height: 48px;
  border-color: #bccac0;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-size: 16px;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.auth-card > input::placeholder {
  color: #94a3b8;
}

.auth-card > input:focus {
  border-color: #078c67;
  outline: 3px solid rgb(7 140 103 / 16%);
}

.auth-info-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 22px 0 0;
  padding: 13px;
  border: 1px solid #cce5ff;
  border-radius: 8px;
  background: rgb(204 229 255 / 50%);
  color: #006398;
  font-size: 14px;
  line-height: 1.6;
}

.auth-info-notice span {
  flex-shrink: 0;
}

.auth-terms {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 14px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.auth-terms input {
  flex: 0 0 18px;
  width: 18px;
  min-height: 18px;
  margin: 2px 0 0;
  padding: 0;
  accent-color: #006948;
}

.auth-terms strong {
  color: #006948;
  font-weight: 500;
}

.auth-card > button[type='submit'] {
  min-height: 48px;
  margin-top: 20px;
  border-radius: 8px;
  background: #006948;
  font-size: 14px;
  font-weight: 600;
}

.auth-card > button[type='submit']:hover:not(:disabled) {
  background: #00543e;
}

.auth-switch-copy {
  margin: 16px 0 0;
  color: #64748b;
  font-size: 14px;
  text-align: center;
}

.auth-switch-copy button {
  min-height: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #006948;
  font: inherit;
  font-weight: 600;
}

.auth-card button:focus-visible,
.auth-switch-copy button:focus-visible {
  outline: 3px solid rgb(7 140 103 / 25%);
  outline-offset: 3px;
}

.auth-card [role='alert'],
.auth-card [role='status'] {
  margin: 14px 0 0;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 20px;
  }

  .auth-card-logo {
    width: 64px;
    height: 64px;
  }

  .auth-card-header h2 {
    font-size: 22px;
  }
}

.profile-setup-form {
  box-sizing: border-box;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 32px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgb(23 43 36 / 6%);
  font-family: 'Prompt', 'Noto Sans Thai', system-ui, sans-serif;
}

.profile-setup-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.profile-setup-header .auth-card-logo {
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  margin: 0;
}

.profile-setup-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 26px;
  line-height: 1.4;
}

.profile-setup-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.profile-account-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px 14px;
  border: 1px solid #cce5ff;
  border-radius: 8px;
  background: rgb(204 229 255 / 38%);
  color: #475569;
  font-size: 14px;
}

.profile-account-notice strong {
  color: #1e293b;
  font-weight: 600;
}

.profile-account-notice button {
  flex-shrink: 0;
  min-height: 36px;
  padding: 6px 12px;
  border: 1px solid #bccac0;
  border-radius: 8px;
  background: #ffffff;
  color: #006948;
  font: 600 13px/1.5 inherit;
  cursor: pointer;
}

.profile-role-options {
  margin: 0 0 24px;
  padding: 0;
  border: 0;
}

.profile-role-options legend,
.profile-field > label {
  margin-bottom: 7px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.profile-role-options legend span,
.profile-field > label > span {
  color: #ef4444;
}

.profile-field > label small {
  color: #64748b;
  font: inherit;
  font-weight: 400;
}

.profile-role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.profile-role-grid > label {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 16px;
  border: 1px solid #dce7e2;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.profile-role-grid > label.selected {
  border-color: #078c67;
  background: #ecfdf5;
  box-shadow: 0 0 0 1px #078c67;
}

.profile-role-grid input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #006948;
}

.profile-role-grid label > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-role-grid strong {
  color: #1e293b;
  font-size: 15px;
}

.profile-role-grid small {
  color: #64748b;
  font-size: 13px;
}

.profile-form-row,
.profile-location-grid {
  display: grid;
  gap: 16px;
}

.profile-form-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 18px;
}

.profile-location-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 18px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-field input,
.profile-field select,
.profile-field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #bccac0;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font: 400 15px/1.5 inherit;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.profile-field textarea {
  min-height: 88px;
  resize: vertical;
}

.profile-field input::placeholder,
.profile-field textarea::placeholder {
  color: #94a3b8;
}

.profile-field input:focus,
.profile-field select:focus,
.profile-field textarea:focus {
  border-color: #078c67;
  outline: 3px solid rgb(7 140 103 / 16%);
}

.profile-field select:disabled {
  cursor: not-allowed;
  background: #f1f5f3;
  color: #718079;
}

.profile-address-section {
  margin-top: 6px;
  padding-top: 22px;
  border-top: 1px solid #eaf0ed;
}

.profile-address-section h3 {
  margin: 0 0 16px;
  color: #1e293b;
  font-size: 17px;
}

.profile-setup-form > [role='alert'] {
  margin: 16px 0 0;
}

.profile-submit-button {
  width: 100%;
  min-height: 48px;
  margin-top: 24px;
  padding: 11px 18px;
  border: 0;
  border-radius: 8px;
  background: #006948;
  color: #ffffff;
  font: 600 15px/1.5 inherit;
  cursor: pointer;
}

.profile-submit-button:hover:not(:disabled) {
  background: #00543e;
}

.profile-submit-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.profile-setup-form button:focus-visible,
.profile-role-grid input:focus-visible {
  outline: 3px solid rgb(7 140 103 / 25%);
  outline-offset: 3px;
}

@media (max-width: 720px) {
  .profile-setup-form {
    padding: 20px;
  }

  .profile-setup-header {
    align-items: flex-start;
  }

  .profile-role-grid,
  .profile-form-row,
  .profile-location-grid {
    grid-template-columns: 1fr;
  }

  .profile-account-notice {
    align-items: flex-start;
    flex-direction: column;
  }
}

[role='alert'] {
  color: #b42318;
}

.app-shell-dashboard {
  padding-top: 96px;
}

.app-shell-dashboard .auth-status {
  min-height: calc(100vh - 144px);
  display: flex;
  flex-direction: column;
}

.app-shell-dashboard .app-footer {
  margin-top: auto;
}

.top-navbar {
  position: absolute;
  inset: 0 0 auto;
  z-index: 20;
  background: #fff;
  border-bottom: 1px solid #dee4de;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
  font-family: 'Prompt', 'Noto Sans Thai', system-ui, sans-serif;
}

.top-navbar-inner {
  width: min(calc(100% - 64px), 1480px);
  min-height: 64px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: #006948;
  font:
    700 20px/32px 'Prompt',
    system-ui,
    sans-serif;
  cursor: pointer;
}

.navbar-logo {
  position: relative;
  display: block;
  width: 39px;
  height: 39px;
  overflow: hidden;
}

.navbar-logo img {
  position: absolute;
  width: 191.66%;
  height: 191.66%;
  left: -45.83%;
  top: -27.22%;
}

.role-navigation {
  display: flex;
  align-items: center;
  gap: 24px;
}

.role-navigation button {
  padding: 0;
  background: transparent;
  color: #64748b;
  border: 0;
  border-bottom: 2px solid transparent;
  font: inherit;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  cursor: pointer;
}

.role-navigation button.active {
  color: #059669;
  border-bottom-color: #059669;
  font-weight: 700;
}

.role-navigation button:hover {
  color: #059669;
}

.navbar-account,
.account-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-account {
  flex-shrink: 0;
}
.navbar-dropdown {
  position: relative;
}
.navbar-dropdown summary {
  list-style: none;
  cursor: pointer;
}
.navbar-dropdown summary::-webkit-details-marker {
  display: none;
}
.notification-toggle {
  padding: 10px;
  display: flex;
}
.notification-toggle img {
  width: 16px;
  height: 20px;
}
.account-toggle {
  min-height: 44px;
  color: #171d19;
}
.account-toggle img {
  width: 12px;
  height: 8px;
  margin-left: 4px;
}
.account-name {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account-role {
  font-size: 14px;
  white-space: nowrap;
}
.navbar-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 240px;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #dee4de;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
}
.navbar-popover p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
}
.navbar-popover button {
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 4px;
  background: #f4fbf8;
  color: #006948;
  font: inherit;
  cursor: pointer;
}
.caregiver-match-list {
  display: grid;
  gap: 16px;
  padding: 0;
  list-style: none;
}
.account-menu {
  width: 224px;
  padding: 6px;
  border-color: #e6ece8;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgb(25 50 38 / 9%);
}
.account-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 11px 12px;
  text-align: left;
  background: transparent;
  color: #405149;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 400;
}
.account-menu button svg { width: 18px; height: 18px; flex-shrink: 0; }
.account-menu button:hover, .account-menu button:focus-visible { background: #f2f7f4; }
.account-menu button[aria-current='page'] { color: #006948; font-weight: 600; }
.account-menu hr { border: 0; border-top: 1px solid #edf0ee; margin: 4px 10px; }
.account-menu .account-signout:hover { color: #a13434; background: #fdf4f4; }
.caregiver-match-list .job-heading {
  flex-wrap: wrap;
}
.top-navbar :focus-visible {
  outline: 2px solid #059669;
  outline-offset: 4px;
}

@media (max-width: 1150px) {
  .top-navbar-inner {
    flex-wrap: wrap;
    gap: 0 16px;
  }
  .role-navigation {
    order: 3;
    width: 100%;
    overflow-x: auto;
    padding: 12px 0;
  }
  .navbar-brand,
  .navbar-account {
    min-height: 64px;
  }
  .app-shell-dashboard {
    padding-top: 140px;
  }
}

@media (max-width: 600px) {
  .top-navbar-inner {
    width: calc(100% - 32px);
  }
  .navbar-brand {
    gap: 6px;
    font-size: 18px;
  }
  .navbar-account {
    gap: 0;
  }
  .account-role {
    display: none;
  }
  .account-name {
    max-width: 85px;
    font-size: 14px;
  }
  .account-toggle {
    gap: 6px;
  }
  .role-navigation {
    gap: 20px;
  }
  .role-navigation button {
    font-size: 14px;
  }
}

.role-dashboard {
  padding: 24px;
  background: #ffffff;
  border: 1px solid #dce7e1;
  border-radius: 16px;
}
.caregiver-profile {
  width: 100%;
  max-width: 760px;
  margin: 32px auto;
}

.caregiver-profile-form {
  display: grid;
  gap: 12px;
}

.caregiver-profile-form > label {
  font-weight: 600;
}

.caregiver-profile-form textarea,
.caregiver-profile-form input[type='number'] {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #bdcfc5;
  border-radius: 8px;
  background: #fff;
  font: inherit;
}

.caregiver-profile-form textarea {
  min-height: 120px;
  resize: vertical;
}
.caregiver-profile-form fieldset {
  margin: 8px 0 0;
  padding: 16px;
  border: 1px solid #dce7e2;
  border-radius: 12px;
}

.caregiver-profile-form legend {
  font-weight: 600;
}

.caregiver-profile-form ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.caregiver-profile-form li label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.caregiver-profile-form input[type='checkbox'],
.caregiver-profile-availability input {
  accent-color: #006948;
}

.caregiver-profile-form button[type='submit'] {
  justify-self: start;
  min-height: 44px;
  padding: 10px 20px;
  border: 0;
  border-radius: 8px;
  background: #006948;
  color: #fff;
  font: inherit;
  font-weight: 600;
}

.caregiver-profile-availability {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #dce7e2;
  border-radius: 12px;
  background: #f4fbf8;
}

.caregiver-profile-availability label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.caregiver-profile-availability p {
  margin: 8px 0 0;
  color: #64748b;
}

.caregiver-profile-availability input[role='switch'] {
  appearance: none;
  position: relative;
  width: 44px;
  height: 24px;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: #94a3b8;
  cursor: pointer;
}

.caregiver-profile-availability input[role='switch']::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
}

.caregiver-profile-availability input[role='switch']:checked {
  background: #006948;
}

.caregiver-profile-availability input[role='switch']:checked::before {
  transform: translateX(20px);
}

.employer-dashboard {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 2fr);
  gap: 32px;
  min-height: 500px;
  padding-top: 0;
}

.dashboard-patients,
.dashboard-jobs {
  min-width: 0;
}

.dashboard-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.employer-dashboard h2 {
  margin: 0 0 12px;
  color: #1e293b;
  font-size: 24px;
  line-height: 1.2;
}

.dashboard-patient-list {
  display: grid;
  gap: 12px;
  max-height: 534px;
  overflow-y: auto;
  padding-right: 8px;
}

.dashboard-patient-card,
.dashboard-state,
.dashboard-empty-jobs {
  box-sizing: border-box;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.dashboard-patient-card {
  padding: 24px;
}

.dashboard-patient-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.dashboard-patient-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #cce5ff;
}

.dashboard-patient-avatar img {
  width: 14px;
  height: 22px;
}

.dashboard-patient-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  line-height: 29px;
}

.dashboard-patient-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.dashboard-patient-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  color: #3d4a42;
  font-size: 14px;
}

.dashboard-patient-detail img {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.dashboard-state {
  margin: 0;
  padding: 24px;
  color: #64748b;
}

.dashboard-empty-patients button {
  padding: 8px 14px;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  background: #f0f9ff;
  color: #0369a1;
  font: inherit;
  cursor: pointer;
}

.dashboard-empty-jobs {
  min-height: 347px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.dashboard-empty-icon {
  display: grid;
  place-items: center;
  width: 80px;
  height: 56px;
  margin-bottom: 24px;
  border-radius: 50%;
  background: #f8fafc;
}

.dashboard-empty-icon img {
  width: 40px;
  height: 38px;
}

.dashboard-empty-title {
  margin: 0 0 24px;
  color: #1e293b;
  font-size: 14px;
}

.dashboard-empty-description {
  margin: 0 0 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 22px;
}

.dashboard-empty-jobs button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(310px, 100%);
  min-height: 48px;
  padding: 10px 20px;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  background: #f0f9ff;
  color: #0369a1;
  font: inherit;
  cursor: pointer;
}

.dashboard-empty-jobs button img {
  width: 15px;
  height: 15px;
  margin-right: 8px;
}

.app-footer {
  width: 100vw;
  margin: 72px 0 -48px calc(50% - 50vw);
  border-top: 1px solid #bccac0;
  background: #ffffff;
}

.app-footer-inner {
  box-sizing: border-box;
  width: min(calc(100% - 64px), 1480px);
  min-height: 104px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: #171d19;
  font-size: 14px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #006948;
  font:
    700 20px/32px 'Prompt',
    system-ui,
    sans-serif;
}

.app-footer-inner > p {
  margin: 0;
}

.app-footer nav {
  display: flex;
  gap: 24px;
  color: #475569;
}

@media (max-width: 900px) {
  .employer-dashboard {
    grid-template-columns: 1fr;
  }

  .app-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 0;
  }

  .app-footer nav {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .app-shell:not(.app-shell-landing) {
    width: calc(100% - 32px);
  }

  .employer-dashboard h2 {
    font-size: 20px;
  }

  .dashboard-patient-card {
    padding: 20px;
  }

  .app-footer-inner {
    width: calc(100% - 32px);
  }
}

.patient-manager {
  width: 100%;
}

.patient-manager h2 {
  margin: 24px 0 18px;
  color: #1e293b;
  font-size: 24px;
}

.patient-feedback {
  position: fixed;
  z-index: 1100;
  top: 88px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: min(360px, calc(100vw - 48px));
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgb(15 23 42 / 14%);
  font-size: 14px;
}

.patient-feedback-success {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.patient-feedback-error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.patient-feedback span {
  flex: 1;
}

.patient-feedback button {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.patient-card,
.add-patient-card {
  box-sizing: border-box;
  min-height: 188px;
  border-radius: 12px;
}

.patient-card {
  padding: 24px;
  border: 1px solid #bccac0;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.patient-card h3 {
  margin: 0 0 18px;
  color: #171d19;
  font-size: 18px;
}

.patient-card p {
  margin: 10px 0;
  color: #3d4a42;
  font-size: 14px;
}

.patient-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.patient-card-actions button,
.patient-form-actions button {
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid #bccac0;
  border-radius: 8px;
  background: #ffffff;
  color: #006948;
  font: inherit;
  cursor: pointer;
}

.patient-card-actions button:first-child,
.patient-form-actions button[type='submit'] {
  border-color: #059669;
  background: #059669;
  color: #ffffff;
}

.add-patient-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed #bccac0;
  background: transparent;
  color: #64748b;
  font: inherit;
  cursor: pointer;
}

.add-patient-card span {
  font-size: 28px;
  line-height: 1;
}

.patient-form-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: 24px;
  background: rgb(30 41 59 / 68%);
}

.patient-form-dialog {
  width: min(672px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.patient-form {
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  padding: 32px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 45px rgb(15 23 42 / 18%);
}

.patient-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.patient-form-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 24px;
}

.patient-form-header button {
  border: 0;
  background: transparent;
  color: #087443;
  font-size: 24px;
  cursor: pointer;
}

.patient-form label,
.patient-form legend {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.patient-form > input,
.patient-form > select,
.patient-form > textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid #bccac0;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
}

.patient-form > textarea {
  min-height: 72px;
  resize: vertical;
}

.patient-option-group {
  display: grid;
  gap: 8px;
  margin: 4px 0;
  padding: 12px;
  border: 1px solid #dce7e1;
  border-radius: 8px;
}

.patient-option-group label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 400;
}

.patient-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.patient-form-actions button:disabled {
  cursor: wait;
  opacity: 0.6;
}

@media (max-width: 720px) {
  .patient-feedback {
    top: 152px;
    right: 16px;
    width: calc(100vw - 32px);
  }

  .patient-manager {
    width: calc(100vw - 32px);
  }

  .patient-grid {
    grid-template-columns: 1fr;
  }

  .patient-form {
    padding: 20px;
  }

  .patient-form-actions {
    flex-direction: column-reverse;
  }
}

/* Sprint 1: shared job form/list, responsive and keyboard-visible controls */
*,
*::before,
*::after {
  box-sizing: border-box;
}
button,
input,
select,
textarea {
  font-family: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
:focus-visible {
  outline: 3px solid #008fa8;
  outline-offset: 3px;
}
.job-manager,
.job-form {
  width: 100%;
  margin: 32px 0;
  min-width: 0;
}
.job-form {
  max-width: 900px;
  margin-inline: auto;
  padding: 32px;
  border: 1px solid #dce7e2;
  border-radius: 20px;
  background: white;
}
.job-form h2,
.job-heading h2,
.job-heading h3 {
  margin: 0;
}
.job-form > p,
.job-heading p {
  color: #64748b;
}
.job-form-fields {
  display: grid;
  gap: 12px;
  border: 0;
  padding: 0;
  min-width: 0;
}
.job-form-fields > label {
  font-weight: 500;
  margin-top: 8px;
}
.job-form input:not([type='checkbox']),
.job-form select,
.job-form textarea,
.job-filter select {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid #bdcfc5;
  border-radius: 8px;
  background: #fff;
  color: #24332c;
  font-size: 16px;
}
.job-form textarea {
  resize: vertical;
}
.job-form-fields > fieldset {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dce7e2;
  border-radius: 12px;
  min-width: 0;
}
.job-form input[type='checkbox'] {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  accent-color: #006948;
}
.job-heading,
.job-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.job-actions {
  justify-content: flex-start;
  margin-top: 24px;
}
.job-manager button,
.job-form button,
.job-card button {
  border: 1px solid #006948;
  border-radius: 8px;
  padding: 11px 18px;
  background: #006948;
  color: white;
  font-size: 15px;
}
.job-manager .secondary-button,
.job-form .secondary-button {
  background: white;
  color: #006948;
}
.job-filter {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 24px 0;
}
.job-filter select {
  width: auto;
}
.job-list {
  display: grid;
  gap: 20px;
}
.job-card,
.job-empty {
  padding: 24px;
  border: 1px solid #dce7e2;
  border-radius: 16px;
  background: white;
  min-width: 0;
  overflow-wrap: anywhere;
}
.job-description {
  white-space: pre-wrap;
}
.job-status {
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 14px;
  background: #edf1f5;
  color: #475569;
}
.job-status-open {
  background: #e0f6e9;
  color: #006948;
}
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.job-tags span {
  padding: 5px 10px;
  border-radius: 6px;
  background: #edf6ff;
  color: #006398;
  font-size: 14px;
}
.success-notice {
  padding: 14px;
  background: #e0f6e9;
  border-radius: 8px;
  color: #006948;
}
.form-error,
.field-error {
  color: #a61b1b;
}
.field-error {
  display: block;
  font-size: 14px;
  margin: 4px 0 12px;
}
[aria-invalid='true'] {
  border-color: #a61b1b !important;
}
@media (max-width: 600px) {
  .job-form {
    padding: 20px 16px;
  }
  .job-card {
    padding: 18px;
  }
  .job-heading {
    align-items: flex-start;
  }
  .job-actions button {
    flex: 1;
  }
}
````

## frontend/src/styles/CaregiverDashboard.css

SHA-256: `da81e783bb36a4138e1ceab7d33f91bda7fcc238a6fd8205a3d0c587e85a726d`

````css
.care-home {
  width: min(calc(100% - 64px), 1480px);
  margin: 36px auto 56px;
  color: #243b33;
}

.care-home * {
  box-sizing: border-box;
}

.care-home-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}

.care-home-heading h1 {
  font-size: clamp(24px, 2.5vw, 32px);
  margin: 4px 0 8px;
  letter-spacing: -0.6px;
}

.care-home-heading p {
  margin: 0;
  color: #63766d;
}

.care-home .care-eyebrow {
  color: #007453;
  font-size: 13px;
  font-weight: 600;
}

.care-home button {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 9px;
  padding: 12px 18px;
  cursor: pointer;
  min-height: 44px;
}

.care-home button:focus-visible {
  outline: 3px solid #42a98b;
  outline-offset: 4px;
}

.care-home .care-outline {
  border: 1px solid #c4d8ce;
  color: #006948;
  background: white;
}

.care-home .care-outline:hover {
  background: #edf8f2;
}

.care-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 32px 40px;
  background: #e3f3eb;
  border: 1px solid #d2e9dd;
  border-radius: 20px;
}

.care-welcome h2 {
  font-size: clamp(23px, 2.3vw, 31px);
  line-height: 1.5;
  letter-spacing: -0.5px;
  margin: 10px 0;
  color: #174d37;
}

.care-welcome p {
  color: #526e5f;
  margin: 8px 0 22px;
}

.care-welcome button {
  background: #006948;
  color: white;
  border: 1px solid #006948;
}

.care-welcome button:hover {
  background: #00563b;
}

.care-welcome button span {
  margin-left: 18px;
}

.care-art {
  width: 240px;
  flex: 0 0 240px;
  margin-right: 4%;
}

.care-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 24px 0;
}

.care-stat,
.care-panel {
  background: white;
  border: 1px solid #deebe4;
  border-radius: 14px;
  padding: 24px;
  min-width: 0;
}

.care-stat {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.care-stat > span {
  color: #5e7167;
  font-size: 14px;
}

.care-stat strong {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 21px;
}

.care-stat small {
  color: #728178;
  font-size: 12px;
}

.care-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #98a7a0;
  flex-shrink: 0;
}

.care-dot.ready {
  background: #098a5c;
  box-shadow: 0 0 0 4px #e1f3e9;
}

.care-columns {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 24px;
}

.care-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.care-panel h2 {
  font-size: 18px;
  margin: 0;
}

.care-panel-heading > span {
  color: #738478;
  font-size: 12px;
  white-space: nowrap;
}

.care-checklist {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
}

.care-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 22px;
}

.care-checklist li:last-child {
  padding-bottom: 0;
}

.care-step {
  display: grid;
  place-items: center;
  flex: 0 0 30px;
  height: 30px;
  border: 1px solid #dae4de;
  border-radius: 50%;
  color: #7b8980;
  font-size: 13px;
}

.care-step.complete {
  background: #e2f5eb;
  color: #00704b;
  border-color: #e2f5eb;
}

.care-checklist h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 5px;
}

.care-checklist p,
.care-muted {
  font-size: 13px;
  color: #6a7c71;
  margin: 0;
  line-height: 1.7;
}

.care-note {
  color: #68796f;
  font-size: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f5f8f6;
  margin: 22px 0 0;
}

.care-home .care-text {
  background: none;
  border: 0;
  color: #00704b;
  padding: 8px;
}

.care-tags {
  padding: 0;
  margin: 22px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.care-tags li {
  background: #eef7f2;
  color: #32664b;
  border: 1px solid #deeee4;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.care-empty {
  padding: 28px 0 12px;
}

.care-empty strong {
  font-size: 15px;
}

.care-empty p {
  color: #6a7c71;
  font-size: 13px;
  margin: 10px 0 18px;
}

@media (max-width: 800px) {
  .care-home {
    width: calc(100% - 32px);
    margin-top: 24px;
  }

  .care-columns {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .care-welcome {
    padding: 24px;
  }

  .care-art {
    width: 150px;
    flex-basis: 150px;
    margin: 0;
  }

  .care-summary {
    gap: 10px;
  }

  .care-stat {
    padding: 16px;
  }

  .care-stat strong {
    font-size: 17px;
  }
}

@media (max-width: 560px) {
  .care-home-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }

  .care-art {
    display: none;
  }

  .care-summary {
    grid-template-columns: 1fr;
    margin: 16px 0;
  }

  .care-stat {
    gap: 8px;
  }

  .care-panel {
    padding: 20px;
  }

  .care-panel h2 {
    font-size: 16px;
  }
}
````

## frontend/src/styles/Workflow.css

SHA-256: `8c36b4ea4255bed09aae41d62d0c84d33478786109f219c122b5982092786170`

````css
.workflow-page {
  width: min(calc(100% - 64px), 1480px);
  margin: 32px auto 48px;
}
.workflow-page header {
  margin-bottom: 24px;
}
.workflow-page h1 {
  margin: 6px 0 12px;
  font-size: clamp(24px, 3vw, 32px);
}
.workflow-eyebrow {
  color: #00704b;
  font-size: 13px;
}
.workflow-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}
.workflow-card {
  padding: 24px;
  background: white;
  border: 1px solid #dce9e1;
  border-radius: 16px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.workflow-card h2 {
  font-size: 20px;
  margin-top: 0;
}
.workflow-card label {
  display: block;
  font-weight: 600;
  margin: 18px 0 8px;
}
.workflow-card input,
.workflow-card select,
.workflow-card textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  font: inherit;
  border: 1px solid #cbdcd2;
  border-radius: 8px;
  background: white;
}
.workflow-card textarea {
  min-height: 100px;
  resize: vertical;
}
.workflow-page button {
  font: inherit;
  padding: 11px 16px;
  border: 1px solid #006948;
  border-radius: 8px;
  background: #006948;
  color: white;
  cursor: pointer;
  min-height: 44px;
}
.workflow-page button.secondary-button {
  color: #006948;
  background: white;
}
.workflow-page button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.workflow-page :focus-visible {
  outline: 3px solid #73bda1;
  outline-offset: 3px;
}
.workflow-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.workflow-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid #e9eeeb;
  overflow-wrap: anywhere;
}
.workflow-list li > div {
  min-width: 0;
}
.workflow-list li > button {
  flex-shrink: 0;
}
.workflow-hint,
.workflow-list p {
  color: #64776d;
  font-size: 14px;
}
.workflow-badge {
  display: inline-block;
  padding: 5px 10px;
  background: #edf6f0;
  color: #286348;
  border-radius: 20px;
  font-size: 13px;
}
.workflow-actions,
.workflow-heading {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin: 16px 0;
}
.workflow-heading {
  justify-content: space-between;
}
.workflow-heading h2 {
  margin: 0;
}
.workflow-stack {
  display: grid;
  gap: 20px;
}
.workflow-contact {
  border-top: 1px solid #dce9e1;
  margin-top: 24px;
  padding-top: 16px;
}
.workflow-page [role='alert'] {
  color: #a12c2c;
}
@media (max-width: 800px) {
  .workflow-page {
    width: calc(100% - 32px);
  }
  .workflow-columns {
    grid-template-columns: 1fr;
  }
  .workflow-card {
    padding: 20px;
  }
}
@media (max-width: 480px) {
  .workflow-list li {
    align-items: flex-start;
    flex-direction: column;
  }
}
````

## frontend/src/styles/index.css

SHA-256: `bc366b275a3bfe972bbae96e54fdd5a4aa9daa45b33357dfdff140815cf7bb26`

````css
:root {
  scrollbar-gutter: stable;
  font-family: 'Prompt', 'Noto Sans Thai', system-ui, sans-serif;
  line-height: 1.5;
  color: #24332c;
  background: #f4fbf8;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
````

## frontend/vite.config.js

SHA-256: `e1eefd0ed1639c88d1213884ef760516884db9e168190e223fee6b063ad3e088`

````javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
````

## scripts/generate-review-snapshot.mjs

SHA-256: `c8ac696505c40b1b5f9d93d5fc07709bf28b0e231a7c75ccd8b72215f377d203`

````javascript
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const files = []
async function collect(directory) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name === 'node_modules' || entry.name.startsWith('.'))) continue
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) await collect(path)
    else if (/\.(jsx?|css|mjs|sql)$/.test(entry.name)) files.push(path)
  }
}
for (const directory of ['frontend/src', 'frontend/scripts', 'database', 'scripts']) {
  await collect(directory)
}
files.push('frontend/package.json', 'frontend/vite.config.js', 'frontend/index.html')
files.sort()
const sections = [
  '# MatchCare — Sprint 1 Source Snapshot',
  'สร้างใหม่ด้วย `node scripts/generate-review-snapshot.mjs` หลังแก้โค้ด เอกสารนี้เป็นสำเนาเพื่ออ่าน ไม่ใช่ไฟล์ที่นำไปรันโดยตรง',
  'อ่านผลตรวจและข้อจำกัดใน [SPRINT1_CODE_REVIEW.md](SPRINT1_CODE_REVIEW.md) ก่อน บางหน้าเป็น placeholder ของ Sprint ถัดไป',
  'รวมโค้ดแอป, config, SQL, tests และ scripts ไม่รวม .env, credentials, dependency, lockfile, ภาพ, build output และ JSON ข้อมูลพื้นที่ขนาดใหญ่ SHA-256 คำนวณหลังปรับ newline เป็น LF',
  '## รายการไฟล์\n\n' + files.map((file, index) => `${index + 1}. [${file}](../${file})`).join('\n'),
]
for (const file of files) {
  const source = (await readFile(resolve(root, file), 'utf8')).replace(/\r\n/g, '\n')
  const hash = createHash('sha256').update(source).digest('hex')
  const language = { js: 'javascript', mjs: 'javascript', jsx: 'jsx', sql: 'sql', css: 'css', json: 'json', html: 'html' }[file.split('.').at(-1)]
  const fence = '`'.repeat(Math.max(4, ...[...source.matchAll(/`+/g)].map(match => match[0].length + 1)))
  sections.push(`## ${file}\n\nSHA-256: \`${hash}\`\n\n${fence}${language}\n${source.trimEnd()}\n${fence}`)
}
await writeFile(resolve(root, 'docs/SPRINT1_SOURCE_SNAPSHOT.md'), sections.join('\n\n') + '\n')
console.log(`Generated snapshot: ${files.length} files`)
````
