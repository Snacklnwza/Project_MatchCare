import { useEffect, useRef, useState } from 'react'
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
  const reviewPanel = useRef(null)
  const reasonInput = useRef(null)
  useEffect(() => {
    if (!selected) return
    reviewPanel.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
    reviewPanel.current?.focus({ preventScroll: true })
  }, [selected])
  async function review(approve) {
    if (busy.current) return
    setActionError('')
    setMessage('')
    if (!approve && !reason.trim()) {
      setActionError('กรุณาระบุเหตุผลที่ไม่อนุมัติ')
      reasonInput.current?.focus()
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
      {!loading && !error && data.length > 0 && (
        <div className="workflow-columns admin-verification-layout">
          <section
            className="workflow-card admin-verification-queue"
            aria-labelledby="verification-queue-title"
          >
            <div className="admin-verification-queue-heading">
              <div>
                <h2 id="verification-queue-title">คิวรอตรวจสอบ</h2>
                <p>เลือกผู้ดูแลเพื่อดูเอกสารและพิจารณาผล</p>
              </div>
              <span className="workflow-badge">{data.length} คน</span>
            </div>
            <ul className="admin-verification-queue-list">
              {data.map((person) => {
                const isSelected =
                  selected?.caregiver_id === person.caregiver_id
                return (
                  <li key={person.caregiver_id}>
                    <button
                      type="button"
                      className="admin-verification-person"
                      aria-pressed={isSelected}
                      disabled={saving}
                      onClick={() => {
                        setSelected(person)
                        setReason('')
                        setActionError('')
                      }}
                    >
                      <span
                        className="admin-verification-avatar"
                        aria-hidden="true"
                      >
                        {person.display_name?.trim().charAt(0) || 'ผ'}
                      </span>
                      <span className="admin-verification-person-info">
                        <strong>{person.display_name}</strong>
                        <span>รอตรวจเอกสาร</span>
                      </span>
                      <span
                        className="admin-verification-person-action"
                        aria-hidden="true"
                      >
                        {isSelected ? 'กำลังตรวจ' : 'ตรวจเอกสาร'} →
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
          {selected && (
            <section
              ref={reviewPanel}
              tabIndex={-1}
              className="workflow-card"
              aria-labelledby="verification-person-name"
            >
              <h2 id="verification-person-name">{selected.display_name}</h2>
              <DocumentList
                key={selected.caregiver_id}
                caregiverId={selected.caregiver_id}
              />
              <label htmlFor="review-reason">เหตุผลกรณีไม่อนุมัติ</label>
              <textarea
                id="review-reason"
                ref={reasonInput}
                placeholder="ระบุสิ่งที่ต้องแก้ เช่น รูปไม่ชัด ให้ส่งเอกสารใหม่"
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
          {!selected && (
            <section className="workflow-card admin-verification-placeholder">
              <h2>เลือกผู้ดูแลจากคิว</h2>
              <p>รายละเอียดเอกสารและปุ่มอนุมัติจะแสดงตรงนี้</p>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
