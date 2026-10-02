-- ID 11: ผู้ว่าจ้างพิจารณาใบสมัคร; ทดสอบสิทธิ์และการจับคู่ใน transaction เดียว
begin;
select set_config('test.review_employer',gen_random_uuid()::text,true);
select set_config('test.review_other_employer',gen_random_uuid()::text,true);
select set_config('test.review_caregiver_a',gen_random_uuid()::text,true);
select set_config('test.review_caregiver_b',gen_random_uuid()::text,true);
select set_config('test.review_caregiver_c',gen_random_uuid()::text,true);
select set_config('test.review_admin',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.review_employer','test.review_other_employer',
 'test.review_caregiver_a','test.review_caregiver_b','test.review_caregiver_c','test.review_admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,
 case when k='test.review_admin' then 'admin'
      when k in ('test.review_employer','test.review_other_employer') then 'employer'
      else 'caregiver' end,
 'ทดสอบ',k,'0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ที่อยู่ลับ'
from unnest(array['test.review_employer','test.review_other_employer',
 'test.review_caregiver_a','test.review_caregiver_b','test.review_caregiver_c','test.review_admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status,verification_status,verified_by,verified_at)
select current_setting(k)::uuid,'available','verified',current_setting('test.review_admin')::uuid,now()
from unnest(array['test.review_caregiver_a','test.review_caregiver_b','test.review_caregiver_c']) k;
update public.caregiver_profiles set bio='ติดต่อ 0812345678 LINE: private-test'
where caregiver_id in (current_setting('test.review_caregiver_a')::uuid,
 current_setting('test.review_caregiver_b')::uuid,current_setting('test.review_caregiver_c')::uuid);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_employer'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare p public.patients; j bigint; v_skill bigint;
begin
 select id into v_skill from public.skills where is_active order by id limit 1;
 p:=public.save_patient_with_tags(null,'ผู้ป่วย','สมมติ','1950-01-01','normal',null,
   'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ที่อยู่ลับ','{}',array[v_skill]);
 j:=public.create_job_with_tags(p.id,'งานทดสอบตัดสินใจ','รายละเอียด','ดูแล',
   '2030-01-01 12:00+07','2030-01-03 12:00+07',1000,'day',array[v_skill]);
 perform set_config('test.review_job',j::text,true);
 j:=public.create_job_with_tags(p.id,'งานทดสอบปฏิเสธ','รายละเอียด','ดูแล',
   '2030-02-01 12:00+07','2030-02-03 12:00+07',1000,'day',array[v_skill]);
 perform set_config('test.review_reject_job',j::text,true);
 j:=public.invite_caregiver(current_setting('test.review_job')::bigint,current_setting('test.review_caregiver_c')::uuid);
 perform set_config('test.review_invitation',j::text,true);
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_caregiver_a'),'role','authenticated')::text,true);
select set_config('test.review_application_a',public.submit_application(current_setting('test.review_job')::bigint)::text,true);
select set_config('test.review_rejected_application',public.submit_application(current_setting('test.review_reject_job')::bigint)::text,true);
do $$ begin
 begin
   perform public.respond_to_application(current_setting('test.review_application_a')::bigint,true);
   raise exception 'caregiver reviewed own application';
 exception when insufficient_privilege then null; end;
 begin
   perform public.list_received_applications();
   raise exception 'caregiver listed received applications';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_caregiver_b'),'role','authenticated')::text,true);
select set_config('test.review_application_b',public.submit_application(current_setting('test.review_job')::bigint)::text,true);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_other_employer'),'role','authenticated')::text,true);
do $$ begin
 if exists(select 1 from public.list_received_applications()) then
   raise exception 'unrelated employer listed applications';
 end if;
 begin
   perform public.respond_to_application(current_setting('test.review_application_a')::bigint,true);
   raise exception 'unrelated employer accepted application';
 exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_employer'),'role','authenticated')::text,true);
do $$ begin
 if (select count(*) from public.list_received_applications())<>3 then
   raise exception 'employer application list incomplete';
 end if;
 if exists(select 1 from public.list_received_applications()
   where request_id=current_setting('test.review_invitation')::bigint) then
   raise exception 'invitation shown as application';
 end if;
 if exists(select 1 from public.list_received_applications() a
   where to_jsonb(a) ?| array['phone','line_id','address_detail','document_type']) then
   raise exception 'private data leaked before matching';
 end if;
 if exists(select 1 from public.list_received_applications() a where a.bio is not null) then
   raise exception 'free text contact leaked in application list';
 end if;
 perform public.respond_to_application(current_setting('test.review_rejected_application')::bigint,false);
 if not exists(select 1 from public.list_received_applications()
   where request_id=current_setting('test.review_rejected_application')::bigint and status='rejected') then
   raise exception 'rejected status missing';
 end if;
 begin
   perform public.respond_to_application(current_setting('test.review_invitation')::bigint,true);
   raise exception 'employer accepted invitation as application';
 exception when insufficient_privilege then null; end;
 perform public.respond_to_application(current_setting('test.review_application_a')::bigint,true);
 if (select count(*) from public.match_requests
   where job_post_id=current_setting('test.review_job')::bigint and status='accepted')<>1 then
   raise exception 'job has wrong accepted count';
 end if;
 if exists(select 1 from public.match_requests
   where job_post_id=current_setting('test.review_job')::bigint and status='pending') then
   raise exception 'other requests still pending';
 end if;
 if (select status from public.job_posts where id=current_setting('test.review_job')::bigint)<>'matched' then
   raise exception 'job not matched';
 end if;
 if not exists(select 1 from public.get_match_contact(current_setting('test.review_application_a')::bigint)) then
   raise exception 'employer cannot see accepted contact';
 end if;
 begin
   perform public.respond_to_application(current_setting('test.review_application_b')::bigint,true);
   raise exception 'second application accepted';
 exception when raise_exception then
   if sqlerrm<>'application_no_longer_open' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_caregiver_a'),'role','authenticated')::text,true);
do $$ begin
 if not exists(select 1 from public.list_my_applications()
   where request_id=current_setting('test.review_application_a')::bigint and status='accepted') then
   raise exception 'caregiver cannot see accepted application';
 end if;
 if not exists(select 1 from public.get_match_contact(current_setting('test.review_application_a')::bigint)) then
   raise exception 'caregiver cannot see accepted contact';
 end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_caregiver_b'),'role','authenticated')::text,true);
do $$ begin
 if not exists(select 1 from public.list_my_applications()
   where request_id=current_setting('test.review_application_b')::bigint and status='not_selected') then
   raise exception 'other applicant not notified of decision';
 end if;
 begin
   perform public.get_match_contact(current_setting('test.review_application_a')::bigint);
   raise exception 'unselected caregiver saw contact';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
