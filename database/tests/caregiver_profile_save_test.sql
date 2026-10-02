-- ตรวจการบันทึกพร้อมกันและสิทธิ์ด้วยข้อมูลสมมติ แล้วล้างด้วย rollback
begin;
select set_config('test.cp_user',gen_random_uuid()::text,true),
  set_config('test.cp_other',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.cp_user','test.cp_other']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,case k when 'test.cp_user' then 'caregiver' else 'employer' end,
'ทดสอบ','โปรไฟล์','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ'
from unnest(array['test.cp_user','test.cp_other']) k;
insert into public.skills(name) values('QA atomic '||gen_random_uuid()) returning set_config('test.cp_skill',id::text,true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cp_user'),'role','authenticated')::text,true);
set local role authenticated;
select * from public.save_caregiver_profile_with_skills('เดิม',2,array[current_setting('test.cp_skill')::bigint]);
do $$ begin
  begin
    perform public.save_caregiver_profile_with_skills('ห้ามบันทึก',3,array[-1::bigint]);
    raise exception 'invalid skill accepted';
  exception when insufficient_privilege or foreign_key_violation then null; end;
  if not exists(select 1 from public.caregiver_profiles where caregiver_id=auth.uid() and bio='เดิม' and experience_years=2)
    or not exists(select 1 from public.caregiver_skills where caregiver_id=auth.uid() and skill_id=current_setting('test.cp_skill')::bigint)
  then raise exception 'partial save occurred'; end if;
  begin
    perform public.save_caregiver_profile_with_skills(E'\t\n ',2,'{}');
    raise exception 'blank bio accepted';
  exception when invalid_parameter_value then null; end;
end $$;
reset role;
update public.skills set is_active=false where id=current_setting('test.cp_skill')::bigint;
set local role authenticated;
select * from public.save_caregiver_profile_with_skills('แก้แล้ว',4,array[current_setting('test.cp_skill')::bigint]);
do $$ begin
  if not exists(select 1 from public.caregiver_skills where caregiver_id=auth.uid() and skill_id=current_setting('test.cp_skill')::bigint)
    then raise exception 'inactive history removed'; end if;
  if not exists(select 1 from public.caregiver_profiles where caregiver_id=auth.uid() and bio='แก้แล้ว' and experience_years=4 and verification_status='not_submitted' and availability_status='unavailable')
    then raise exception 'profile result incorrect'; end if;
end $$;
select * from public.save_caregiver_profile_with_skills('ไม่มีทักษะ',4,'{}');
do $$ begin
  if exists(select 1 from public.caregiver_skills where caregiver_id=auth.uid()) then raise exception 'skills not removed'; end if;
  begin
    perform public.save_caregiver_profile_with_skills('เพิ่มทักษะปิด',5,array[current_setting('test.cp_skill')::bigint]);
    raise exception 'inactive skill re-added';
  exception when insufficient_privilege then null; end;
  if not exists(select 1 from public.caregiver_profiles where caregiver_id=auth.uid() and bio='ไม่มีทักษะ') then raise exception 'inactive failure partially saved'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cp_other'),'role','authenticated')::text,true);
do $$ begin
  begin perform public.save_caregiver_profile_with_skills('ห้าม',1,'{}'); raise exception 'employer allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{}',true);
do $$ begin
  begin perform public.save_caregiver_profile_with_skills('ห้าม',1,'{}'); raise exception 'missing identity allowed';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.save_caregiver_profile_with_skills(text,integer,bigint[])','execute') then raise exception 'guest allowed'; end if;
end $$;
rollback;
