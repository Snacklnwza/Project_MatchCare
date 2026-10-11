import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate } from '../lib/jobs'
import { loadJobEmployerReputation } from '../lib/reviews'
import '../styles/Reviews.css'

export default function EmployerReputation({ jobId }) {
  const loader = useCallback(() => loadJobEmployerReputation(jobId), [jobId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const info = data[0]

  return (
    <section
      className="employer-reputation"
      aria-label="คะแนนและรีวิวผู้ว่าจ้าง"
    >
      <h4>รีวิวผู้ว่าจ้างจากงานที่ผ่านมา</h4>
      {loading ? (
        <p role="status">กำลังโหลดรีวิว...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : !info?.review_count ? (
        <p className="workflow-hint">ยังไม่มีรีวิวผู้ว่าจ้างจากงานที่จบแล้ว</p>
      ) : (
        <>
          <p className="review-score">
            ★ {Number(info.average_rating).toFixed(1)} / 5{' '}
            <span>จาก {info.review_count} รีวิว</span>
          </p>
          <ul className="caregiver-review-list">
            {info.reviews.map((review) => (
              <li key={review.id}>
                <strong>★ {review.rating} / 5</strong>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
                <small>{formatJobDate(review.created_at)}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
