-- เจ้าของอ่านและจัดการประกาศของตน; ยังไม่เปิดตารางที่มีที่อยู่ละเอียดให้ผู้อื่นอ่าน

revoke all privileges on table public.job_posts from anon, authenticated;

grant select on table public.job_posts to authenticated;

grant insert (
  employer_id, patient_id, title, description, care_summary,
  starts_at, ends_at, pay_amount, pay_unit,
  province, district, subdistrict, address_detail, status
) on table public.job_posts to authenticated;

grant update (
  patient_id, title, description, care_summary,
  starts_at, ends_at, pay_amount, pay_unit,
  province, district, subdistrict, address_detail, status
) on table public.job_posts to authenticated;

grant usage, select on sequence public.job_posts_id_seq to authenticated;

create policy job_posts_select_own
on public.job_posts for select to authenticated
using ((select auth.uid()) = employer_id);

create policy job_posts_insert_own
on public.job_posts for insert to authenticated
with check (
  (select auth.uid()) = employer_id
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'employer'
  )
);

create policy job_posts_update_own
on public.job_posts for update to authenticated
using (
  (select auth.uid()) = employer_id
  and status in ('draft', 'open')
)
with check (
  (select auth.uid()) = employer_id
  and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'employer'
  )
);

-- ทักษะของประกาศอ่าน/เพิ่ม/ลบได้เฉพาะเจ้าของประกาศที่ยังแก้ไขได้
revoke all privileges on table public.job_required_skills from anon, authenticated;
grant select, insert, delete on table public.job_required_skills to authenticated;

create policy job_required_skills_select_own
on public.job_required_skills for select to authenticated
using (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
  )
);

create policy job_required_skills_insert_own
on public.job_required_skills for insert to authenticated
with check (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
      and status in ('draft', 'open')
  )
  and exists (
    select 1 from public.skills
    where id = job_required_skills.skill_id and is_active = true
  )
);

create policy job_required_skills_delete_own
on public.job_required_skills for delete to authenticated
using (
  exists (
    select 1 from public.job_posts
    where id = job_required_skills.job_post_id
      and employer_id = (select auth.uid())
      and status in ('draft', 'open')
  )
);
