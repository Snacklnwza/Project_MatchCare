begin;
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
commit;
