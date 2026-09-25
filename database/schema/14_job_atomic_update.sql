create or replace function public.update_job_with_tags(
  p_job_id bigint,
  p_patient_id bigint,
  p_title text,
  p_description text,
  p_care_summary text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_pay_amount numeric,
  p_pay_unit text,
  p_skill_ids bigint[]
)
returns bigint
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_patient public.patients;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  -- ล็อกประกาศเพื่อไม่ให้แก้ไขและปิดพร้อมกัน
  perform 1 from public.job_posts
  where id = p_job_id and employer_id = auth.uid() and status in ('draft', 'open')
  for update;
  if not found then raise exception 'ไม่พบประกาศที่แก้ไขได้ กรุณาโหลดรายการใหม่'; end if;
  select * into v_patient from public.patients
  where id = p_patient_id and employer_id = auth.uid() and is_active for share;
  if not found then raise exception 'กรุณาเลือกผู้ป่วยที่ใช้งานอยู่ของคุณ'; end if;
  if coalesce(length(btrim(p_title)), 0) = 0 or length(p_title) > 120
    or coalesce(length(btrim(p_description)), 0) = 0
    or coalesce(length(btrim(p_care_summary)), 0) = 0 then
    raise exception 'กรุณากรอกหัวข้อไม่เกิน 120 ตัวอักษร รายละเอียด และสรุปการดูแล';
  end if;
  if p_starts_at is null or p_ends_at is null or not isfinite(p_starts_at)
    or not isfinite(p_ends_at) or p_ends_at <= p_starts_at then
    raise exception 'วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน';
  end if;
  if p_pay_amount is null or p_pay_amount <= 0 or p_pay_amount > 99999999.99
    or p_pay_unit is null or p_pay_unit not in ('hour','day','month','total') then
    raise exception 'ค่าตอบแทนหรือหน่วยค่าตอบแทนไม่ถูกต้อง';
  end if;
  if coalesce(cardinality(p_skill_ids), 0) = 0 or exists (
    select 1 from unnest(p_skill_ids) requested(id)
    left join public.skills s on s.id = requested.id and s.is_active
    where s.id is null
  ) then raise exception 'กรุณาเลือกทักษะที่ใช้งานอยู่อย่างน้อย 1 รายการ'; end if;
  update public.job_posts set patient_id = p_patient_id, title = btrim(p_title),
    description = btrim(p_description), care_summary = btrim(p_care_summary),
    starts_at = p_starts_at, ends_at = p_ends_at, pay_amount = p_pay_amount,
    pay_unit = p_pay_unit, province = v_patient.province, district = v_patient.district,
    subdistrict = v_patient.subdistrict, address_detail = v_patient.address_detail
  where id = p_job_id and employer_id = auth.uid();
  -- เพิ่มชุดใหม่ก่อนลบชุดเก่า; ถ้าล้มเหลว transaction จะย้อนกลับทั้งชุด
  insert into public.job_required_skills(job_post_id, skill_id)
  select p_job_id, id from (select distinct unnest(p_skill_ids) id) ids
  on conflict do nothing;
  delete from public.job_required_skills
  where job_post_id = p_job_id and not (skill_id = any(p_skill_ids));
  return p_job_id;
end;
$$;

revoke all on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) from public, anon;
grant execute on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) to authenticated;

create or replace function public.close_job(p_job_id bigint)
returns bigint language plpgsql security invoker set search_path = pg_catalog
as $$
declare v_id bigint;
begin
  update public.job_posts set status = 'closed'
  where id = p_job_id and employer_id = auth.uid() and status in ('draft', 'open')
  returning id into v_id;
  if v_id is null then raise exception 'ไม่พบประกาศที่ปิดได้ กรุณาโหลดรายการใหม่'; end if;
  return v_id;
end;
$$;
revoke all on function public.close_job(bigint) from public, anon;
grant execute on function public.close_job(bigint) to authenticated;
