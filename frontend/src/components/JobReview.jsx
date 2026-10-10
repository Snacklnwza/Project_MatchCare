import { useCallback, useId, useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate } from '../lib/jobs'
import { loadJobReview, reviewError, submitJobReview } from '../lib/reviews'
import '../styles/Reviews.css'

export default function JobReview({ jobId, canReview }) {
  const loader = useCallback(() => loadJobReview(jobId), [jobId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [message, setMessage] = useState('')
  const busy = useRef(false)
  const fieldId = useId()
  const review = data[0]

  async function save(event) {
    event.preventDefault()
    if (busy.current) return
    if (!rating) { setSaveError('กรุณาเลือกคะแนน 1–5 ดาว'); return }
    busy.current = true
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      await submitJobReview(jobId, rating, comment)
      setMessage('บันทึกรีวิวแล้ว ขอบคุณที่แบ่งปันประสบการณ์')
      reload()
    } catch (issue) {
      setSaveError(reviewError(issue))
      if (issue?.message === 'job_already_reviewed') reload()
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  return (
    <section className="job-review" aria-label="รีวิวของงานนี้">
      <h3>รีวิวหลังจบงาน</h3>
      {message && <p role="status">{message}</p>}
      {saveError && <p role="alert">{saveError}</p>}
      {loading ? <p role="status">กำลังโหลดรีวิว...</p> : error ? (
        <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองอีกครั้ง</button></div>
      ) : review ? (
        <div>
          <p className="review-score">★ {review.rating} / 5</p>
          {review.comment && <p className="review-comment">{review.comment}</p>}
          <p className="workflow-hint">เขียนเมื่อ {formatJobDate(review.created_at)}</p>
        </div>
      ) : canReview ? (
        <form onSubmit={save}>
          <p>บอกประสบการณ์การดูแลของงานนี้ รีวิวหนึ่งครั้งต่อหนึ่งงาน</p>
          <fieldset className="review-rating" disabled={saving}>
            <legend>ให้คะแนนผู้ดูแล</legend>
            <div className="review-rating-options">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className={rating === value ? 'is-selected' : ''}>
                  <input type="radio" name={`${fieldId}-rating`} value={value} checked={rating === value}
                    onChange={() => setRating(value)} />
                  <span aria-hidden="true">★</span><span>{value} ดาว</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={`${fieldId}-comment`}>ข้อความรีวิว (ไม่บังคับ)</label>
          <textarea id={`${fieldId}-comment`} value={comment} maxLength={1000} disabled={saving}
            aria-describedby={`${fieldId}-hint`} onChange={(event) => setComment(event.target.value)} />
          <p id={`${fieldId}-hint`} className="workflow-hint">รีวิวจะปรากฏในข้อมูลผู้ดูแล กรุณาไม่ใส่ชื่อผู้ป่วย ข้อมูลสุขภาพส่วนตัว หรือช่องทางติดต่อ · {comment.length}/1,000 ตัวอักษร</p>
          <button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกรีวิว'}</button>
        </form>
      ) : <p>ผู้ว่าจ้างยังไม่ได้เขียนรีวิวของงานนี้</p>}
    </section>
  )
}
