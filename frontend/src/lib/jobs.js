import { supabase } from './supabase'

export const JOB_PAGE_SIZE = 20

export async function searchOpenJobs(filters, page) {
  const { data, error } = await supabase.rpc('search_open_jobs', {
    p_province: filters.province || null,
    p_district: filters.district || null,
    p_work_date: filters.workDate || null,
    p_pay_unit: filters.payUnit || null,
    p_min_pay: filters.minimumPay === '' ? null : Number(filters.minimumPay),
    p_max_pay: filters.maximumPay === '' ? null : Number(filters.maximumPay),
    p_skill_id: filters.skillId === '' ? null : Number(filters.skillId),
    p_offset: page * JOB_PAGE_SIZE,
    p_limit: JOB_PAGE_SIZE + 1,
  })
  if (error) throw error
  return data ?? []
}

export async function loadJobSkillOptions() {
  const { data, error } = await supabase
    .from('skills')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getOpenJobDetails(jobId) {
  const { data, error } = await supabase.rpc('get_open_job_details', {
    p_job_id: jobId,
  })
  if (error) throw error
  return data
}

export const jobStatusLabels = {
  draft: 'ฉบับร่าง',
  open: 'เปิดรับสมัคร',
  closed: 'ปิดรับสมัคร',
  matched: 'จับคู่สำเร็จ',
  in_progress: 'กำลังดำเนินงาน',
  completion_pending: 'รอผู้ว่าจ้างยืนยันจบงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}
export const payUnitLabels = {
  hour: 'ต่อชั่วโมง',
  day: 'ต่อวัน',
  month: 'ต่อเดือน',
  total: 'เหมาทั้งงาน',
}

// datetime-local ต้องเป็นเวลาท้องถิ่น ไม่ใช่เวลา UTC ที่ใช้เก็บในฐานข้อมูล
export function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
export function formatJobDate(value) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
