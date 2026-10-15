create or replace function match_internal.get_my_work_details(p_request_id bigint)
returns jsonb language plpgsql stable security definer set search_path = ''
as $fn$
declare v_details jsonb; v_request public.match_requests; v_status text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'caregiver'
  ) then raise exception using errcode = '42501', message = 'caregiver_required'; end if;
  select * into v_request from public.match_requests
  where id = p_request_id and caregiver_id = auth.uid();
  if not found then raise exception using errcode = '42501', message = 'request_owner_required'; end if;

  select j.status, jsonb_build_object(
    'job_id', j.id, 'title', j.title, 'description', j.description,
    'care_summary', j.care_summary, 'health_visible', false,
    'required_skills', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name) order by s.name)
      from public.job_required_skills js join public.skills s on s.id = js.skill_id
      where js.job_post_id = j.id
    ), '[]'::jsonb)
  ) into v_status, v_details from public.job_posts j where j.id = v_request.job_post_id;

  if v_request.status = 'accepted' then
    return v_details || (match_internal.get_matched_patient_details(p_request_id) - 'required_skills')
      || jsonb_build_object('health_visible', true);
  elsif v_request.status = 'pending' and v_status = 'open' then
    return v_details || match_internal.get_open_job_details(v_request.job_post_id)
      || jsonb_build_object('health_visible', true);
  end if;
  return v_details;
end;
$fn$;
revoke all on function match_internal.get_my_work_details(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_my_work_details(bigint) to authenticated;

create or replace function public.get_my_work_details(p_request_id bigint)
returns jsonb language sql stable security invoker set search_path = ''
as $fn$ select match_internal.get_my_work_details(p_request_id); $fn$;
revoke all on function public.get_my_work_details(bigint) from public, anon, authenticated;
grant execute on function public.get_my_work_details(bigint) to authenticated;
