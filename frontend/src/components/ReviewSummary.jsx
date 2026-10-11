import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate } from '../lib/jobs'
import { loadCaregiverReviews, loadJobEmployerReputation } from '../lib/reviews'
import '../styles/Reviews.css'

export default function ReviewSummary({ caregiverId, jobId }) {
  const caregiver = Boolean(caregiverId)
  const loader = useCallback(
    () =>
      caregiver
        ? loadCaregiverReviews(caregiverId)
        : loadJobEmployerReputation(jobId),
    [caregiver, caregiverId, jobId],
  )
  const { data, loading, error, reload } = useRemoteList(loader)
  const info = data[0]

  return (
    <section
      className={caregiver ? 'caregiver-reviews' : 'employer-reputation'}
      aria-label={
        caregiver ? 'คะแนนและรีวิวผู้ดูแล' : 'คะแนนและรีวิวผู้ว่าจ้าง'
      }
    >
      <h4>{caregiver ? 'คะแนนและรีวิว' : 'รีวิวผู้ว่าจ้างจากงานที่ผ่านมา'}</h4>
      {loading ? (
        <p role="status">กำลังโหลดรีวิว...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : !Number(info?.review_count) ? (
        <p className="workflow-hint">
          {caregiver
            ? 'ยังไม่มีรีวิวจากงานที่เสร็จสิ้น'
            : 'ยังไม่มีรีวิวผู้ว่าจ้างจากงานที่จบแล้ว'}
        </p>
      ) : (
        <>
          <p className="review-score">
            ★ {Number(info.average_rating).toFixed(1)} / 5{' '}
            <span>จาก {info.review_count} รีวิว</span>
          </p>
          {caregiver && (
            <p className="workflow-hint">
              รีวิวล่าสุดจากผู้ว่าจ้างที่เคยจ้างงานจริง
            </p>
          )}
          <ul className="caregiver-review-list">
            {info.reviews.map((review) => (
              <li key={review.id}>
                <strong>★ {review.rating} / 5</strong>
                <p className="review-comment">
                  {review.comment || 'ให้คะแนนโดยไม่ได้เขียนข้อความ'}
                </p>
                <small>{formatJobDate(review.created_at)}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
