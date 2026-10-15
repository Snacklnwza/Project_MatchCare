import useRevealItem from '../hooks/useRevealItem'
import RequestFilters, { RequestBadge } from '../components/RequestFilters'
import { requestMatches } from '../lib/requestStatus'
import { useRef, useState } from 'react'
import MatchContact from '../components/MatchContact'
import useRemoteList from '../hooks/useRemoteList'
import useWorkflowUpdates from '../hooks/useWorkflowUpdates'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import {
  applicationLabels,
  callWorkflow,
  loadReceivedApplications,
  workflowError,
} from '../lib/workflow'

export default function EmployerApplications({ onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(
    loadReceivedApplications,
    { backgroundRefresh: true },
  )
  useWorkflowUpdates(reload)
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

  async function respond(application, accept) {
    if (
      busy.current ||
      !window.confirm(
        accept
          ? `ยืนยันรับคุณ${application.caregiver_name}เข้าทำงาน “${application.title}”? ใบสมัครและคำเชิญอื่นของประกาศนี้จะสิ้นสุด`
          : `ยืนยันปฏิเสธใบสมัครของคุณ${application.caregiver_name}?`,
      )
    )
      return
    busy.current = true
    setBusyId(application.request_id)
    setActionError('')
    setMessage('')
    setContact(null)
    try {
      await callWorkflow('respond_to_application', {
        p_request_id: application.request_id,
        p_accept: accept,
      })
      setMessage(
        accept
          ? 'จับคู่สำเร็จแล้ว ทั้งสองฝ่ายเปิดข้อมูลติดต่อได้'
          : 'ปฏิเสธใบสมัครแล้ว',
      )
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
      reload()
    } finally {
      busy.current = false
      setBusyId(null)
    }
  }

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

  return (
    <section className="workflow-page">
      <header>
        <h1>ใบสมัครที่ได้รับ</h1>
        <p>พิจารณาประสบการณ์และทักษะของผู้ดูแลก่อนตัดสินใจรับงาน</p>
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
          <p>เมื่อผู้ดูแลสมัครประกาศของคุณ ใบสมัครจะปรากฏที่นี่</p>
          <button type="button" onClick={() => onNavigate('jobs')}>
            ไปที่ประกาศงาน
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
                <strong>ผู้สมัคร:</strong> {application.caregiver_name}
              </p>
              <p>
                <strong>ประสบการณ์:</strong> {application.experience_years} ปี
              </p>
              <p>
                <strong>ทักษะ:</strong>{' '}
                {application.caregiver_skills?.length
                  ? application.caregiver_skills.join(', ')
                  : 'ยังไม่ได้ระบุ'}
              </p>
              <p>
                งาน: อ.{application.district} จ.{application.province} ·{' '}
                {formatJobDate(application.starts_at)} –{' '}
                {formatJobDate(application.ends_at)}
              </p>
              <p>
                {Number(application.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[application.pay_unit]}
              </p>
              <p className="workflow-hint">
                สมัครเมื่อ {formatJobDate(application.created_at)} ·
                สถานะประกาศ:{' '}
                {jobStatusLabels[application.job_status] ??
                  application.job_status}
              </p>
              {application.status === 'pending' &&
                application.job_status === 'open' && (
                  <div className="workflow-actions">
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => respond(application, true)}
                    >
                      รับเข้าทำงาน
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyId !== null}
                      onClick={() => respond(application, false)}
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                )}
              {application.status === 'accepted' && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => showContact(application.request_id)}
                >
                  ดูข้อมูลติดต่อ
                </button>
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
