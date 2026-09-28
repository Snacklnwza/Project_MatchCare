-- รันหลังติดตั้ง 06_matching.sql; ข้อมูลสมมติทั้งหมดถูก rollback
begin;
select set_config('test.owner', gen_random_uuid()::text, true);
select set_config('test.other', gen_random_uuid()::text, true);
select set_config('test.full', gen_random_uuid()::text, true);
select set_config('test.partial', gen_random_uuid()::text, true);
select set_config('test.unverified', gen_random_uuid()::text, true);
select set_config('test.unavailable', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.owner','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.profiles(id, role, first_name, last_name, phone, province, district, subdistrict, address_detail)
select current_setting(k)::uuid,
  case when k in ('test.owner','test.other') then 'employer' else 'caregiver' end,
  'ทดสอบ', k, '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'พระบรมมหาราชวัง', 'ข้อมูลสมมติ'
from unnest(array['test.owner','test.other','test.full','test.partial','test.unverified','test.unavailable']) k;
insert into public.caregiver_profiles(caregiver_id, availability_status, verification_status, verified_by, verified_at)
select current_setting(k)::uuid,
  case when k = 'test.unavailable' then 'unavailable' else 'available' end,
  case when k = 'test.unverified' then 'not_submitted' else 'verified' end,
  case when k <> 'test.unverified' then current_setting('test.owner')::uuid end,
  case when k <> 'test.unverified' then now() end
from unnest(array['test.full','test.partial','test.unverified','test.unavailable']) k;

-- สร้างประกาศด้วยสิทธิ์ผู้ว่าจ้างจริง
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare p public.patients; j bigint; tags bigint[];
begin
  select array_agg(id order by id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  if cardinality(tags) is distinct from 2 then raise exception 'ต้องมีทักษะที่เปิดใช้งานสองรายการ'; end if;
  perform set_config('test.tags', tags::text, true);
  p := public.save_patient_with_tags(null,'ทดสอบ','จับคู่','1950-01-01','walker',null,
    'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',tags);
  j := public.create_job_with_tags(p.id,'ทดสอบจับคู่','รายละเอียด','การดูแล',now()+interval '1 day',now()+interval '2 days',1000,'day',tags);
  perform set_config('test.job',j::text,true);
end $$;
reset role;
insert into public.caregiver_skills(caregiver_id, skill_id)
select current_setting(k)::uuid, tag
from unnest(array['test.full','test.partial','test.unverified','test.unavailable']) k
cross join unnest(current_setting('test.tags')::bigint[]) tag
where k <> 'test.partial' or tag = (current_setting('test.tags')::bigint[])[1];
set local role authenticated;
do $$
declare counts bigint[];
begin
  select array_agg(s.matched_skills order by s.matched_skills desc) into counts
  from public.search_caregivers_for_job(current_setting('test.job')::bigint) s
  where s.caregiver_id in (current_setting('test.full')::uuid,current_setting('test.partial')::uuid);
  if counts is distinct from array[2,1]::bigint[] then raise exception 'คะแนนทักษะผิด'; end if;
  if exists(select 1 from public.search_caregivers_for_job(current_setting('test.job')::bigint) s
    where s.caregiver_id in (current_setting('test.unverified')::uuid,current_setting('test.unavailable')::uuid))
  then raise exception 'พบผู้ดูแลที่ไม่ผ่านเงื่อนไข'; end if;
  if exists(select 1 from public.search_caregivers_for_job(current_setting('test.job')::bigint) s where s.required_skills <> 2)
  then raise exception 'จำนวนทักษะประกาศผิด'; end if;
end $$;

-- ผู้ว่าจ้างอื่น ผู้ดูแล และผู้ไม่มี session ต้องถูกปฏิเสธ
do $$
declare k text;
begin
  foreach k in array array['test.other','test.full'] loop
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting(k),'role','authenticated')::text,true);
    begin
      perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
      raise exception 'ผู้ไม่มีสิทธิ์ค้นหาได้';
    exception when insufficient_privilege then null; end;
  end loop;
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
    raise exception 'ไม่มี session แต่ค้นหาได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
select public.close_job(current_setting('test.job')::bigint);
do $$ begin
  begin
    perform public.search_caregivers_for_job(current_setting('test.job')::bigint);
    raise exception 'ประกาศปิดแล้วแต่ค้นหาได้';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.search_caregivers_for_job(bigint)','EXECUTE')
    or has_function_privilege('anon','match_internal.search_caregivers_for_job(bigint)','EXECUTE')
  then raise exception 'anon เรียกฟังก์ชันได้'; end if;
end $$;
select 'matching_search_tests_passed' as result;
rollback;
