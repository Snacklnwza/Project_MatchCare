-- ตรวจประวัติด้วยข้อมูลสมมติ และย้อนกลับทุกแถวเมื่อจบ
begin;
select set_config('test.history_employer', gen_random_uuid()::text, true);
select set_config('test.history_caregiver', gen_random_uuid()::text, true);
select set_config('test.history_other', gen_random_uuid()::text, true);
select set_config('test.history_admin', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.history_employer', 'test.history_caregiver', 'test.history_other', 'test.history_admin']) k;
insert into public.profiles(id, role, first_name, last_name, phone, province, district, subdistrict, address_detail)
select current_setting(k)::uuid,
  case when k = 'test.history_caregiver' then 'caregiver' when k = 'test.history_admin' then 'admin' else 'employer' end,
  'ทดสอบ', k, '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'ข้อมูลลับ', 'ที่อยู่ลับ'
from unnest(array['test.history_employer', 'test.history_caregiver', 'test.history_other', 'test.history_admin']) k;
insert into public.caregiver_profiles(caregiver_id, availability_status, verification_status, verified_by, verified_at)
values(current_setting('test.history_caregiver')::uuid, 'available', 'verified', current_setting('test.history_admin')::uuid, now());
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_employer'), 'role', 'authenticated')::text, true);
set local role authenticated;

do $$
declare p public.patients; j bigint; r bigint; s bigint;
begin
  select id into s from public.skills where is_active order by id limit 1;
  p := public.save_patient_with_tags(null, 'ผู้ป่วย', 'สมมติ', '1950-01-01', 'normal', null,
    'กรุงเทพมหานคร', 'พระนคร', 'ข้อมูลลับ', 'ที่อยู่ลับ', '{}', array[s]);
  for i in 1..23 loop
    perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_employer'))::text, true);
    j := public.create_job_with_tags(p.id, 'งานประวัติ ' || i, 'รายละเอียดงาน', 'ดูแล',
      '2030-01-01 12:00+07', '2030-01-03 12:00+07', 1000, 'day', array[s]);
    if i % 2 = 0 then
      r := public.invite_caregiver(j, current_setting('test.history_caregiver')::uuid);
      perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_caregiver'))::text, true);
      perform public.respond_to_invitation(r, true);
    else
      perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_caregiver'))::text, true);
      r := public.submit_application(j);
      perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_employer'))::text, true);
      perform public.respond_to_application(r, true);
    end if;
    if i = 1 then perform set_config('test.history_completed', j::text, true); end if;
    if i = 2 then perform set_config('test.history_cancelled', j::text, true); end if;
    perform set_config('test.history_latest', j::text, true);
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_employer'))::text, true);
  j := current_setting('test.history_completed')::bigint;
  perform public.start_matched_job(j);
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_caregiver'))::text, true);
  perform public.request_job_completion(j);
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_employer'))::text, true);
  perform public.confirm_job_completion(j);
  j := public.create_job_with_tags(p.id, 'ยังไม่จับคู่', 'รายละเอียด', 'ดูแล',
    '2030-02-01 12:00+07', '2030-02-03 12:00+07', 1000, 'day', array[s]);
  perform set_config('test.history_pending', j::text, true);
  perform public.invite_caregiver(j, current_setting('test.history_caregiver')::uuid);
end $$;

-- สร้างสถานะยกเลิกเป็น fixture เท่านั้น ไม่แก้กฎการยกเลิกของระบบ
reset role;
set constraints all immediate;
alter table public.job_posts disable trigger job_posts_validate;
update public.job_posts set status = 'cancelled', cancelled_at = now(), cancellation_reason = 'เหตุผลสมมติ'
where id = current_setting('test.history_cancelled')::bigint;
alter table public.job_posts enable trigger job_posts_validate;
set local role authenticated;

do $$
declare item jsonb;
begin
  if (select count(*) from public.list_job_history()) <> 21
    or (select count(*) from public.list_job_history('all', 20)) <> 3 then
    raise exception 'แบ่งหน้าประวัติผิด';
  end if;
  if (select job_post_id from public.list_job_history() limit 1) <> current_setting('test.history_latest')::bigint then
    raise exception 'ลำดับประวัติไม่คงที่';
  end if;
  if (select count(*) from public.list_job_history('completed')) <> 1
    or (select count(*) from public.list_job_history('cancelled')) <> 1
    or (select count(*) from public.list_job_history('active')) <> 21 then
    raise exception 'กรองสถานะผิด';
  end if;
  select to_jsonb(h) into item from public.list_job_history() h limit 1;
  if item ?| array['phone', 'line_id', 'address_detail', 'patient_id', 'patient_name', 'caregiver_id'] then
    raise exception 'รายการประวัติส่งข้อมูลเกินจำเป็น';
  end if;
  if not exists(select 1 from public.get_job_history_details(current_setting('test.history_completed')::bigint)
    where completed_at is not null and jsonb_array_length(required_skills) = 1) then
    raise exception 'รายละเอียดงานจบหาย';
  end if;
  if not exists(select 1 from public.get_job_history_details(current_setting('test.history_cancelled')::bigint)
    where cancellation_reason = 'เหตุผลสมมติ') then raise exception 'รายละเอียดงานยกเลิกหาย'; end if;
  begin
    perform public.get_job_history_details(current_setting('test.history_pending')::bigint);
    raise exception 'งานยังไม่จับคู่ปรากฏในประวัติ';
  exception when insufficient_privilege then null; end;
  begin
    perform public.list_job_history('invalid'); raise exception 'รับตัวกรองผิด';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.list_job_history('all', -1); raise exception 'รับหน้าติดลบ';
  exception when invalid_parameter_value then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_caregiver'))::text, true);
  if (select count(*) from public.list_job_history('all', 20)) <> 3 then raise exception 'ผู้ดูแลไม่เห็นประวัติทั้งสองเส้นทาง'; end if;
  perform public.get_job_history_details(current_setting('test.history_completed')::bigint);
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_other'))::text, true);
  if exists(select 1 from public.list_job_history()) then raise exception 'บัญชีอื่นอ่านประวัติได้'; end if;
  begin
    perform public.get_job_history_details(current_setting('test.history_completed')::bigint);
    raise exception 'บัญชีอื่นเปิดรายละเอียดได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.history_admin'))::text, true);
  begin
    perform public.list_job_history(); raise exception 'แอดมินอ่านประวัติส่วนตัวได้';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform public.list_job_history(); raise exception 'ผู้ไม่ล็อกอินอ่านประวัติได้';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
