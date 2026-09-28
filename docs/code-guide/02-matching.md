# ค้นหา คำเชิญ และการจับคู่

## ไฟล์

- `database/schema/06_matching.sql`: ค้นหาผู้ดูแลด้วยทักษะของประกาศ
- `database/schema/08_invitations.sql`: คำเชิญ การเปลี่ยนสถานะ และสิทธิ์ดูข้อมูลติดต่อ
- `frontend/src/components/JobManager.jsx`: เปิดหน้าค้นหาจากประกาศ open
- `frontend/src/components/CaregiverMatches.jsx`: ผลค้นหาและปุ่มเชิญ
- `frontend/src/pages/Invitations.jsx`: รายการคำเชิญใช้ร่วมผู้ว่าจ้างและผู้ดูแล

## การค้นหา

`search_caregivers_for_job(job_id)` ตรวจผู้ว่าจ้างเจ้าของประกาศ open เลือกผู้ดูแล verified + available แล้วนับทักษะที่ตรง เรียงจำนวนตรงมากไปน้อย ตามด้วยประสบการณ์และ UUID เพื่อให้ลำดับคงที่

ผลลัพธ์ไม่มีเบอร์ LINE หรือที่อยู่ละเอียด คนที่ตรงศูนย์ทักษะอยู่ท้ายรายการ ฟังก์ชันนี้ยังไม่มีตัวกรองสถานที่หรือ pagination

## ตาราง match_requests

| คอลัมน์/กฎ | เหตุผล |
| --- | --- |
| job_post_id | ระบุประกาศและหาเจ้าของจาก job_posts โดยไม่เชื่อ employer_id จาก client |
| caregiver_id | คนที่ได้รับคำเชิญ |
| status | pending, accepted, rejected, not_selected |
| created_at/responded_at | เวลาส่งและสิ้นสุดคำเชิญ |
| UNIQUE(job_post_id, caregiver_id) | ป้องกันคำเชิญซ้ำ รวมคำเชิญที่เคยปฏิเสธ |
| partial UNIQUE(job_post_id) WHERE accepted | บังคับหนึ่งผู้ดูแลที่ตอบรับต่อประกาศ |

## ฟังก์ชัน

### invite_caregiver(job_id, caregiver_id)

ล็อกประกาศ ตรวจว่าผู้เรียกเป็นเจ้าของและงาน open ตรวจผู้ดูแล verified + available แล้วเพิ่ม pending หากเคยเชิญแล้วให้ข้อความ invitation_already_exists

### respond_to_invitation(request_id, accept)

1. ตรวจว่าคำเชิญเป็นของผู้ดูแลที่ล็อกอิน
2. ล็อกประกาศก่อน แล้วล็อกคำเชิญ ทุกคำตอบใช้ลำดับเดียวกัน
3. ตรวจคำเชิญ pending และประกาศ open อีกครั้งหลังได้ล็อก
4. ถ้าตอบรับ ตรวจ verified + available อีกครั้ง
5. เปลี่ยนคำเชิญเป็น accepted, ประกาศเป็น matched, คำเชิญ pending อื่นเป็น not_selected ใน transaction เดียว
6. ถ้าปฏิเสธ เปลี่ยนเฉพาะคำเชิญนั้นเป็น rejected

ล็อกประกาศทำให้คำตอบของคนที่สองรอ และตรวจสถานะใหม่หลังคนแรกสำเร็จ ส่วน unique index เป็นการป้องกันซ้ำอีกชั้น การทดสอบสอง session พร้อมกันบน Supabase จริงยังค้าง

### list_my_invitations()

ตรวจ session และบทบาท คืนเฉพาะรายการของผู้ดูแลหรือเจ้าของประกาศ พร้อมหัวข้อ รายละเอียดงาน วันเวลา ค่าตอบแทน และพื้นที่ระดับจังหวัด/อำเภอ ไม่คืนข้อมูลติดต่อหรือที่อยู่ละเอียด

### get_match_contact(request_id)

อนุญาตเฉพาะผู้ว่าจ้างหรือผู้ดูแลของคำเชิญ accepted คืนชื่อและเบอร์/LINE ของอีกฝ่ายพร้อมที่อยู่สถานที่ดูแลจากประกาศ ปุ่มใน UI ไม่ใช่ตัวรักษาความปลอดภัยหลัก; RPC ตรวจสิทธิ์เองเสมอ

### private.validate_job_post()

คงกฎและการล็อกผู้ป่วยจาก schema 05 เพิ่มเฉพาะ open → matched เมื่อมีคำเชิญ accepted จริง ไม่เปิดสิทธิ์ให้ client เปลี่ยนสถานะคำเชิญโดยตรง

### private.close_pending_invitations()

Trigger หลังประกาศถูกปิด เปลี่ยน pending เป็น not_selected เพื่อไม่ให้แสดงคำเชิญที่รับไม่ได้ค้างไว้

## Frontend

- `invite`: ยืนยันก่อนส่ง, ref ป้องกันกดซ้ำ, disabled ระหว่างส่ง, แสดงผลภาษาไทย
- `respond`: รับ/ปฏิเสธ แล้ว reload รายการเพื่อรับสถานะจากฐานข้อมูล
- `showContact`: เรียก RPC เมื่อกดดูเท่านั้น; ไม่มีการโหลดข้อมูลติดต่อมาก่อนแล้วซ่อนด้วย CSS
- เปลี่ยน role แล้ว RoleDashboard ถูก remount ตามบัญชีจาก App.jsx ป้องกัน state ของบัญชีเดิมปน

## ขอบเขต

หนึ่งประกาศรับได้หนึ่งคน แต่ยังไม่ตรวจเวลางานทับซ้อนข้ามหลายประกาศ ยังไม่มีการถอนคำเชิญหรือยกเลิกคู่ accepted และไม่มีการสมัครที่ผู้ดูแลเริ่มเองในตารางนี้
