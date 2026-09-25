# MatchCare

เว็บจับคู่ผู้ว่าจ้างกับผู้ดูแล ใช้ React, Vite และ Supabase

## Sprint 1

มีระบบสมัคร/เข้าสู่ระบบตามบทบาท จัดการผู้ป่วย และสร้าง–แก้ไข–ปิดประกาศ พร้อมตรวจสิทธิ์ที่ฐานข้อมูล

- [รีวิวโค้ด ผลทดสอบ และข้อจำกัด](docs/SPRINT1_CODE_REVIEW.md)
- [รวม source สำหรับอ่านรีวิว](docs/SPRINT1_SOURCE_SNAPSHOT.md)

เมนู Sprint ถัดไปบางส่วนยังเป็น placeholder ไม่ถือว่าโครงการทั้งหมดเสร็จแล้ว

## เริ่มพัฒนา

เข้าโฟลเดอร์ frontend แล้วรัน npm ci สร้าง .env.local ตาม .env.example และใส่ Supabase URL กับ publishable key

- npm run dev: เปิดเว็บพัฒนา
- npm run lint: ตรวจโค้ด
- npm run build: สร้าง production bundle

ฐานข้อมูลใหม่: รัน database/prototypes/skills_setup.sql แล้ว schema 01–16 ตามลำดับ ฐานเดิมไม่ควรรัน CREATE TABLE ซ้ำ

Regression: รัน database/tests/sprint1_integration_test.sql ทั้งไฟล์ใน SQL Editor ข้อมูลทดสอบจะ rollback

Vercel: Root Directory frontend, Build npm run build, Output dist และตั้ง environment variables ก่อน deploy

สร้างเอกสาร source ใหม่: node scripts/generate-review-snapshot.mjs
