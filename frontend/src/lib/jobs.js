export const jobStatusLabels = {
  draft: 'ฉบับร่าง',
  open: 'เปิดรับสมัคร',
  closed: 'ปิดรับสมัคร',
  matched: 'เลือกผู้ดูแลแล้ว',
  in_progress: 'กำลังดำเนินงาน',
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
