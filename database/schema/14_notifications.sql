-- ID 17: แจ้งเตือนจากเหตุการณ์จริงในฐานข้อมูล ผู้ใช้เห็นเฉพาะของตัวเอง
begin;
create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check(source_type in ('request','job')),
  source_id bigint not null,
  event text not null,
  title text not null,
  target_page text not null check(target_page in ('invitations','applications','receivedApplications','jobs','history')),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique(recipient_id,source_type,source_id,event)
);
create index notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc,id desc);
create index notifications_unread_idx on public.notifications(recipient_id) where read_at is null;
alter table public.notifications enable row level security;
revoke all on public.notifications from public,anon,authenticated;
grant select, update(read_at) on public.notifications to authenticated;
create policy notifications_read_own on public.notifications for select to authenticated
using(recipient_id=(select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated
using(recipient_id=(select auth.uid())) with check(recipient_id=(select auth.uid()));

-- ไม่ใส่ชื่อผู้ป่วย เบอร์ หรือข้อมูลติดต่อในข้อความแจ้งเตือน
create function private.notify_match_request() returns trigger
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
    heading := 'ประกาศที่คุณสมัครหรือได้รับเชิญสิ้นสุดการรับสมัครแล้ว';
  else return new;
  end if;
  page := case when recipient=owner_id then
    case when new.request_type='application' then 'receivedApplications' else 'invitations' end
    else case when new.request_type='application' then 'applications' else 'invitations' end end;
  insert into public.notifications(recipient_id,source_type,source_id,event,title,target_page)
  values(recipient,'request',new.id,new.status,heading,page) on conflict do nothing;
  return new;
end;
$$;
revoke all on function private.notify_match_request() from public,anon,authenticated;
create trigger match_requests_notify after insert or update of status on public.match_requests
for each row execute function private.notify_match_request();

create function private.notify_job_status() returns trigger
language plpgsql security definer set search_path = '' as $$
declare pair public.match_requests; heading text;
begin
  if new.status is not distinct from old.status then return new; end if;
  heading := case new.status when 'matched' then 'จับคู่สำเร็จแล้ว เปิดดูข้อมูลติดต่อได้'
    when 'in_progress' then 'ผู้ว่าจ้างเริ่มงานแล้ว'
    when 'completion_pending' then 'ผู้ดูแลแจ้งจบงาน รอผู้ว่าจ้างยืนยัน'
    when 'completed' then 'ผู้ว่าจ้างยืนยันจบงานแล้ว'
    else null end;
  if heading is null then return new; end if;
  select * into pair from public.match_requests where job_post_id=new.id and status='accepted';
  if not found then return new; end if;
  insert into public.notifications(recipient_id,source_type,source_id,event,title,target_page)
  values(new.employer_id,'job',new.id,new.status,heading,
    case when new.status='completed' then 'history' when pair.request_type='application' then 'receivedApplications' else 'invitations' end),
    (pair.caregiver_id,'job',new.id,new.status,heading,
    case when new.status='completed' then 'history' when pair.request_type='application' then 'applications' else 'invitations' end)
  on conflict do nothing;
  return new;
end;
$$;
revoke all on function private.notify_job_status() from public,anon,authenticated;
create trigger job_posts_notify after update of status on public.job_posts
for each row execute function private.notify_job_status();

-- เปิด Postgres Changes เฉพาะตารางที่มี RLS ของผู้รับ; ฐานทดสอบไม่มี publication นี้
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(
    select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications'
  ) then alter publication supabase_realtime add table public.notifications; end if;
end $$;
commit;
