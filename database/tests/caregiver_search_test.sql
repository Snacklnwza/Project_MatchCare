-- ID 9: ทดสอบตัวกรอง สิทธิ์ และข้อมูลสาธารณะ; ย้อนข้อมูลสมมติทั้งหมด
begin;
select set_config('test.employer', gen_random_uuid()::text, true);
select set_config('test.other', gen_random_uuid()::text, true);
select set_config('test.full', gen_random_uuid()::text, true);
select set_config('test.partial', gen_random_uuid()::text, true);
select set_config('test.unverified', gen_random_uuid()::text, true);
select set_config('test.unavailable', gen_random_uuid()::text, true);

insert into auth.users(id,email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.employer','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,
  case when k in ('test.employer','test.other') then 'employer' else 'caregiver' end,
  'ทดสอบ', k, '0812345678',
  case when k = 'test.partial' then 'เชียงใหม่' else 'กรุงเทพมหานคร' end,
  case when k = 'test.partial' then 'เมืองเชียงใหม่' else 'พระนคร' end,
  'ข้อมูลลับ', 'ที่อยู่ลับ'
from unnest(array['test.employer','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.caregiver_profiles(caregiver_id,bio,experience_years,availability_status,verification_status,verified_by,verified_at)
select current_setting(k)::uuid,'ติดต่อ 0812345678',
  case when k = 'test.full' then 5 else 1 end,
  case when k = 'test.unavailable' then 'unavailable' else 'available' end,
  case when k = 'test.unverified' then 'not_submitted' else 'verified' end,
  case when k = 'test.unverified' then null else current_setting('test.employer')::uuid end,
  case when k = 'test.unverified' then null else now() end
from unnest(array['test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.caregiver_skills(caregiver_id,skill_id)
select current_setting(k)::uuid,(select id from public.skills where is_active order by id limit 1)
from unnest(array['test.full','test.unverified','test.unavailable']) k;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare v_skill bigint; v_result jsonb;
begin
  select id into v_skill from public.skills where is_active order by id limit 1;
  if not exists(select 1 from public.search_caregivers() where caregiver_id = current_setting('test.full')::uuid)
    or not exists(select 1 from public.search_caregivers() where caregiver_id = current_setting('test.partial')::uuid)
    or exists(select 1 from public.search_caregivers() where caregiver_id in (current_setting('test.unverified')::uuid,current_setting('test.unavailable')::uuid))
    then raise exception 'verified/available ไม่ถูกต้อง'; end if;
  if not exists(select 1 from public.search_caregivers(p_skill_id => v_skill) where caregiver_id = current_setting('test.full')::uuid)
    or exists(select 1 from public.search_caregivers(p_skill_id => v_skill) where caregiver_id = current_setting('test.partial')::uuid)
    then raise exception 'กรองทักษะผิด'; end if;
  if not exists(select 1 from public.search_caregivers(p_province => 'เชียงใหม่',p_district => 'เมืองเชียงใหม่') where caregiver_id = current_setting('test.partial')::uuid)
    or exists(select 1 from public.search_caregivers(p_province => 'เชียงใหม่',p_district => 'เมืองเชียงใหม่') where caregiver_id = current_setting('test.full')::uuid)
    then raise exception 'กรองพื้นที่ผิด'; end if;
  if not exists(select 1 from public.search_caregivers(p_min_experience => 3) where caregiver_id = current_setting('test.full')::uuid)
    or exists(select 1 from public.search_caregivers(p_min_experience => 3) where caregiver_id = current_setting('test.partial')::uuid)
    then raise exception 'กรองประสบการณ์ผิด'; end if;
  if not exists(select 1 from public.search_caregivers(p_max_experience => 1) where caregiver_id = current_setting('test.partial')::uuid)
    or exists(select 1 from public.search_caregivers(p_max_experience => 1) where caregiver_id = current_setting('test.full')::uuid)
    then raise exception 'กรองประสบการณ์สูงสุดผิด'; end if;
  if (select count(*) from public.search_caregivers(p_offset => 1,p_limit => 1)) > 1 then raise exception 'แบ่งหน้าผิด'; end if;
  if (select count(*) from public.search_caregivers(p_province => 'ไม่มีจังหวัดนี้')) <> 0 then raise exception 'ผลว่างผิด'; end if;
  select to_jsonb(c) into v_result from public.search_caregivers() c limit 1;
  if v_result ?| array['phone','line_id','email','address_detail','subdistrict','document_path','verified_by']
    then raise exception 'API ส่งข้อมูลส่วนตัว'; end if;
  if v_result->>'bio' is not null or v_result::text like '%0812345678%'
    then raise exception 'คำแนะนำตัวเผยข้อมูลติดต่อ'; end if;
  if not v_result ?& array['bio','skills','province','district','experience_years']
    then raise exception 'API ขาดข้อมูลสาธารณะ'; end if;
  begin
    perform public.search_caregivers(p_min_experience => 8,p_max_experience => 2);
    raise exception 'ตัวกรองผิดแต่ยอมรับ';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.search_caregivers(p_job_id => -1);
    raise exception 'อ่านประกาศที่ไม่ใช่ของตน';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- เปลี่ยนความพร้อมแล้วค้นใหม่ ต้องหายจากรายการ
update public.caregiver_profiles set availability_status = 'unavailable'
where caregiver_id = current_setting('test.full')::uuid;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.search_caregivers() where caregiver_id = current_setting('test.full')::uuid)
    then raise exception 'ผู้ไม่พร้อมยังปรากฏ'; end if;
end $$;
reset role;

-- ผ่านการตรวจแต่สถานะยืนยันเปลี่ยน ต้องไม่ปรากฏในการค้นหาใหม่
update public.caregiver_profiles
set availability_status = 'available', verification_status = 'pending'
where caregiver_id = current_setting('test.full')::uuid;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.search_caregivers() where caregiver_id = current_setting('test.full')::uuid)
    then raise exception 'ผู้ไม่ผ่านการยืนยันยังปรากฏ'; end if;
end $$;
reset role;

-- บัญชีผู้ดูแลและผู้ไม่เข้าสู่ระบบไม่มีสิทธิ์เรียก RPC
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.partial'),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  begin perform public.search_caregivers(); raise exception 'ผู้ดูแลค้นได้';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if has_function_privilege('anon','public.search_caregivers(text,text,bigint,integer,integer,bigint,integer,integer)','EXECUTE')
    then raise exception 'ผู้ไม่เข้าสู่ระบบเรียก RPC ได้'; end if;
end $$;
select 'caregiver_search_tests_passed' as result;
rollback;
