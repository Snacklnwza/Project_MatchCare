import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { supabase } from '../lib/supabase'
import { callWorkflow, workflowError } from '../lib/workflow'

async function loadJobs() {
  const { data, error } = await supabase
    .from('job_posts')
    .select('id, title')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function InviteCaregiverPicker({ caregiver, onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(loadJobs)
  const [jobId, setJobId] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [issue, setIssue] = useState('')
  const [sent, setSent] = useState([])
  const busy = useRef(false)
  async function invite(event) {
    event.preventDefault()
    const job = data.find((item) => String(item.id) === jobId)
    if (
      !job ||
      busy.current ||
      !window.confirm(
        `ส่งคำเชิญงาน “${job.title}” ให้คุณ${caregiver.display_name}?`,
      )
    )
      return
    busy.current = true
    setSending(true)
    setIssue('')
    setNotice('')
    try {
      await callWorkflow('invite_caregiver', {
        p_job_id: job.id,
        p_caregiver_id: caregiver.caregiver_id,
      })
      setSent((ids) => [...ids, jobId])
      setNotice(`ส่งคำเชิญงาน “${job.title}” แล้ว ติดตามได้ในคำเชิญที่ส่ง`)
    } catch (error) {
      setIssue(workflowError(error))
    } finally {
      busy.current = false
      setSending(false)
    }
  }
  return (
    <section
      className="invite-picker"
      aria-label={`เชิญ ${caregiver.display_name}`}
    >
      <h4>เชิญคุณ{caregiver.display_name}มาดูแล</h4>
      {loading && <p role="status">กำลังโหลดประกาศของคุณ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading &&
        !error &&
        (data.length ? (
          <form onSubmit={invite}>
            <label>
              เลือกประกาศที่เปิดรับ
              <select
                value={jobId}
                disabled={sending}
                required
                onChange={(event) => {
                  setJobId(event.target.value)
                  setIssue('')
                  setNotice('')
                }}
              >
                <option value="">เลือกประกาศของคุณ</option>
                {data.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={sending || !jobId || sent.includes(jobId)}
            >
              {sending
                ? 'กำลังส่ง...'
                : sent.includes(jobId)
                  ? 'ส่งคำเชิญแล้ว'
                  : 'ส่งคำเชิญ'}
            </button>
          </form>
        ) : (
          <>
            <p>คุณยังไม่มีประกาศที่เปิดรับ สร้างประกาศก่อนส่งคำเชิญ</p>
            <button type="button" onClick={() => onNavigate('jobs')}>
              ไปสร้างประกาศ
            </button>
          </>
        ))}
      {issue && <p role="alert">{issue}</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  )
}
