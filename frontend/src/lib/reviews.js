import { callWorkflow } from './workflow'

export const loadJobReview = (jobId) =>
  callWorkflow('get_job_review', { p_job_id: jobId })
export const loadCaregiverReviews = (caregiverId) =>
  callWorkflow('get_caregiver_reviews', { p_caregiver_id: caregiverId })
export const loadJobEmployerReview = (jobId) =>
  callWorkflow('get_job_employer_review', { p_job_id: jobId })
export const loadJobEmployerReputation = (jobId) =>
  callWorkflow('get_job_employer_reputation', { p_job_id: jobId })
export function submitJobReview(jobId, rating, comment) {
  return callWorkflow('submit_job_review', {
    p_job_id: jobId,
    p_rating: rating,
    p_comment: comment.trim(),
  })
}
export function submitEmployerReview(jobId, rating, comment) {
  return callWorkflow('submit_employer_review', {
    p_job_id: jobId,
    p_rating: rating,
    p_comment: comment.trim(),
  })
}
export function reviewError(error) {
  if (error?.message === 'job_already_reviewed')
    return 'งานนี้เขียนรีวิวแล้ว กรุณาโหลดข้อมูลใหม่'
  if (error?.message === 'review_requires_completed_job')
    return 'เขียนรีวิวได้หลังผู้ว่าจ้างยืนยันจบงานแล้วเท่านั้น'
  if (error?.message === 'invalid_job_review')
    return 'เลือกคะแนน 1–5 ดาว และเขียนข้อความไม่เกิน 1,000 ตัวอักษร'
  if (error?.code === '42501') return 'คุณไม่มีสิทธิ์เขียนรีวิวของงานนี้'
  return 'บันทึกรีวิวไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ กรุณาลองใหม่'
}
