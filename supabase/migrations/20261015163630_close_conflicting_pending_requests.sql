begin;

create or replace function match_internal.close_conflicting_requests(p_caregiver_id uuid, p_job_id bigint)
returns void language sql volatile security invoker set search_path = '' as $$
  update public.match_requests r
  set status = 'not_selected', responded_at = now()
  from public.job_posts candidate, public.job_posts booked
  where booked.id = p_job_id and booked.status in ('matched', 'in_progress', 'completion_pending')
    and r.caregiver_id = p_caregiver_id and r.status = 'pending'
    and candidate.id = r.job_post_id and candidate.id <> booked.id and candidate.status = 'open'
    and candidate.starts_at < booked.ends_at and candidate.ends_at > booked.starts_at;
$$;

revoke all on function match_internal.close_conflicting_requests(uuid,bigint) from public,anon,authenticated;

create or replace function match_internal.invite_caregiver(p_job_id bigint, p_caregiver_id uuid)
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_job public.job_posts; v_id bigint;
begin
 select * into v_job from public.job_posts where id=p_job_id;
 if auth.uid() is null or v_job.employer_id is distinct from auth.uid() or not exists(select 1 from public.profiles where id=auth.uid() and role='employer') then
 raise exception using errcode='42501',message='job_owner_required'; end if;
 perform 1 from public.caregiver_profiles where caregiver_id=p_caregiver_id for update;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if v_job.status<>'open' then raise exception 'job_not_open'; end if;
 perform 1 from public.caregiver_profiles cp join public.profiles p on p.id=cp.caregiver_id
 where cp.caregiver_id=p_caregiver_id and p.role='caregiver' and cp.verification_status='verified' and cp.availability_status='available' for share of cp;
 if not found then raise exception 'caregiver_not_eligible'; end if;
 if match_internal.caregiver_has_conflict(p_caregiver_id,v_job.starts_at,v_job.ends_at,p_job_id) then
   raise exception 'caregiver_schedule_conflict';
 end if;
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
 perform 1 from public.caregiver_profiles
 where caregiver_id=auth.uid() and verification_status='verified'
   and availability_status='available' for update;
 if not found then raise exception 'caregiver_not_eligible'; end if;
 select * into v_job from public.job_posts where id=p_job_id for update;
 if v_job.status is distinct from 'open' then raise exception 'job_not_open'; end if;
 if match_internal.caregiver_has_conflict(auth.uid(),v_job.starts_at,v_job.ends_at,p_job_id) then
   raise exception 'caregiver_schedule_conflict';
 end if;
 insert into public.match_requests(job_post_id,caregiver_id,request_type)
 values(p_job_id,auth.uid(),'application')
 on conflict(job_post_id,caregiver_id) do nothing returning id into v_id;
 if v_id is null then raise exception 'request_already_exists'; end if;
 return v_id;
end;
$fn$;

create or replace function match_internal.respond_to_invitation(p_request_id bigint, p_accept boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$

declare v_request public.match_requests; v_job public.job_posts; v_job_id bigint;
begin
 if auth.uid() is null or p_accept is null then raise exception using errcode='42501',message='caregiver_required'; end if;
 select job_post_id into v_job_id from public.match_requests where id=p_request_id and caregiver_id=auth.uid();
 if v_job_id is null then raise exception using errcode='42501',message='invitation_owner_required'; end if;
 -- ล็อกผู้ดูแลก่อนประกาศและคำขอ ให้การรับงานกับการยุติคำขอทับเวลาทำตามลำดับเดียวกัน
 perform 1 from public.caregiver_profiles where caregiver_id=auth.uid() for update;
 select * into v_job from public.job_posts where id=v_job_id for update;
 select * into v_request from public.match_requests where id=p_request_id for update;
 if v_request.request_type<>'invitation' or v_request.status<>'pending' or v_job.status<>'open'
 then raise exception 'invitation_no_longer_open'; end if;
 if not exists(select 1 from public.profiles where id=auth.uid() and role='caregiver')
 then raise exception using errcode='42501',message='caregiver_required'; end if;
 if p_accept then
   perform 1 from public.caregiver_profiles
   where caregiver_id=auth.uid() and verification_status='verified' and availability_status='available' for update;
   if not found then raise exception 'caregiver_not_eligible'; end if;
 end if;
 update public.match_requests set status=case when p_accept then 'accepted' else 'rejected' end,responded_at=now() where id=p_request_id;
 if p_accept then
   update public.job_posts set status='matched' where id=v_job_id;
   update public.match_requests set status='not_selected',responded_at=now() where job_post_id=v_job_id and status='pending';
   perform match_internal.close_conflicting_requests(v_request.caregiver_id, v_job_id);
 end if;
end;
$fn$;

create or replace function match_internal.respond_to_application(p_request_id bigint,p_accept boolean)
returns void language plpgsql volatile security definer set search_path = ''
as $fn$
declare v_job public.job_posts; v_request public.match_requests; v_job_id bigint; v_caregiver uuid;
begin
 if auth.uid() is null or p_accept is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='employer'
 ) then
   raise exception using errcode='42501',message='employer_required';
 end if;
 select r.job_post_id,r.caregiver_id into v_job_id,v_caregiver
 from public.match_requests r join public.job_posts j on j.id=r.job_post_id
 where r.id=p_request_id and r.request_type='application' and j.employer_id=auth.uid();
 if v_job_id is null then
   raise exception using errcode='42501',message='application_owner_required';
 end if;
 perform 1 from public.caregiver_profiles where caregiver_id=v_caregiver for update;
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
     and availability_status='available' for update;
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
   perform match_internal.close_conflicting_requests(v_request.caregiver_id, v_job_id);
 end if;
end;
$fn$;

create or replace function private.notify_match_request() returns trigger
language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; recipient uuid; heading text; page text;
begin
  if tg_op='UPDATE' and new.status is not distinct from old.status then return new; end if;
  select employer_id into owner_id from public.job_posts where id=new.job_post_id;
  if tg_op='INSERT' then
    recipient := case when new.request_type='application' then owner_id else new.caregiver_id end;
    heading := case when new.request_type='application' then 'มีใบสมัครงานใหม่' else 'คุณได้รับคำเชิญให้ดูแลงาน' end;
  elsif new.status='accepted' then
    -- การตอบรับทำให้ job เปลี่ยนเป็น matched ด้วย ใช้แจ้งเตือนฝั่ง job ครั้งเดียว
    return new;
  elsif new.status='rejected' then
    recipient := case when new.request_type='application' then new.caregiver_id else owner_id end;
    heading := case when new.request_type='application' then 'ใบสมัครของคุณไม่ได้รับการตอบรับ' else 'ผู้ดูแลปฏิเสธคำเชิญ' end;
  elsif new.status='not_selected' then
    recipient := new.caregiver_id;
    heading := 'คำขอสมัครงานหรือคำเชิญนี้สิ้นสุดแล้ว';
  else return new;
  end if;
  page := case when recipient=owner_id then
    case when new.request_type='application' then 'receivedApplications' else 'invitations' end
    else case when new.request_type='application' then 'applications' else 'invitations' end end;
  insert into public.notifications(recipient_id,source_type,source_id,event,title,target_page)
  values(recipient,'request',new.id,new.status,heading,page) on conflict do nothing;
  if new.status = 'not_selected' and owner_id <> recipient then
    insert into public.notifications(recipient_id,source_type,source_id,event,title,target_page)
    values(owner_id,'request',new.id,new.status,heading,
      case when new.request_type='application' then 'receivedApplications' else 'invitations' end)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

update public.match_requests pending
set status='not_selected', responded_at=now()
from public.job_posts candidate
where pending.status='pending' and candidate.id=pending.job_post_id
  and exists (
    select 1 from public.match_requests accepted
    join public.job_posts booked on booked.id=accepted.job_post_id
    where accepted.caregiver_id=pending.caregiver_id and accepted.status='accepted'
      and booked.status in ('matched','in_progress','completion_pending')
      and booked.starts_at<candidate.ends_at and booked.ends_at>candidate.starts_at
  );

commit;
