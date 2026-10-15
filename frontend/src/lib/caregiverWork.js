export const workFilters = {
  current: 'งานปัจจุบัน',
  waiting: 'รอคำตอบ',
  matched: 'รับงานแล้ว',
  in_progress: 'กำลังดูแล',
  ended: 'จบแล้ว / สิ้นสุด',
  all: 'ทั้งหมด',
}

export function workGroup(request) {
  if (request.status === 'pending' && request.job_status === 'open') return 'waiting'
  if (request.status === 'accepted') {
    if (request.job_status === 'matched') return 'matched'
    if (['in_progress', 'completion_pending'].includes(request.job_status)) return 'in_progress'
  }
  return 'ended'
}

export function workMatches(request, filter) {
  const group = workGroup(request)
  return filter === 'all' || (filter === 'current' ? group !== 'ended' : group === filter)
}

export function mergeCaregiverWork(invitations, applications) {
  const requests = new Map()
  for (const [rows, type] of [[invitations, 'invitation'], [applications, 'application']]) {
    for (const row of rows) requests.set(String(row.request_id), { ...row, request_type: type })
  }
  return [...requests.values()].sort((a, b) => Number(b.request_id) - Number(a.request_id))
}
