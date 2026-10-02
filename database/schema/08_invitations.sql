-- ระบบคำเชิญ: สิทธิ์เปลี่ยนสถานะอยู่ใน RPC เท่านั้น
begin;
create table public.match_requests (
 id bigint generated always as identity primary key,
 job_post_id bigint not null references public.job_posts(id) on delete restrict,
 caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete restrict,
 request_type text not null default 'invitation' check(request_type in ('invitation','application')),
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

  if v_check_patient and new.status in ('draft', 'open', 'matched', 'in_progress', 'completion_pending') then
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
      or (old.status = 'matched' and new.status = 'in_progress' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
      or (old.status = 'in_progress' and new.status = 'completion_pending' and exists (
        select 1 from public.match_requests r where r.job_post_id=new.id and r.status='accepted'
      ))
      or (old.status = 'completion_pending' and new.status = 'completed' and exists (
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
 if v_id is null then
   if exists(select 1 from public.match_requests where job_post_id=p_job_id and caregiver_id=p_caregiver_id and request_type='application') then
     raise exception 'application_already_exists';
   end if;
   raise exception 'invitation_already_exists';
 end if;
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
 if v_request.request_type<>'invitation' or v_request.status<>'pending' or v_job.status<>'open' then raise exception 'invitation_no_longer_open'; end if;
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
 where r.request_type='invitation' and (
   (r.caregiver_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='caregiver'))
   or (j.employer_id=auth.uid() and exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='employer'))
 )
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

-- ผู้ดูแลสมัครงานได้เฉพาะประกาศเปิดรับและบัญชีที่ผ่านการตรวจสอบ
create or replace function match_internal.submit_application(p_job_id bigint)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$
declare v_job public.job_posts; v_id bigint;
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='caregiver'
 ) then
   raise exception using errcode='42501',message='caregiver_required';
 end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if v_job.status is distinct from 'open' then raise exception 'job_not_open'; end if;
 perform 1 from public.caregiver_profiles
 where caregiver_id=auth.uid() and verification_status='verified'
   and availability_status='available' for share;
 if not found then raise exception 'caregiver_not_eligible'; end if;
 insert into public.match_requests(job_post_id,caregiver_id,request_type)
 values(p_job_id,auth.uid(),'application')
 on conflict(job_post_id,caregiver_id) do nothing returning id into v_id;
 if v_id is null then raise exception 'request_already_exists'; end if;
 return v_id;
end;
$fn$;
revoke all on function match_internal.submit_application(bigint) from public,anon,authenticated;
grant execute on function match_internal.submit_application(bigint) to authenticated;
create or replace function public.submit_application(p_job_id bigint)
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select match_internal.submit_application(p_job_id); $fn$;
revoke all on function public.submit_application(bigint) from public,anon,authenticated;
grant execute on function public.submit_application(bigint) to authenticated;

-- รายการใบสมัครของผู้ดูแล แสดงข้อมูลประกาศเท่าที่จำเป็น
create or replace function match_internal.list_my_applications()
returns table(request_id bigint,job_post_id bigint,title text,province text,district text,
 starts_at timestamptz,ends_at timestamptz,pay_amount numeric,pay_unit text,
 status text,job_status text,created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $fn$
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='caregiver'
 ) then
   raise exception using errcode='42501',message='caregiver_required';
 end if;
 return query
 select r.id,j.id,j.title,j.province,j.district,j.starts_at,j.ends_at,
   j.pay_amount,j.pay_unit,r.status,j.status,r.created_at
 from public.match_requests r
 join public.job_posts j on j.id=r.job_post_id
 where r.caregiver_id=auth.uid() and r.request_type='application'
 order by r.created_at desc,r.id desc;
end;
$fn$;
revoke all on function match_internal.list_my_applications() from public,anon,authenticated;
grant execute on function match_internal.list_my_applications() to authenticated;
create or replace function public.list_my_applications()
returns table(request_id bigint,job_post_id bigint,title text,province text,district text,
 starts_at timestamptz,ends_at timestamptz,pay_amount numeric,pay_unit text,
 status text,job_status text,created_at timestamptz)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_my_applications(); $fn$;
revoke all on function public.list_my_applications() from public,anon,authenticated;
grant execute on function public.list_my_applications() to authenticated;

-- ผู้ว่าจ้างเห็นใบสมัครของประกาศตนเอง พร้อมข้อมูลสาธารณะสำหรับพิจารณา
create or replace function match_internal.list_received_applications()
returns table(request_id bigint,job_post_id bigint,caregiver_id uuid,title text,
 description text,province text,district text,starts_at timestamptz,
 ends_at timestamptz,pay_amount numeric,pay_unit text,status text,
 job_status text,caregiver_name text,bio text,experience_years smallint,
 caregiver_skills jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $fn$
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='employer'
 ) then
   raise exception using errcode='42501',message='employer_required';
 end if;
 return query
 select r.id,j.id,r.caregiver_id,j.title,j.description,j.province,j.district,
   j.starts_at,j.ends_at,j.pay_amount,j.pay_unit,r.status,j.status,
   -- ข้อความอิสระอาจมีเบอร์หรือ LINE ใช้ RPC ข้อมูลติดต่อหลังจับคู่แทน
   concat_ws(' ',p.first_name,p.last_name),null::text,cp.experience_years,
   coalesce((select jsonb_agg(s.name order by s.name)
     from public.caregiver_skills cs join public.skills s on s.id=cs.skill_id
     where cs.caregiver_id=r.caregiver_id),'[]'::jsonb),r.created_at
 from public.match_requests r
 join public.job_posts j on j.id=r.job_post_id
 join public.profiles p on p.id=r.caregiver_id
 join public.caregiver_profiles cp on cp.caregiver_id=r.caregiver_id
 where j.employer_id=auth.uid() and r.request_type='application'
 order by r.created_at desc,r.id desc;
end;
$fn$;
revoke all on function match_internal.list_received_applications() from public,anon,authenticated;
grant execute on function match_internal.list_received_applications() to authenticated;
create or replace function public.list_received_applications()
returns table(request_id bigint,job_post_id bigint,caregiver_id uuid,title text,
 description text,province text,district text,starts_at timestamptz,
 ends_at timestamptz,pay_amount numeric,pay_unit text,status text,
 job_status text,caregiver_name text,bio text,experience_years smallint,
 caregiver_skills jsonb,created_at timestamptz)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_received_applications(); $fn$;
revoke all on function public.list_received_applications() from public,anon,authenticated;
grant execute on function public.list_received_applications() to authenticated;

-- ล็อกประกาศก่อนใบสมัคร เช่นเดียวกับการตอบรับคำเชิญ เพื่อให้ผลตัดสินเป็นชุดเดียว
create or replace function match_internal.respond_to_application(p_request_id bigint,p_accept boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$
declare v_job public.job_posts; v_request public.match_requests; v_job_id bigint;
begin
 if auth.uid() is null or p_accept is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='employer'
 ) then
   raise exception using errcode='42501',message='employer_required';
 end if;
 select r.job_post_id into v_job_id
 from public.match_requests r join public.job_posts j on j.id=r.job_post_id
 where r.id=p_request_id and r.request_type='application' and j.employer_id=auth.uid();
 if v_job_id is null then
   raise exception using errcode='42501',message='application_owner_required';
 end if;
 select * into v_job from public.job_posts where id=v_job_id for update;
 select * into v_request from public.match_requests where id=p_request_id for update;
 if v_request.request_type is distinct from 'application'
   or v_request.status is distinct from 'pending'
   or v_job.status is distinct from 'open' then
   raise exception 'application_no_longer_open';
 end if;
 if p_accept then
   perform 1 from public.caregiver_profiles
   where caregiver_id=v_request.caregiver_id and verification_status='verified'
     and availability_status='available' for share;
   if not found then raise exception 'caregiver_not_eligible'; end if;
 end if;
 update public.match_requests
 set status=case when p_accept then 'accepted' else 'rejected' end,
   responded_at=now()
 where id=p_request_id;
 if p_accept then
   update public.job_posts set status='matched' where id=v_job_id;
   update public.match_requests set status='not_selected',responded_at=now()
   where job_post_id=v_job_id and status='pending';
 end if;
end;
$fn$;
revoke all on function match_internal.respond_to_application(bigint,boolean) from public,anon,authenticated;
grant execute on function match_internal.respond_to_application(bigint,boolean) to authenticated;
create or replace function public.respond_to_application(p_request_id bigint,p_accept boolean)
returns void language sql volatile security invoker set search_path = ''
as $fn$ select match_internal.respond_to_application(p_request_id,p_accept); $fn$;
revoke all on function public.respond_to_application(bigint,boolean) from public,anon,authenticated;
grant execute on function public.respond_to_application(bigint,boolean) to authenticated;

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

-- เริ่มงานได้เมื่อเจ้าของประกาศมีผู้ดูแลตอบรับแล้ว
create or replace function match_internal.start_matched_job(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or v_job.employer_id is distinct from auth.uid()
   or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
   raise exception using errcode='42501',message='job_owner_required';
 end if;
 if v_job.status <> 'matched' then raise exception 'job_not_ready_to_start'; end if;
 if not exists(select 1 from public.match_requests where job_post_id=p_job_id and status='accepted') then
   raise exception using errcode='23514',message='accepted_match_required';
 end if;
 update public.job_posts set status='in_progress',started_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.start_matched_job(bigint) from public,anon,authenticated;
grant execute on function match_internal.start_matched_job(bigint) to authenticated;
create or replace function public.start_matched_job(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.start_matched_job(p_job_id); $fn$;
revoke all on function public.start_matched_job(bigint) from public,anon,authenticated;
grant execute on function public.start_matched_job(bigint) to authenticated;

-- ผู้ดูแลแจ้งจบงานของคู่ที่ตอบรับแล้ว
create or replace function match_internal.request_job_completion(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver')
   or not exists(select 1 from public.match_requests where job_post_id=p_job_id and caregiver_id=auth.uid() and status='accepted') then
   raise exception using errcode='42501',message='accepted_caregiver_required';
 end if;
 if v_job.status <> 'in_progress' then raise exception 'job_not_in_progress'; end if;
 update public.job_posts set status='completion_pending',completion_requested_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.request_job_completion(bigint) from public,anon,authenticated;
grant execute on function match_internal.request_job_completion(bigint) to authenticated;
create or replace function public.request_job_completion(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.request_job_completion(p_job_id); $fn$;
revoke all on function public.request_job_completion(bigint) from public,anon,authenticated;
grant execute on function public.request_job_completion(bigint) to authenticated;

-- ผู้ว่าจ้างเจ้าของประกาศยืนยันปิดงาน
create or replace function match_internal.confirm_job_completion(p_job_id bigint)
returns bigint language plpgsql security definer set search_path = '' as $fn$
declare v_job public.job_posts;
begin
 if auth.uid() is null then raise exception using errcode='42501',message='login_required'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if not found or v_job.employer_id is distinct from auth.uid()
   or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
   raise exception using errcode='42501',message='job_owner_required';
 end if;
 if v_job.status <> 'completion_pending' then raise exception 'job_completion_not_pending'; end if;
 if v_job.completion_requested_at is null then raise exception using errcode='23514',message='completion_request_required'; end if;
 update public.job_posts set status='completed',completed_at=now() where id=p_job_id;
 return p_job_id;
end;
$fn$;
revoke all on function match_internal.confirm_job_completion(bigint) from public,anon,authenticated;
grant execute on function match_internal.confirm_job_completion(bigint) to authenticated;
create or replace function public.confirm_job_completion(p_job_id bigint)
returns bigint language sql security invoker set search_path=pg_catalog
as $fn$ select match_internal.confirm_job_completion(p_job_id); $fn$;
revoke all on function public.confirm_job_completion(bigint) from public,anon,authenticated;
grant execute on function public.confirm_job_completion(bigint) to authenticated;
commit;
