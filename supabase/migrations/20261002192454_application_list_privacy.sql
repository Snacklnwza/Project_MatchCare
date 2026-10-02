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
