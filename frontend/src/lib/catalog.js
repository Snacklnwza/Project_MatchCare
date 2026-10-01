import { supabase } from './supabase'

export const catalogLabels = { skills: 'ทักษะการดูแล', conditions: 'รอยโรคและสภาวะการดูแล' }

function catalogTable(kind) {
  if (!Object.hasOwn(catalogLabels, kind)) throw new Error('invalid_catalog')
  return supabase.from(kind)
}

export async function loadCatalog(kind) {
  const { data, error } = await catalogTable(kind)
    .select('id, name, description, is_active').order('name')
  if (error) throw error
  return data ?? []
}

export async function saveCatalogItem(kind, id, values) {
  const query = id == null
    ? catalogTable(kind).insert(values)
    : catalogTable(kind).update(values).eq('id', id)
  const { data, error } = await query.select('id, name, description, is_active').single()
  if (error) throw error
  return data
}

export function catalogError(error) {
  if (error.code === '23505') return 'มีชื่อนี้อยู่แล้ว รวมถึงรายการที่ปิดใช้งาน กรุณาใช้ชื่ออื่น'
  if (error.code === '42501' || error.code === 'PGRST116') return 'บันทึกไม่ได้ กรุณาตรวจสิทธิ์แอดมินหรือโหลดรายการใหม่'
  if (error.code === '23514') return 'ชื่อจำเป็นและยาวได้ไม่เกิน 120 ตัวอักษร คำอธิบายไม่เกิน 1,000 ตัวอักษร'
  return 'บันทึกไม่สำเร็จ ข้อมูลในฟอร์มยังอยู่ กรุณาลองใหม่'
}
