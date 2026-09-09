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