-- รูปเป็นข้อมูลสมัครใจ เจ้าของเปลี่ยนได้ ผู้ว่าจ้างเห็นเฉพาะรูปปัจจุบันของผู้ดูแลที่ยืนยันแล้ว
begin;
do $$ begin
  if (select public from storage.buckets where id='caregiver-avatars') then
    raise exception 'รูปโปรไฟล์ถูกเปิดเป็นสาธารณะ';
  end if;
end $$;
select set_config('test.avatar_employer', gen_random_uuid()::text, true);
select set_config('test.avatar_owner', gen_random_uuid()::text, true);
select set_config('test.avatar_pending', gen_random_uuid()::text, true);
insert into auth.users(id,email)
select current_setting(k)::uuid, current_setting(k)||'@example.com'
from unnest(array['test.avatar_employer','test.avatar_owner','test.avatar_pending']) k;
insert into public.profiles(id,role,first_name,last_name,phone,province,district,subdistrict,address_detail)
select current_setting(k)::uuid,
  case when k='test.avatar_employer' then 'employer' else 'caregiver' end,
  'ทดสอบ','รูป','0800000000','กรุงเทพมหานคร','พระนคร','พระบรมมหาราชวัง','ที่อยู่สมมติ'
from unnest(array['test.avatar_employer','test.avatar_owner','test.avatar_pending']) k;
insert into public.caregiver_profiles(caregiver_id,verification_status,verified_by,verified_at)
values (current_setting('test.avatar_owner')::uuid,'verified',current_setting('test.avatar_employer')::uuid,now()),
  (current_setting('test.avatar_pending')::uuid,'not_submitted',null,null);

select set_config('test.avatar_path',current_setting('test.avatar_owner')||'/photo.jpg',true);
select set_config('test.pending_path',current_setting('test.avatar_pending')||'/photo.jpg',true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.avatar_owner'),'role','authenticated')::text,true);
set local role authenticated;
insert into storage.objects(id,bucket_id,name,owner_id)
values(gen_random_uuid(),'caregiver-avatars',current_setting('test.avatar_path'),current_setting('test.avatar_owner'));
update public.caregiver_profiles set avatar_path=current_setting('test.avatar_path')
where caregiver_id=current_setting('test.avatar_owner')::uuid;
do $$ begin
  begin
    update public.caregiver_profiles set avatar_path=current_setting('test.pending_path')
    where caregiver_id=current_setting('test.avatar_owner')::uuid;
    raise exception 'ยอมให้ชี้รูปในโฟลเดอร์คนอื่น';
  exception when check_violation then null; end;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.avatar_pending'),'role','authenticated')::text,true);
insert into storage.objects(id,bucket_id,name,owner_id)
values(gen_random_uuid(),'caregiver-avatars',current_setting('test.pending_path'),current_setting('test.avatar_pending'));
update public.caregiver_profiles set avatar_path=current_setting('test.pending_path')
where caregiver_id=current_setting('test.avatar_pending')::uuid;
do $$ begin
  begin
    perform public.get_caregiver_avatar_paths(array[current_setting('test.avatar_owner')::uuid]);
    raise exception 'ผู้ดูแลเรียก path ของผู้อื่นได้';
  exception when insufficient_privilege then null; end;
  if exists(select 1 from storage.objects where bucket_id='caregiver-avatars'
    and name=current_setting('test.avatar_path')) then
    raise exception 'ผู้ดูแลอ่านรูปของผู้อื่นได้';
  end if;
end $$;

select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.avatar_employer'),'role','authenticated')::text,true);
do $$ begin
  if has_function_privilege('anon','public.get_caregiver_avatar_paths(uuid[])','EXECUTE') then
    raise exception 'ผู้ไม่เข้าสู่ระบบเรียก path รูปได้';
  end if;
  if not exists(select 1 from public.get_caregiver_avatar_paths(array[
    current_setting('test.avatar_owner')::uuid,current_setting('test.avatar_pending')::uuid
  ]) where avatar_path=current_setting('test.avatar_path')) then
    raise exception 'ผู้ว่าจ้างไม่เห็นรูปของผู้ดูแลที่ยืนยันแล้ว';
  end if;
  if exists(select 1 from public.get_caregiver_avatar_paths(array[
    current_setting('test.avatar_pending')::uuid
  ])) then raise exception 'รูปผู้ดูแลที่ยังไม่ยืนยันถูกเปิด'; end if;
  if not exists(select 1 from storage.objects where bucket_id='caregiver-avatars'
    and name=current_setting('test.avatar_path')) then
    raise exception 'ผู้ว่าจ้างอ่านรูปที่เปิดใช้ไม่ได้';
  end if;
  if exists(select 1 from storage.objects where bucket_id='caregiver-avatars'
    and name=current_setting('test.pending_path')) then
    raise exception 'ผู้ว่าจ้างอ่านรูปที่ยังไม่ยืนยันได้';
  end if;
end $$;
rollback;
