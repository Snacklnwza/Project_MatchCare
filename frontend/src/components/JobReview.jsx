import { useCallback, useId, useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate } from '../lib/jobs'
import {
  loadJobEmployerReview,
  loadJobReview,
  reviewError,
  submitEmployerReview,
  submitJobReview,
} from '../lib/reviews'
import '../styles/Reviews.css'

export default function JobReview({ jobId, kind, canReview }) {
  const reviewsCaregiver = kind === 'caregiver'
  const target = reviewsCaregiver ? 'ผู้ดูแล' : 'ผู้ว่าจ้าง'
  const writer = reviewsCaregiver ? 'ผู้ว่าจ้าง' : 'ผู้ดูแล'
  const loader = useCallback(
    () =>
      reviewsCaregiver ? loadJobReview(jobId) : loadJobEmployerReview(jobId),
    [jobId, reviewsCaregiver],
  )
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
    if (!rating) {
      setSaveError('กรุณาเลือกคะแนน 1–5 ดาว')
      return
    }
    busy.current = true
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      await (reviewsCaregiver
        ? submitJobReview(jobId, rating, comment)
        : submitEmployerReview(jobId, rating, comment))
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
    <section className="job-review" aria-label={`รีวิว${target}ของงานนี้`}>
      <h3>รีวิว{target}หลังจบงาน</h3>
      {message && <p role="status">{message}</p>}
      {saveError && <p role="alert">{saveError}</p>}
      {loading ? (
        <p role="status">กำลังโหลดรีวิว...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : review ? (
        <div>
          <p className="review-score">★ {review.rating} / 5</p>
          {review.comment && <p className="review-comment">{review.comment}</p>}
          <p className="workflow-hint">
            เขียนเมื่อ {formatJobDate(review.created_at)}
          </p>
        </div>
      ) : canReview ? (
        <form onSubmit={save}>
          <p>
            ให้คะแนน
            {reviewsCaregiver ? 'การดูแล' : 'ประสบการณ์ทำงานกับผู้ว่าจ้าง'}{' '}
            รีวิวได้หนึ่งครั้งต่องาน
          </p>
          <fieldset className="review-rating" disabled={saving}>
            <legend>ให้คะแนน{target}</legend>
            <div className="review-rating-options">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className={rating === value ? 'is-selected' : ''}
                >
                  <input
                    type="radio"
                    name={`${fieldId}-rating`}
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                  />
                  <span aria-hidden="true">★</span>
                  <span>{value} ดาว</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={`${fieldId}-comment`}>ข้อความรีวิว (ไม่บังคับ)</label>
          <textarea
            id={`${fieldId}-comment`}
            value={comment}
            maxLength={1000}
            disabled={saving}
            aria-describedby={`${fieldId}-hint`}
            onChange={(event) => setComment(event.target.value)}
          />
          <p id={`${fieldId}-hint`} className="workflow-hint">
            รีวิวจะปรากฏ
            {reviewsCaregiver
              ? 'ในข้อมูลผู้ดูแล'
              : 'กับประกาศของผู้ว่าจ้าง'}{' '}
            กรุณาไม่ใส่ชื่อผู้ป่วย ข้อมูลสุขภาพส่วนตัว หรือช่องทางติดต่อ ·{' '}
            {comment.length}/1,000 ตัวอักษร
          </p>
          <button type="submit" disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกรีวิว'}
          </button>
        </form>
      ) : (
        <p className="workflow-hint">{writer}ยังไม่ได้เขียนรีวิวของงานนี้</p>
      )}
    </section>
  )
}
