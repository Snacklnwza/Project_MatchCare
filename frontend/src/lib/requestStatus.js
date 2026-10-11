import { jobStatusLabels } from './jobs'

export function requestGroup(request) {
  if (request.status === 'pending' && request.job_status === 'open')
    return 'waiting'
  if (
    request.status === 'accepted' &&
    ['matched', 'in_progress', 'completion_pending'].includes(
      request.job_status,
    )
  )
    return 'active'
  return 'ended'
}

export function requestMatches(request, filter) {
  const group = requestGroup(request)
  return (
    filter === 'all' ||
    (filter === 'current' ? group !== 'ended' : group === filter)
  )
}

export function requestStatus(request, labels) {
  if (request.status === 'accepted')
    return {
      status: request.job_status,
      label: jobStatusLabels[request.job_status] ?? 'ตอบรับแล้ว',
    }
  if (request.status === 'pending' && request.job_status !== 'open')
    return { status: 'closed', label: 'ประกาศสิ้นสุดแล้ว' }
  return {
    status: request.status,
    label: labels[request.status] ?? 'ไม่ทราบสถานะ',
  }
}
