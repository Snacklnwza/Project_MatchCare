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