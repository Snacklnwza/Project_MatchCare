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