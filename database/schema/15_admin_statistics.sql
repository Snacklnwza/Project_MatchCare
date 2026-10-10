-- ID 19: สรุปจำนวนจากข้อมูลจริง ส่งเฉพาะยอดรวมให้แอดมิน
begin;
create function match_internal.get_admin_statistics()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
    raise exception using errcode='42501',message='admin_account_required';
  end if;
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'employers', (select count(*) from public.profiles where role='employer'),
    'caregivers', (select count(*) from public.profiles where role='caregiver'),
    'admins', (select count(*) from public.profiles where role='admin'),
    'verified_caregivers', (select count(*) from public.caregiver_profiles where verification_status='verified'),
    'pending_verifications', (select count(*) from public.caregiver_profiles where verification_status='pending'),
    'published_jobs', (select count(*) from public.job_posts where published_at is not null),
    'open_jobs', (select count(*) from public.job_posts where status='open'),
    'matched_jobs', (select count(*) from public.job_posts j where j.published_at is not null and exists(
      select 1 from public.match_requests r where r.job_post_id=j.id and r.status='accepted'
    )),
    'completed_jobs', (select count(*) from public.job_posts where status='completed'),
    'jobs_by_status', (select jsonb_object_agg(v.status,v.total) from (
      select s.status,count(j.id) total from (values('draft'),('open'),('closed'),('matched'),
        ('in_progress'),('completion_pending'),('completed'),('cancelled')) s(status)
      left join public.job_posts j on j.status=s.status group by s.status
    ) v),
    'updated_at', now()
  ) into result;
  return result || jsonb_build_object('match_rate',
    case when (result->>'published_jobs')::numeric=0 then 0
    else round(100*(result->>'matched_jobs')::numeric/(result->>'published_jobs')::numeric,1) end);
end;
$$;
revoke all on function match_internal.get_admin_statistics() from public,anon,authenticated;
grant execute on function match_internal.get_admin_statistics() to authenticated;
create or replace function public.get_admin_statistics()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select match_internal.get_admin_statistics();
$$;
revoke all on function public.get_admin_statistics() from public,anon,authenticated;
grant execute on function public.get_admin_statistics() to authenticated;
commit;
