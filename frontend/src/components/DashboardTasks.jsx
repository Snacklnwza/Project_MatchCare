import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { supabase } from '../lib/supabase'
import {
  loadInvitations,
  loadMyApplications,
  loadReceivedApplications,
} from '../lib/workflow'
import { requestGroup } from '../lib/requestStatus'

export default function DashboardTasks({ role, onNavigate }) {
  const loader = useCallback(async () => {
    if (role === 'employer') {
      const [applications, result] = await Promise.all([
        loadReceivedApplications(),
        supabase
          .from('job_posts')
          .select('id, status')
          .in('status', ['matched', 'in_progress', 'completion_pending']),
      ])
      if (result.error) throw result.error
      return [
        {
          title: 'ใบสมัครรอพิจารณา',
          count: applications.filter((item) => requestGroup(item) === 'waiting')
            .length,
          page: 'receivedApplications',
        },
        {
          title: 'รอยืนยันจบงาน',
          count: result.data.filter(
            (item) => item.status === 'completion_pending',
          ).length,
          page: 'jobs',
        },
        { title: 'งานที่ตอบรับแล้ว', count: result.data.length, page: 'jobs' },
      ]
    }
    const [invitations, applications] = await Promise.all([
      loadInvitations(),
      loadMyApplications(),
    ])
    const active = [...invitations, ...applications].filter(
      (item) => requestGroup(item) === 'active',
    )
    return [
      {
        title: 'คำเชิญรอคำตอบ',
        count: invitations.filter((item) => requestGroup(item) === 'waiting')
          .length,
        page: 'invitations',
      },
      {
        title: 'งานจากคำเชิญ',
        count: active.filter((item) =>
          invitations.some(
            (invitation) => invitation.request_id === item.request_id,
          ),
        ).length,
        page: 'invitations',
      },
      {
        title: 'งานจากใบสมัคร',
        count: applications.filter((item) => requestGroup(item) === 'active')
          .length,
        page: 'applications',
      },
    ]
  }, [role])
  const { data, loading, error, reload } = useRemoteList(loader)
  return (
    <section className="dashboard-tasks" aria-label="รายการที่ต้องติดตาม">
      <h2>ติดตามงานของคุณ</h2>
      {loading && <p role="status">กำลังตรวจรายการที่ต้องติดตาม...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="dashboard-task-grid">
          {data.map((task) => (
            <button
              type="button"
              key={task.title}
              onClick={() => onNavigate(task.page)}
            >
              <span>{task.title}</span>
              <strong>{task.count} รายการ</strong>
              <span aria-hidden="true">เปิดรายการ →</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
