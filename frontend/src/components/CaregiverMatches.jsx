import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callWorkflow, workflowError } from '../lib/workflow'

export default function CaregiverMatches({ job, onBack }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState([])
  const [notice, setNotice] = useState('')
  const [inviteError, setInviteError] = useState('')
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
          'search_caregivers_for_job',
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
      <button type="button" className="secondary-button" onClick={onBack}>
        ← กลับไปประกาศงาน
      </button>
      <h2 id="matches-heading">ผู้ดูแลสำหรับ “{job.title}”</h2>
      {notice && <p role="status">{notice}</p>}
      {inviteError && <p role="alert">{inviteError}</p>}
      <p>
        ผู้ดูแลที่ยืนยันแล้วและพร้อมรับงาน เรียงตามทักษะที่ตรงกับประกาศมากที่สุด
      </p>
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
          <ol className="caregiver-match-list">
            {results.map((caregiver) => (
              <li className="job-card" key={caregiver.caregiver_id}>
                <div className="job-heading">
                  <h3>{caregiver.display_name}</h3>
                  <span className="job-status job-status-open">
                    ตรง {caregiver.matched_skills} จาก{' '}
                    {caregiver.required_skills} ทักษะ
                  </span>
                </div>
                <p>
                  อ.{caregiver.district} จ.{caregiver.province}
                </p>
                <p>ประสบการณ์ดูแล {caregiver.experience_years} ปี</p>
                <p>ยืนยันแล้ว · พร้อมรับงาน</p>
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
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
