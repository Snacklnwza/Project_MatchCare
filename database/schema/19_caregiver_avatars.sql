-- รูปโปรไฟล์แยกจากเอกสารยืนยันตัวตน และให้ผู้ดูแลเลือกใส่หรือเอาออกได้
alter table public.caregiver_profiles
  add column avatar_path text,
  add constraint caregiver_avatar_own_folder check (
    avatar_path is null or avatar_path like caregiver_id::text || '/%'
  );
grant update (avatar_path) on public.caregiver_profiles to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('caregiver-avatars', 'caregiver-avatars', false, 2097152,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- เจ้าของไฟล์อัปโหลด อ่าน และลบในโฟลเดอร์ของตัวเองเท่านั้น
create policy caregiver_avatar_upload on storage.objects
for insert to authenticated with check (
  bucket_id = 'caregiver-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and exists (select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'caregiver')
);

-- ผู้ว่าจ้างอ่านได้เฉพาะรูปที่ผู้ดูแลยืนยันตัวตนแล้วตั้งเป็นรูปปัจจุบัน
create function match_internal.employer_can_view_avatar(p_path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles viewer
    join public.caregiver_profiles cp on cp.avatar_path = p_path
    where viewer.id = auth.uid() and viewer.role = 'employer'
      and cp.verification_status = 'verified'
  );
$$;
revoke all on function match_internal.employer_can_view_avatar(text) from public, anon, authenticated;
grant execute on function match_internal.employer_can_view_avatar(text) to authenticated;

create policy caregiver_avatar_read on storage.objects
for select to authenticated using (
  bucket_id = 'caregiver-avatars' and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or match_internal.employer_can_view_avatar(name)
  )
);
create policy caregiver_avatar_remove on storage.objects
for delete to authenticated using (
  bucket_id = 'caregiver-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

-- ดึง path รูปเป็นชุดสำหรับรายชื่อผู้ดูแลที่ผู้ว่าจ้างค้นพบ
create function match_internal.get_caregiver_avatar_paths(p_caregiver_ids uuid[])
returns table(caregiver_id uuid, avatar_path text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'
  ) then raise exception using errcode = '42501', message = 'employer_account_required'; end if;
  if coalesce(cardinality(p_caregiver_ids), 0) > 50 then
    raise exception using errcode = '22023', message = 'too_many_caregivers';
  end if;
  return query
  select cp.caregiver_id, cp.avatar_path
  from public.caregiver_profiles cp
  where cp.caregiver_id = any(coalesce(p_caregiver_ids, '{}'::uuid[]))
    and cp.verification_status = 'verified'
    and cp.avatar_path is not null;
end;
$$;
revoke all on function match_internal.get_caregiver_avatar_paths(uuid[]) from public, anon, authenticated;
grant execute on function match_internal.get_caregiver_avatar_paths(uuid[]) to authenticated;

create function public.get_caregiver_avatar_paths(p_caregiver_ids uuid[])
returns table(caregiver_id uuid, avatar_path text)
language sql stable security invoker set search_path = '' as $$
  select * from match_internal.get_caregiver_avatar_paths(p_caregiver_ids);
$$;
revoke all on function public.get_caregiver_avatar_paths(uuid[]) from public, anon, authenticated;
grant execute on function public.get_caregiver_avatar_paths(uuid[]) to authenticated;
