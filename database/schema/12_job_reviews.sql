-- รีวิวจากผู้ว่าจ้างหลังยืนยันจบงาน หนึ่งงานเขียนได้ครั้งเดียว
begin;
create table public.job_reviews (
  id bigint generated always as identity primary key,
  job_post_id bigint not null unique references public.job_posts(id) on delete restrict,
  employer_id uuid not null references public.profiles(id) on delete restrict,
  caregiver_id uuid not null references public.caregiver_profiles(caregiver_id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);
create index job_reviews_caregiver_created_idx on public.job_reviews(caregiver_id, created_at desc, id desc);
create index job_reviews_employer_idx on public.job_reviews(employer_id);
alter table public.job_reviews enable row level security;
revoke all on public.job_reviews from public, anon, authenticated;
grant select on public.job_reviews to authenticated;
create policy job_reviews_select_participant on public.job_reviews for select to authenticated
using (employer_id = (select auth.uid()) or caregiver_id = (select auth.uid()));

create or replace function match_internal.submit_job_review(p_job_id bigint, p_rating integer, p_comment text default '')
returns bigint language plpgsql volatile security definer set search_path = ''
as $fn$
declare v_job public.job_posts; v_caregiver uuid; v_id bigint; v_comment text := btrim(coalesce(p_comment, ''));
begin
  if auth.uid() is null or not exists(select 1 from public.profiles where id = auth.uid() and role = 'employer') then
    raise exception using errcode = '42501', message = 'employer_required';
  end if;
  select * into v_job from public.job_posts where id = p_job_id for share;
  if not found or v_job.employer_id is distinct from auth.uid() then
    raise exception using errcode = '42501', message = 'job_owner_required';
  end if;
  if v_job.status <> 'completed' then raise exception 'review_requires_completed_job'; end if;
  select r.caregiver_id into v_caregiver from public.match_requests r
    where r.job_post_id = p_job_id and r.status = 'accepted';
  if v_caregiver is null then raise exception 'accepted_match_required'; end if;
  if p_rating is null or p_rating not between 1 and 5 or char_length(v_comment) > 1000 then
    raise exception using errcode = '22023', message = 'invalid_job_review';
  end if;
  insert into public.job_reviews(job_post_id, employer_id, caregiver_id, rating, comment)
  values(p_job_id, auth.uid(), v_caregiver, p_rating, v_comment)
  on conflict(job_post_id) do nothing returning id into v_id;
  if v_id is null then raise exception 'job_already_reviewed'; end if;
  return v_id;
end;
$fn$;
revoke all on function match_internal.submit_job_review(bigint, integer, text) from public, anon, authenticated;
grant execute on function match_internal.submit_job_review(bigint, integer, text) to authenticated;
create or replace function public.submit_job_review(p_job_id bigint, p_rating integer, p_comment text default '')
returns bigint language sql volatile security invoker set search_path = ''
as $fn$ select match_internal.submit_job_review(p_job_id, p_rating, p_comment); $fn$;
revoke all on function public.submit_job_review(bigint, integer, text) from public, anon, authenticated;
grant execute on function public.submit_job_review(bigint, integer, text) to authenticated;

-- คู่สัญญาเปิดรีวิวของงานตนเองได้ แม้ผู้ดูแลปิดรับงานภายหลัง
create or replace function match_internal.get_job_review(p_job_id bigint)
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
  return query select r.rating, r.comment, r.created_at from public.job_reviews r where r.job_post_id = p_job_id;
end;
$fn$;
revoke all on function match_internal.get_job_review(bigint) from public, anon, authenticated;
grant execute on function match_internal.get_job_review(bigint) to authenticated;
create or replace function public.get_job_review(p_job_id bigint)
returns table(rating smallint, comment text, created_at timestamptz)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_job_review(p_job_id); $fn$;
revoke all on function public.get_job_review(bigint) from public, anon, authenticated;
grant execute on function public.get_job_review(bigint) to authenticated;

-- รีวิวในผลค้นหาไม่ส่งรหัสงาน ข้อมูลผู้ป่วย หรือช่องทางติดต่อของผู้เขียน
create or replace function match_internal.get_caregiver_reviews(p_caregiver_id uuid)
returns table(average_rating numeric, review_count bigint, reviews jsonb)
language plpgsql stable security definer set search_path = ''
as $fn$
declare v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if auth.uid() is null or v_role is null or not (
    (v_role = 'caregiver' and p_caregiver_id = auth.uid())
    or (v_role = 'employer' and exists(select 1 from public.caregiver_profiles
      where caregiver_id = p_caregiver_id and verification_status = 'verified' and availability_status = 'available'))
  ) then raise exception using errcode = '42501', message = 'caregiver_reviews_not_visible'; end if;
  return query
  select round(coalesce(avg(r.rating), 0), 1), count(*),
    coalesce((select jsonb_agg(to_jsonb(latest) order by latest.created_at desc, latest.id desc)
      from (select x.id, x.rating, x.comment, x.created_at
        from public.job_reviews x where x.caregiver_id = p_caregiver_id
        order by x.created_at desc, x.id desc limit 5) latest), '[]'::jsonb)
  from public.job_reviews r where r.caregiver_id = p_caregiver_id;
end;
$fn$;
revoke all on function match_internal.get_caregiver_reviews(uuid) from public, anon, authenticated;
grant execute on function match_internal.get_caregiver_reviews(uuid) to authenticated;
create or replace function public.get_caregiver_reviews(p_caregiver_id uuid)
returns table(average_rating numeric, review_count bigint, reviews jsonb)
language sql stable security invoker set search_path = ''
as $fn$ select * from match_internal.get_caregiver_reviews(p_caregiver_id); $fn$;
revoke all on function public.get_caregiver_reviews(uuid) from public, anon, authenticated;
grant execute on function public.get_caregiver_reviews(uuid) to authenticated;
commit;
