# เอกสารและการยืนยันผู้ดูแล

## ไฟล์และหน้าที่

| ไฟล์ | หน้าที่ |
| --- | --- |
| `database/schema/07_caregiver_documents.sql` | metadata เอกสาร, private bucket, RLS, RPC ส่งและตรวจ |
| `frontend/src/pages/CaregiverDocuments.jsx` | เลือกประเภทไฟล์ ส่งเอกสาร และดูผลตรวจ |
| `frontend/src/pages/AdminVerifications.jsx` | คิวผู้ดูแลรอตรวจ เลือกคน ดาวน์โหลด และตัดสินผล |
| `frontend/src/components/DocumentList.jsx` | รายการเอกสารใช้ร่วมทั้งผู้ดูแลและแอดมิน |
| `frontend/src/lib/workflow.js` | ฟังก์ชันติดต่อ RPC/Storage และข้อความภาษาไทย |

## ทำไมแยกไฟล์กับ metadata

Storage เก็บเนื้อไฟล์; `caregiver_documents` เก็บเจ้าของ ประเภท path ชื่อไฟล์ และผลตรวจ หน้าเว็บต้องอัปโหลดสำเร็จก่อนเรียก `submit_caregiver_document` เพื่อไม่สร้างรายการที่อ้างไฟล์ที่ไม่มี

bucket `caregiver-documents` เป็น private จำกัด JPG/PNG/PDF และ 5 MB ชื่อ path เป็น `user UUID/file UUID.ext` ไม่ใช้ชื่อบุคคลหรือเลขบัตรใน URL

## ฟังก์ชัน SQL

### submit_caregiver_document(path, type, name, mime)

1. ตรวจ `auth.uid()` และบทบาท caregiver
2. ล็อก `caregiver_profiles` ด้วย `FOR UPDATE` ให้การส่งกับการตรวจไม่ทับกัน
3. ตรวจว่ามีโปรไฟล์และยังไม่ verified
4. ตรวจ Storage object, เจ้าของ, โฟลเดอร์, MIME และขนาดที่ metadata ของ Storage ระบุ
5. เพิ่มเอกสาร pending และเปลี่ยนโปรไฟล์เป็น pending ใน transaction เดียว

ฟังก์ชันไม่ได้ตรวจว่าไฟล์เป็นบัตรจริงหรือเนื้อหาแท้ แอดมินต้องอ่านไฟล์เอง MIME/ขนาดเป็นข้อจำกัดทางเทคนิค ไม่ใช่การยืนยันบุคคล

### list_verification_queue()

ตรวจบทบาท admin แล้วคืนเฉพาะ UUID ชื่อและสถานะของผู้ดูแล pending ใช้ SQL function เพื่อไม่เปิดสิทธิ์อ่านตาราง profiles ทั้งแถวให้หน้าแอดมิน

### review_caregiver(caregiver_id, approve, reason)

ตรวจบทบาท admin และห้ามตรวจตัวเอง ล็อกโปรไฟล์เดียวกับการส่งเอกสาร ตรวจว่ายัง pending และตัดสินเอกสาร pending ในรอบนั้นทั้งหมด

- อนุมัติ: ต้องมีเอกสารประเภท identity ในรอบที่รอตรวจพร้อม Storage object → เอกสาร approved, โปรไฟล์ verified พร้อมผู้ตรวจและเวลา
- ไม่อนุมัติ: ต้องมีเหตุผล 1–1,000 ตัวอักษร → เอกสารและโปรไฟล์ rejected
- ส่งใหม่หลัง rejected ได้ โดยต้องส่ง identity ใหม่เพื่ออนุมัติรอบใหม่
- ใบรับรองและเอกสารอื่นเป็นเอกสารประกอบ; MVP รอบนี้ไม่ได้บังคับใบรับรองทุกคน

## สิทธิ์

- ผู้ดูแลอ่าน metadata/ไฟล์ของตัวเองได้
- แอดมินอ่านไฟล์ที่ลงทะเบียนเป็นเอกสารแล้วได้; ไฟล์อัปโหลดค้างที่ยังไม่มี metadata ไม่อยู่ในคิว
- ผู้ว่าจ้างและ anon อ่านเอกสารไม่ได้
- authenticated ไม่มีสิทธิ์ INSERT/UPDATE metadata โดยตรง จึงแก้ review_status เองไม่ได้
- ไม่ให้ overwrite/delete ไฟล์ผ่าน client ป้องกันเปลี่ยนเนื้อหาหลังตรวจ
- public RPC เป็น SECURITY INVOKER; ฟังก์ชันที่ใช้สิทธิ์สูงอยู่ใน match_internal, กำหนด search_path ว่าง, ตรวจสิทธิ์ทุกครั้ง และ revoke EXECUTE จาก PUBLIC/anon
- ต้องไม่เพิ่ม match_internal ใน Exposed schemas

## Frontend

- `submit`: ตรวจไฟล์ก่อนส่ง ใช้ ref กันกดซ้ำ และ finally คืนสถานะปุ่ม
- `uploadDocument`: อัปโหลดด้วย upsert=false แล้วเรียก RPC ลงทะเบียน
- `loadDocuments`: โหลดเฉพาะ metadata ที่จำเป็นตาม caregiver_id โดย RLS ตรวจสิทธิ์ซ้ำ
- `downloadDocument`: download ด้วย session ปัจจุบัน สร้าง Blob URL ชั่วคราวแล้ว revoke; ไม่สร้าง public URL
- `review`: ขอคำยืนยัน ตรวจเหตุผลเมื่อปฏิเสธ และโหลดคิวใหม่เมื่อสำเร็จ

## กรณีผิดพลาดที่ต้องรู้

Storage กับฐานข้อมูลไม่ใช่ transaction เดียวกัน หากอัปโหลดสำเร็จแต่ RPC ลงทะเบียนล้มเหลว ไฟล์อาจค้างแบบไม่มี metadata จะไม่ถูกอนุมัติหรือแสดงให้แอดมินในคิว ต้องมีขั้นตอนเก็บกวาดไฟล์ค้างผ่าน Storage API ก่อนใช้งานระยะยาว ห้ามลบ storage.objects ด้วย SQL แทนการลบไฟล์จริง

บัญชี verified ส่งเพิ่มไม่ได้ใน MVP นี้ ถ้าต้องการเปลี่ยนเอกสารหลังอนุมัติ ต้องออกแบบการขอตรวจรอบใหม่ก่อน
