import { callWorkflow } from './workflow'

export const loadMySchedule = (month) =>
  callWorkflow('list_my_schedule', { p_month: month })
export const scheduleDate = (year, month, day = 1) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
export function jobsOnDate(jobs, date) {
  const start = new Date(`${date}T00:00:00+07:00`).getTime()
  return jobs.filter(
    (job) =>
      new Date(job.starts_at).getTime() < start + 86400000 &&
      new Date(job.ends_at).getTime() > start,
  )
}
export const activeJob = (job) =>
  ['matched', 'in_progress', 'completion_pending'].includes(job.job_status)
