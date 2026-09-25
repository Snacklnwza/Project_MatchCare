-- Repeatable integration checks. All fixture rows roll back; sequence gaps are expected.
begin;
select set_config('test.owner', gen_random_uuid()::text, true);
select set_config('test.other', gen_random_uuid()::text, true);
select set_config('test.caregiver', gen_random_uuid()::text, true);
insert into auth.users(id, email)
select current_setting(key)::uuid, current_setting(key) || '@example.com'
from unnest(array['test.owner','test.other','test.caregiver']) key;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
set local role authenticated;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'employer','ทดสอบ','สปรินต์หนึ่ง','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'profile isolation failed'; end if;
  begin
    update public.profiles set role='admin' where id=auth.uid();
    raise exception 'role escalation allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set phone='12345678901' where id=auth.uid();
    raise exception 'long phone allowed';
  exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'employer','อื่น','สปรินต์หนึ่ง','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
do $$ begin
  begin
    insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
    values(auth.uid(),'admin','ทดสอบ','ผู้ดูแล','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
    raise exception 'admin signup allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
values(auth.uid(),'caregiver','ทดสอบ','ผู้ดูแล','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ');
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
do $$
declare p public.patients; j bigint; skills bigint[]; before_count bigint; rejected boolean;
begin
  select array_agg(id) into skills from (select id from public.skills where is_active order by id limit 2) s;
  if cardinality(skills) < 2 then raise exception 'Need two active skill fixtures'; end if;
  p := public.save_patient_with_tags(null,'ทดสอบ','ผู้ป่วย','1950-01-01','walker',null,
    'กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ข้อมูลสมมติ','{}',skills);
  perform set_config('test.patient',p.id::text,true);
  -- Use the same calendar as validate_patient, including UTC/Thai midnight overlap.
  update public.patients set birth_date=(now() at time zone 'Asia/Bangkok')::date where id=p.id;
  begin
    update public.patients set birth_date=(now() at time zone 'Asia/Bangkok')::date+1 where id=p.id;
    raise exception 'future birthday allowed';
  exception when check_violation then null; end;
  update public.patients set birth_date='1950-01-01' where id=p.id;
  j := public.create_job_with_tags(p.id,'ทดสอบประกาศ','รายละเอียด','การดูแล',now()+interval '1 day',now()+interval '2 days',1200,'day',skills);
  perform set_config('test.job',j::text,true);
  if not exists(select 1 from public.job_posts where id=j and status='open' and published_at is not null)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 2 then raise exception 'create failed'; end if;
  perform public.update_job_with_tags(j,p.id,'แก้ไขประกาศ','รายละเอียดใหม่','สรุปใหม่',now()+interval '2 days',now()+interval '3 days',1500,'day',array[skills[2]]);
  if not exists(select 1 from public.job_posts where id=j and title='แก้ไขประกาศ' and pay_amount=1500)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 1 then raise exception 'update failed'; end if;
  -- Invalid tags, zero pay, reversed dates, blank text must leave the existing job unchanged.
  for i in 1..4 loop
    rejected := false;
    begin
      perform public.update_job_with_tags(j,p.id,case when i=4 then ' ' else 'ห้ามบันทึก' end,'รายละเอียด','สรุป',now(),
        case when i=3 then now()-interval '1 day' else now()+interval '1 day' end,
        case when i=2 then 0 else 100 end,'day',case when i=1 then array[-1::bigint] else skills end);
    exception when raise_exception or check_violation then rejected := true; end;
    if not rejected then raise exception 'invalid update accepted case %',i; end if;
  end loop;
  if not exists(select 1 from public.job_posts where id=j and title='แก้ไขประกาศ' and pay_amount=1500)
    or (select count(*) from public.job_required_skills where job_post_id=j) <> 1 then raise exception 'atomic rollback failed'; end if;
  select count(*) into before_count from public.job_posts;
  rejected := false;
  begin
    perform public.create_job_with_tags(p.id,'ผิดพลาด','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day','{}');
  exception when raise_exception then rejected:=true; end;
  if not rejected or (select count(*) from public.job_posts) <> before_count then raise exception 'empty skills accepted'; end if;
  begin
    update public.patients set is_active=false where id=p.id;
    raise exception 'active patient deactivated';
  exception when check_violation then null; end;
  -- Immediate constraint checks also prove at least one skill remains.
  begin
    delete from public.job_required_skills where job_post_id=j;
    set constraints all immediate;
    raise exception 'last skill removed';
  exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.other'),'role','authenticated')::text,true);
do $$ declare rejected boolean:=false; begin
  if exists(select 1 from public.patients) or exists(select 1 from public.job_posts) then raise exception 'cross account data visible'; end if;
  begin perform public.close_job(current_setting('test.job')::bigint);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'cross owner close allowed'; end if;
  rejected:=false;
  begin perform public.update_job_with_tags(current_setting('test.job')::bigint,current_setting('test.patient')::bigint,
    'ข้ามบัญชี','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day',array[1::bigint]);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'cross owner update allowed'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.caregiver'),'role','authenticated')::text,true);
do $$ declare rejected boolean:=false; begin
  begin perform public.create_job_with_tags(current_setting('test.patient')::bigint,'งาน','รายละเอียด','สรุป',now(),now()+interval '1 day',100,'day',array[1::bigint]);
  exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'caregiver created job'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.owner'),'role','authenticated')::text,true);
do $$ declare j bigint:=current_setting('test.job')::bigint; rejected boolean:=false; begin
  perform public.close_job(j);
  if not exists(select 1 from public.job_posts where id=j and status='closed' and closed_at is not null) then raise exception 'close failed'; end if;
  begin perform public.close_job(j); exception when raise_exception then rejected:=true; end;
  if not rejected then raise exception 'stale close gave success'; end if;
  update public.patients set is_active=false where id=current_setting('test.patient')::bigint;
  if not found then raise exception 'patient deactivation after close failed'; end if;
end $$;
set constraints all immediate;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.profiles; raise exception 'anon can read profiles'; exception when insufficient_privilege then null; end;
  begin perform public.close_job(1); raise exception 'anon can call close'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select true as profiles_and_roles_passed, true as patient_guard_passed,
 true as job_create_update_close_passed, true as atomic_rollback_passed,
 true as cross_account_passed, true as anon_denied;
rollback;
