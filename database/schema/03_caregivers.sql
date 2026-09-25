-- Source: database/schema/07_caregiver_tables.sql
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

-- Source: database/schema/08_caregiver_policies.sql
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
