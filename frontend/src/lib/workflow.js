import { supabase } from './supabase'

export const documentLabels = {
  identity: 'เอกสารยืนยันตัวตน',
  care_certificate: 'ใบรับรองการดูแล',
  other: 'เอกสารอื่น ๆ',
}
export const reviewLabels = {
  pending: 'รอตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่ผ่านการตรวจสอบ',
}
export const invitationLabels = {
  pending: 'รอคำตอบ',
  accepted: 'จับคู่สำเร็จ',
  rejected: 'ปฏิเสธแล้ว',
  not_selected: 'คำเชิญสิ้นสุดแล้ว',
}
export const applicationLabels = {
  pending: 'รอผู้ว่าจ้างพิจารณา',
  accepted: 'จับคู่สำเร็จ',
  rejected: 'ไม่ผ่านการพิจารณา',
  not_selected: 'ประกาศสิ้นสุดแล้ว',
}
const messages = {
  invitation_already_exists: 'ส่งคำเชิญให้ผู้ดูแลคนนี้แล้ว',
  application_already_exists: 'ผู้ดูแลคนนี้สมัครงานไว้แล้ว',
  request_already_exists: 'คุณสมัครงานนี้แล้ว หรือได้รับคำเชิญอยู่แล้ว',
  caregiver_not_eligible: 'ผู้ดูแลต้องผ่านการยืนยันและเปิดพร้อมรับงาน',
  job_not_open: 'ประกาศนี้ไม่ได้เปิดรับสมัครแล้ว',
  invitation_no_longer_open: 'คำเชิญนี้สิ้นสุดแล้ว กรุณาโหลดรายการใหม่',
  identity_document_required: 'ต้องมีเอกสารยืนยันตัวตนที่ส่งตรวจในรอบนี้',
  rejection_reason_required: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ',
  review_no_longer_pending: 'รายการนี้ถูกตรวจสอบแล้ว กรุณาโหลดใหม่',
  profile_missing_or_already_verified:
    'ต้องบันทึกโปรไฟล์ก่อนส่งเอกสาร และส่งได้เฉพาะบัญชีที่ยังไม่อนุมัติ',
  uploaded_file_not_found: 'ไม่พบไฟล์อัปโหลดที่ถูกต้อง กรุณาส่งใหม่',
}
export function workflowError(error) {
  if (error?.code === '42501')
    return 'คุณไม่มีสิทธิ์ดำเนินการนี้ หรือสถานะรายการเปลี่ยนไปแล้ว'
  return messages[error?.message] ?? 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่'
}
export async function callWorkflow(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}
export const loadInvitations = () => callWorkflow('list_my_invitations')
export const loadMyApplications = () => callWorkflow('list_my_applications')
export const loadVerificationQueue = () =>
  callWorkflow('list_verification_queue')
export async function loadDocuments(caregiverId) {
  const { data, error } = await supabase
    .from('caregiver_documents')
    .select(
      'id, document_type, storage_path, original_file_name, review_status, rejection_reason, created_at',
    )
    .eq('caregiver_id', caregiverId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function uploadDocument(userId, file, type) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  }
  if (
    !file ||
    !extensions[file.type] ||
    file.size < 1 ||
    file.size > 5 * 1024 * 1024
  ) {
    throw new Error('เลือกไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5 MB')
  }
  const path = userId + '/' + crypto.randomUUID() + '.' + extensions[file.type]
  const { error } = await supabase.storage
    .from('caregiver-documents')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  await callWorkflow('submit_caregiver_document', {
    p_path: path,
    p_type: type,
    p_name: file.name,
    p_mime: file.type,
  })
}
export async function downloadDocument(document) {
  const { data, error } = await supabase.storage
    .from('caregiver-documents')
    .download(document.storage_path)
  if (error) throw error
  const url = URL.createObjectURL(data)
  const link = window.document.createElement('a')
  link.href = url
  link.download = document.original_file_name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
