# ฐานข้อมูล MatchCare

## ติดตั้งฐานใหม่

รันไฟล์ใน `schema/` ตามลำดับ โดยรันแต่ละไฟล์ทั้งไฟล์ใน Supabase SQL Editor:

1. `01_core.sql` — ทักษะ บัญชี สิทธิ์พื้นฐาน และฟังก์ชัน `updated_at`
2. `02_patients.sql` — ผู้ป่วย สภาวะ สิทธิ์ ข้อมูลตั้งต้น และฟังก์ชันบันทึก
3. `03_caregivers.sql` — โปรไฟล์และสิทธิ์ผู้ดูแล
4. `04_jobs.sql` — ประกาศงาน สิทธิ์ และฟังก์ชันสร้าง แก้ไข ปิดงาน
5. `05_integrity.sql` — กฎตรวจข้อมูลเพิ่มเติมและดัชนี
6. `06_matching.sql` — RPC ค้นหาผู้ดูแลสำหรับประกาศของผู้ว่าจ้าง
7. `07_caregiver_documents.sql` — Storage ส่วนตัว เอกสาร และ RPC ตรวจอนุมัติ
8. `08_invitations.sql` — คำเชิญ ตอบรับ/ปฏิเสธ และข้อมูลติดต่อหลังจับคู่

ไฟล์เหล่านี้เป็น **ชุดติดตั้งฐานใหม่** ไม่ใช่ migration runner ห้ามนำไปรันซ้ำบนฐานที่มีตารางแล้ว คำสั่ง SQL ย้ายมาจากสคริปต์ 01–16 เดิมโดยคงเนื้อหาและลำดับความขึ้นต่อกันไว้

## ฐานที่ใช้งานอยู่

ใช้ `../supabase/migrations/` เป็นที่เก็บ migration ใหม่ที่ตรงกับประวัติ Supabase ตรวจประวัติก่อนรันและไม่รันซ้ำ ห้ามรัน `schema/` เพื่ออัปเดตฐานเดิม ส่วน `database/migrations/` เก็บ patch เก่าเพื่ออ้างอิงเท่านั้น

`001_patient_normal_mobility.sql` เพิ่มค่า `normal` ใน constraint ของ `patients.mobility_status` ฐาน Supabase หลักของโครงการรองรับค่านี้แล้ว จึงไม่ต้องรันไฟล์นี้ซ้ำ

ไฟล์ใน `tests/` เป็น SQL สำหรับตรวจพฤติกรรม ไม่ใช่ขั้นตอนติดตั้งฐานข้อมูล

## ชุดเอกสารและจับคู่ที่ติดตั้งแล้ว

`../supabase/migrations/20260928084433_caregiver_documents_and_invitations.sql` รวม schema 07–08 สำหรับฐานเดิมใน transaction เดียว
ติดตั้งบน Supabase วันที่ 28 กันยายน 2026 แล้ว ผ่าน SQL rollback และทดสอบ Auth/Storage/RPC จริงด้วยบัญชีทดสอบสาม role
อ่านขอบเขต ผลทดสอบ และคู่มือโค้ดได้ที่ [คู่มือโค้ด](../docs/code-guide/README.md)

จาก root โปรเจกต์ รันทดสอบในเครื่องได้ด้วย `npm --prefix database ci` แล้ว `npm --prefix database test`
ไม่มีการเชื่อมฐานจริงในคำสั่งทดสอบนี้

## ส่วนค้นหาผู้ดูแล

`search_caregivers_for_job(p_job_id)` ตรวจว่าผู้เรียกเป็น employer เจ้าของประกาศสถานะ open
แล้วคืนผู้ดูแลที่ verified และ available เรียงจำนวนทักษะตรงกันมากไปน้อย
คะแนนเท่ากันเรียงประสบการณ์มากไปน้อย แล้วใช้ caregiver_id ให้ลำดับคงที่
ผู้ดูแลที่ตรงศูนย์ทักษะยังอยู่ท้ายรายการ ไม่มีข้อมูลติดต่อหรือที่อยู่ละเอียดในผลลัพธ์

ฟังก์ชันภายในอยู่ใน `match_internal` ซึ่งต้องไม่เพิ่มใน Exposed schemas ของ Data API
public RPC ใช้ SECURITY INVOKER ส่วนฟังก์ชันภายในตรวจสิทธิ์เองก่อนอ่านข้าม RLS

ทดสอบด้วย `tests/matching_search_test.sql` โดยใช้ข้อมูลสมมติและ rollback
เมื่อ 28 กันยายน 2026 ติดตั้งบน Supabase แล้วด้วย migration `caregiver_matching_search`
เก็บสำเนาที่ CLI สร้างใน `supabase/migrations/20260927185017_caregiver_matching_search.sql`
(ปรับ version ให้ตรงกับประวัติ migration บนเซิร์ฟเวอร์)
ฐานเดิมที่ยังไม่ติดตั้งให้ใช้ migration นี้ ไม่รันชุด schema ทั้งหมดซ้ำ
ทดสอบ SQL หลังติดตั้งผ่านแล้ว และ rollback เฉพาะข้อมูลสมมติ

หน้า `JobManager` มีปุ่มค้นหาสำหรับประกาศ open และเรียก RPC ผ่าน `CaregiverMatches`
ทดสอบ UI ด้วยข้อมูลสมมติครอบคลุมการส่ง job ID, ผลค้นหา, รายการว่าง, error และลองใหม่
ยังไม่ได้ทดสอบแบบเข้าสู่ระบบจริงจากเบราว์เซอร์ครบวงจร หรือเผยแพร่ frontend ไป Vercel

Security advisors หลังติดตั้ง schema 07–08 ไม่พบรายการเตือนของ RLS เอกสารหรือฟังก์ชันใหม่ เหลืองานตั้งค่า Auth เดิม:
- Auth ยังไม่เปิด leaked password protection: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
