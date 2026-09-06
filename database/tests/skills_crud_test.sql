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