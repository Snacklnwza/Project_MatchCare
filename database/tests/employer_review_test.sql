-- ตรวจรีวิวสองฝั่งด้วยบัญชีสมมติและยกเลิกข้อมูลเมื่อจบ
begin;
select set_config('test.er_employer',gen_random_uuid()::text,true);
select set_config('test.er_caregiver',gen_random_uuid()::text,true);
select set_config('test.er_other',gen_random_uuid()::text,true);
select set_config('test.er_admin',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,k||'@example.com'
from unnest(array['test.er_employer','test.er_caregiver','test.er_other','test.er_admin']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,
  case when k='test.er_caregiver' then 'caregiver' when k='test.er_admin' then 'admin' else 'employer' end,
  'ทดสอบ',k,'0800000000','กรุงเทพมหานคร','พระนคร','ข้อมูลลับ','ที่อยู่ลับ'
from unnest(array['test.er_employer','test.er_caregiver','test.er_other','test.er_admin']) k;
insert into public.caregiver_profiles(caregiver_id,availability_status,verification_status,verified_by,verified_at)
values(current_setting('test.er_caregiver')::uuid,'available','verified',current_setting('test.er_admin')::uuid,now());
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_employer'))::text,true);
set local role authenticated;
do $$ declare p public.patients; j bigint; r bigint; s bigint;
begin
  select id into s from public.skills where is_active order by id limit 1;
  p:=public.save_patient_with_tags(null,'คนไข้','สมมติ','1950-01-01','normal',null,
    'กรุงเทพมหานคร','พระนคร','ข้อมูลลับ','ที่อยู่ลับ','{}',array[s]);
  j:=public.create_job_with_tags(p.id,'งานที่จบแล้ว','รายละเอียด','ดูแล',
    '2031-01-01 12:00+07','2031-01-03 12:00+07',1000,'day',array[s]);
  perform set_config('test.er_completed_job',j::text,true);
  r:=public.invite_caregiver(j,current_setting('test.er_caregiver')::uuid);
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_caregiver'))::text,true);
  perform public.respond_to_invitation(r,true);
  begin perform public.submit_employer_review(j,5,'ก่อนจบงาน'); raise exception 'รีวิวก่อนจบงานได้';
  exception when raise_exception then if sqlerrm <> 'review_requires_completed_job' then raise; end if; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_employer'))::text,true);
  perform public.start_matched_job(j);
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_caregiver'))::text,true);
  perform public.request_job_completion(j);
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_employer'))::text,true);
  perform public.confirm_job_completion(j);
  j:=public.create_job_with_tags(p.id,'งานที่ยังเปิด','รายละเอียด','ดูแล',
    '2031-02-01 12:00+07','2031-02-03 12:00+07',1000,'day',array[s]);
  perform set_config('test.er_open_job',j::text,true);
end $$;
do $$ begin
  begin perform public.submit_employer_review(current_setting('test.er_completed_job')::bigint,4,'ปลอม'); raise exception 'ผู้ว่าจ้างรีวิวตนเองได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_other'))::text,true);
do $$ begin
  begin perform public.get_job_employer_review(current_setting('test.er_completed_job')::bigint); raise exception 'คนนอกอ่านรีวิวส่วนตัวได้';
  exception when insufficient_privilege then null; end;
  begin perform public.get_job_employer_reputation(current_setting('test.er_open_job')::bigint); raise exception 'ผู้ว่าจ้างอื่นอ่านชื่อเสียงได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_caregiver'))::text,true);
do $$ declare j bigint:=current_setting('test.er_completed_job')::bigint; open_j bigint:=current_setting('test.er_open_job')::bigint;
begin
  if not exists(select 1 from public.get_job_employer_reputation(open_j) where review_count=0 and reviews='[]') then
    raise exception 'สถานะเริ่มต้นของคะแนนผิด'; end if;
  begin perform public.submit_employer_review(j,0,''); raise exception 'รับคะแนน 0';
  exception when invalid_parameter_value then null; end;
  begin perform public.submit_employer_review(j,5,repeat('ก',1001)); raise exception 'รับข้อความยาว';
  exception when invalid_parameter_value then null; end;
  perform public.submit_employer_review(j,5,'  สื่อสารชัดเจน  ');
  begin perform public.submit_employer_review(j,1,'ซ้ำ'); raise exception 'รีวิวซ้ำได้';
  exception when raise_exception then if sqlerrm <> 'job_already_reviewed' then raise; end if; end;
  if not exists(select 1 from public.get_job_employer_review(j) where rating=5 and comment='สื่อสารชัดเจน') then
    raise exception 'รีวิวของงานหาย'; end if;
  if not exists(select 1 from public.get_job_employer_reputation(open_j) where average_rating=5 and review_count=1) then
    raise exception 'คะแนนผู้ว่าจ้างไม่แสดงในประกาศใหม่'; end if;
  if exists(select 1 from public.get_job_employer_reputation(open_j) v,
    lateral jsonb_array_elements(v.reviews) item
    where item ?| array['job_post_id','employer_id','caregiver_id','phone','address_detail','patient_id']) then
    raise exception 'ผลรีวิวเปิดข้อมูลส่วนตัว'; end if;
  begin insert into public.employer_reviews(job_post_id,employer_id,caregiver_id,rating)
    values(open_j,current_setting('test.er_employer')::uuid,auth.uid(),5); raise exception 'เขียนตารางตรงได้';
  exception when insufficient_privilege then null; end;
  begin update public.employer_reviews set rating=1; raise exception 'แก้รีวิวตรงได้';
  exception when insufficient_privilege then null; end;
  begin delete from public.employer_reviews; raise exception 'ลบรีวิวตรงได้';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.er_other'))::text,true);
do $$ begin
  if exists(select 1 from public.employer_reviews) then raise exception 'คนนอกอ่านตารางรีวิวได้'; end if;
end $$;
set local role anon;
do $$ begin
  begin perform public.get_job_employer_reputation(current_setting('test.er_open_job')::bigint); raise exception 'ผู้ไม่ล็อกอินอ่านคะแนนได้';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
