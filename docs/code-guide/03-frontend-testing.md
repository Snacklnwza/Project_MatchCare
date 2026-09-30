# Frontend, UX/UI และการทดสอบ

## โครงสร้าง

ใช้ `pages` สำหรับหน้าจอ, `components` สำหรับส่วนร่วม, `styles` สำหรับ CSS, `lib` สำหรับ Supabase/API และข้อความ, `hooks` สำหรับพฤติกรรม React ที่ซ้ำจริง

เพิ่ม `useRemoteList(loader)` เพราะหน้าเอกสาร คิวตรวจ และคำเชิญต้องมี loading/error/reload และป้องกันการอัปเดต state หลังออกจากหน้าเหมือนกัน loader ต้องคงที่ด้วย useCallback หรือประกาศระดับไฟล์ ไม่มีการเพิ่ม state-management library

`workflow.js` มี:

| ฟังก์ชัน | หน้าที่ |
| --- | --- |
| callWorkflow | เรียก RPC แล้ว throw เมื่อมี error |
| workflowError | แปลง error ที่รู้จักเป็นข้อความภาษาไทย ไม่ส่งรายละเอียดฐานข้อมูลดิบให้ผู้ใช้ |
| loadInvitations/loadVerificationQueue | loader คงที่สำหรับ useRemoteList |
| loadDocuments | เลือก metadata ที่หน้าจอต้องใช้ |
| uploadDocument | ตรวจชนิด/ขนาด ตั้งชื่อสุ่ม อัปโหลด แล้วลงทะเบียน |
| downloadDocument | ดาวน์โหลดด้วยสิทธิ์ session และคืนทรัพยากร Blob URL |

## หลัก UX/UI ที่ใช้

- หน้าเอกสารแบ่งฝั่งส่งใหม่กับรายการที่ส่งแล้ว desktop สองคอลัมน์ มือถือหนึ่งคอลัมน์
- คิวแอดมินแยกรายชื่อกับรายละเอียดของคนที่เลือก เหตุผลบังคับเมื่อไม่อนุมัติ
- คำเชิญแสดงข้อมูลที่ใช้ตัดสินใจก่อนปุ่มตอบรับ; ข้อมูลติดต่อโหลดเมื่อ accepted เท่านั้น
- ปุ่มหลักสีเขียว การปฏิเสธเป็นปุ่มรอง ไม่ทำสองปุ่มเด่นเท่ากัน
- ทุกคำสั่ง async มี disabled/loading และข้อความ error/status; ใช้ label จริง, focus-visible และปุ่มอย่างน้อย 44px
- เมนูบัญชีมีโปรไฟล์และเอกสารเหนือเส้นแบ่งออกจากระบบ
- ไม่ใส่ตัวเลขสรุปหรือข้อมูลจำลองลง production UI

## รันตรวจในเครื่อง

จากโฟลเดอร์ MatchCare_Rebuild:

```powershell
npm --prefix database ci
npm --prefix database test
npm --prefix frontend run lint
npm --prefix frontend run build
```

ฐานทดสอบใช้ PGlite 0.3.14 และสร้างใหม่ในหน่วยความจำทุกครั้ง ไม่เชื่อมฐานจริง `tests/run-local.mjs` จำลอง auth.uid, roles และ storage metadata จากนั้นรัน schema ตามลำดับ แล้วรัน tests

| ชุดทดสอบ | ตรวจอะไร | ผลล่าสุด |
| --- | --- | --- |
| matching_search_test.sql | คะแนนค้นหา เงื่อนไขยืนยัน/พร้อมรับงาน เจ้าของประกาศ | ผ่านในเครื่อง |
| workflow_integration_test.sql | ส่ง/ปฏิเสธ/ส่งใหม่/อนุมัติ, RLS, เชิญซ้ำ, รับงาน, ผู้ดูแลคนที่สอง, contact gating, ปิดงาน | ผ่านในเครื่องและ Supabase จริงแบบ rollback |
| sprint1_integration_test.sql | ระบบโปรไฟล์ ผู้ป่วย ประกาศเดิมไม่เสีย | ผ่านในเครื่อง |
| Playwright fixture | ส่งไฟล์ UI, เหตุผลปฏิเสธ, อนุมัติ, รับคำเชิญ, ดู contact และมือถือ | ผ่านด้วย API จำลอง |
| Supabase JS + session จริง | Auth สาม role, binary upload/download, อนุมัติ, ค้นหา, เชิญ, รับงาน, ข้อมูลติดต่อ | ผ่าน ดูรายงาน 04 |

ตัวอย่างภาพและ script ตรวจ UI อยู่ใน `output/playwright` และ fixture อยู่ `frontend/output/playwright` ซึ่ง gitignore ไว้ ไม่ใช่หน้าที่ deploy

## แผนตรวจ Supabase จริง

ติดตั้งแล้วและทดสอบเส้นทางหลักผ่านตาม [รายงานฐานจริง](04-live-test-results.md) รายการด้านล่างเป็นขอบเขตรวม รวม edge case ที่ต้องขยายผลต่อ ไม่ได้ถือว่าทุกข้อผ่านจาก UI mock

1. ใช้ไฟล์สมมติ JPG/PNG/PDF จริง ทดสอบ 0 byte, เกิน 5 MB, MIME ไม่รองรับ
2. ผู้ดูแลอัปโหลด/อ่านของตัวเอง; ผู้ดูแลอื่นและผู้ว่าจ้างอ่าน URL เดียวกันต้องไม่ได้
3. แอดมินดาวน์โหลดเอกสาร ตรวจปฏิเสธพร้อมเหตุผล ส่งใหม่แล้วอนุมัติ
4. ผู้ว่าจ้างค้นหาผู้ดูแล approved + available แล้วเชิญ
5. ทดสอบตอบรับและปฏิเสธด้วยบัญชีจริงทั้งสองฝ่าย
6. ใช้สอง session ตอบรับสองคำเชิญของประกาศเดียวกันพร้อมกัน ต้อง accepted เพียงหนึ่ง
7. ก่อน accepted เรียก get_match_contact ตรง ๆ ต้องถูกปฏิเสธ; หลัง accepted ได้เฉพาะคู่
8. ทดสอบ network error ระหว่าง upload กับลงทะเบียนเอกสาร และเก็บกวาดไฟล์ orphan ด้วย Storage API
9. ตรวจ security advisors และทดสอบ Vercel หลัง deploy

ฐานทดสอบในเครื่องไม่จำลอง JWT signature, Storage HTTP service, binary file validation หรือการล็อกข้าม connection จึงไม่ใช้ผลในเครื่องแทนรายการตรวจจริงเหล่านี้
