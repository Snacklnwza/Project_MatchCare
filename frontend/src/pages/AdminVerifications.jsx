import { useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import DocumentList from '../components/DocumentList'
import {
  loadVerificationQueue,
  callWorkflow,
  workflowError,
} from '../lib/workflow'

export default function AdminVerifications() {
  const { data, loading, error, reload } = useRemoteList(loadVerificationQueue)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const busy = useRef(false)
  async function review(approve) {
    if (busy.current) return
    setActionError('')
    setMessage('')
    if (!approve && !reason.trim()) {
      setActionError('กรุณาระบุเหตุผลที่ไม่อนุมัติ')
      return
    }
    if (
      !window.confirm(
        approve
          ? 'ยืนยันว่าได้ตรวจเอกสารและอนุมัติผู้ดูแลคนนี้?'
          : 'ส่งผลไม่อนุมัติพร้อมเหตุผลให้ผู้ดูแล?',
      )
    )
      return
    busy.current = true
    setSaving(true)
    try {
      await callWorkflow('review_caregiver', {
        p_caregiver_id: selected.caregiver_id,
        p_approve: approve,
        p_reason: reason.trim(),
      })
      setMessage(approve ? 'อนุมัติผู้ดูแลแล้ว' : 'ส่งผลตรวจพร้อมเหตุผลแล้ว')
      setSelected(null)
      setReason('')
      reload()
    } catch (issue) {
      setActionError(workflowError(issue))
    } finally {
      busy.current = false
      setSaving(false)
    }
  }
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">พื้นที่แอดมิน</p>
        <h1>ตรวจสอบผู้ดูแล</h1>
        <p>ตรวจเอกสารยืนยันตัวตนก่อนอนุมัติให้ผู้ดูแลปรากฏในผลค้นหา</p>
      </header>
      {message && <p role="status">{message}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {loading && <p role="status">กำลังโหลดคิวตรวจสอบ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && !data.length && (
        <div className="workflow-card workflow-empty">
          <h2>ตรวจสอบครบแล้ว</h2>
          <p>ขณะนี้ไม่มีผู้ดูแลรอตรวจสอบ</p>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-columns">
          <ul className="workflow-list">
            {data.map((person) => (
              <li key={person.caregiver_id}>
                <div>
                  <strong>{person.display_name}</strong>
                  <p>รอการตรวจสอบ</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setSelected(person)
                    setReason('')
                    setActionError('')
                  }}
                >
                  ตรวจเอกสาร
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <section className="workflow-card">
              <h2>{selected.display_name}</h2>
              <DocumentList
                key={selected.caregiver_id}
                caregiverId={selected.caregiver_id}
              />
              <label htmlFor="review-reason">เหตุผลกรณีไม่อนุมัติ</label>
              <textarea
                id="review-reason"
                maxLength={1000}
                value={reason}
                disabled={saving}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="workflow-actions">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => review(true)}
                >
                  อนุมัติผู้ดูแล
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => review(false)}
                >
                  ไม่อนุมัติ
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
