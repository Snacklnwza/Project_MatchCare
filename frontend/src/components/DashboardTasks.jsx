import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import useWorkflowUpdates from '../hooks/useWorkflowUpdates'
import { supabase } from '../lib/supabase'
import {
  loadMyWork,
  loadReceivedApplications,
} from '../lib/workflow'
import { requestGroup } from '../lib/requestStatus'
import { workGroup } from '../lib/caregiverWork'

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
    const requests = await loadMyWork()
    return [['waiting', 'รอคำตอบ'], ['matched', 'รับงานแล้ว'], ['in_progress', 'กำลังดูแล']]
      .map(([filter, title]) => ({ title, count: requests.filter(item => workGroup(item) === filter).length, page: 'myWork', filter }))
  }, [role])
  const { data, loading, error, reload } = useRemoteList(loader, { backgroundRefresh: true })
  useWorkflowUpdates(reload)
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
              onClick={() => onNavigate(task.page, task.filter ? { work_filter: task.filter } : null)}
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
