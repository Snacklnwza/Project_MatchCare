-- ID 6: ผู้ดูแลค้นหาได้แม้ยังไม่ยืนยัน แต่ประกาศปิดและข้อมูลส่วนตัวต้องไม่หลุด
begin;
select set_config('test.job_search_employer', gen_random_uuid()::text, true);
select set_config('test.job_search_caregiver', gen_random_uuid()::text, true);

insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.job_search_employer', 'test.job_search_caregiver']) k;

insert into public.profiles(
  id, role, first_name, last_name, phone,
  province, district, subdistrict, address_detail
)
select current_setting(k)::uuid,
  case when k = 'test.job_search_employer' then 'employer' else 'caregiver' end,
  'ทดสอบ', 'ค้นหางาน', '0800000000',
  'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่ส่วนตัว'
from unnest(array['test.job_search_employer', 'test.job_search_caregiver']) k;

insert into public.caregiver_profiles(caregiver_id)
values (current_setting('test.job_search_caregiver')::uuid);

select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.job_search_employer'), 'role', 'authenticated'
)::text, true);
set local role authenticated;

do $$
declare v_patient public.patients; v_job bigint; v_skill bigint;
begin
  select id into v_skill from public.skills where is_active order by id limit 1;
  perform set_config('test.job_search_skill', v_skill::text, true);
  v_patient := public.save_patient_with_tags(
    null, 'ชื่อผู้ป่วยลับ', 'นามสกุลลับ', '1950-01-01', 'normal', null,
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'บ้านเลขที่ลับ',
    '{}', array[v_skill]
  );
  v_job := public.create_job_with_tags(
    v_patient.id, 'งานดูแลทดสอบ', 'รายละเอียดงาน', 'ช่วยดูแลทั่วไป',
    '2030-01-01 12:00+07', '2030-01-03 12:00+07', 1000, 'day', array[v_skill]
  );
  perform set_config('test.job_search_job', v_job::text, true);
end $$;

-- ผู้ว่าจ้างเรียก RPC นี้ไม่ได้ แม้เป็นเจ้าของประกาศ
do $$ begin
  begin
    perform public.search_open_jobs();
    raise exception 'ผู้ว่าจ้างค้นประกาศผ่าน RPC ผู้ดูแลได้';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_open_job_details(current_setting('test.job_search_job')::bigint);
    raise exception 'ผู้ว่าจ้างเปิดรายละเอียดผ่าน RPC ผู้ดูแลได้';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.job_search_caregiver'), 'role', 'authenticated'
)::text, true);

do $$
declare v_result record;
begin
  select * into v_result from public.search_open_jobs(
    p_province => 'กรุงเทพมหานคร', p_district => 'พระนคร',
    p_work_date => '2030-01-02', p_pay_unit => 'day',
    p_min_pay => 1000, p_skill_id => current_setting('test.job_search_skill')::bigint
  );
  if v_result.job_id is distinct from current_setting('test.job_search_job')::bigint
    or jsonb_array_length(v_result.required_skills) <> 1 then
    raise exception 'ค้นหาประกาศหรือทักษะที่ต้องการไม่ถูกต้อง';
  end if;
  if to_jsonb(v_result) ?| array['patient_id', 'address_detail', 'subdistrict', 'phone'] then
    raise exception 'ผลค้นหามีข้อมูลส่วนตัว';
  end if;
  if (public.get_open_job_details(v_result.job_id)->>'title') is distinct from 'งานดูแลทดสอบ'
    or public.get_open_job_details(v_result.job_id) ?| array['patient_id', 'address_detail', 'phone'] then
    raise exception 'รายละเอียดงานไม่ถูกต้องหรือมีข้อมูลส่วนตัว';
  end if;
  if exists(select 1 from public.search_open_jobs(p_min_pay => 1200, p_pay_unit => 'day'))
    or exists(select 1 from public.search_open_jobs(p_province => 'พะเยา'))
    or exists(select 1 from public.search_open_jobs(p_work_date => '2030-01-05'))
    or exists(select 1 from public.search_open_jobs(p_offset => 1, p_limit => 1)) then
    raise exception 'ตัวกรองหรือการแบ่งหน้าผิด';
  end if;
end $$;

-- เมื่อปิดประกาศแล้ว ผู้ดูแลต้องไม่เห็นอีก
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.job_search_employer'), 'role', 'authenticated'
)::text, true);
select public.close_job(current_setting('test.job_search_job')::bigint);
select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.job_search_caregiver'), 'role', 'authenticated'
)::text, true);
do $$ begin
  if exists(select 1 from public.search_open_jobs()) then
    raise exception 'ประกาศปิดแล้วยังแสดงอยู่';
  end if;
  if public.get_open_job_details(current_setting('test.job_search_job')::bigint) is not null then
    raise exception 'ประกาศปิดแล้วยังเปิดรายละเอียดได้';
  end if;
  if has_function_privilege('anon',
    'public.search_open_jobs(text,text,date,text,numeric,bigint,integer,integer)',
    'execute') then
    raise exception 'ผู้ไม่เข้าสู่ระบบเรียก RPC ได้';
  end if;
end $$;
rollback;
