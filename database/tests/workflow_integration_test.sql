-- ทดสอบด้วยข้อมูลสมมติเท่านั้น; รันหลัง schema 01–08 และ rollback ทุกแถว
-- storage.objects ด้านล่างเป็น metadata จำลอง ไม่ใช่การอัปโหลดไฟล์ผ่าน Storage API
begin;
select set_config('test.employer',gen_random_uuid()::text,true);
select set_config('test.other',gen_random_uuid()::text,true);
select set_config('test.caregiver',gen_random_uuid()::text,true);
select set_config('test.second',gen_random_uuid()::text,true);
select set_config('test.admin',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.employer','test.other','test.caregiver','test.second','test.admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,case when k='test.admin' then 'admin' when k in ('test.caregiver','test.second') then 'caregiver' else 'employer' end,
'ทดสอบ',k,'0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ'
from unnest(array['test.employer','test.other','test.caregiver','test.second','test.admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status)
values(current_setting('test.caregiver')::uuid,'available'),(current_setting('test.second')::uuid,'available');

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
set local role authenticated;
-- ห้ามอัปโหลดเข้าโฟลเดอร์คนอื่น และห้ามยืนยันตนเอง
do $$ begin
  begin
    insert into storage.objects(bucket_id,name,owner_id,metadata)
    values('caregiver-documents',current_setting('test.second')||'/fake.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
    raise exception 'cross-owner upload allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.review_caregiver(auth.uid(),true,null);
    raise exception 'self approval allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity.pdf','identity','เอกสารสมมติ.pdf','application/pdf');
do $$ begin
  if not exists(select 1 from public.caregiver_profiles where verification_status='pending') then raise exception 'submission not pending'; end if;
  begin
    update public.caregiver_documents set review_status='approved';
    raise exception 'direct document approval allowed';
  exception when insufficient_privilege then null; end;
end $$;

-- ผู้ว่าจ้างดูเอกสารไม่ได้ และส่งไฟล์เองไม่ได้
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ begin
  if exists(select 1 from public.caregiver_documents) then raise exception 'employer sees documents'; end if;
  if exists(select 1 from storage.objects where bucket_id='caregiver-documents') then raise exception 'employer sees private files'; end if;
  begin
    insert into storage.objects(bucket_id,name,owner_id,metadata)
    values('caregiver-documents',auth.uid()::text||'/employer.pdf',auth.uid()::text,'{}');
    raise exception 'employer upload allowed';
  exception when insufficient_privilege then null; end;
end $$;

-- แอดมินเห็นคิวและไฟล์ที่ส่งแล้ว; ทดสอบปฏิเสธและส่งใหม่
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.list_verification_queue() where caregiver_id=current_setting('test.caregiver')::uuid) then raise exception 'queue missing'; end if;
  if not exists(select 1 from storage.objects where name=current_setting('test.caregiver')||'/identity.pdf') then raise exception 'admin cannot read submitted file'; end if;
  begin
    perform public.review_caregiver(current_setting('test.caregiver')::uuid,false,' ');
    raise exception 'empty rejection reason allowed';
  exception when raise_exception then
    if sqlerrm <> 'rejection_reason_required' then raise; end if;
  end;
end $$;
select public.review_caregiver(current_setting('test.caregiver')::uuid,false,'กรุณาส่งภาพที่ชัดขึ้น');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity-new.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity-new.pdf','identity','เอกสารใหม่.pdf','application/pdf');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
select public.review_caregiver(current_setting('test.caregiver')::uuid,true,null);

-- ผู้ดูแลคนที่สองส่งเอกสารและได้รับอนุมัติ
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
insert into storage.objects(bucket_id,name,owner_id,metadata)
values('caregiver-documents',auth.uid()::text||'/identity.pdf',auth.uid()::text,'{"mimetype":"application/pdf","size":100}');
select public.submit_caregiver_document(auth.uid()::text||'/identity.pdf','identity','ทดสอบสอง.pdf','application/pdf');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin'),'role','authenticated')::text,true);
select public.review_caregiver(current_setting('test.second')::uuid,true,null);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ declare p public.patients; j bigint; tags bigint[]; r bigint;
begin
  select array_agg(id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  p:=public.save_patient_with_tags(null,'ทดสอบ','ผู้ป่วย','1950-01-01','walker',null,'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',tags);
  j:=public.create_job_with_tags(p.id,'งานทดสอบจับคู่','รายละเอียด','ดูแล',now()+interval '1 day',now()+interval '2 days',1000,'day',tags);
  perform set_config('test.job',j::text,true);
  if not exists(select 1 from public.search_caregivers_for_job(j) where caregiver_id=current_setting('test.caregiver')::uuid) then raise exception 'approved caregiver missing from search'; end if;
  r:=public.invite_caregiver(j,current_setting('test.caregiver')::uuid);
  perform set_config('test.request',r::text,true);
  r:=public.invite_caregiver(j,current_setting('test.second')::uuid);
  perform set_config('test.second_request',r::text,true);
  begin
    perform public.invite_caregiver(j,current_setting('test.caregiver')::uuid);
    raise exception 'duplicate invite allowed';
  exception when raise_exception then if sqlerrm <> 'invitation_already_exists' then raise; end if; end;
  begin
    perform public.get_match_contact(current_setting('test.request')::bigint);
    raise exception 'contact visible before acceptance';
  exception when insufficient_privilege then null; end;
end $$;

-- คนอื่นเชิญแทนเจ้าของหรือตอบรับแทนไม่ได้
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
do $$ begin
  begin
    perform public.invite_caregiver(current_setting('test.job')::bigint,current_setting('test.caregiver')::uuid);
    raise exception 'foreign job invite allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.respond_to_invitation(current_setting('test.request')::bigint,true);
    raise exception 'foreign invitation acceptance allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
select public.respond_to_invitation(current_setting('test.request')::bigint,true);
do $$ begin
  if not exists(select 1 from public.get_match_contact(current_setting('test.request')::bigint) where phone='0800000000') then raise exception 'accepted contact missing'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.list_my_invitations() where request_id=current_setting('test.second_request')::bigint and status='not_selected') then raise exception 'other invite still pending'; end if;
  begin
    perform public.respond_to_invitation(current_setting('test.second_request')::bigint,true);
    raise exception 'second acceptance allowed';
  exception when raise_exception then if sqlerrm <> 'invitation_no_longer_open' then raise; end if; end;
  begin
    perform public.get_match_contact(current_setting('test.request')::bigint);
    raise exception 'third party contact visible';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
do $$ begin
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='matched') then raise exception 'job not matched'; end if;
  if not exists(select 1 from public.get_match_contact(current_setting('test.request')::bigint)) then raise exception 'employer contact missing'; end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
  begin
    perform public.start_matched_job(current_setting('test.job')::bigint);
    raise exception 'another employer started the job';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if public.start_matched_job(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'start did not return job id';
  end if;
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='in_progress' and started_at is not null) then
    raise exception 'job did not enter in_progress';
  end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.second'),'role','authenticated')::text,true);
  begin
    perform public.request_job_completion(current_setting('test.job')::bigint);
    raise exception 'unmatched caregiver requested completion';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
  if public.request_job_completion(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'completion request did not return job id';
  end if;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='completion_pending' and completion_requested_at is not null) then
    raise exception 'job did not enter completion_pending';
  end if;
  begin
    update public.patients set is_active=false where id=(select patient_id from public.job_posts where id=current_setting('test.job')::bigint);
    raise exception 'patient deactivation allowed while job awaits completion';
  exception when check_violation then
    if sqlerrm <> 'patient_has_active_job' then raise; end if;
  end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
  begin
    perform public.confirm_job_completion(current_setting('test.job')::bigint);
    raise exception 'caregiver confirmed own completion request';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
  if public.confirm_job_completion(current_setting('test.job')::bigint) <> current_setting('test.job')::bigint then
    raise exception 'employer confirmation did not return job id';
  end if;
  if not exists(select 1 from public.job_posts where id=current_setting('test.job')::bigint and status='completed' and completed_at is not null) then
    raise exception 'job did not enter completed';
  end if;
  begin
    perform public.confirm_job_completion(current_setting('test.job')::bigint);
    raise exception 'duplicate completion confirmation allowed';
  exception when raise_exception then if sqlerrm <> 'job_completion_not_pending' then raise; end if; end;
  begin
    perform public.start_matched_job(current_setting('test.job')::bigint);
    raise exception 'duplicate start allowed';
  exception when raise_exception then if sqlerrm <> 'job_not_ready_to_start' then raise; end if; end;
end $$;
-- ทดสอบปฏิเสธคำเชิญและปิดประกาศอีกงานหนึ่ง
do $$ declare j bigint; p bigint; tags bigint[];
begin
  select patient_id into p from public.job_posts where id=current_setting('test.job')::bigint;
  select array_agg(id) into tags from (select id from public.skills where is_active order by id limit 2) s;
  j:=public.create_job_with_tags(p,'งานทดสอบปิด','รายละเอียด','ดูแล',now()+interval '3 days',now()+interval '4 days',1000,'day',tags);
  perform set_config('test.closed_job',j::text,true);
  perform set_config('test.decline',public.invite_caregiver(j,current_setting('test.caregiver')::uuid)::text,true);
  perform set_config('test.close_pending',public.invite_caregiver(j,current_setting('test.second')::uuid)::text,true);
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
select public.respond_to_invitation(current_setting('test.decline')::bigint,false);
do $$ begin
  if not exists(select 1 from public.list_my_invitations() where request_id=current_setting('test.decline')::bigint and status='rejected') then raise exception 'decline failed'; end if;
  begin
    perform public.get_match_contact(current_setting('test.decline')::bigint);
    raise exception 'rejected contact visible';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.employer'),'role','authenticated')::text,true);
select public.close_job(current_setting('test.closed_job')::bigint);
do $$ begin
  if not exists(select 1 from public.match_requests where id=current_setting('test.close_pending')::bigint and status='not_selected') then raise exception 'closing left pending invitations'; end if;
end $$;
-- ไม่มี session ต้องไม่ได้รับข้อมูล แม้เรียกด้วย role authenticated
select set_config('request.jwt.claims','{}',true);
do $$ begin
  begin
    perform public.list_my_invitations();
    raise exception 'anonymous invitation read allowed';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.review_caregiver(uuid,boolean,text)','execute')
    or has_function_privilege('anon','public.respond_to_invitation(bigint,boolean)','execute') then raise exception 'anon execute granted'; end if;
end $$;
reset role;
select 'workflow_integration_passed' as result;
rollback;
