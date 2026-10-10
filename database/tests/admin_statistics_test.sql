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
insert into auth.users(id,email) values(current_setting('test.admin')::uuid,'stats-'||current_setting('test.admin')||'@example.com');
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(current_setting('test.admin')::uuid,'admin','ทดสอบ','สถิติ','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','สมมติ');
do $$ declare stats jsonb; begin
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'))::text,true);
  stats := public.get_admin_statistics();
  if (stats->>'total_users')::bigint<>(select count(*) from public.profiles)
    or (stats->>'published_jobs')::bigint<>(select count(*) from public.job_posts where published_at is not null)
    or (stats->>'matched_jobs')::bigint<>(select count(*) from public.job_posts j where j.published_at is not null and exists(select 1 from public.match_requests r where r.job_post_id=j.id and r.status='accepted'))
    or (stats->>'verified_caregivers')::bigint<>(select count(*) from public.caregiver_profiles where verification_status='verified') then
    raise exception 'จำนวนสถิติผิด'; end if;
  perform set_config('test.stats_before',stats::text,true);
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
set local role authenticated;
select public.invite_caregiver(current_setting('test.job')::bigint,current_setting('test.full')::uuid);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.full'))::text,true);
select public.respond_to_invitation((select id from public.match_requests where job_post_id=current_setting('test.job')::bigint and caregiver_id=auth.uid()),true);
do $$ declare k text; begin
  foreach k in array array['test.owner','test.full','test.other'] loop
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting(k))::text,true);
    begin
      perform public.get_admin_statistics();
      raise exception 'ผู้ใช้ทั่วไปอ่านสถิติได้';
    exception when insufficient_privilege then null; end;
  end loop;
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.get_admin_statistics();
    raise exception 'ไม่มี session แต่อ่านสถิติได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'))::text,true);
do $$ declare stats jsonb; before_stats jsonb:=current_setting('test.stats_before')::jsonb; begin
  stats := public.get_admin_statistics();
  if (stats->>'matched_jobs')::bigint<>(before_stats->>'matched_jobs')::bigint+1 then raise exception 'ตอบรับแล้วสถิติไม่เพิ่ม'; end if;
  if (stats->>'match_rate')::numeric<>round(100*(stats->>'matched_jobs')::numeric/(stats->>'published_jobs')::numeric,1) then raise exception 'อัตราจับคู่ผิด'; end if;
  if has_function_privilege('anon','public.get_admin_statistics()','EXECUTE') then raise exception 'anon มีสิทธิ์'; end if;
end $$;
-- ทดสอบระบบที่ยังไม่มีประกาศ โดยย้อนเฉพาะข้อมูลทดสอบใน transaction นี้
reset role;
update public.job_posts set published_at=null where published_at is not null;
set local role authenticated;
do $$ declare stats jsonb; begin
  stats := public.get_admin_statistics();
  if (stats->>'published_jobs')::bigint<>0 or (stats->>'match_rate')::numeric<>0 then raise exception 'หารศูนย์หรือแสดงอัตราผิด'; end if;
end $$;
rollback;
