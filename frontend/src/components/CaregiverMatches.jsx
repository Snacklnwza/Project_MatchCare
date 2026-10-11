import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callWorkflow, workflowError } from '../lib/workflow'
import ReviewSummary from './ReviewSummary'
import { mobilityLabels, areaLabels, sideLabels, assistanceLabels } from '../lib/careContext'

export default function CaregiverMatches({ job, onBack }) {
  const care = job.patients
  const hasCareDetails = Boolean(
    care?.mobility_status || care?.affected_area || care?.transfer_assistance ||
    care?.chronic_conditions || care?.care_notes || care?.patient_conditions?.length,
  )
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState([])
  const [notice, setNotice] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [reviewId, setReviewId] = useState(null)
  const sending = useRef(false)

  async function invite(caregiver) {
    if (
      sending.current ||
      !window.confirm(
        `ส่งคำเชิญสำหรับ “${job.title}” ให้ ${caregiver.display_name}?`,
      )
    )
      return
    sending.current = true
    setSendingId(caregiver.caregiver_id)
    setNotice('')
    setInviteError('')
    try {
      await callWorkflow('invite_caregiver', {
        p_job_id: job.id,
        p_caregiver_id: caregiver.caregiver_id,
      })
      setSentIds((ids) => [...ids, caregiver.caregiver_id])
      setNotice('ส่งคำเชิญแล้ว ติดตามได้ที่เมนูคำเชิญที่ส่ง')
    } catch (issue) {
      setInviteError(workflowError(issue))
      if (issue.message === 'invitation_already_exists')
        setSentIds((ids) => [...ids, caregiver.caregiver_id])
    } finally {
      sending.current = false
      setSendingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function search() {
      setLoading(true)
      setError('')
      setResults([])
      try {
        const { data, error: queryError } = await supabase.rpc(
          'rank_caregivers_for_job',
          { p_job_id: job.id },
        )
        if (queryError) throw queryError
        if (!cancelled) setResults(data ?? [])
      } catch (queryError) {
        if (!cancelled)
          setError(
            queryError.code === '42501'
              ? 'ค้นหาได้เฉพาะประกาศของคุณที่ยังเปิดรับสมัคร กรุณากลับไปตรวจสอบประกาศ'
              : 'ไม่สามารถค้นหาผู้ดูแลได้ กรุณาลองอีกครั้ง',
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    search()
    return () => {
      cancelled = true
    }
  }, [job.id, retry])

  return (
    <section className="job-manager" aria-labelledby="matches-heading">
      <p className="form-help">
        เปอร์เซ็นต์นี้แสดงความตรงกันของทักษะกับงาน
        ส่วนคะแนนรีวิวเป็นความคิดเห็นจากงานที่ผ่านมา ดูประกอบกันก่อนตัดสินใจ
      </p>
      <button type="button" className="secondary-button" onClick={onBack}>
        ← กลับไปประกาศงาน
      </button>
      <h2 id="matches-heading">ผู้ดูแลสำหรับ “{job.title}”</h2>
      {notice && <p role="status">{notice}</p>}
      {inviteError && <p role="alert">{inviteError}</p>}
      <p>ผู้ดูแลที่ยืนยันแล้วและพร้อมรับงาน เรียงตามคะแนนทักษะที่ตรงกับงาน</p>
      {loading ? (
        <p role="status">กำลังค้นหาผู้ดูแล...</p>
      ) : error ? (
        <div className="form-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="job-empty" role="status">
          <h3>ยังไม่พบผู้ดูแลที่พร้อมรับงาน</h3>
          <p>
            ขณะนี้ยังไม่มีผู้ดูแลที่ผ่านการยืนยันและเปิดรับงาน
            ลองค้นหาอีกครั้งภายหลัง
          </p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            ค้นหาอีกครั้ง
          </button>
        </div>
      ) : (
        <>
          <p role="status">พบผู้ดูแล {results.length} คน</p>
          <p className="workflow-hint">
            แสดงเฉพาะผู้ดูแลที่ไม่มีงานที่ตอบรับแล้วทับช่วงเวลาของประกาศนี้
          </p>
          <p className="workflow-hint">คะแนนมาจากทักษะที่เลือกในประกาศ 100% โปรดอ่านรายละเอียดสุขภาพก่อนส่งคำเชิญ</p>
          <div className="caregiver-results-layout">
            <ol className="caregiver-match-list">
            {results.map((caregiver) => (
              <li className="job-card" key={caregiver.caregiver_id}>
                <div className="job-heading">
                  <h3>{caregiver.display_name}</h3>
                  <span className="job-status job-status-open">
                    {caregiver.required_skills > 0
                      ? `ทักษะตรงกับงาน ${caregiver.match_score}%`
                      : 'ยังไม่มีเกณฑ์คะแนน'}
                  </span>
                </div>
                <p>
                  อ.{caregiver.district} จ.{caregiver.province}
                </p>
                <p>ประสบการณ์ดูแล {caregiver.experience_years} ปี</p>
                <p>ยืนยันแล้ว · พร้อมรับงาน</p>
                <SkillExplanation
                  title="ทักษะในประกาศ"
                  matching={caregiver.matching_skills}
                  missing={caregiver.missing_skills}
                />
                <div className="job-actions">
                  <button
                    type="button"
                    disabled={
                      sendingId !== null ||
                      sentIds.includes(caregiver.caregiver_id)
                    }
                    onClick={() => invite(caregiver)}
                  >
                    {sentIds.includes(caregiver.caregiver_id)
                      ? 'ส่งคำเชิญแล้ว'
                      : sendingId === caregiver.caregiver_id
                        ? 'กำลังส่ง...'
                        : 'เชิญให้ดูแลงานนี้'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-expanded={reviewId === caregiver.caregiver_id}
                    onClick={() =>
                      setReviewId(
                        reviewId === caregiver.caregiver_id
                          ? null
                          : caregiver.caregiver_id,
                      )
                    }
                  >
                    {reviewId === caregiver.caregiver_id
                      ? 'ซ่อนรีวิว'
                      : 'ดูคะแนนและรีวิว'}
                  </button>
                </div>
                {reviewId === caregiver.caregiver_id && (
                  <ReviewSummary caregiverId={caregiver.caregiver_id} />
                )}
              </li>
            ))}
            </ol>
            <aside className="caregiver-care-panel" aria-labelledby="caregiver-care-heading">
              <h3 id="caregiver-care-heading">รายละเอียดงานดูแล</h3>
              {hasCareDetails ? (
                <>
                  {care.mobility_status && (
                    <p><strong>การเคลื่อนไหว</strong><span>{mobilityLabels[care.mobility_status]}</span></p>
                  )}
                  {care.chronic_conditions && (
                    <p><strong>โรคประจำตัว/อาการ</strong><span>{care.chronic_conditions}</span></p>
                  )}
                  {care.care_notes && (
                    <p><strong>อาการอื่น/สิ่งที่ต้องช่วย</strong><span>{care.care_notes}</span></p>
                  )}
                  {care.patient_conditions?.length > 0 && (
                    <p><strong>สภาวะการดูแล</strong><span>{care.patient_conditions.map(item => item.conditions?.name).filter(Boolean).join(', ')}</span></p>
                  )}
                  {care.affected_area && (
                    <p><strong>บริเวณที่เคลื่อนไหวลำบาก</strong><span>{areaLabels[care.affected_area]} {sideLabels[care.affected_side]}</span></p>
                  )}
                  {care.transfer_assistance && (
                    <p><strong>การลุก นั่ง หรือย้ายตัว</strong><span>{assistanceLabels[care.transfer_assistance]}</span></p>
                  )}
                </>
              ) : <p>ยังไม่มีรายละเอียดสุขภาพเพิ่มเติม</p>}
              <small>ข้อมูลนี้ช่วยประกอบการตัดสินใจ คะแนนคิดจากทักษะในประกาศเท่านั้น</small>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}

function SkillExplanation({ title, matching = [], missing = [] }) {
  if (!matching.length && !missing.length) return null
  return (
    <div className="match-explanation">
      <strong>{title}</strong>
      <p>ตรง: {matching.length ? matching.join(' · ') : 'ยังไม่มีทักษะตรง'}</p>
      {missing.length > 0 && (
        <p className="workflow-hint">ยังขาด: {missing.join(' · ')}</p>
      )}
    </div>
  )
}
