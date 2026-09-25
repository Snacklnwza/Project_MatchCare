-- Source: database/prototypes/skills_setup.sql
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

-- Source: database/schema/01_profiles.sql
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

-- Source: database/schema/02_profiles_policies.sql
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

-- Source: database/schema/03_updated_at_trigger.sql
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
