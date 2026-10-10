import { supabase } from './supabase'

const profileFields = 'id, role, first_name, last_name, phone, line_id'

export async function saveCaregiverContact(userId, values) {
  const changes = {
    phone: values.phone.trim(),
    line_id: values.line_id.trim() || null,
  }
  if (!/^[0-9]{9,10}$/.test(changes.phone))
    throw new Error('กรอกเบอร์โทรศัพท์ 9–10 หลัก')
  if (changes.line_id?.length > 100)
    throw new Error('LINE ID ต้องไม่เกิน 100 ตัวอักษร')
  // ส่งเฉพาะช่องทางติดต่อ ใช้ RLS เดิม ไม่แก้สถานะยืนยันตัวตน
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .eq('role', 'caregiver')
    .select('phone, line_id')
    .single()
  if (error) throw new Error('บันทึกข้อมูลติดต่อไม่สำเร็จ กรุณาลองใหม่')
  return data
}

export async function loadEmployerProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileFields)
    .eq('id', userId)
    .eq('role', 'employer')
    .single()
  if (error) throw error
  return data
}

export async function saveEmployerProfile(userId, values) {
  const changes = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    phone: values.phone.trim(),
    line_id: values.line_id.trim() || null,
  }
  if (!changes.first_name || !changes.last_name)
    throw new Error('กรุณากรอกชื่อและนามสกุล')
  if (changes.first_name.length > 100 || changes.last_name.length > 100)
    throw new Error('ชื่อและนามสกุลต้องไม่เกินช่องละ 100 ตัวอักษร')
  if (!/^[0-9]{9,10}$/.test(changes.phone))
    throw new Error('กรอกเบอร์โทรศัพท์ 9-10 หลัก')
  if (changes.line_id?.length > 100)
    throw new Error('LINE ID ต้องไม่เกิน 100 ตัวอักษร')

  // ส่งเฉพาะช่องที่แก้ได้ ใช้ RLS เดิมจำกัดให้บันทึกเฉพาะเจ้าของบัญชี
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .eq('role', 'employer')
    .select(profileFields)
    .single()
  if (error)
    throw new Error('บันทึกไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ กรุณาลองใหม่')
  return data
}
