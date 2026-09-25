-- ทดสอบ ID 4 ด้วยข้อมูลชั่วคราว: คำสั่งสุดท้าย rollback ทุกแถว
begin;

select set_config(
  'test.employer_id',
  (select id::text from auth.users where email = 'employer.test@example.com'),
  true
);
select set_config(
  'test.caregiver_id',
  (select id::text from auth.users where email = 'caregiver.test@example.com'),
  true
);
select set_config(
  'test.other_employer_id',
  (select id::text from public.profiles
   where role = 'employer'
     and id <> current_setting('test.employer_id')::uuid
   limit 1),
  true
);
select set_config(
  'test.skill_id',
  (select id::text from public.skills where is_active = true order by id limit 1),
  true
);

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

with new_patient as (
  insert into public.patients (
    employer_id, first_name, last_name, birth_date, mobility_status,
    province, district, subdistrict, address_detail
  ) values (
    (select auth.uid()), 'ทดสอบ', 'ประกาศงาน', '1950-01-01', 'walker',
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
  ) returning id
)
select set_config('test.patient_id', id::text, true) from new_patient;

with new_job as (
  insert into public.job_posts (
    employer_id, patient_id, title, description, care_summary,
    starts_at, ends_at, pay_amount, pay_unit,
    province, district, subdistrict, address_detail
  ) values (
    (select auth.uid()), current_setting('test.patient_id')::bigint,
    'ประกาศทดสอบ', 'รายละเอียดงานสมมติ', 'ดูแลการเคลื่อนไหว',
    now() + interval '1 day', now() + interval '2 days', 1200, 'day',
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
  ) returning id
)
select set_config('test.job_id', id::text, true) from new_job;

insert into public.job_required_skills (job_post_id, skill_id)
values (
  current_setting('test.job_id')::bigint,
  current_setting('test.skill_id')::bigint
);

update public.job_posts set status = 'open'
where id = current_setting('test.job_id')::bigint;
set constraints job_posts_require_skill immediate;

do $$
begin
  if not exists (
    select 1 from public.job_posts
    where id = current_setting('test.job_id')::bigint
      and status = 'open' and published_at is not null
  ) then
    raise exception 'เปิดประกาศไม่สำเร็จ';
  end if;

  begin
    update public.patients set is_active = false
    where id = current_setting('test.patient_id')::bigint;
    raise exception 'ปิดผู้ป่วยทั้งที่มีประกาศเปิดอยู่ได้';
  exception
    when check_violation then
      perform set_config('test.patient_guard_passed', 'true', true);
  end;
end;
$$;

-- ผู้ดูแลอ่านประกาศที่มีที่อยู่ละเอียดไม่ได้ และสร้างประกาศไม่ได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.caregiver_id'),
    'role', 'authenticated'
  )::text,
  true
);

do $$
begin
  if exists (select 1 from public.job_posts
             where id = current_setting('test.job_id')::bigint) then
    raise exception 'ผู้ดูแลอ่านประกาศส่วนตัวได้';
  end if;

  begin
    insert into public.job_posts (
      employer_id, patient_id, title, description, care_summary,
      starts_at, ends_at, pay_amount, pay_unit,
      province, district, subdistrict, address_detail
    ) values (
      (select auth.uid()), current_setting('test.patient_id')::bigint,
      'ไม่ควรสร้างได้', 'รายละเอียด', 'สรุป',
      now() + interval '1 day', now() + interval '2 days', 100, 'day',
      'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
    );
    raise exception 'ผู้ดูแลสร้างประกาศได้';
  exception
    when others then
      if sqlerrm in ('ผู้ดูแลสร้างประกาศได้') then
        raise;
      end if;
      perform set_config('test.caregiver_rejected', 'true', true);
  end;
end;
$$;

-- ผู้ว่าจ้างรายอื่นมองไม่เห็นและแก้ไขประกาศนี้ไม่ได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.other_employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
select set_config(
  'test.other_owner_hidden',
  ((select count(*) from public.job_posts
    where id = current_setting('test.job_id')::bigint) = 0)::text,
  true
);
with changed as (
  update public.job_posts set title = 'แก้ไขข้ามบัญชี'
  where id = current_setting('test.job_id')::bigint
  returning id
)
select set_config('test.other_owner_update_count', count(*)::text, true)
from changed;

-- เจ้าของปิดประกาศแล้วจึงปิดผู้ป่วยได้
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.employer_id'),
    'role', 'authenticated'
  )::text,
  true
);
update public.job_posts set status = 'closed'
where id = current_setting('test.job_id')::bigint;
update public.patients set is_active = false
where id = current_setting('test.patient_id')::bigint;

select
  current_setting('test.patient_guard_passed')::boolean as patient_guard_passed,
  current_setting('test.caregiver_rejected')::boolean as caregiver_rejected,
  current_setting('test.other_owner_hidden')::boolean as other_owner_hidden,
  current_setting('test.other_owner_update_count')::integer = 0
    as other_owner_update_rejected,
  (select status = 'closed' and closed_at is not null
   from public.job_posts where id = current_setting('test.job_id')::bigint)
    as job_closed,
  (select is_active = false
   from public.patients where id = current_setting('test.patient_id')::bigint)
    as patient_deactivated_after_close;

rollback;
