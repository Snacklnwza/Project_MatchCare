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