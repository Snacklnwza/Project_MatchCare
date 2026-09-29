-- รันครั้งเดียวกับฐานข้อมูล MatchCare เดิมที่สร้างก่อนเพิ่มค่า `normal`
-- ฐานข้อมูลที่ติดตั้งใหม่มีค่านี้อยู่แล้วใน schema/02_patients.sql
begin;

alter table public.patients
  drop constraint if exists patients_mobility_status_valid;

alter table public.patients
  add constraint patients_mobility_status_valid
  check (mobility_status in ('normal', 'bedridden', 'wheelchair', 'walker', 'cane'));

commit;
