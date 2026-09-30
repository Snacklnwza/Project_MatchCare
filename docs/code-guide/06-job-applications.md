# ใบสมัครงานของผู้ดูแล (ID 10)

เมื่อผู้ดูแลเปิดรายละเอียดประกาศที่ยังรับสมัคร จะกด **สมัครงานนี้** ได้ ระบบส่งรหัสประกาศไปที่ `submit_application()` และให้ฐานข้อมูลเป็นผู้ตรวจสิทธิ์อีกครั้ง ไม่ใช้สถานะที่หน้าเว็บแสดงเป็นหลัก เพราะประกาศอาจปิดระหว่างที่ผู้ใช้กำลังดู

## โค้ดอยู่ตรงไหน

- `database/schema/08_invitations.sql` เพิ่ม `request_type` ใน `match_requests` เพื่อแยก `application` จาก `invitation` โดยใช้ unique เดิมของคู่ประกาศ–ผู้ดูแลกันรายการซ้ำ แม้กดพร้อมกัน
- `match_internal.submit_application()` ล็อกประกาศ ตรวจว่าเปิดรับ ตรวจ role, สถานะยืนยันตัวตนและพร้อมรับงาน ก่อนสร้างใบสมัคร `pending`; `public.submit_application()` เป็นทางเข้าที่หน้าเว็บเรียกได้
- `match_internal.list_my_applications()` คืนเฉพาะใบสมัครของผู้ดูแลที่เข้าสู่ระบบ; employer เจ้าของประกาศยังอ่านใบสมัครที่ได้รับผ่าน RLS ของ `match_requests` ได้
- `respond_to_invitation()` ตรวจ `request_type` เพิ่ม จึงไม่สามารถใช้ปุ่มตอบรับคำเชิญกับใบสมัครของตัวเองได้; `list_my_invitations()` แสดงเฉพาะคำเชิญ
- `frontend/src/pages/JobSearch.jsx` แสดงปุ่มสมัครและข้อผิดพลาดที่เข้าใจได้; `Applications.jsx` แสดงสถานะในเมนู **งานที่สมัคร**; `frontend/src/lib/workflow.js` รวมชื่อ RPC และข้อความสถานะ
- `database/tests/job_application_test.sql` ทดสอบการสมัคร สิทธิ์ ข้อมูลที่มองเห็น รายการซ้ำ การปิดประกาศ และการไม่ปะปนกับคำเชิญ

## การทดสอบ

รัน `npm --prefix database test`, `npm run lint` ใน `frontend` และ production build ด้วย Vite ผลวันที่ 30 กันยายน 2569 ผ่านทั้งหมด ฟังก์ชันถูกติดตั้งใน Supabase โครงการ `MatchCare-Rebuild` ด้วย migration ชื่อ `caregiver_job_applications`; ผู้ใช้ `authenticated` เรียก public RPC ได้ แต่ `anon` เรียกไม่ได้

ข้อจำกัดตอนนี้: ฝั่งผู้ว่าจ้างยังไม่มีหน้ารวมใบสมัครเพื่อกดยอมรับหรือปฏิเสธ งานนั้นเป็นขั้นถัดไปของเส้นทางจับคู่ (ID 11) จึงยังไม่ถือว่า flow สมัครจนจับคู่จากใบสมัครเสร็จ
