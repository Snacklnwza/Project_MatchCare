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

-- ส่งคำเชิญและลองส่งซ้ำ ต้องมีข้อความแค่ครั้งเดียว
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.partial'))::text,true);
select public.submit_application(current_setting('test.job')::bigint);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
do $$ begin
  if (select count(*) from public.notifications where title='มีใบสมัครงานใหม่' and recipient_id=auth.uid())<>1 then
    raise exception 'ผู้ว่าจ้างไม่ได้รับใบสมัคร'; end if;
end $$;
select public.invite_caregiver(current_setting('test.job')::bigint,current_setting('test.full')::uuid);
do $$ begin
  begin
    perform public.invite_caregiver(current_setting('test.job')::bigint,current_setting('test.full')::uuid);
    raise exception 'ส่งคำเชิญซ้ำได้';
  exception when raise_exception then
    if sqlerrm <> 'invitation_already_exists' then raise; end if;
  end;
  if exists(select 1 from public.notifications where source_id=current_setting('test.job')::bigint and source_type='job') then
    raise exception 'เกิดข้อความจับคู่ก่อนตอบรับ'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.full'))::text,true);
do $$ begin
  if (select count(*) from public.notifications where source_type='request' and recipient_id=auth.uid())<>1 then
    raise exception 'ไม่ได้รับคำเชิญหรือข้อความซ้ำ'; end if;
  begin
    insert into public.notifications(recipient_id,source_type,source_id,event,title,target_page)
    values(auth.uid(),'job',1,'fake','ปลอม','jobs');
    raise exception 'สร้างข้อความปลอมได้';
  exception when insufficient_privilege then null; end;
end $$;
select public.respond_to_invitation((select id from public.match_requests where job_post_id=current_setting('test.job')::bigint and caregiver_id=auth.uid()),true);
do $$ begin
  if (select count(*) from public.notifications where source_type='job' and source_id=current_setting('test.job')::bigint and event='matched')<>1 then
    raise exception 'ไม่ได้รับข้อความจับคู่ของตัวเอง'; end if;
  if exists(select 1 from public.notifications where recipient_id<>auth.uid()) then raise exception 'เห็นข้อความคนอื่น'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other'))::text,true);
do $$ begin
  if exists(select 1 from public.notifications where source_type='job' and source_id=current_setting('test.job')::bigint) then raise exception 'เห็นข้อความคู่คนอื่น'; end if;
  update public.notifications set read_at=now() where source_type='job' and source_id=current_setting('test.job')::bigint;
  if found then raise exception 'แก้ข้อความคนอื่นได้'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
select public.start_matched_job(current_setting('test.job')::bigint);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.full'))::text,true);
select public.request_job_completion(current_setting('test.job')::bigint);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
select public.confirm_job_completion(current_setting('test.job')::bigint);
do $$ begin
  if (select count(*) from public.notifications where source_type='job' and source_id=current_setting('test.job')::bigint)<>4 then
    raise exception 'สถานะงานแจ้งเตือนไม่ครบ'; end if;
  if exists(select 1 from public.notifications where source_type='job' and source_id=current_setting('test.job')::bigint and event='completed' and target_page<>'history') then
    raise exception 'จบงานแล้วลิงก์ผิด'; end if;
  update public.notifications set read_at=now() where read_at is null;
  if exists(select 1 from public.notifications where read_at is null) then raise exception 'อ่านทั้งหมดไม่ได้'; end if;
  begin
    update public.notifications set title='แก้ข้อความ';
    raise exception 'แก้เนื้อหาข้อความได้';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if (select count(*) from public.notifications where source_type='job' and source_id=current_setting('test.job')::bigint)<>8 then raise exception 'แจ้งเตือนทั้งสองฝ่ายไม่ครบ'; end if;
  if exists(select 1 from public.notifications where recipient_id=current_setting('test.full')::uuid and read_at is not null) then raise exception 'การอ่านของผู้ว่าจ้างกระทบผู้ดูแล'; end if;
  if not exists(select 1 from public.notifications where recipient_id=current_setting('test.partial')::uuid and event='not_selected' and target_page='applications') then raise exception 'ผู้สมัครที่ไม่ได้รับเลือกไม่รับข้อความ'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
set local role authenticated;
select set_config('test.second_job',public.create_job_with_tags(
  (select patient_id from public.job_posts where id=current_setting('test.job')::bigint),
  'ทดสอบปฏิเสธ','รายละเอียด','การดูแล',now()+interval '1 day',now()+interval '2 days',1000,'day',current_setting('test.tags')::bigint[])::text,true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.partial'))::text,true);
select public.submit_application(current_setting('test.second_job')::bigint);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner'))::text,true);
select public.respond_to_application((select id from public.match_requests where job_post_id=current_setting('test.second_job')::bigint),false);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.partial'))::text,true);
do $$ begin
  if (select count(*) from public.notifications where event='rejected' and title='ใบสมัครของคุณไม่ได้รับการตอบรับ' and target_page='applications')<>1 then
    raise exception 'ผลปฏิเสธไปผิดผู้รับหรือผิดหน้า'; end if;
end $$;
rollback;
