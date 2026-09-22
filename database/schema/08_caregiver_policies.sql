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