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

reset role;
select set_config('test.admin',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('test.admin')::uuid,'smart-admin-'||current_setting('test.admin')||'@example.com');
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(current_setting('test.admin')::uuid,'admin','ทดสอบ','เกณฑ์','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
insert into public.conditions(name) values('เกณฑ์ทดสอบ-'||current_setting('test.admin')) returning set_config('test.condition',id::text,true);
insert into public.patient_conditions(patient_id,condition_id)
select patient_id,current_setting('test.condition')::bigint from public.job_posts where id=current_setting('test.job')::bigint;
-- ให้เกณฑ์สภาวะมีทักษะเดียว ซึ่งผู้ดูแลที่ทักษะบางส่วนมีอยู่แล้ว
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'))::text,true);
set local role authenticated;
select public.save_condition_skills(current_setting('test.condition')::bigint,array[(current_setting('test.tags')::bigint[])[1]]);
do $$ begin
  begin
    perform public.save_condition_skills(current_setting('test.condition')::bigint,array[9223372036854775807]);
    raise exception 'ยอมรับทักษะที่ไม่มีจริง';
  exception when invalid_parameter_value then null; end;
  if (select count(*) from public.condition_skills where condition_id=current_setting('test.condition')::bigint) <> 1 then
    raise exception 'การบันทึกที่ผิดลบทักษะเดิม'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
do $$ declare full_score numeric; partial_score numeric; begin
  select match_score into full_score from public.rank_caregivers_for_job(current_setting('test.job')::bigint) where caregiver_id=current_setting('test.full')::uuid;
  select match_score into partial_score from public.rank_caregivers_for_job(current_setting('test.job')::bigint) where caregiver_id=current_setting('test.partial')::uuid;
  if full_score <> 100 or partial_score <> 50 then raise exception 'คะแนนทักษะในประกาศผิด: % %',full_score,partial_score; end if;
  if (select ordinality from public.rank_caregivers_for_job(current_setting('test.job')::bigint) with ordinality r where r.caregiver_id=current_setting('test.full')::uuid)
    >= (select ordinality from public.rank_caregivers_for_job(current_setting('test.job')::bigint) with ordinality r where r.caregiver_id=current_setting('test.partial')::uuid) then
    raise exception 'ลำดับคะแนนผิด'; end if;
  if exists(select 1 from public.rank_caregivers_for_job(current_setting('test.job')::bigint) r
    where caregiver_id=current_setting('test.partial')::uuid and
      (jsonb_array_length(r.missing_skills)<>1 or r.matched_condition_skills<>0 or r.required_condition_skills<>0)) then
    raise exception 'เหตุผลคะแนนไม่ตรงกับทักษะ'; end if;
  if exists(select 1 from public.rank_caregivers_for_job(current_setting('test.job')::bigint)
    where caregiver_id in (current_setting('test.unverified')::uuid,current_setting('test.unavailable')::uuid)) then
    raise exception 'พบผู้ดูแลที่ไม่ผ่านเงื่อนไข'; end if;
  begin
    perform public.save_condition_skills(current_setting('test.condition')::bigint,'{}');
    raise exception 'ผู้ว่าจ้างแก้เกณฑ์ได้';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from public.condition_skills where condition_id=current_setting('test.condition')::bigint;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.rank_caregivers_for_job(current_setting('test.job')::bigint)
    where caregiver_id=current_setting('test.partial')::uuid and (match_score<>50 or unmapped_conditions<>0)) then
    raise exception 'สภาวะเปลี่ยนคะแนนทักษะหลัก'; end if;
end $$;
-- กรณีไม่มีเกณฑ์ทั้งสองด้านต้องให้ 0 ไม่ใช่ 100
reset role;
delete from public.job_required_skills where job_post_id=current_setting('test.job')::bigint;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.rank_caregivers_for_job(current_setting('test.job')::bigint) where match_score<>0) then
    raise exception 'ไม่มีเกณฑ์แต่ได้คะแนน'; end if;
end $$;
do $$ declare k text; begin
  foreach k in array array['test.other','test.full'] loop
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting(k))::text,true);
    begin
      perform public.rank_caregivers_for_job(current_setting('test.job')::bigint);
      raise exception 'ค้นหาประกาศคนอื่นได้';
    exception when insufficient_privilege then null; end;
  end loop;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
select public.close_job(current_setting('test.job')::bigint);
do $$ begin
  begin
    perform public.rank_caregivers_for_job(current_setting('test.job')::bigint);
    raise exception 'ประกาศปิดยังค้นหาได้';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.rank_caregivers_for_job(bigint)','EXECUTE') then raise exception 'anon เรียกได้'; end if;
end $$;
rollback;
