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


-- ระบบคำเชิญ

create table public.match_requests (
 id bigint generated always as identity primary key,
 job_post_id bigint not null references public.job_posts(id) on delete restrict,
 caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete restrict,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','not_selected')),
 created_at timestamptz not null default now(), responded_at timestamptz,
 unique(job_post_id,caregiver_id)
);
create unique index match_requests_one_accepted on public.match_requests(job_post_id) where status='accepted';
create index match_requests_caregiver_idx on public.match_requests(caregiver_id,created_at desc);
alter table public.match_requests enable row level security;
revoke all on public.match_requests from public,anon,authenticated;
grant select on public.match_requests to authenticated;
create policy match_requests_read on public.match_requests for select to authenticated using (
 caregiver_id=(select auth.uid()) or exists(select 1 from public.job_posts j where j.id=job_post_id and j.employer_id=(select auth.uid()))
);

create or replace function private.validate_job_post()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_check_patient boolean := true;
begin
  if tg_op = 'UPDATE' then
    v_check_patient := new.patient_id is distinct from old.patient_id
      or new.status is distinct from old.status;
  end if;

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress') then
    -- ทำงานให้สอดคล้องกับการปิดใช้งานผู้ป่วย และตรวจ `is_active` อีกครั้งหลังได้ล็อก
    perform 1 from public.patients
    where id = new.patient_id and employer_id = new.employer_id and is_active
    for share;
    if not found then
      raise exception using errcode = '23514', message = 'job_patient_must_be_active_and_owned';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'open') then
      raise exception using errcode = '23514',
        message = 'job_initial_status_invalid';
    end if;
  elsif new.status is distinct from old.status then
    if not (
      (old.status = 'draft' and new.status in ('open', 'closed'))
      or (old.status = 'open' and new.status = 'closed')
      or (old.status = 'open' and new.status = 'matched' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
    ) then
      raise exception using errcode = '23514',
        message = 'job_status_transition_invalid';
    end if;
  end if;

  if new.status = 'open' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  end if;

  return new;
end;
$$;

-- invite_caregiver: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.invite_caregiver(p_job_id bigint, p_caregiver_id uuid)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_job public.job_posts; v_id bigint;
begin
 select * into v_job from public.job_posts where id=p_job_id for update;
 if auth.uid() is null or v_job.employer_id is distinct from auth.uid() or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
 raise exception using errcode='42501',message='job_owner_required'; end if;
 if v_job.status<>'open' then raise exception 'job_not_open'; end if;
 perform 1 from public.caregiver_profiles cp join public.profiles p on p.id=cp.caregiver_id
 where cp.caregiver_id=p_caregiver_id and p.role='caregiver' and cp.verification_status='verified' and cp.availability_status='available' for share of cp;
 if not found then raise exception 'caregiver_not_eligible'; end if;
 insert into public.match_requests(job_post_id,caregiver_id) values(p_job_id,p_caregiver_id)
 on conflict(job_post_id,caregiver_id) do nothing returning id into v_id;
 if v_id is null then raise exception 'invitation_already_exists'; end if;
 return v_id;
end;
$fn$;
revoke all on function match_internal.invite_caregiver(bigint,uuid) from public, anon, authenticated;
grant execute on function match_internal.invite_caregiver(bigint,uuid) to authenticated;
create or replace function public.invite_caregiver(p_job_id bigint, p_caregiver_id uuid)
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.invite_caregiver(p_job_id, p_caregiver_id); $fn$;
revoke all on function public.invite_caregiver(bigint,uuid) from public, anon, authenticated;
grant execute on function public.invite_caregiver(bigint,uuid) to authenticated;

-- respond_to_invitation: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.respond_to_invitation(p_request_id bigint, p_accept boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_request public.match_requests; v_job public.job_posts; v_job_id bigint;
begin
 if auth.uid() is null or p_accept is null then raise exception using errcode='42501',message='caregiver_required'; end if;
 select job_post_id into v_job_id from public.match_requests where id=p_request_id and caregiver_id=auth.uid();
 if v_job_id is null then raise exception using errcode='42501',message='invitation_owner_required'; end if;
 -- ทุกคำตอบล็อกประกาศก่อนคำเชิญ เพื่อกันการตอบรับสองคนพร้อมกัน
 select * into v_job from public.job_posts where id=v_job_id for update;
 select * into v_request from public.match_requests where id=p_request_id for update;
 if v_request.status<>'pending' or v_job.status<>'open' then raise exception 'invitation_no_longer_open'; end if;
 if not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver') then raise exception using errcode='42501',message='caregiver_required'; end if;
 if p_accept then
   perform 1 from public.caregiver_profiles where caregiver_id=auth.uid() and verification_status='verified' and availability_status='available' for share;
   if not found then raise exception 'caregiver_not_eligible'; end if;
 end if;
 update public.match_requests set status=case when p_accept then 'accepted' else 'rejected' end,responded_at=now() where id=p_request_id;
 if p_accept then
   update public.job_posts set status='matched' where id=v_job_id;
   update public.match_requests set status='not_selected',responded_at=now() where job_post_id=v_job_id and status='pending';
 end if;
end;
$fn$;
revoke all on function match_internal.respond_to_invitation(bigint,boolean) from public, anon, authenticated;
grant execute on function match_internal.respond_to_invitation(bigint,boolean) to authenticated;
create or replace function public.respond_to_invitation(p_request_id bigint, p_accept boolean)
returns void language sql volatile security invoker set search_path = ''
as $fn$ select * from match_internal.respond_to_invitation(p_request_id, p_accept); $fn$;
revoke all on function public.respond_to_invitation(bigint,boolean) from public, anon, authenticated;
grant execute on function public.respond_to_invitation(bigint,boolean) to authenticated;

-- list_my_invitations: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.list_my_invitations()
returns table(request_id bigint, job_post_id bigint, caregiver_id uuid, title text, description text, province text, district text, starts_at timestamptz, ends_at timestamptz, pay_amount numeric, pay_unit text, status text, job_status text, caregiver_name text) language plpgsql stable security definer set search_path = ''
as $fn$

begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 return query select r.id,j.id,r.caregiver_id,j.title,j.description,j.province,j.district,j.starts_at,j.ends_at,j.pay_amount,j.pay_unit,r.status,j.status,concat_ws(' ',p.first_name,p.last_name)
 from public.match_requests r join public.job_posts j on j.id=r.job_post_id join public.profiles p on p.id=r.caregiver_id
 where (r.caregiver_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='caregiver'))
 or (j.employer_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='employer'))
 order by r.created_at desc,r.id desc;
end;
$fn$;
revoke all on function match_internal.list_my_invitations() from public, anon, authenticated;
grant execute on function match_internal.list_my_invitations() to authenticated;
create or replace function public.list_my_invitations()
returns table(request_id bigint, job_post_id bigint, caregiver_id uuid, title text, description text, province text, district text, starts_at timestamptz, ends_at timestamptz, pay_amount numeric, pay_unit text, status text, job_status text, caregiver_name text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_my_invitations(); $fn$;
revoke all on function public.list_my_invitations() from public, anon, authenticated;
grant execute on function public.list_my_invitations() to authenticated;

-- get_match_contact: ตรวจสิทธิ์ภายในก่อนอ่านหรือเปลี่ยนข้อมูล
create or replace function match_internal.get_match_contact(p_request_id bigint)
returns table(display_name text, phone text, line_id text, province text, district text, subdistrict text, address_detail text) language plpgsql stable security definer set search_path = ''
as $fn$

declare v_request public.match_requests; v_job public.job_posts; v_other uuid;
begin
 select * into v_request from public.match_requests where id=p_request_id;
 select * into v_job from public.job_posts where id=v_request.job_post_id;
 if auth.uid() is null or v_request.status is distinct from 'accepted' or (auth.uid() is distinct from v_request.caregiver_id and auth.uid() is distinct from v_job.employer_id) then
 raise exception using errcode='42501',message='accepted_match_required'; end if;
 v_other:=case when auth.uid()=v_request.caregiver_id then v_job.employer_id else v_request.caregiver_id end;
 return query select concat_ws(' ',p.first_name,p.last_name),p.phone,p.line_id,v_job.province,v_job.district,v_job.subdistrict,v_job.address_detail from public.profiles p where p.id=v_other;
end;
$fn$;
revoke all on function match_internal.get_match_contact(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_match_contact(bigint) to authenticated;
create or replace function public.get_match_contact(p_request_id bigint)
returns table(display_name text, phone text, line_id text, province text, district text, subdistrict text, address_detail text) language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_match_contact(p_request_id); $fn$;
revoke all on function public.get_match_contact(bigint) from public, anon, authenticated;
grant execute on function public.get_match_contact(bigint) to authenticated;

-- เมื่อปิดประกาศ ยุติคำเชิญค้างด้วย
create or replace function private.close_pending_invitations() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='closed' and old.status is distinct from new.status then
 update public.match_requests set status='not_selected',responded_at=now() where job_post_id=new.id and status='pending';
 end if; return new;
end; $$;
revoke all on function private.close_pending_invitations() from public,anon,authenticated;
create trigger job_close_invitations after update of status on public.job_posts for each row execute function private.close_pending_invitations();
commit;
