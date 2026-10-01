-- ID 8: ตรวจสิทธิ์และประวัติแท็กด้วยข้อมูลสมมติ ทุกอย่าง rollback เมื่อจบ
begin;
select set_config('test.cat_admin',gen_random_uuid()::text,true),
  set_config('test.cat_employer',gen_random_uuid()::text,true),
  set_config('test.cat_caregiver',gen_random_uuid()::text,true);
insert into auth.users(id,email)
select current_setting(k)::uuid,current_setting(k)||'@example.com'
from unnest(array['test.cat_admin','test.cat_employer','test.cat_caregiver']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,case k when 'test.cat_admin' then 'admin' when 'test.cat_employer' then 'employer' else 'caregiver' end,
'ทดสอบ','คลังกลาง','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ'
from unnest(array['test.cat_admin','test.cat_employer','test.cat_caregiver']) k;
insert into public.caregiver_profiles(caregiver_id) values(current_setting('test.cat_caregiver')::uuid);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_admin'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare s bigint; c bigint; kind text;
begin
 insert into public.skills(name,description) values('  QA catalog skill  ',' ') returning id into s;
 insert into public.conditions(name) values('  QA catalog condition  ') returning id into c;
 perform set_config('test.cat_skill',s::text,true);
 perform set_config('test.cat_condition',c::text,true);
 if not exists(select 1 from public.skills where id=s and name='QA catalog skill' and description is null) then raise exception 'normalization failed'; end if;
 foreach kind in array array['skills','conditions'] loop
  begin
   execute format('insert into public.%I(name) values($1)',kind) using '   ';
   raise exception 'blank allowed';
  exception when check_violation then null; end;
  begin
   execute format('insert into public.%I(name) values($1)',kind) using case kind when 'skills' then ' qa CATALOG skill ' else ' qa CATALOG condition ' end;
   raise exception 'duplicate allowed';
  exception when unique_violation then null; end;
 end loop;
 update public.skills set description='แก้ไขคำอธิบาย' where id=s;
 if not exists(select 1 from public.skills where id=s and description='แก้ไขคำอธิบาย') then raise exception 'edit failed'; end if;
 update public.conditions set description='แก้ไขคำอธิบาย' where id=c;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_employer'),'role','authenticated')::text,true);
do $$ declare p public.patients; j bigint;
begin
 p:=public.save_patient_with_tags(null,'คนไข้','ทดสอบ','1950-01-01','normal',null,
 'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ',array[current_setting('test.cat_condition')::bigint],array[current_setting('test.cat_skill')::bigint]);
 perform set_config('test.cat_patient',p.id::text,true);
 j:=public.create_job_with_tags(p.id,'งานคลังกลาง','รายละเอียด','ดูแล','2030-01-01 08:00+07','2030-01-02 08:00+07',1000,'day',array[current_setting('test.cat_skill')::bigint]);
 perform set_config('test.cat_job',j::text,true);
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_caregiver'),'role','authenticated')::text,true);
insert into public.caregiver_skills(caregiver_id,skill_id) values(auth.uid(),current_setting('test.cat_skill')::bigint);

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_admin'),'role','authenticated')::text,true);
update public.skills set is_active=false where id=current_setting('test.cat_skill')::bigint;
update public.conditions set is_active=false where id=current_setting('test.cat_condition')::bigint;
do $$ begin
 begin delete from public.skills where id=current_setting('test.cat_skill')::bigint; raise exception 'hard delete allowed'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_employer'),'role','authenticated')::text,true);
do $$ declare p public.patients; kind text; n integer;
begin
 if not exists(select 1 from public.skills where id=current_setting('test.cat_skill')::bigint and not is_active) then raise exception 'historical skill unreadable'; end if;
 if exists(select 1 from public.conditions where id=current_setting('test.cat_condition')::bigint and is_active) then raise exception 'inactive condition offered'; end if;
 -- การแก้ข้อมูลอื่นต้องเก็บแท็กเดิมได้ แม้แท็กถูกปิดใช้งานไปแล้ว
 p:=public.save_patient_with_tags(current_setting('test.cat_patient')::bigint,'คนไข้','แก้แล้ว','1950-01-01','normal',null,
 'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ',array[current_setting('test.cat_condition')::bigint],array[current_setting('test.cat_skill')::bigint]);
 perform public.update_job_with_tags(current_setting('test.cat_job')::bigint,p.id,'งานแก้แล้ว','รายละเอียด','ดูแล',
 '2030-01-01 08:00+07','2030-01-02 08:00+07',1000,'day',array[current_setting('test.cat_skill')::bigint]);
 if not exists(select 1 from public.patient_conditions where patient_id=p.id and condition_id=current_setting('test.cat_condition')::bigint) then raise exception 'history removed'; end if;
 begin
  perform public.save_patient_with_tags(null,'ห้าม','เพิ่มแท็กเก่า','1950-01-01','normal',null,
  'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','สมมติ',array[current_setting('test.cat_condition')::bigint],'{}');
  raise exception 'inactive reference added';
 exception when insufficient_privilege then null; end;
 foreach kind in array array['skills','conditions'] loop
  begin execute format('insert into public.%I(name) values($1)',kind) using 'Forbidden'; raise exception 'nonadmin inserted'; exception when insufficient_privilege then null; end;
  execute format('update public.%I set description=$1',kind) using 'Forbidden';
  get diagnostics n=row_count;
  if n<>0 then raise exception 'nonadmin updated'; end if;
  begin execute format('delete from public.%I',kind); raise exception 'nonadmin deleted'; exception when insufficient_privilege then null; end;
 end loop;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_caregiver'),'role','authenticated')::text,true);
do $$ begin
 if not exists(select 1 from public.caregiver_skills cs join public.skills s on s.id=cs.skill_id where cs.caregiver_id=auth.uid() and s.id=current_setting('test.cat_skill')::bigint) then raise exception 'caregiver history unreadable'; end if;
 begin insert into public.conditions(name) values('Forbidden'); raise exception 'caregiver inserted'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.cat_admin'),'role','authenticated')::text,true);
update public.skills set is_active=true where id=current_setting('test.cat_skill')::bigint;
update public.conditions set is_active=true where id=current_setting('test.cat_condition')::bigint;
do $$ begin
 if not exists(select 1 from public.skills where id=current_setting('test.cat_skill')::bigint and is_active) then raise exception 'reactivation failed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin insert into public.skills(name) values('Forbidden'); raise exception 'guest inserted'; exception when insufficient_privilege then null; end;
end $$;
rollback;
