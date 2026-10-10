-- ทดสอบด้วยข้อมูลสมมติ แล้ว ROLLBACK ทุกแถวและ Trigger สำหรับจำลองความล้มเหลว
begin;
select set_config('test.completion_owner', gen_random_uuid()::text, true);
select set_config('test.completion_caregiver', gen_random_uuid()::text, true);
select set_config('test.completion_other', gen_random_uuid()::text, true);
select set_config('test.completion_admin', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.completion_owner','test.completion_caregiver','test.completion_other','test.completion_admin']) k;
insert into public.profiles(id, role, first_name, last_name, phone, province, district, subdistrict, address_detail)
select current_setting(k)::uuid,
 case when k='test.completion_caregiver' then 'caregiver' when k='test.completion_admin' then 'admin' else 'employer' end,
 'ทดสอบ Procedure', 'ข้อมูลสมมติ', '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'ข้อมูลสมมติ', 'ข้อมูลสมมติ'
from unnest(array['test.completion_owner','test.completion_caregiver','test.completion_other','test.completion_admin']) k;
insert into public.caregiver_profiles(caregiver_id, availability_status, verification_status, verified_by, verified_at)
values(current_setting('test.completion_caregiver')::uuid,'available','verified',current_setting('test.completion_admin')::uuid,now());

-- จำลองว่าเขียนการแจ้งเตือนไม่สำเร็จ เพื่อตรวจว่าสถานะงานไม่ถูกบันทึกค้างไว้
create function public.test_completion_notification_failure() returns trigger language plpgsql as $$
begin
 if current_setting('test.completion_fail_notification', true)='yes' then
   raise exception using errcode='23514', message='test_notification_failure';
 end if;
 return new;
end $$;
create trigger test_completion_notification_failure before insert on public.notifications
for each row execute function public.test_completion_notification_failure();

select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.completion_owner'))::text, true);
set local role authenticated;
do $$
declare p public.patients; s bigint; j bigint; r bigint; result bigint; before_count bigint; original_completed_at timestamptz; actor text;
begin
 if not exists(select 1 from pg_proc where oid='match_internal.confirm_job_completion_action(bigint)'::regprocedure and prokind='p' and not prosecdef) then
   raise exception 'ต้องเป็น Procedure จริงและใช้ SECURITY INVOKER';
 end if;
 begin
   call match_internal.confirm_job_completion_action(-1);
   raise exception 'client เรียก Procedure ภายในได้โดยตรง';
 exception when insufficient_privilege then null; end;
 begin
   perform public.confirm_job_completion(null);
   raise exception 'รับ job_id ว่างได้';
 exception when insufficient_privilege then null; end;
 begin
   perform public.confirm_job_completion(-1);
   raise exception 'รับงานที่ไม่มีอยู่ได้';
 exception when insufficient_privilege then null; end;
 select id into s from public.skills where is_active order by id limit 1;
 p := public.save_patient_with_tags(null,'ผู้ป่วย','ทดสอบ Procedure','1950-01-01','normal',null,
   'กรุงเทพมหานคร','พระนคร','ข้อมูลสมมติ','ข้อมูลสมมติ','{}',array[s]);
 j := public.create_job_with_tags(p.id,'ทดสอบยืนยันจบงาน','ข้อมูลสมมติ','ดูแล',
   '2030-01-01 12:00+07','2030-01-02 12:00+07',1000,'day',array[s]);
 begin
   perform public.confirm_job_completion(j);
   raise exception 'ยืนยันงานที่ยังไม่แจ้งจบได้';
 exception when raise_exception then
   if sqlerrm <> 'job_completion_not_pending' then raise; end if;
 end;
 r := public.invite_caregiver(j,current_setting('test.completion_caregiver')::uuid);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.completion_caregiver'))::text,true);
 perform public.respond_to_invitation(r,true);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.completion_owner'))::text,true);
 perform public.start_matched_job(j);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.completion_caregiver'))::text,true);
 perform public.request_job_completion(j);
 foreach actor in array array['test.completion_caregiver','test.completion_other','test.completion_admin'] loop
   perform set_config('request.jwt.claims',json_build_object('sub',current_setting(actor))::text,true);
   begin
     perform public.confirm_job_completion(j);
     raise exception 'บัญชีที่ไม่ใช่เจ้าของยืนยันจบงานได้';
   exception when insufficient_privilege then null; end;
 end loop;
 perform set_config('request.jwt.claims','{}',true);
 begin
   perform public.confirm_job_completion(j);
   raise exception 'ไม่มี auth.uid แต่ยืนยันจบงานได้';
 exception when insufficient_privilege then null; end;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.completion_owner'))::text,true);
 select count(*) into before_count from public.notifications;
 perform set_config('test.completion_fail_notification','yes',true);
 begin
   perform public.confirm_job_completion(j);
   raise exception 'ไม่พบความล้มเหลวของการแจ้งเตือน';
 exception when check_violation then
   if sqlerrm <> 'test_notification_failure' then raise; end if;
 end;
 perform set_config('test.completion_fail_notification','no',true);
 if not exists(select 1 from public.job_posts where id=j and status='completion_pending' and completed_at is null)
   or (select count(*) from public.notifications) <> before_count then
   raise exception 'การล้มเหลวไม่ย้อนกลับงานและการแจ้งเตือน';
 end if;
 result := public.confirm_job_completion(j);
 if result is distinct from j or not exists(select 1 from public.job_posts where id=j and status='completed' and completed_at is not null) then
   raise exception 'ผลลัพธ์ RPC หรือสถานะจบงานผิด';
 end if;
 -- RLS ของผู้ว่าจ้างเห็นเฉพาะการแจ้งเตือนของตนเอง จึงเพิ่มหนึ่งรายการ
 if (select count(*) from public.notifications) <> before_count + 1 then
   raise exception 'ไม่มีการแจ้งเตือนจบงานให้ผู้ว่าจ้าง';
 end if;
 select completed_at into original_completed_at from public.job_posts where id=j;
 begin
   perform public.confirm_job_completion(j);
   raise exception 'ยืนยันจบงานซ้ำได้';
 exception when raise_exception then
   if sqlerrm <> 'job_completion_not_pending' then raise; end if;
 end;
 if (select completed_at from public.job_posts where id=j) is distinct from original_completed_at
   or (select count(*) from public.notifications) <> before_count + 1 then
   raise exception 'เรียกซ้ำแล้วเวลาและการแจ้งเตือนเปลี่ยน';
 end if;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.completion_caregiver'))::text,true);
 if not exists(select 1 from public.notifications where source_type='job' and source_id=j and event='completed' and target_page='history') then
   raise exception 'ไม่มีการแจ้งเตือนจบงานให้ผู้ดูแล';
 end if;
end $$;
set local role anon;
do $$ begin
 begin perform public.confirm_job_completion(-1); raise exception 'guest เรียก RPC ได้';
 exception when insufficient_privilege then null; end;
 begin call match_internal.confirm_job_completion_action(-1); raise exception 'guest เรียก Procedure ได้';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
