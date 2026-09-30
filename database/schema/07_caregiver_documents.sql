-- เอกสารและ Storage ส่วนตัว พร้อม RPC ส่งเอกสารและตรวจอนุมัติ
-- ไม่ให้เขียน metadata หรือผลตรวจโดยตรง
begin;

create table if not exists public.caregiver_documents (
  id bigint generated always as identity primary key,
  caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete cascade,
  document_type text not null check (document_type in ('identity', 'care_certificate', 'other')),
  storage_path text not null unique check (btrim(storage_path) <> ''),
  original_file_name text not null check (btrim(original_file_name) <> ''),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint caregiver_documents_review_fields_valid check (
    (review_status = 'pending' and reviewed_by is null and reviewed_at is null and rejection_reason is null)
    or (review_status = 'approved' and reviewed_by is not null and reviewed_at is not null and rejection_reason is null)
    or (review_status = 'rejected' and reviewed_by is not null and reviewed_at is not null
      and rejection_reason is not null and btrim(rejection_reason) <> '')
  )
);

create index if not exists caregiver_documents_caregiver_idx
on public.caregiver_documents(caregiver_id, created_at desc);
create index if not exists caregiver_documents_reviewer_idx
on public.caregiver_documents(reviewed_by);

alter table public.caregiver_documents enable row level security;
revoke all on public.caregiver_documents from public, anon, authenticated;
grant select on public.caregiver_documents to authenticated;

create policy caregiver_documents_read on public.caregiver_documents
for select to authenticated using (
  caregiver_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

create trigger caregiver_documents_updated_at
before update on public.caregiver_documents
for each row execute function private.set_updated_at();

-- เก็บไฟล์ไม่เกิน 5 MB ต่อไฟล์ ใช้ชื่อ path เป็น UUIDผู้ใช้/UUIDไฟล์.นามสกุล
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('caregiver-documents', 'caregiver-documents', false, 5242880,
  array['image/jpeg', 'image/png', 'application/pdf']);

-- ผู้ดูแลอัปโหลดในโฟลเดอร์ตนเองได้ เมื่อมี caregiver_profiles แล้ว
create policy caregiver_documents_upload on storage.objects
for insert to authenticated with check (
  bucket_id = 'caregiver-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and exists (
    select 1 from public.profiles p
    join public.caregiver_profiles cp on cp.caregiver_id = p.id
    where p.id = (select auth.uid()) and p.role = 'caregiver'
  )
);

-- เจ้าของอ่านไฟล์ตนเอง; แอดมินอ่านเฉพาะไฟล์ที่มีรายการเอกสารส่งเข้าระบบแล้ว
create policy caregiver_documents_download on storage.objects
for select to authenticated using (
  bucket_id = 'caregiver-documents'
  and (
    (owner_id = (select auth.uid())::text
      and (storage.foldername(name))[1] = (select auth.uid())::text)
    or (
      exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      and exists (select 1 from public.caregiver_documents d where d.storage_path = name)
    )
  )
);

-- ไม่ให้ overwrite หรือลบไฟล์ที่ส่งตรวจ ป้องกันเปลี่ยนเนื้อหาหลังอนุมัติ

-- submit_caregiver_document: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.submit_caregiver_document(p_path text, p_type text, p_name text, p_mime text)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_id bigint; v_status text;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver') then
   raise exception using errcode='42501', message='caregiver_required'; end if;
 select verification_status into v_status from public.caregiver_profiles where caregiver_id=auth.uid() for update;
 if not found or v_status='verified' then raise exception 'profile_missing_or_already_verified'; end if;
 if p_type not in ('identity','care_certificate','other') or p_type is null or p_name is null or length(btrim(p_name)) not between 1 and 255 then
   raise exception 'invalid_document'; end if;
 if not exists(select 1 from storage.objects o where o.bucket_id='caregiver-documents' and o.name=p_path
   and o.owner_id=auth.uid()::text and split_part(o.name,'/',1)=auth.uid()::text
   and o.metadata->>'mimetype'=p_mime and (o.metadata->>'size')::bigint between 1 and 5242880) then
   raise exception 'uploaded_file_not_found'; end if;
 insert into public.caregiver_documents(caregiver_id,document_type,storage_path,original_file_name,mime_type)
 values(auth.uid(),p_type,p_path,p_name,p_mime) returning id into v_id;
 update public.caregiver_profiles set verification_status='pending',verified_by=null,verified_at=null,rejection_reason=null where caregiver_id=auth.uid();
 return v_id;
end;
$fn$;
revoke all on function match_internal.submit_caregiver_document(text,text,text,text) from public, anon, authenticated;
grant execute on function match_internal.submit_caregiver_document(text,text,text,text) to authenticated;
create or replace function public.submit_caregiver_document(p_path text, p_type text, p_name text, p_mime text)
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.submit_caregiver_document(p_path, p_type, p_name, p_mime); $fn$;
revoke all on function public.submit_caregiver_document(text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_caregiver_document(text,text,text,text) to authenticated;

-- list_verification_queue: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.list_verification_queue()
returns table(caregiver_id uuid, display_name text, verification_status text) language plpgsql stable security definer set search_path = ''
as $fn$

begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
   raise exception using errcode='42501',message='admin_required'; end if;
 return query select cp.caregiver_id,concat_ws(' ',p.first_name,p.last_name),cp.verification_status
 from public.caregiver_profiles cp join public.profiles p on p.id=cp.caregiver_id
 where cp.verification_status='pending' order by cp.updated_at,cp.caregiver_id;
end;
$fn$;
revoke all on function match_internal.list_verification_queue() from public, anon, authenticated;
grant execute on function match_internal.list_verification_queue() to authenticated;
create or replace function public.list_verification_queue()
returns table(caregiver_id uuid, display_name text, verification_status text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_verification_queue(); $fn$;
revoke all on function public.list_verification_queue() from public, anon, authenticated;
grant execute on function public.list_verification_queue() to authenticated;

-- review_caregiver: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.review_caregiver(p_caregiver_id uuid, p_approve boolean, p_reason text)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_status text;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
   raise exception using errcode='42501',message='admin_required'; end if;
 if p_caregiver_id=auth.uid() or p_approve is null then raise exception 'invalid_review'; end if;
 select verification_status into v_status from public.caregiver_profiles where caregiver_id=p_caregiver_id for update;
 if v_status is distinct from 'pending' then raise exception 'review_no_longer_pending'; end if;
 if not p_approve and (p_reason is null or length(btrim(p_reason)) not between 1 and 1000) then raise exception 'rejection_reason_required'; end if;
 if p_approve and not exists(select 1 from public.caregiver_documents d join storage.objects o
   on o.bucket_id='caregiver-documents' and o.name=d.storage_path
   where d.caregiver_id=p_caregiver_id and d.document_type='identity' and d.review_status='pending') then
   raise exception 'identity_document_required'; end if;
 update public.caregiver_documents set review_status=case when p_approve then 'approved' else 'rejected' end,
 reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=case when p_approve then null else btrim(p_reason) end
 where caregiver_id=p_caregiver_id and review_status='pending';
 update public.caregiver_profiles set verification_status=case when p_approve then 'verified' else 'rejected' end,
 verified_by=case when p_approve then auth.uid() else null end,
 verified_at=case when p_approve then now() else null end,
 rejection_reason=case when p_approve then null else btrim(p_reason) end where caregiver_id=p_caregiver_id;
end;
$fn$;
revoke all on function match_internal.review_caregiver(uuid,boolean,text) from public, anon, authenticated;
grant execute on function match_internal.review_caregiver(uuid,boolean,text) to authenticated;
create or replace function public.review_caregiver(p_caregiver_id uuid, p_approve boolean, p_reason text)
returns void language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.review_caregiver(p_caregiver_id, p_approve, p_reason); $fn$;
revoke all on function public.review_caregiver(uuid,boolean,text) from public, anon, authenticated;
grant execute on function public.review_caregiver(uuid,boolean,text) to authenticated;

commit;
