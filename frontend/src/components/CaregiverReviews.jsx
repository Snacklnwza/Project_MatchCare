import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate } from '../lib/jobs'
import { loadCaregiverReviews } from '../lib/reviews'
import '../styles/Reviews.css'

export default function CaregiverReviews({ caregiverId }) {
  const loader = useCallback(() => loadCaregiverReviews(caregiverId), [caregiverId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const info = data[0]
  return (
    <section className="caregiver-reviews" aria-label="คะแนนและรีวิวผู้ดูแล">
      <h4>คะแนนและรีวิว</h4>
      {loading ? <p role="status">กำลังโหลดรีวิว...</p> : error ? (
        <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองอีกครั้ง</button></div>
      ) : !info?.review_count || Number(info.review_count) === 0 ? <p>ยังไม่มีรีวิวจากงานที่เสร็จสิ้น</p> : (
        <>
          <p className="review-score">★ {Number(info.average_rating).toFixed(1)} / 5 <span>จาก {info.review_count} รีวิว</span></p>
          <p className="workflow-hint">รีวิวล่าสุดจากผู้ว่าจ้างที่เคยจ้างงานจริง</p>
          <ul className="caregiver-review-list">
            {info.reviews.map((review) => <li key={review.id}>
              <strong>★ {review.rating} / 5</strong>
              <p className="review-comment">{review.comment || 'ให้คะแนนโดยไม่ได้เขียนข้อความ'}</p>
              <small>{formatJobDate(review.created_at)}</small>
            </li>)}
          </ul>
        </>
      )}
    </section>
  )
}
