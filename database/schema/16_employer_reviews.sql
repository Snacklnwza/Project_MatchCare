-- ผู้ดูแลรีวิวผู้ว่าจ้างหลังงานจบ แยกจากรีวิวผู้ดูแลเพื่อเก็บข้อมูลเดิมไว้ครบ
begin;
create table public.employer_reviews (
  id bigint generated always as identity primary key,
  job_post_id bigint not null unique references public.job_posts(id) on delete restrict,
  employer_id uuid not null references public.profiles(id) on delete restrict,
  caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);
create index employer_reviews_employer_created_idx on public.employer_reviews(employer_id, created_at desc, id desc);
alter table public.employer_reviews enable row level security;
revoke all on public.employer_reviews from public, anon, authenticated;
grant select on public.employer_reviews to authenticated;
create policy employer_reviews_select_participant on public.employer_reviews for select to authenticated
using (employer_id = (select auth.uid()) or caregiver_id = (select auth.uid()));

create or replace function match_internal.submit_employer_review(p_job_id bigint, p_rating integer, p_comment text default '')
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$
declare v_job public.job_posts; v_id bigint; v_comment text := btrim(coalesce(p_comment, ''));
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id = auth.uid() and role = 'caregiver') then
    raise exception using errcode = '42501', message = 'caregiver_required';
  end if;
  select * into v_job from public.job_posts where id = p_job_id for share;
  if not found or not exists(select 1 from public.match_requests r
    where r.job_post_id = p_job_id and r.caregiver_id = auth.uid() and r.status = 'accepted') then
    raise exception using errcode = '42501', message = 'accepted_match_required';
  end if;
  if v_job.status <> 'completed' then raise exception 'review_requires_completed_job'; end if;
  if p_rating is null or p_rating not between 1 and 5 or char_length(v_comment) > 1000 then
    raise exception using errcode = '22023', message = 'invalid_job_review';
  end if;
  insert into public.employer_reviews(job_post_id, employer_id, caregiver_id, rating, comment)
  values(p_job_id, v_job.employer_id, auth.uid(), p_rating, v_comment)
  on conflict(job_post_id) do nothing returning id into v_id;
  if v_id is null then raise exception 'job_already_reviewed'; end if;
  return v_id;
end;
$fn$;
revoke all on function match_internal.submit_employer_review(bigint, integer, text) from public, anon, authenticated;
grant execute on function match_internal.submit_employer_review(bigint, integer, text) to authenticated;
create or replace function public.submit_employer_review(p_job_id bigint, p_rating integer, p_comment text default '')
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select match_internal.submit_employer_review(p_job_id, p_rating, p_comment); $fn$;
revoke all on function public.submit_employer_review(bigint, integer, text) from public, anon, authenticated;
grant execute on function public.submit_employer_review(bigint, integer, text) to authenticated;

-- คู่สัญญาเห็นรีวิวของงานตนเอง แม้ผู้ว่าจ้างปิดประกาศภายหลัง
create or replace function match_internal.get_job_employer_review(p_job_id bigint)
returns table(rating smallint, comment text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $fn$
begin
  if auth.uid() is null or not exists (
    select 1 from public.match_requests r join public.job_posts j on j.id = r.job_post_id
    join public.profiles me on me.id = auth.uid()
    where j.id = p_job_id and r.status = 'accepted'
      and ((me.role = 'employer' and j.employer_id = me.id) or (me.role = 'caregiver' and r.caregiver_id = me.id))
  ) then raise exception using errcode = '42501', message = 'job_participant_required'; end if;
  return query select r.rating, r.comment, r.created_at from public.employer_reviews r where r.job_post_id = p_job_id;
end;
$fn$;
revoke all on function match_internal.get_job_employer_review(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_job_employer_review(bigint) to authenticated;
create or replace function public.get_job_employer_review(p_job_id bigint)
returns table(rating smallint, comment text, created_at timestamptz)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_job_employer_review(p_job_id); $fn$;
revoke all on function public.get_job_employer_review(bigint) from public, anon, authenticated;
grant execute on function public.get_job_employer_review(bigint) to authenticated;

-- ให้ผู้ดูแลเห็นชื่อเสียงผู้ว่าจ้างก่อนตอบรับหรือสมัคร โดยไม่ส่งรหัสบัญชีและข้อมูลส่วนตัว
create or replace function match_internal.get_job_employer_reputation(p_job_id bigint)
returns table(average_rating numeric, review_count bigint, reviews jsonb)
language plpgsql stable security definer set search_path = ''
as $fn$
declare v_employer uuid;
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id = auth.uid() and role = 'caregiver') then
    raise exception using errcode = '42501', message = 'caregiver_required';
  end if;
  select j.employer_id into v_employer from public.job_posts j where j.id = p_job_id
    and (j.status = 'open' or exists(select 1 from public.match_requests r
      where r.job_post_id = j.id and r.caregiver_id = auth.uid() and r.status = 'accepted'));
  if v_employer is null then raise exception using errcode = '42501', message = 'job_not_visible'; end if;
  return query
  select round(coalesce(avg(r.rating), 0), 1), count(*),
    coalesce((select jsonb_agg(to_jsonb(latest) order by latest.created_at desc, latest.id desc)
      from (select x.id, x.rating, x.comment, x.created_at
        from public.employer_reviews x where x.employer_id = v_employer
        order by x.created_at desc, x.id desc limit 5) latest), '[]'::jsonb)
  from public.employer_reviews r where r.employer_id = v_employer;
end;
$fn$;
revoke all on function match_internal.get_job_employer_reputation(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_job_employer_reputation(bigint) to authenticated;
create or replace function public.get_job_employer_reputation(p_job_id bigint)
returns table(average_rating numeric, review_count bigint, reviews jsonb)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_job_employer_reputation(p_job_id); $fn$;
revoke all on function public.get_job_employer_reputation(bigint) from public, anon, authenticated;
grant execute on function public.get_job_employer_reputation(bigint) to authenticated;
commit;
