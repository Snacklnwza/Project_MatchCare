import useRevealItem from '../hooks/useRevealItem'
import RequestFilters, { RequestBadge } from '../components/RequestFilters'
import { requestMatches } from '../lib/requestStatus'
import { useRef, useState } from 'react'
import MatchContact from '../components/MatchContact'
import MatchedPatientDetails from '../components/MatchedPatientDetails'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import {
  applicationLabels,
  callWorkflow,
  loadMyApplications,
  workflowError,
} from '../lib/workflow'

export default function Applications({ onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(loadMyApplications)
  const [filter, setFilter] = useState('current')
  const targetId = useRevealItem(data, 'request', 'request_id')
  const visible = data.filter(
    (request) =>
      String(request.request_id) === String(targetId) ||
      requestMatches(request, filter),
  )
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
      const rows = await callWorkflow('get_match_contact', {
        p_request_id: requestId,
      })
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
    if (
      busy.current ||
      !window.confirm(
        `แจ้งผู้ว่าจ้างว่างาน “${application.title}” เสร็จแล้วใช่หรือไม่?`,
      )
    )
      return
    busy.current = true
    setBusyId(application.request_id)
    setActionError('')
    setMessage('')
    try {
      await callWorkflow('request_job_completion', {
        p_job_id: application.job_post_id,
      })
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
        <h1>งานที่สมัคร</h1>
        <p>ติดตามใบสมัครที่ส่งแล้ว ผู้ว่าจ้างจะเห็นใบสมัครเพื่อพิจารณา</p>
      </header>
      {!loading && !error && data.length > 0 && (
        <RequestFilters data={data} value={filter} onChange={setFilter} />
      )}
      {!loading && !error && data.length > 0 && visible.length === 0 && (
        <div className="workflow-card workflow-empty">
          <h2>ไม่มีรายการในสถานะนี้</h2>
          <p>
            รายการที่จบแล้วอยู่ใน “สิ้นสุดแล้ว” และดูย้อนหลังได้ในประวัติงาน
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setFilter('all')}
          >
            ดูรายการทั้งหมด
          </button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดใบสมัคร...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <section className="workflow-card workflow-empty">
          <h2>ยังไม่มีใบสมัคร</h2>
          <p>ไปที่หน้าค้นหางาน เลือกประกาศที่สนใจ แล้วกดสมัครงาน</p>
          <button type="button" onClick={() => onNavigate('jobs')}>
            ไปค้นหางาน
          </button>
        </section>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="workflow-stack">
          {visible.map((application) => (
            <article
              id={`request-${application.request_id}`}
              tabIndex={-1}
              className={`workflow-card${String(targetId) === String(application.request_id) ? ' revealed-item' : ''}`}
              key={application.request_id}
            >
              <div className="workflow-heading">
                <h2>{application.title}</h2>
                <RequestBadge
                  request={application}
                  labels={applicationLabels}
                />
              </div>
              <p>
                อ.{application.district} จ.{application.province}
              </p>
              <p>
                เริ่ม {formatJobDate(application.starts_at)} –{' '}
                {formatJobDate(application.ends_at)}
              </p>
              <p>
                {Number(application.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[application.pay_unit]}
              </p>
              <p className="workflow-hint">
                สมัครเมื่อ {formatJobDate(application.created_at)}
              </p>
              {application.status === 'accepted' && (
                <MatchedPatientDetails requestId={application.request_id} />
              )}
              {application.status === 'accepted' && (
                <p role="status">
                  สถานะงาน:{' '}
                  {jobStatusLabels[application.job_status] ??
                    application.job_status}
                </p>
              )}
              {application.status === 'accepted' &&
                application.job_status === 'completion_pending' && (
                  <p role="status">ส่งคำขอแล้ว กำลังรอผู้ว่าจ้างยืนยันจบงาน</p>
                )}
              {application.status === 'accepted' && (
                <div className="workflow-actions">
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => showContact(application.request_id)}
                  >
                    ดูข้อมูลติดต่อ
                  </button>
                  {application.job_status === 'in_progress' && (
                    <button
                      type="button"
                      className="workflow-complete-button"
                      disabled={busyId !== null}
                      onClick={() => requestCompletion(application)}
                    >
                      <span
                        className="workflow-complete-icon"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      แจ้งจบงาน
                    </button>
                  )}
                </div>
              )}
              {contact?.requestId === application.request_id && (
                <MatchContact
                  contact={contact}
                  onHide={() => setContact(null)}
                />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
