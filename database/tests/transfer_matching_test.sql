-- รายละเอียดการย้ายตัวและโรคไม่เปลี่ยนคะแนน ทักษะในประกาศเท่านั้นที่เปลี่ยน
begin;
select set_config('test.transfer_owner', gen_random_uuid()::text, true);
select set_config('test.transfer_basic', gen_random_uuid()::text, true);
select set_config('test.transfer_skilled', gen_random_uuid()::text, true);
insert into auth.users (id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.transfer_owner', 'test.transfer_basic', 'test.transfer_skilled']) k;
insert into public.profiles (
  id, role, first_name, last_name, phone, province, district, subdistrict, address_detail
)
select current_setting(k)::uuid,
  case when k = 'test.transfer_owner' then 'employer' else 'caregiver' end,
  'ทดสอบ', k, '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ'
from unnest(array['test.transfer_owner', 'test.transfer_basic', 'test.transfer_skilled']) k;
insert into public.caregiver_profiles (
  caregiver_id, availability_status, verification_status, verified_by, verified_at
)
select current_setting(k)::uuid, 'available', 'verified',
  current_setting('test.transfer_owner')::uuid, now()
from unnest(array['test.transfer_basic', 'test.transfer_skilled']) k;
select set_config('test.transfer_skill', id::text, true)
from public.skills where name = 'การช่วยพยุงและย้ายตัว';
select set_config('test.base_skill', id::text, true)
from public.skills where name = 'การปฐมพยาบาลเบื้องต้น';

select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.transfer_owner'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
declare p public.patients; j bigint;
begin
  p := public.save_patient_with_health_context(
    null, 'ทดสอบ', 'จับคู่', '1950-01-01', 'walker', 'ต้องช่วยพยุงไปห้องน้ำ',
    'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ที่อยู่สมมติ',
    '{}'::bigint[], '{}'::bigint[], 'arm_and_leg', 'left', 'independent', 'ความดันสูง'
  );
  j := public.create_job_with_tags(
    p.id, 'ทดสอบความต้องการย้ายตัว', 'รายละเอียด', 'การดูแล',
    now() + interval '1 day', now() + interval '2 days', 1000, 'day',
    array[current_setting('test.base_skill')::bigint]
  );
  perform set_config('test.transfer_patient', p.id::text, true);
  perform set_config('test.transfer_job', j::text, true);
end $$;
reset role;
insert into public.caregiver_skills (caregiver_id, skill_id)
select current_setting(k)::uuid, current_setting('test.base_skill')::bigint
from unnest(array['test.transfer_basic', 'test.transfer_skilled']) k;
insert into public.caregiver_skills (caregiver_id, skill_id)
values (current_setting('test.transfer_skilled')::uuid, current_setting('test.transfer_skill')::bigint);
set local role authenticated;

do $$
declare basic_score numeric; skilled_score numeric;
begin
  select match_score into basic_score from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
  where caregiver_id = current_setting('test.transfer_basic')::uuid;
  select match_score into skilled_score from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
  where caregiver_id = current_setting('test.transfer_skilled')::uuid;
  if basic_score <> 100 or skilled_score <> 100 then
    raise exception 'ย้ายตัวได้เองไม่ควรเพิ่มเกณฑ์: % %', basic_score, skilled_score;
  end if;

  update public.patients set transfer_assistance = 'partial'
  where id = current_setting('test.transfer_patient')::bigint;
  select match_score into basic_score from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
  where caregiver_id = current_setting('test.transfer_basic')::uuid;
  select match_score into skilled_score from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
  where caregiver_id = current_setting('test.transfer_skilled')::uuid;
  if basic_score <> 100 or skilled_score <> 100 then
    raise exception 'รายละเอียดการย้ายตัวเปลี่ยนคะแนน: % %', basic_score, skilled_score;
  end if;
  update public.patients set chronic_conditions = 'เบาหวาน' where id = current_setting('test.transfer_patient')::bigint;
  if not exists (select 1 from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
    where caregiver_id = current_setting('test.transfer_basic')::uuid and match_score = 100
  ) then raise exception 'โรคประจำตัวเปลี่ยนคะแนน'; end if;

  update public.patients set affected_side = 'right'
  where id = current_setting('test.transfer_patient')::bigint;
  if not exists (
    select 1 from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
    where caregiver_id = current_setting('test.transfer_basic')::uuid and match_score = basic_score
  ) then raise exception 'การเปลี่ยนข้างทำให้คะแนนเปลี่ยน'; end if;

  update public.patients set transfer_assistance = 'full'
  where id = current_setting('test.transfer_patient')::bigint;
  insert into public.job_required_skills (job_post_id, skill_id)
  values (
    current_setting('test.transfer_job')::bigint,
    current_setting('test.transfer_skill')::bigint
  );
  if not exists (
    select 1 from public.rank_caregivers_for_job(current_setting('test.transfer_job')::bigint)
    where caregiver_id = current_setting('test.transfer_basic')::uuid
      and required_skills = 2 and match_score = 50
  ) then raise exception 'ทักษะในประกาศไม่เปลี่ยนคะแนน'; end if;
end $$;

select set_config('request.jwt.claims', json_build_object(
  'sub', current_setting('test.transfer_skilled'), 'role', 'authenticated'
)::text, true);
do $$
declare details jsonb;
begin
  details := public.get_open_job_details(current_setting('test.transfer_job')::bigint);
  if details->>'transfer_assistance' <> 'full' or details->>'chronic_conditions' <> 'เบาหวาน'
    or details->>'care_notes' <> 'ต้องช่วยพยุงไปห้องน้ำ'
    or details->>'affected_side' <> 'right' or exists (
    select 1 from jsonb_array_elements(details->'required_skills') item
    where item->>'name' = 'ทักษะที่ไม่มีในประกาศ'
  ) then raise exception 'รายละเอียดสุขภาพหรือทักษะในประกาศไม่ตรง'; end if;
  if details ?| array['patient_id', 'patient_name', 'address_detail', 'phone'] then
    raise exception 'รายละเอียดงานเปิดข้อมูลผู้ป่วยเกินจำเป็น';
  end if;
end $$;
rollback;
