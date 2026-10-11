# MatchCare

เว็บจับคู่ผู้ว่าจ้างกับผู้ดูแลสำหรับงานดูแลผู้ป่วย พัฒนาด้วย React, Vite, Supabase Auth, Storage และ PostgreSQL ผ่าน RLS/RPC

## ระบบที่ใช้งานได้

- ผู้ว่าจ้างจัดการข้อมูลผู้ป่วยและประกาศงาน ค้นหาผู้ดูแลตามทักษะ ส่งคำเชิญ และพิจารณาใบสมัคร
- ผู้ดูแลบันทึกโปรไฟล์ ทักษะ และรูป ส่งเอกสารยืนยันตัวตน ค้นหาและสมัครงาน ตอบรับคำเชิญ และดูปฏิทินงาน
- แอดมินตรวจเอกสารผู้ดูแล จัดการคลังทักษะ/สภาวะการดูแล และดูสถิติ
- ระบบจำกัดการเปิดข้อมูลติดต่อจนจับคู่สำเร็จ กันเวลางานทับกัน ติดตามการเริ่มและจบงาน แจ้งเตือน และให้รีวิวหลังจบงาน
- สมัคร เข้าสู่ระบบ และขอลิงก์ตั้งรหัสผ่านใหม่ผ่าน Supabase Auth

## เปิดโปรเจกต์ในเครื่อง

1. เข้า `frontend` แล้วรัน `npm ci`
2. คัดลอก `frontend/.env.example` เป็น `frontend/.env.local` และตั้ง `VITE_SUPABASE_URL` กับ `VITE_SUPABASE_PUBLISHABLE_KEY` ห้ามใส่ secret/service-role key ในตัวแปร `VITE_*`
3. รัน `npm run dev` จาก `frontend`

เว็บที่ deploy ใช้ Vercel โดยตั้ง Root Directory เป็น `frontend`, Build Command เป็น `npm run build`, Output Directory เป็น `dist` และตั้ง environment variables สองตัวเดียวกันใน Vercel

## ตรวจโค้ด

จาก `frontend` รัน `npm run lint` และ `npm run build` จาก `database` รัน `npm ci` และ `npm test`

`database/npm test` รัน SQL บน PGlite ชั่วคราวในเครื่อง ไม่ได้ตรวจฐาน Supabase ที่ใช้งานจริง การส่งงานควรตรวจ flow สำคัญอีกครั้งบนเว็บที่ deploy

## ฐานข้อมูลและเอกสาร

- `database/schema/01_core.sql` ถึง `20_care_skill_tags.sql` คือชุด SQL เรียงลำดับสำหรับสร้างฐานใหม่ **ห้ามรันซ้ำบนฐานที่ใช้อยู่**
- `database/tests/` คือชุดทดสอบ SQL และตัวรันทดสอบในเครื่อง
- `supabase/migrations/` เก็บ migration รุ่นเก่าที่เคยใช้; การเปลี่ยนแปลงรุ่นหลังบางส่วนติดตั้งผ่าน Supabase SQL Editor จึงต้องตรวจฐานจริงก่อนนำโครงการไปใช้กับฐานใหม่
- `database/README.md` อธิบายการจัดการ SQL และข้อควรระวังเพิ่มเติม
- `docs/` เป็นคู่มือและหลักฐานในเครื่องตามข้อตกลงของโครงการ โฟลเดอร์นี้ถูก `.gitignore` และไม่รวมใน GitHub; หากต้องส่งเอกสารให้แนบแยก
