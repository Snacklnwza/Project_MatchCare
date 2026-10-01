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
commit;
