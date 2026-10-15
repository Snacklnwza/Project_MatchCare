import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import useRevealItem from '../hooks/useRevealItem'
import { RequestBadge } from '../components/RequestFilters'
import InvitationCareDetails from '../components/InvitationCareDetails'
import MatchContact from '../components/MatchContact'
import ReviewSummary from '../components/ReviewSummary'
import JobReview from '../components/JobReview'
import { formatJobDate, payUnitLabels } from '../lib/jobs'
import { workFilters, workMatches } from '../lib/caregiverWork'
import { applicationLabels, invitationLabels, callWorkflow, loadMyWork, workflowError } from '../lib/workflow'

export default function MyWork({ initialFilter = 'current', onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(loadMyWork)
  const [filter, setFilter] = useState(initialFilter)
  const [expandedId, setExpandedId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState(null)
  const busy = useRef(false)
  const targetId = useRevealItem(data, 'request', 'request_id')
  const visible = data.filter(request => String(request.request_id) === String(targetId) || workMatches(request, filter))

  async function act(request, operation, accept) {
    if (busy.current) return
    const prompt = operation === 'respond_to_invitation'
      ? accept ? 'ยืนยันรับงานนี้? ประกาศจะจับคู่กับคุณทันที' : 'ยืนยันปฏิเสธคำเชิญนี้?'
      : `แจ้งผู้ว่าจ้างว่างาน “${request.title}” เสร็จแล้วใช่หรือไม่?`
    if (!window.confirm(prompt)) return
    busy.current = true
    setBusyId(request.request_id)
    setActionError('')
    setMessage('')
    setContact(null)
    try {
      await callWorkflow(operation, operation === 'respond_to_invitation'
        ? { p_request_id: request.request_id, p_accept: accept }
        : { p_job_id: request.job_post_id })
      setMessage(operation === 'request_job_completion'
        ? 'ส่งคำขอจบงานแล้ว รอผู้ว่าจ้างยืนยัน'
        : accept ? 'ตอบรับงานแล้ว เปิดข้อมูลติดต่อเพื่อนัดหมายได้' : 'ปฏิเสธคำเชิญแล้ว')
    } catch (issue) {
      setActionError(workflowError(issue))
    } finally {
      busy.current = false
      setBusyId(null)
      reload()
    }
  }

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

  return (
    <section className="workflow-page" aria-labelledby="my-work-heading">
      <header>
        <h1 id="my-work-heading">งานของฉัน</h1>
        <p>รวมงานที่สมัครเองและคำเชิญ ติดตามสถานะและอ่านรายละเอียดได้ในที่เดียว</p>
      </header>
      {!loading && !error && data.length > 0 && (
        <div className="request-filters" role="group" aria-label="กรองสถานะงานของฉัน">
          {Object.entries(workFilters).map(([key, label]) => (
            <button key={key} type="button" className="secondary-button" aria-pressed={filter === key}
              onClick={() => setFilter(key)}>
              {label} <span>{data.filter(request => workMatches(request, key)).length}</span>
            </button>
          ))}
        </div>
      )}
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดงานของฉัน...</p>}
      {error && <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองใหม่</button></div>}
      {!loading && !error && !visible.length && (
        <div className="workflow-card workflow-empty">
          <h2>{data.length ? 'ไม่มีงานในสถานะนี้' : 'ยังไม่มีงานของคุณ'}</h2>
          <p>{data.length ? 'เลือกสถานะอื่น หรือดูงานทั้งหมดรวมรายการที่สิ้นสุดแล้ว' : 'เลือกงานที่สนใจในหน้าค้นหางาน หรือรอคำเชิญจากผู้ว่าจ้าง'}</p>
          <button type="button" onClick={() => data.length ? setFilter('all') : onNavigate('jobs')}>
            {data.length ? 'ดูงานทั้งหมด' : 'ไปค้นหางาน'}
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-stack">
          {visible.map(request => {
            const expanded = expandedId === request.request_id
            const isInvitation = request.request_type === 'invitation'
            const canRespond = isInvitation && request.status === 'pending' && request.job_status === 'open'
            return (
              <article key={request.request_id} id={`request-${request.request_id}`} tabIndex={-1}
                className={`workflow-card${String(targetId) === String(request.request_id) ? ' revealed-item' : ''}`}>
                <div className="workflow-heading">
                  <h2>{request.title}</h2>
                  <RequestBadge request={request} labels={isInvitation ? invitationLabels : applicationLabels} />
                </div>
                <span className="work-source">{isInvitation ? 'ได้รับคำเชิญ' : 'สมัครเอง'}</span>
                <p>อ.{request.district} จ.{request.province}</p>
                <p>{formatJobDate(request.starts_at)} – {formatJobDate(request.ends_at)}</p>
                <p>{Number(request.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[request.pay_unit]}</p>
                {request.job_status === 'completion_pending' && request.status === 'accepted' && <p role="status">ส่งคำขอแล้ว กำลังรอผู้ว่าจ้างยืนยันจบงาน</p>}
                <div className="workflow-actions">
                  <button type="button" className="secondary-button" aria-expanded={expanded}
                    aria-controls={`work-details-${request.request_id}`}
                    onClick={() => setExpandedId(expanded ? null : request.request_id)}>
                    {expanded ? 'ซ่อนรายละเอียดงาน' : 'ดูรายละเอียดงาน'}
                  </button>
                  {request.status === 'accepted' && <button type="button" disabled={busyId !== null}
                    onClick={() => showContact(request.request_id)}>ดูข้อมูลติดต่อ</button>}
                  {request.status === 'accepted' && request.job_status === 'in_progress' && (
                    <button type="button" className="workflow-complete-button" disabled={busyId !== null}
                      onClick={() => act(request, 'request_job_completion')}>แจ้งจบงาน</button>
                  )}
                </div>
                {expanded && (
                  <div id={`work-details-${request.request_id}`}>
                    <InvitationCareDetails requestId={request.request_id}>
                      {request.status !== 'accepted' && request.job_status === 'open' && <ReviewSummary jobId={request.job_post_id} />}
                      {canRespond && (
                        <div className="workflow-actions">
                          <button type="button" disabled={busyId !== null} onClick={() => act(request, 'respond_to_invitation', true)}>ตอบรับงาน</button>
                          <button type="button" className="secondary-button" disabled={busyId !== null} onClick={() => act(request, 'respond_to_invitation', false)}>ปฏิเสธ</button>
                        </div>
                      )}
                    </InvitationCareDetails>
                    {request.status === 'accepted' && request.job_status === 'completed' && (
                      <>
                        <JobReview jobId={request.job_post_id} kind="employer" canReview />
                        <JobReview jobId={request.job_post_id} kind="caregiver" canReview={false} />
                      </>
                    )}
                  </div>
                )}
                {contact?.requestId === request.request_id && <MatchContact contact={contact} onHide={() => setContact(null)} />}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
