-- รีวิวจริงของงานสมมติ ทดสอบทั้งกรณีอนุญาตและปฏิเสธ แล้ว rollback
begin;
select set_config('test.rating_employer', gen_random_uuid()::text, true);
select set_config('test.rating_caregiver', gen_random_uuid()::text, true);
select set_config('test.rating_other', gen_random_uuid()::text, true);
select set_config('test.rating_admin', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(k)::uuid, current_setting(k) || '@example.com'
from unnest(array['test.rating_employer','test.rating_caregiver','test.rating_other','test.rating_admin']) k;
insert into public.profiles(id, role, first_name, last_name, phone, province, district, subdistrict, address_detail)
select current_setting(k)::uuid,
  case when k='test.rating_caregiver' then 'caregiver' when k='test.rating_admin' then 'admin' else 'employer' end,
  'ทดสอบ', k, '0800000000', 'กรุงเทพมหานคร', 'พระนคร', 'ข้อมูลลับ', 'ที่อยู่ลับ'
from unnest(array['test.rating_employer','test.rating_caregiver','test.rating_other','test.rating_admin']) k;
insert into public.caregiver_profiles(caregiver_id, availability_status, verification_status, verified_by, verified_at)
values(current_setting('test.rating_caregiver')::uuid,'available','verified',current_setting('test.rating_admin')::uuid,now());
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_employer'))::text,true);
set local role authenticated;
do $$ declare p public.patients; j bigint; r bigint; s bigint;
begin
  select id into s from public.skills where is_active order by id limit 1;
  p := public.save_patient_with_tags(null,'ผู้ป่วย','สมมติ','1950-01-01','normal',null,
    'กรุงเทพมหานคร','พระนคร','ข้อมูลลับ','ที่อยู่ลับ','{}',array[s]);
  for i in 1..7 loop
    j := public.create_job_with_tags(p.id,'งานรีวิว '||i,'รายละเอียด','ดูแล',
      '2030-01-01 12:00+07','2030-01-03 12:00+07',1000,'day',array[s]);
    r := public.invite_caregiver(j,current_setting('test.rating_caregiver')::uuid);
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_caregiver'))::text,true);
    perform public.respond_to_invitation(r,true);
    perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_employer'))::text,true);
    perform set_config('test.rating_job_'||i,j::text,true);
    if i <= 6 then
      perform public.start_matched_job(j);
      perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_caregiver'))::text,true);
      perform public.request_job_completion(j);
      perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_employer'))::text,true);
      perform public.confirm_job_completion(j);
    end if;
  end loop;
  if exists(select 1 from public.get_job_review(current_setting('test.rating_job_1')::bigint)) then raise exception 'มีรีวิวก่อนเขียน'; end if;
  if not exists(select 1 from public.get_caregiver_reviews(current_setting('test.rating_caregiver')::uuid) where review_count=0 and average_rating=0 and reviews='[]') then
    raise exception 'ค่าเริ่มต้นรีวิวผิด';
  end if;
  begin perform public.submit_job_review(current_setting('test.rating_job_7')::bigint,5,''); raise exception 'รีวิวงานที่ยังไม่จบได้';
  exception when raise_exception then if sqlerrm <> 'review_requires_completed_job' then raise; end if; end;
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,0,''); raise exception 'รับดาวน้อยกว่า 1';
  exception when invalid_parameter_value then null; end;
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,6,''); raise exception 'รับดาวเกิน 5';
  exception when invalid_parameter_value then null; end;
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,null,''); raise exception 'รับดาวว่าง';
  exception when invalid_parameter_value then null; end;
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,5,repeat('ก',1001)); raise exception 'รับข้อความยาวเกิน';
  exception when invalid_parameter_value then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_other'))::text,true);
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,5,''); raise exception 'คนอื่นรีวิวได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_caregiver'))::text,true);
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,5,''); raise exception 'ผู้ดูแลรีวิวตนเองได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_admin'))::text,true);
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,5,''); raise exception 'แอดมินรีวิวแทนได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_employer'))::text,true);
  perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,5,'  ดูแลดี  ');
  begin perform public.submit_job_review(current_setting('test.rating_job_1')::bigint,1,'เขียนซ้ำ'); raise exception 'รีวิวซ้ำได้';
  exception when raise_exception then if sqlerrm <> 'job_already_reviewed' then raise; end if; end;
  if not exists(select 1 from public.get_job_review(current_setting('test.rating_job_1')::bigint) where rating=5 and comment='ดูแลดี') then raise exception 'รีวิวหายหรือถูกเขียนทับ'; end if;
  perform public.submit_job_review(current_setting('test.rating_job_2')::bigint,3,null);
  for i in 3..6 loop perform public.submit_job_review(current_setting('test.rating_job_'||i)::bigint,4,'รีวิวสมมติ'); end loop;
  if not exists(select 1 from public.get_caregiver_reviews(current_setting('test.rating_caregiver')::uuid)
    where average_rating=4 and review_count=6 and jsonb_array_length(reviews)=5) then raise exception 'คะแนนเฉลี่ยหรือจำนวนรีวิวผิด'; end if;
  if exists(select 1 from public.get_caregiver_reviews(current_setting('test.rating_caregiver')::uuid) v,
    lateral jsonb_array_elements(v.reviews) item where item ?| array['job_post_id','employer_id','caregiver_id','phone','address_detail','patient_id']) then
    raise exception 'รีวิวสาธารณะมีข้อมูลส่วนตัว';
  end if;
  begin insert into public.job_reviews(job_post_id,employer_id,caregiver_id,rating)
    values(current_setting('test.rating_job_7')::bigint,auth.uid(),current_setting('test.rating_caregiver')::uuid,5);
    raise exception 'เขียนตรงข้าม RPC ได้';
  exception when insufficient_privilege then null; end;
  begin update public.job_reviews set rating=1; raise exception 'แก้รีวิวตรงได้';
  exception when insufficient_privilege then null; end;
  begin delete from public.job_reviews; raise exception 'ลบรีวิวตรงได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_other'))::text,true);
  if exists(select 1 from public.job_reviews) then raise exception 'บัญชีอื่นอ่านรหัสงานในตารางรีวิวได้'; end if;
  begin perform public.get_job_review(current_setting('test.rating_job_1')::bigint); raise exception 'บัญชีอื่นเปิดรีวิวส่วนตัวได้';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_caregiver'))::text,true);
  if (select count(*) from public.job_reviews) <> 6 then raise exception 'ผู้ดูแลไม่เห็นรีวิวตนเอง'; end if;
  update public.caregiver_profiles set availability_status='unavailable' where caregiver_id=auth.uid();
  perform public.get_job_review(current_setting('test.rating_job_1')::bigint);
  perform public.get_caregiver_reviews(auth.uid());
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.rating_employer'))::text,true);
  begin perform public.get_caregiver_reviews(current_setting('test.rating_caregiver')::uuid); raise exception 'รีวิวคนที่ปิดรับงานยังถูกค้นได้';
  exception when insufficient_privilege then null; end;
end $$;
-- ใช้สถานะยกเลิกเป็นข้อมูลสมมติ เพื่อยืนยันว่าเขียนรีวิวไม่ได้
reset role;
set constraints all immediate;
alter table public.job_posts disable trigger job_posts_validate;
update public.job_posts set status='cancelled', cancelled_at=now(), cancellation_reason='ทดสอบ'
where id=current_setting('test.rating_job_7')::bigint;
alter table public.job_posts enable trigger job_posts_validate;
set local role authenticated;
do $$ begin
  begin perform public.submit_job_review(current_setting('test.rating_job_7')::bigint,5,''); raise exception 'รีวิวงานยกเลิกได้';
  exception when raise_exception then if sqlerrm <> 'review_requires_completed_job' then raise; end if; end;
end $$;
set local role anon;
do $$ begin
  begin perform public.get_caregiver_reviews(current_setting('test.rating_caregiver')::uuid); raise exception 'ผู้ไม่ล็อกอินอ่านรีวิวได้';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
