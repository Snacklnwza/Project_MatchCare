import { createClient } from '@supabase/supabase-js'

// อ่านค่าการเชื่อมต่อที่ตั้งไว้ใน .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// แจ้งสาเหตุให้ชัดเจนหากยังไม่ได้ตั้งค่า
if (!supabaseUrl || !supabaseKey) {
  throw new Error('กรุณาตั้งค่า Supabase URL และ Publishable Key ใน .env.local')
}

// สร้าง Client ส่วนกลางให้ไฟล์อื่นนำไปใช้
export const supabase = createClient(supabaseUrl, supabaseKey)