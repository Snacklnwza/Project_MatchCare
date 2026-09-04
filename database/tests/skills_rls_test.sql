-- ทดสอบว่า RLS แสดงเฉพาะทักษะที่เปิดใช้งาน

begin;

update public.skills
set is_active = false
where name = 'First Aid';

set local role anon;

select
  id,
  name,
  is_active
from public.skills
order by id;

rollback;


-- ตรวจสอบสิทธิ์ของผู้ใช้ Frontend

select
  (
    select is_active
    from public.skills
    where name = 'First Aid'
  ) as first_aid_restored,

  has_table_privilege(
    'anon',
    'public.skills',
    'select'
  ) as anon_can_select,

  has_table_privilege(
    'anon',
    'public.skills',
    'insert'
  ) as anon_can_insert,

  has_table_privilege(
    'authenticated',
    'public.skills',
    'select'
  ) as authenticated_can_select,

  has_table_privilege(
    'authenticated',
    'public.skills',
    'insert'
  ) as authenticated_can_insert;
