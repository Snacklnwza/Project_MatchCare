import { useRef, useState } from 'react'
import MatchContact from '../components/MatchContact'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import { applicationLabels, callWorkflow, loadMyApplications, workflowError } from '../lib/workflow'

export default function Applications({ onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(loadMyApplications)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState(null)
  const busy = useRef(false)

  async function showContact(requestId) {
    if (busy.current) return
    busy.current = true
    setBusyId(requestId)
    setActionError('')
    setContact(null)
    try {
      const rows = await callWorkflow('get_match_contact', { p_request_id: requestId })
      if (!rows?.length) throw new Error('missing_contact')
      setContact({ requestId, ...rows[0] })
    } catch (issue) {
      setActionError(workflowError(issue))
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }

  async function requestCompletion(application) {
    if (busy.current || !window.confirm(`แจ้งผู้ว่าจ้างว่างาน “${application.title}” เสร็จแล้วใช่หรือไม่?`)) return
    busy.current = true
    setBusyId(application.request_id)
    setActionError('')
    setMessage('')
    try {
      await callWorkflow('request_job_completion', { p_job_id: application.job_post_id })
      setMessage('ส่งคำขอจบงานแล้ว รอผู้ว่าจ้างยืนยัน')
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
      reload()
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }

  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">สำหรับผู้ดูแล</p>
        <h1>งานที่สมัคร</h1>
        <p>ติดตามใบสมัครที่ส่งแล้ว ผู้ว่าจ้างจะเห็นใบสมัครเพื่อพิจารณา</p>
      </header>
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดใบสมัคร...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>ลองอีกครั้ง</button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <section className="workflow-card workflow-empty">
          <h2>ยังไม่มีใบสมัคร</h2>
          <p>ไปที่หน้าค้นหางาน เลือกประกาศที่สนใจ แล้วกดสมัครงาน</p>
          <button type="button" onClick={() => onNavigate('jobs')}>ไปค้นหางาน</button>
        </section>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="workflow-stack">
          {data.map((application) => (
            <article className="workflow-card" key={application.request_id}>
              <div className="workflow-heading">
                <h2>{application.title}</h2>
                <span className="workflow-badge" data-status={application.status}>
                  {applicationLabels[application.status] ?? application.status}
                </span>
              </div>
              <p>อ.{application.district} จ.{application.province}</p>
              <p>เริ่ม {formatJobDate(application.starts_at)} – {formatJobDate(application.ends_at)}</p>
              <p>{Number(application.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[application.pay_unit]}</p>
              <p className="workflow-hint">สมัครเมื่อ {formatJobDate(application.created_at)}</p>
              {application.status === 'accepted' && (
                <p role="status">สถานะงาน: {jobStatusLabels[application.job_status] ?? application.job_status}</p>
              )}
              {application.status === 'accepted' && application.job_status === 'completion_pending' && (
                <p role="status">ส่งคำขอแล้ว กำลังรอผู้ว่าจ้างยืนยันจบงาน</p>
              )}
              {application.status === 'accepted' && (
                <button type="button" disabled={busyId !== null} onClick={() => showContact(application.request_id)}>ดูข้อมูลติดต่อ</button>
              )}
              {application.status === 'accepted' && application.job_status === 'in_progress' && (
                <button type="button" disabled={busyId !== null} onClick={() => requestCompletion(application)}>แจ้งจบงาน</button>
              )}
              {contact?.requestId === application.request_id && (
                <MatchContact contact={contact} onHide={() => setContact(null)} />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
