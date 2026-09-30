-- ID 10: สมัครงานได้เมื่อยืนยันตัวตนแล้ว และต้องไม่ปะปนกับคำเชิญ
begin;
select set_config('test.app_employer',gen_random_uuid()::text,true);
select set_config('test.app_caregiver',gen_random_uuid()::text,true);
select set_config('test.app_other',gen_random_uuid()::text,true);
select set_config('test.app_admin',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.app_employer','test.app_caregiver','test.app_other','test.app_admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,
  case when k='test.app_employer' then 'employer' when k='test.app_admin' then 'admin' else 'caregiver' end,
  'ทดสอบ','สมัครงาน','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ที่อยู่สมมติ'
from unnest(array['test.app_employer','test.app_caregiver','test.app_other','test.app_admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status,verification_status,verified_by,verified_at)
values(current_setting('test.app_caregiver')::uuid,'available','not_submitted',null,null),
      (current_setting('test.app_other')::uuid,'available','verified',current_setting('test.app_admin')::uuid,now());

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_employer'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare p public.patients; j bigint; v_skill bigint;
begin
 select id into v_skill from public.skills where is_active order by id limit 1;
 p:=public.save_patient_with_tags(null,'ผู้ป่วย','สมมติ','1950-01-01','normal',null,
   'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ที่อยู่ลับ','{}',array[v_skill]);
 j:=public.create_job_with_tags(p.id,'งานทดสอบใบสมัคร','รายละเอียด','ดูแลทั่วไป',
   '2030-01-01 12:00+07','2030-01-03 12:00+07',1000,'day',array[v_skill]);
 perform set_config('test.app_job',j::text,true);
 begin
   perform public.submit_application(j);
   raise exception 'employer applied to job';
 exception when insufficient_privilege then null; end;
end $$;

-- ผู้ดูแลที่ยังไม่ผ่านตรวจสอบสมัครไม่ได้ แม้เห็นประกาศในหน้าค้นหา
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_caregiver'),'role','authenticated')::text,true);
do $$ begin
 begin
   perform public.submit_application(current_setting('test.app_job')::bigint);
   raise exception 'unverified caregiver applied';
 exception when raise_exception then
   if sqlerrm <> 'caregiver_not_eligible' then raise; end if;
 end;
end $$;

-- จำลองแอดมินอนุมัติแล้ว จากนั้นสมัครสำเร็จเพียงครั้งเดียว
reset role;
update public.caregiver_profiles set verification_status='verified',
 verified_by=current_setting('test.app_admin')::uuid,verified_at=now()
where caregiver_id=current_setting('test.app_caregiver')::uuid;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_caregiver'),'role','authenticated')::text,true);
select set_config('test.app_request',public.submit_application(current_setting('test.app_job')::bigint)::text,true);
do $$ begin
 if not exists(select 1 from public.list_my_applications()
   where request_id=current_setting('test.app_request')::bigint and status='pending') then
   raise exception 'pending application missing';
 end if;
 if exists(select 1 from public.list_my_invitations()) then
   raise exception 'application displayed as invitation';
 end if;
 begin
   perform public.submit_application(current_setting('test.app_job')::bigint);
   raise exception 'duplicate application allowed';
 exception when raise_exception then
   if sqlerrm <> 'request_already_exists' then raise; end if;
 end;
 begin
   perform public.respond_to_invitation(current_setting('test.app_request')::bigint,true);
   raise exception 'caregiver accepted own application';
 exception when raise_exception then
   if sqlerrm <> 'invitation_no_longer_open' then raise; end if;
 end;
end $$;

-- ผู้ดูแลอีกคนมองไม่เห็นใบสมัครของเจ้าของ และผู้ว่าจ้างเชิญซ้ำคู่เดิมไม่ได้
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_other'),'role','authenticated')::text,true);
do $$ begin
 if exists(select 1 from public.list_my_applications()) then
   raise exception 'other caregiver sees application';
 end if;
 if exists(select 1 from public.match_requests where id=current_setting('test.app_request')::bigint) then
   raise exception 'other caregiver sees request through RLS';
 end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_employer'),'role','authenticated')::text,true);
do $$ begin
 if not exists(select 1 from public.match_requests where id=current_setting('test.app_request')::bigint and request_type='application') then
   raise exception 'employer cannot see received application';
 end if;
 begin
   perform public.invite_caregiver(current_setting('test.app_job')::bigint,current_setting('test.app_caregiver')::uuid);
   raise exception 'invitation duplicated application';
 exception when raise_exception then
   if sqlerrm <> 'application_already_exists' then raise; end if;
 end;
 perform public.close_job(current_setting('test.app_job')::bigint);
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.app_other'),'role','authenticated')::text,true);
do $$ begin
 begin
   perform public.submit_application(current_setting('test.app_job')::bigint);
   raise exception 'closed job accepted application';
 exception when raise_exception then
   if sqlerrm <> 'job_not_open' then raise; end if;
 end;
end $$;
rollback;
