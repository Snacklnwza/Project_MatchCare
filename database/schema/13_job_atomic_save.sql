-- สร้างประกาศกับทักษะใน transaction เดียว ภายใต้สิทธิ์/RLS ของผู้เรียก
create or replace function public.create_job_with_tags(
  p_patient_id bigint, p_title text, p_description text, p_care_summary text,
  p_starts_at timestamptz, p_ends_at timestamptz, p_pay_amount numeric,
  p_pay_unit text, p_skill_ids bigint[]
)
returns bigint language plpgsql security invoker set search_path = pg_catalog
as $$
declare
  v_job_id bigint;
  v_patient public.patients;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'employer') then
    raise exception 'เฉพาะผู้ว่าจ้างเท่านั้นที่สร้างประกาศได้';
  end if;

  -- ล็อกผู้ป่วยจนจบ transaction เพื่อไม่ให้ถูกปิดพร้อมกับเปิดประกาศ
  select * into v_patient from public.patients
  where id = p_patient_id and employer_id = auth.uid() and is_active for share;
  if not found then raise exception 'ไม่พบผู้ป่วยที่ใช้งานอยู่ในความดูแลของคุณ'; end if;
  if length(p_title) > 120 or nullif(btrim(p_title), '') is null
    or nullif(btrim(p_description), '') is null
    or nullif(btrim(p_care_summary), '') is null then
    raise exception 'กรุณากรอกข้อมูลประกาศให้ครบ และหัวข้อไม่เกิน 120 ตัวอักษร';
  end if;
  if coalesce(cardinality(p_skill_ids), 0) = 0 or exists (
    select 1 from unnest(p_skill_ids) requested(skill_id)
    left join public.skills skill on skill.id = requested.skill_id and skill.is_active
    where skill.id is null
  ) then raise exception 'กรุณาเลือกทักษะที่ใช้งานอยู่อย่างน้อย 1 รายการ'; end if;
  if p_starts_at is null or p_ends_at is null or not isfinite(p_starts_at)
    or not isfinite(p_ends_at) or p_ends_at <= p_starts_at then
    raise exception 'วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน';
  end if;
  if p_pay_amount is null or p_pay_amount <= 0 or p_pay_amount > 99999999.99
    or p_pay_unit is null or p_pay_unit not in ('hour', 'day', 'month', 'total') then
    raise exception 'ค่าตอบแทนหรือหน่วยค่าตอบแทนไม่ถูกต้อง';
  end if;

  insert into public.job_posts (
    employer_id, patient_id, title, description, care_summary,
    starts_at, ends_at, pay_amount, pay_unit,
    province, district, subdistrict, address_detail, status
  ) values (
    auth.uid(), v_patient.id, btrim(p_title), btrim(p_description), btrim(p_care_summary),
    p_starts_at, p_ends_at, p_pay_amount, p_pay_unit,
    v_patient.province, v_patient.district, v_patient.subdistrict, v_patient.address_detail, 'draft'
  ) returning id into v_job_id;

  insert into public.job_required_skills(job_post_id, skill_id)
  select v_job_id, skill_id from (select distinct unnest(p_skill_ids) skill_id) requested;
  update public.job_posts set status = 'open' where id = v_job_id;
  return v_job_id;
end;
$$;
revoke all on function public.create_job_with_tags(bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) from public, anon;
grant execute on function public.create_job_with_tags(bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) to authenticated;
