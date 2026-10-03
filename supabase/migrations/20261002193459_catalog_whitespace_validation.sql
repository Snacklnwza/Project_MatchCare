create or replace function private.normalize_catalog_item()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  -- รวม Tab และขึ้นบรรทัดใหม่ด้วย เพื่อให้ API ตรวจชื่อว่างเหมือนหน้าเว็บ
  new.name := regexp_replace(new.name, '^\s+|\s+$', '', 'g');
  new.description := nullif(regexp_replace(new.description, '^\s+|\s+$', '', 'g'), '');
  if new.name is null or length(new.name) not between 1 and 120 then
    raise exception using errcode='23514', message='catalog_name_invalid';
  end if;
  if length(new.description) > 1000 then
    raise exception using errcode='23514', message='catalog_description_too_long';
  end if;
  return new;
end;
$$;
