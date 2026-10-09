-- ประวัติงานของคู่ที่ตอบรับแล้ว รวมทั้งใบสมัครและคำเชิญ
-- ไม่คืนชื่อผู้ป่วย ที่อยู่ละเอียด หรือข้อมูลติดต่อในรายการประวัติ
begin;

create or replace function match_internal.list_job_history(
  p_status text default 'all', p_offset integer default 0
)
returns table (
  request_id bigint, job_post_id bigint, title text, job_status text,
  counterpart_name text, province text, district text,
  starts_at timestamptz, ends_at timestamptz, pay_amount numeric,
  pay_unit text, matched_at timestamptz, completed_at timestamptz,
  cancelled_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $fn$
declare v_user uuid := auth.uid(); v_role text;
begin
  select p.role into v_role from public.profiles p where p.id = v_user;
  if v_user is null or v_role is null or v_role not in ('employer', 'caregiver') then
    raise exception using errcode = '42501', message = 'job_participant_required';
  end if;
  if p_status is null or p_status not in ('all', 'active', 'completed', 'cancelled')
    or p_offset is null or p_offset < 0 then
    raise exception using errcode = '22023', message = 'invalid_history_filter';
  end if;
  return query
  select r.id, j.id, j.title, j.status, concat_ws(' ', other.first_name, other.last_name),
    j.province, j.district, j.starts_at, j.ends_at, j.pay_amount, j.pay_unit,
    r.responded_at, j.completed_at, j.cancelled_at
  from public.match_requests r
  join public.job_posts j on j.id = r.job_post_id
  join public.profiles other on other.id = case
    when v_role = 'employer' then r.caregiver_id else j.employer_id end
  where r.status = 'accepted'
    and ((v_role = 'employer' and j.employer_id = v_user)
      or (v_role = 'caregiver' and r.caregiver_id = v_user))
    and j.status in ('matched', 'in_progress', 'completion_pending', 'completed', 'cancelled')
    and (p_status = 'all' or j.status = p_status
      or (p_status = 'active' and j.status in ('matched', 'in_progress', 'completion_pending')))
  order by coalesce(j.completed_at, j.cancelled_at, r.responded_at, j.created_at) desc, j.id desc
  limit 21 offset p_offset;
end;
$fn$;
revoke all on function match_internal.list_job_history(text, integer) from public, anon, authenticated;
grant execute on function match_internal.list_job_history(text, integer) to authenticated;

create or replace function public.list_job_history(p_status text default 'all', p_offset integer default 0)
returns table (
  request_id bigint, job_post_id bigint, title text, job_status text,
  counterpart_name text, province text, district text,
  starts_at timestamptz, ends_at timestamptz, pay_amount numeric,
  pay_unit text, matched_at timestamptz, completed_at timestamptz,
  cancelled_at timestamptz
)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.list_job_history(p_status, p_offset); $fn$;
revoke all on function public.list_job_history(text, integer) from public, anon, authenticated;
grant execute on function public.list_job_history(text, integer) to authenticated;

-- ตรวจคู่สัญญาใหม่ทุกครั้งที่เปิดรายละเอียด ไม่รับบทบาทจากหน้าเว็บ
create or replace function match_internal.get_job_history_details(p_job_id bigint)
returns table (
  job_post_id bigint, description text, care_summary text, required_skills jsonb,
  started_at timestamptz, completion_requested_at timestamptz, completed_at timestamptz,
  cancellation_reason text, cancelled_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $fn$
begin
  if auth.uid() is null or not exists (
    select 1 from public.match_requests r
    join public.job_posts j on j.id = r.job_post_id
    join public.profiles me on me.id = auth.uid()
    where j.id = p_job_id and r.status = 'accepted'
      and ((me.role = 'employer' and j.employer_id = me.id)
        or (me.role = 'caregiver' and r.caregiver_id = me.id))
  ) then
    raise exception using errcode = '42501', message = 'job_participant_required';
  end if;
  return query select j.id, j.description, j.care_summary,
    coalesce((select jsonb_agg(s.name order by s.name)
      from public.job_required_skills js join public.skills s on s.id = js.skill_id
      where js.job_post_id = j.id), '[]'::jsonb),
    j.started_at, j.completion_requested_at, j.completed_at, j.cancellation_reason, j.cancelled_at
  from public.job_posts j where j.id = p_job_id;
end;
$fn$;
revoke all on function match_internal.get_job_history_details(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_job_history_details(bigint) to authenticated;
create or replace function public.get_job_history_details(p_job_id bigint)
returns table (
  job_post_id bigint, description text, care_summary text, required_skills jsonb,
  started_at timestamptz, completion_requested_at timestamptz, completed_at timestamptz,
  cancellation_reason text, cancelled_at timestamptz
)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_job_history_details(p_job_id); $fn$;
revoke all on function public.get_job_history_details(bigint) from public, anon, authenticated;
grant execute on function public.get_job_history_details(bigint) to authenticated;
commit;
