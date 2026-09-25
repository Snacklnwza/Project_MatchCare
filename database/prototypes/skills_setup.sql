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