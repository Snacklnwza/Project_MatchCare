-- ข้อมูลสมมติทั้งหมดอยู่ใน transaction และย้อนกลับเมื่อจบ
begin;
select set_config('test.schedule_owner',gen_random_uuid()::text,true);
select set_config('test.schedule_caregiver',gen_random_uuid()::text,true);
select set_config('test.schedule_admin',gen_random_uuid()::text,true);
insert into auth.users(id,email) select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.schedule_owner','test.schedule_caregiver','test.schedule_admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,case when k='test.schedule_caregiver' then 'caregiver' when k='test.schedule_admin' then 'admin' else 'employer' end,
 'ทดสอบตาราง','ข้อมูลสมมติ','0800000000','กรุงเทพมหานคร','พระนคร','ข้อมูลลับ','ที่อยู่ลับ'
from unnest(array['test.schedule_owner','test.schedule_caregiver','test.schedule_admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status,verification_status,verified_by,verified_at)
values(current_setting('test.schedule_caregiver')::uuid,'available','verified',current_setting('test.schedule_admin')::uuid,now());
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_owner'))::text,true);
set local role authenticated;
do $$
declare p public.patients; s bigint; first_job bigint; conflict_job bigint; next_job bigint; app_job bigint;
 first_request bigint; conflict_request bigint; app_request bigint; next_request bigint; edge_job bigint; edge_request bigint; payload jsonb;
begin
 select id into s from public.skills where is_active order by id limit 1;
 p := public.save_patient_with_tags(null,'ผู้ป่วย','สมมติ','1950-01-01','normal',null,
   'กรุงเทพมหานคร','พระนคร','ข้อมูลลับ','ที่อยู่ลับ','{}',array[s]);
 first_job := public.create_job_with_tags(p.id,'งานแรก','ทดสอบ','ดูแล','2030-01-01 12:00+07','2030-01-05 12:00+07',1000,'day',array[s]);
 conflict_job := public.create_job_with_tags(p.id,'งานทับบางช่วง','ทดสอบ','ดูแล','2030-01-03 12:00+07','2030-01-06 12:00+07',1000,'day',array[s]);
 next_job := public.create_job_with_tags(p.id,'งานต่อทันที','ทดสอบ','ดูแล','2030-01-05 12:00+07','2030-01-10 12:00+07',1000,'day',array[s]);
 app_job := public.create_job_with_tags(p.id,'งานใบสมัครที่ทับ','ทดสอบ','ดูแล','2030-01-02 12:00+07','2030-01-04 12:00+07',1000,'day',array[s]);
 first_request := public.invite_caregiver(first_job,current_setting('test.schedule_caregiver')::uuid);
 conflict_request := public.invite_caregiver(conflict_job,current_setting('test.schedule_caregiver')::uuid);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_caregiver'))::text,true);
 app_request := public.submit_application(app_job);
 if exists(select 1 from public.list_my_schedule('2030-01-01')) then raise exception 'pending ถูกนับเป็นการจอง'; end if;
 perform public.respond_to_invitation(first_request,true);
 begin
   perform public.respond_to_invitation(conflict_request,true); raise exception 'รับคำเชิญเวลาทับกันได้';
 exception when raise_exception then if sqlerrm<>'caregiver_schedule_conflict' then raise; end if; end;
 if not exists(select 1 from public.match_requests where id=conflict_request and status='pending') then raise exception 'รับไม่สำเร็จแต่คำเชิญเปลี่ยน'; end if;
 if (select count(*) from public.list_my_schedule('2030-01-01'))<>1 or exists(select 1 from public.list_my_schedule('2030-02-01')) then raise exception 'ช่วงเดือนปฏิทินผิด'; end if;
 select to_jsonb(j) into payload from public.list_my_schedule('2030-01-01') j;
 if payload ?| array['patient_id','patient_name','phone','line_id','address_detail','caregiver_id'] then raise exception 'ปฏิทินส่งข้อมูลเกินจำเป็น'; end if;
 begin perform public.list_my_schedule('2030-01-02'); raise exception 'รับวันกลางเดือนได้';
 exception when invalid_parameter_value then null; end;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_owner'))::text,true);
 if exists(select 1 from public.rank_caregivers_for_job(conflict_job) where caregiver_id=current_setting('test.schedule_caregiver')::uuid)
 or exists(select 1 from public.search_caregivers_for_job(conflict_job) where caregiver_id=current_setting('test.schedule_caregiver')::uuid)
 or exists(select 1 from public.search_caregivers(p_job_id=>conflict_job) where caregiver_id=current_setting('test.schedule_caregiver')::uuid) then
   raise exception 'ผลค้นหาไม่ตัดผู้ดูแลที่ติดงาน';
 end if;
 begin perform public.invite_caregiver(app_job,current_setting('test.schedule_caregiver')::uuid); raise exception 'เชิญหลังติดงานได้';
 exception when raise_exception then if sqlerrm<>'caregiver_schedule_conflict' then raise; end if; end;
 begin perform public.respond_to_application(app_request,true); raise exception 'รับใบสมัครเวลาทับได้';
 exception when raise_exception then if sqlerrm<>'caregiver_schedule_conflict' then raise; end if; end;
 begin perform public.list_my_schedule('2030-01-01'); raise exception 'ผู้ว่าจ้างอ่านปฏิทินส่วนตัวได้';
 exception when insufficient_privilege then null; end;
 if not exists(select 1 from public.rank_caregivers_for_job(next_job) where caregiver_id=current_setting('test.schedule_caregiver')::uuid) then raise exception 'งานต่อเนื่องถูกตัดออก'; end if;
 next_request := public.invite_caregiver(next_job,current_setting('test.schedule_caregiver')::uuid);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_caregiver'))::text,true);
 perform public.respond_to_invitation(next_request,true);
 if (select count(*) from public.list_my_schedule('2030-01-01'))<>2 then raise exception 'รับงานต่อเนื่องไม่ได้'; end if;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_owner'))::text,true);
 perform public.start_matched_job(first_job);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_caregiver'))::text,true);
 perform public.request_job_completion(first_job);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_owner'))::text,true);
 perform public.confirm_job_completion(first_job);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_caregiver'))::text,true);
 if exists(select 1 from public.list_my_schedule('2030-01-01') where job_post_id=first_job) then
   raise exception 'งานจบแล้วยังอยู่ในปฏิทิน';
 end if;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_owner'))::text,true);
 perform public.respond_to_application(app_request,true);
 edge_job := public.create_job_with_tags(p.id,'งานสิ้นสุดเที่ยงคืน','ทดสอบ','ดูแล','2030-01-31 23:00+07','2030-02-01 00:00+07',1000,'hour',array[s]);
 edge_request := public.invite_caregiver(edge_job,current_setting('test.schedule_caregiver')::uuid);
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_caregiver'))::text,true);
 perform public.respond_to_invitation(edge_request,true);
 if (select count(*) from public.list_my_schedule('2030-01-01'))<>3 or exists(select 1 from public.list_my_schedule('2030-02-01')) then
   raise exception 'งานจบเที่ยงคืนถูกนับเกินช่วงเดือน';
 end if;
 perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.schedule_admin'))::text,true);
 begin perform public.list_my_schedule('2030-01-01'); raise exception 'แอดมินอ่านปฏิทินส่วนตัวได้';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin perform public.list_my_schedule('2030-01-01'); raise exception 'guest อ่านปฏิทินได้';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
