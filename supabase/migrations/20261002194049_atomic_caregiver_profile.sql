-- บันทึกโปรไฟล์กับทักษะใน transaction เดียว หากขั้นใดผิดพลาดข้อมูลเดิมจะยังอยู่
-- ใช้สิทธิ์ผู้เรียกและ RLS เดิม ไม่เปิดสิทธิ์แก้สถานะยืนยันตัวตน
create or replace function public.save_caregiver_profile_with_skills(
  p_bio text, p_experience_years integer, p_skill_ids bigint[]
)
returns table (bio text, experience_years smallint, availability_status text, verification_status text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (
    select 1 from public.profiles where id = v_uid and role = 'caregiver'
  ) then
    raise exception using errcode = '42501', message = 'caregiver_required';
  end if;
  if p_bio is null or p_bio !~ '\S' or p_experience_years is null
    or p_experience_years not between 0 and 80 or p_skill_ids is null
    or array_position(p_skill_ids, null) is not null then
    raise exception using errcode = '22023', message = 'invalid_caregiver_profile';
  end if;

  -- UPSERT ล็อกแถวเจ้าของโปรไฟล์ ทำให้การบันทึกพร้อมกันรอทำทีละรายการ
  insert into public.caregiver_profiles as cp (caregiver_id, bio, experience_years)
  values (v_uid, btrim(p_bio), p_experience_years)
  on conflict (caregiver_id) do update
    set bio = excluded.bio, experience_years = excluded.experience_years;

  -- ไม่เพิ่มลิงก์เดิมซ้ำ จึงเก็บประวัติทักษะที่ถูกปิดใช้งานไว้ได้
  insert into public.caregiver_skills (caregiver_id, skill_id)
  select v_uid, s.id from (select distinct unnest(p_skill_ids) as id) s
  where not exists (
    select 1 from public.caregiver_skills cs where cs.caregiver_id = v_uid and cs.skill_id = s.id
  );
  delete from public.caregiver_skills cs
  where cs.caregiver_id = v_uid and not (cs.skill_id = any(p_skill_ids));

  return query select cp.bio, cp.experience_years, cp.availability_status, cp.verification_status
  from public.caregiver_profiles cp where cp.caregiver_id = v_uid;
end;
$$;
revoke all on function public.save_caregiver_profile_with_skills(text, integer, bigint[]) from public, anon;
grant execute on function public.save_caregiver_profile_with_skills(text, integer, bigint[]) to authenticated;
