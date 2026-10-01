-- ID 8: คลังทักษะและสภาวะการดูแล แอดมินแก้ไขได้ ผู้ใช้ทั่วไปอ่านได้
begin;

-- ชื่อที่ต่างกันแค่ตัวพิมพ์หรือช่องว่างหัวท้ายถือว่าซ้ำกัน
create unique index skills_name_normalized_unique on public.skills (lower(btrim(name)));

create or replace function private.normalize_catalog_item()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.name := btrim(new.name);
  new.description := nullif(btrim(new.description), '');
  if new.name is null or length(new.name) not between 1 and 120 then
    raise exception using errcode='23514', message='catalog_name_invalid';
  end if;
  if length(new.description) > 1000 then
    raise exception using errcode='23514', message='catalog_description_too_long';
  end if;
  return new;
end;
$$;
revoke all on function private.normalize_catalog_item() from public, anon, authenticated;
create trigger skills_normalize before insert or update on public.skills
for each row execute function private.normalize_catalog_item();
create trigger conditions_normalize before insert or update on public.conditions
for each row execute function private.normalize_catalog_item();

-- ชื่อแท็กเป็นคลังกลาง ไม่ใช่ข้อมูลส่วนตัว อ่านรายการเก่าได้เพื่อแสดงประวัติ
-- ตัวเลือกใหม่ของทุกฟอร์มต้องกรอง is_active=true และสิทธิ์เพิ่มความสัมพันธ์ยังตรวจ is_active
create policy skills_read_catalog on public.skills for select to authenticated using (true);
create policy conditions_read_catalog on public.conditions for select to authenticated using (true);

grant insert (name, description, is_active), update (name, description, is_active)
on public.skills, public.conditions to authenticated;
grant usage on sequence public.skills_id_seq, public.conditions_id_seq to authenticated;

create policy skills_admin_insert on public.skills for insert to authenticated
with check (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'));
create policy skills_admin_update on public.skills for update to authenticated
using (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
with check (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'));
create policy conditions_admin_insert on public.conditions for insert to authenticated
with check (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'));
create policy conditions_admin_update on public.conditions for update to authenticated
using (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
with check (exists (select 1 from public.profiles where id=(select auth.uid()) and role='admin'));

-- ไม่ grant DELETE: ปิดใช้งานแทนการลบเพื่อรักษาความสัมพันธ์และเปิดกลับได้


create or replace function public.save_patient_with_tags(
  p_patient_id bigint,
  p_first_name text,
  p_last_name text,
  p_birth_date date,
  p_mobility_status text,
  p_care_notes text,
  p_province text,
  p_district text,
  p_subdistrict text,
  p_address_detail text,
  p_condition_ids bigint[],
  p_skill_ids bigint[]
)
returns public.patients
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_patient public.patients;
begin
  if (select auth.uid()) is null then
    raise exception 'กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลผู้ป่วย';
  end if;

  if p_patient_id is null then
    insert into public.patients (
      employer_id, first_name, last_name, birth_date, mobility_status,
      care_notes, province, district, subdistrict, address_detail
    )
    values (
      (select auth.uid()), p_first_name, p_last_name, p_birth_date,
      p_mobility_status, p_care_notes, p_province, p_district,
      p_subdistrict, p_address_detail
    )
    returning * into v_patient;
  else
    update public.patients
    set first_name = p_first_name,
        last_name = p_last_name,
        birth_date = p_birth_date,
        mobility_status = p_mobility_status,
        care_notes = p_care_notes,
        province = p_province,
        district = p_district,
        subdistrict = p_subdistrict,
        address_detail = p_address_detail
    where id = p_patient_id
      and employer_id = (select auth.uid())
      and is_active = true
    returning * into v_patient;

    if not found then
      raise exception 'ไม่พบผู้ป่วยที่แก้ไขได้';
    end if;
  end if;

  delete from public.patient_conditions
  where patient_id = v_patient.id
    and not (condition_id = any(coalesce(p_condition_ids, '{}'::bigint[])));

  insert into public.patient_conditions (patient_id, condition_id)
  select v_patient.id, selected.condition_id
  from (
    select distinct unnest(coalesce(p_condition_ids, '{}'::bigint[])) as condition_id
  ) as selected
  where not exists (
    select 1 from public.patient_conditions existing
    where existing.patient_id=v_patient.id and existing.condition_id=selected.condition_id
  )
  on conflict do nothing;

  delete from public.patient_required_skills
  where patient_id = v_patient.id
    and not (skill_id = any(coalesce(p_skill_ids, '{}'::bigint[])));

  insert into public.patient_required_skills (patient_id, skill_id)
  select v_patient.id, selected.skill_id
  from (
    select distinct unnest(coalesce(p_skill_ids, '{}'::bigint[])) as skill_id
  ) as selected
  where not exists (
    select 1 from public.patient_required_skills existing
    where existing.patient_id=v_patient.id and existing.skill_id=selected.skill_id
  )
  on conflict do nothing;

  return v_patient;
end;
$$;

revoke all on function public.save_patient_with_tags(
  bigint, text, text, date, text, text, text, text, text, text, bigint[], bigint[]
) from public, anon;

grant execute on function public.save_patient_with_tags(
  bigint, text, text, date, text, text, text, text, text, text, bigint[], bigint[]
) to authenticated;

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
    left join public.skills s on s.id = requested.id and (s.is_active or exists (
      select 1 from public.job_required_skills existing
      where existing.job_post_id=p_job_id and existing.skill_id=s.id
    ))
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
  where not exists (select 1 from public.job_required_skills existing
    where existing.job_post_id=p_job_id and existing.skill_id=ids.id)
  on conflict do nothing;
  delete from public.job_required_skills
  where job_post_id = p_job_id and not (skill_id = any(p_skill_ids));
  return p_job_id;
end;
$$;

revoke all on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) from public, anon;
grant execute on function public.update_job_with_tags(bigint,bigint,text,text,text,timestamptz,timestamptz,numeric,text,bigint[]) to authenticated;


commit;

