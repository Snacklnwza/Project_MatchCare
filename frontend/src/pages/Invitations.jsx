import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import {
  loadInvitations,
  callWorkflow,
  workflowError,
  invitationLabels,
} from '../lib/workflow'
import { formatJobDate, payUnitLabels } from '../lib/jobs'

export default function Invitations({ profile }) {
  const { data, loading, error, reload } = useRemoteList(loadInvitations)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState(null)
  const busy = useRef(false)
  async function respond(request, accept) {
    if (
      busy.current ||
      !window.confirm(
        accept
          ? 'ยืนยันรับงานนี้? ประกาศจะจับคู่กับคุณทันที'
          : 'ยืนยันปฏิเสธคำเชิญนี้?',
      )
    )
      return
    busy.current = true
    setBusyId(request.request_id)
    setActionError('')
    setMessage('')
    setContact(null)
    try {
      await callWorkflow('respond_to_invitation', {
        p_request_id: request.request_id,
        p_accept: accept,
      })
      setMessage(
        accept
          ? 'จับคู่สำเร็จแล้ว คุณสามารถเปิดข้อมูลติดต่อเพื่อนัดหมายได้'
          : 'ปฏิเสธคำเชิญแล้ว',
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
        <p className="workflow-eyebrow">การจับคู่งาน</p>
        <h1>
          {profile.role === 'caregiver' ? 'คำเชิญและงานของฉัน' : 'คำเชิญที่ส่ง'}
        </h1>
        <p>ข้อมูลติดต่อจะแสดงให้ทั้งสองฝ่ายเมื่อผู้ดูแลตอบรับงานแล้วเท่านั้น</p>
      </header>
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดคำเชิญ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && !data.length && (
        <div className="workflow-card">
          <h2>ยังไม่มีคำเชิญ</h2>
          <p>
            {profile.role === 'caregiver'
              ? 'เมื่อผู้ว่าจ้างส่งคำเชิญมา คุณจะเห็นรายละเอียดและตอบรับได้ที่นี่'
              : 'ไปที่ประกาศงาน แล้วเลือกหาผู้ดูแลเพื่อส่งคำเชิญ'}
          </p>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-stack">
          {data.map((request) => (
            <article className="workflow-card" key={request.request_id}>
              <div className="workflow-heading">
                <h2>{request.title}</h2>
                <span className="workflow-badge">
                  {invitationLabels[request.status]}
                </span>
              </div>
              {profile.role === 'employer' && (
                <p>ผู้ดูแล: {request.caregiver_name}</p>
              )}
              <p>{request.description}</p>
              <p>
                อ.{request.district} จ.{request.province}
              </p>
              <p>
                {formatJobDate(request.starts_at)} –{' '}
                {formatJobDate(request.ends_at)}
              </p>
              <p>
                {Number(request.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[request.pay_unit]}
              </p>
              {profile.role === 'caregiver' &&
                request.status === 'pending' &&
                request.job_status === 'open' && (
                  <div className="workflow-actions">
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => respond(request, true)}
                    >
                      ตอบรับงาน
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyId !== null}
                      onClick={() => respond(request, false)}
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                )}
              {request.status === 'accepted' && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => showContact(request.request_id)}
                >
                  ดูข้อมูลติดต่อ
                </button>
              )}
              {contact?.requestId === request.request_id && (
                <section
                  className="workflow-contact"
                  aria-label="ข้อมูลติดต่อคู่ที่จับสำเร็จ"
                >
                  <h3>{contact.display_name}</h3>
                  <p>โทร: {contact.phone || 'ไม่ได้ระบุ'}</p>
                  <p>LINE: {contact.line_id || 'ไม่ได้ระบุ'}</p>
                  <p>
                    สถานที่ดูแล: {contact.address_detail} {contact.subdistrict}{' '}
                    {contact.district} {contact.province}
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setContact(null)}
                  >
                    ซ่อนข้อมูลติดต่อ
                  </button>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
