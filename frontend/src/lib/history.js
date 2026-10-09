import { callWorkflow } from './workflow'

export const historyPageSize = 20
export const historyFilters = {
  all: 'ทั้งหมด',
  active: 'กำลังดำเนินงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

export function loadJobHistory(status, page) {
  return callWorkflow('list_job_history', {
    p_status: status,
    p_offset: page * historyPageSize,
  })
}

export function loadHistoryDetails(jobId) {
  return callWorkflow('get_job_history_details', { p_job_id: jobId })
}
