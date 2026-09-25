# MatchCare — Sprint 1: รีวิวโค้ดและหลักฐานตรวจรับ

วันที่ตรวจ: 25 กันยายน 2569
ขอบเขต: ID 1–4 (สมัครสมาชิก, เข้าสู่ระบบตามบทบาท, ผู้ป่วย, ประกาศงาน)
แหล่งขอบเขต: [MatchCare Backlog](https://docs.google.com/spreadsheets/d/1G9OgpVzQMtd6L0zx-GEj2ZRunYZf6RxxyjXuBItdP1w/edit?gid=0) และ `requirements.md`

## 1. ผลการตรวจและสถานะ

โค้ด flow หลักของ Sprint 1 เชื่อมฐานข้อมูลแล้ว: ผู้ว่าจ้างเพิ่ม/แก้ไข/ปิดใช้งานผู้ป่วย และสร้าง/แก้ไข/ปิดประกาศได้ โดยฐานข้อมูลตรวจเจ้าของข้อมูลและเงื่อนไขซ้ำอีกชั้น ไม่พึ่งการซ่อนปุ่มอย่างเดียว

สถานะนี้หมายถึง **ดำเนินการและทดสอบฟังก์ชันตามหลักฐานด้านล่าง** ไม่ใช่การรับรองว่าโครงการทุก Sprint เสร็จแล้ว หรือผ่านการตรวจเทียบ Figma ทุกพิกเซล

| ID | สิ่งที่มีแล้ว | หลักฐานและขอบเขตของการตรวจ |
|---|---|---|
| 1 สมัครสมาชิก | อีเมล/รหัสผ่าน/ยืนยันรหัสผ่าน; หลังยืนยันอีเมลจึงเลือกบทบาทและกรอกชื่อ โทรศัพท์ ที่อยู่; เลือกได้ employer/caregiver เท่านั้น | UI ตรวจรหัสไม่ตรงและจำลอง rate limit; SQL ทดสอบสร้าง profile และห้ามสร้าง admin; รอบนี้ไม่ได้ส่งอีเมลยืนยันจริงใหม่ |
| 2 เข้าสู่ระบบ | Supabase Auth, แจ้งรหัสผิด, แยกหน้าตาม 3 roles, ออกจากระบบ, retry เมื่อโหลด profile ผิดพลาด | เข้าสู่ระบบจริงทั้ง employer/caregiver/admin; ทดสอบรหัสผิดและ reload คง session; สลับแท็บแล้วข้อมูลฟอร์มยังอยู่ |
| 3 ผู้ป่วย | เพิ่ม/อ่าน/แก้ไข, หลายแท็ก, ที่อยู่แบบเลือกจังหวัด–อำเภอ–ตำบล, soft delete พร้อมยืนยัน, กันปิดเมื่อยังมีงาน | RPC/SQL ทดสอบ atomic save และ rollback; UI เพิ่มและปิดใช้งานจริง; การปิดขณะมีงานถูกปฏิเสธ |
| 4 ประกาศงาน | สร้าง/แก้ไข/ปิด, ผู้ป่วยของตนเอง, หลายทักษะ, วันเวลา, ค่าตอบแทน, ที่อยู่จากผู้ป่วย, ตัวกรองสถานะ, dashboard จาก DB จริง | UI สร้าง→แก้→ปิดจริง; SQL ทดสอบข้อมูลผิด/ข้ามบัญชี/role ผิด/anonymous; งานปิดหายจากรายการเปิดรับ |

### เรื่องที่ยังต้องตรวจรับภายนอกโค้ด

- เทียบหน้าจอกับ Figma ฉบับที่ทีมอนุมัติ: รอบนี้ตรวจความสอดคล้องกับหน้าตาเดิมและ responsive แต่ไม่มี design node ที่ยืนยันให้เทียบครบทุกหน้า จึงไม่อ้างว่า pixel-perfect
- สมัครด้วยอีเมลที่ทีมควบคุม → รับอีเมล → กดลิงก์กลับ production: รอบนี้ทดสอบ validation และ Auth บัญชีที่ยืนยันแล้ว ไม่ได้ยืนยันการส่งอีเมลของผู้ให้บริการใหม่
- ข้อมูลเก่า `profiles` มีเบอร์โทร 1 แถวที่ไม่ใช่เลขล้วนและยาวเกิน 10 หลัก ต้องให้เจ้าของตรวจเบอร์จริงก่อนแก้ ไม่ตัด/เดาแทน
- Backlog Sheet อ่านซ้ำในช่วงท้ายผ่าน connector ไม่สำเร็จ จึงใช้ขอบเขต ID 1–4 ที่อ่านได้ก่อนหน้านี้ ไม่ได้แก้สถานะใน Sheet แทนทีม

## 2. จุดที่พบและแก้ในรอบนี้

| ปัญหาเดิม | การแก้ | ไฟล์หลัก |
|---|---|---|
| ประกาศสร้างได้อย่างเดียว | เพิ่ม edit form, update RPC, close RPC, confirmation, filter และข้อมูลในการ์ด | `JobForm.jsx`, `JobManager.jsx`, schema 14 |
| หน้าหลักบอกไม่มีประกาศตลอด | Query `status = open` และแสดงงานจริง; แยก loading/error/empty | `EmployerDashboard.jsx` |
| หลายคำสั่งอาจบันทึกงานสำเร็จแต่แท็กไม่ครบ | ใช้ RPC transaction เดียว; ตรวจทักษะก่อนบันทึก; rollback เมื่อผิด | schema 13–14 |
| อาจแจ้งปิดผู้ป่วยสำเร็จทั้งที่ไม่แก้แถวใด | update พร้อม `select('id').single()` และตรวจ error/data ก่อนเอาการ์ดออก | `PatientManager.jsx` |
| กดบันทึกซ้ำ/กดยกเลิกระหว่างบันทึก | ใช้ ref กัน submit ซ้ำ, disabled state, finally คืนสถานะ | ฟอร์มผู้ป่วย/ประกาศ/โปรไฟล์ |
| Query profile ใน auth callback | ย้าย query ไป effect ตาม user ID; ป้องกันผลเก่ามาทับบัญชีใหม่; ไม่ reload profile ทุก token refresh | `App.jsx` |
| Error ส่งเมลถี่เกินเป็นอังกฤษ/ข้อความทั่วไป | แปล error code และ HTTP 429; ไม่แสดงว่าสมัครสำเร็จแน่นอนเมื่อ Auth ปกปิดบัญชีซ้ำ | `RegisterForm.jsx` |
| Modal ใช้คีย์บอร์ดไม่ครบ | focus เริ่มต้น, Tab อยู่ใน modal, Escape, คืน focus และล็อก body scroll | `PatientForm.jsx` |
| ข้อมูลไม่ครบ/วันเกิดอนาคต | inline message เชื่อม `aria-describedby`, native validity, ตรวจซ้ำที่ DB | `PatientForm.jsx`, schema 16 |
| เปิดประกาศพร้อมปิดผู้ป่วย/แก้แท็กพร้อมกัน | ล็อกแถวผู้ป่วย/ประกาศใน transaction; คง constraint ว่างานเปิดต้องมีทักษะ | schema 13–15 |
| วันเกิดใช้วันของเซิร์ฟเวอร์ UTC | ตรวจวันใน Asia/Bangkok ที่ DB และ date input ตามวันท้องถิ่นใน UI | schema 16, `jobs.js` |
| JS ก้อนหลักประมาณ 2.86 MB | สร้างข้อมูลจังหวัดเฉพาะชื่อไทยที่ใช้ และ lazy-load ฟอร์ม | `generate-geography.mjs`, `geography-options.json`, `App.jsx`, `PatientManager.jsx` |
| FK ประกาศขาด covering index | เพิ่ม index patient/owner และ cancelled_by | schema 16 |

โค้ด JSX/CSS บางไฟล์มีการจัดรูปแบบด้วย Prettier เพื่ออ่านง่ายด้วย การเปลี่ยนรูปแบบไม่ได้เพิ่มความสามารถให้หน้าที่เป็น placeholder

## 3. แผนผังการอ่านโค้ด

อ่านตามลำดับนี้เพื่อเข้าใจ flow โดยไม่ต้องเริ่มจาก SQL ทุกบรรทัด:

1. `frontend/src/main.jsx` → `App.jsx`: เริ่ม React, รับ session, โหลด profile, เลือกหน้า
2. `RegisterForm.jsx` → `LoginForm.jsx` → `ProfileSetupForm.jsx`: บัญชีและข้อมูลส่วนตัว
3. `RoleDashboard.jsx` → `Navbar.jsx`: role กับหน้าในระบบ
4. `PatientManager.jsx` → `PatientForm.jsx` → schema 09: รายการ/ฟอร์ม/บันทึกผู้ป่วย
5. `JobManager.jsx` → `JobForm.jsx` → schema 10–16: ประกาศและกฎฐานข้อมูล
6. `EmployerDashboard.jsx`: สรุปผู้ป่วยและงานเปิดรับ
7. `database/tests/sprint1_integration_test.sql`: ตรวจว่าสิทธิ์และเงื่อนไขทำงานจริง

ไฟล์ [SPRINT1_SOURCE_SNAPSHOT.md](SPRINT1_SOURCE_SNAPSHOT.md) รวม source ที่ใช้รีวิวไว้ในเอกสารเดียว พร้อม SHA-256 ของแต่ละไฟล์ ไม่รวมรหัสผ่าน, `.env`, dependency, ไฟล์ภาพ, build output และข้อมูลพื้นที่ดิบขนาดใหญ่

## 4. รีวิว Frontend รายไฟล์

| ไฟล์ใน `frontend/` | หน้าที่/สิ่งที่ตรวจ |
|---|---|
| `index.html` | ภาษาไทย, viewport, Prompt font และ favicon; font จาก Google ยังพึ่งเครือข่ายภายนอก |
| `src/main.jsx` | mount React ใน StrictMode; effect ต้องมี cleanup เพราะ dev อาจเรียกซ้ำ |
| `src/App.jsx` | คุม landing/login/register/session/profile; `loadedUserId` กันแสดงหน้า profile ผิดบัญชี; `cancelled` กันผล query เก่า; loading/retry/signout |
| `src/lib/supabase.js` | client ส่วนกลางจาก URL + publishable key; ไม่มี service-role key; error เมื่อไม่ได้ตั้ง env |
| `src/lib/jobs.js` | แปลงสถานะ/หน่วยเป็นไทย, แสดงวันเวลา, แปลง ISO กลับ datetime-local โดยไม่เลื่อนเวลาไป UTC |
| `src/components/RegisterForm.jsx` | trim email, ยืนยันรหัส, minLength 8, checkbox, redirect ตาม origin; duplicate account ตอบกลาง ๆ ตามพฤติกรรม Auth |
| `src/components/LoginForm.jsx` | signInWithPassword, loading และ error ภาษาไทย; ไม่บันทึกรหัสในตาราง profile |
| `src/components/ProfileSetupForm.jsx` | เลือกได้ 1 role, ชื่อ/นามสกุล/โทรศัพท์/ที่อยู่; โทร UI 9–10 หลักและตัดอักขระที่ไม่ใช่เลข; RLS กันสร้างแทนผู้อื่น |
| `src/components/PatientManager.jsx` | อ่านเฉพาะ active ของตนผ่าน RLS; edit modal, state หลัง save, confirmation/feedback/deactivate, retry |
| `src/components/PatientForm.jsx` | แสดง/เลือก tags และพื้นที่, ตรวจ required/วันเกิด, RPC atomic save, เก็บฟอร์มเมื่อผิดพลาด, modal keyboard |
| `src/components/JobManager.jsx` | list และ filter, เลือก create/edit, refresh หลัง save, close พร้อมยืนยัน; ตรวจ RPC ส่ง ID กลับก่อน success |
| `src/components/JobForm.jsx` | form create/edit เดียวกัน; prefill, skill IDs, dates/pay/text validation, read-only location summary, RPC ตามโหมด, retry options |
| `src/components/Navbar.jsx` | เมนูต่างกันตาม role; aria-current; menu account/signout; notification เป็น placeholder |
| `src/components/LandingNavbar.jsx` | แบรนด์เดียวกับภายใน; ปุ่ม login/register |
| `src/components/Footer.jsx` | แบรนด์/ข้อความท้ายหน้า; policy/terms/contact ยังเป็นข้อความ ไม่ใช่หน้าข้อมูลที่เสร็จแล้ว |
| `src/pages/RoleDashboard.jsx` | เลือก dashboard ตาม role, employer patients/jobs ใช้งานจริง; เมนูอื่นยัง placeholder |
| `src/pages/EmployerDashboard.jsx` | รายการผู้ป่วยล่าสุด 3 คน และประกาศ `open` จาก DB; ไม่แสดง empty state เมื่อ query ยังโหลด/ผิดพลาด |
| `src/pages/CaregiverDashboard.jsx` | หน้าเข้าใช้ของ caregiver ตาม ID 2; การจัดการโปรไฟล์/ค้นหางานเป็นงาน Sprint ถัดไป |
| `src/pages/AdminDashboard.jsx` | หน้าเข้าใช้ของ admin ตาม ID 2; ยังไม่ใช่ระบบอนุมัติเอกสาร |
| `src/pages/LandingPage.jsx` | หน้าแนะนำระบบและ CTA; ข้อความเกี่ยวกับ verified/review เป็นเป้าหมายผลิตภัณฑ์ ต้องตรวจอีกครั้งก่อนเปิดรับผู้ใช้จริง |
| `src/index.css` | font, สีพื้น, min-width 320px, root height |
| `src/App.css` | layout, navbar/footer, auth/profile/patient/job styles, media queries, focus-visible และ disabled |
| `scripts/generate-geography.mjs` | สร้างจังหวัด→อำเภอ→ตำบลจาก source เดิม; ใช้ `npm run generate:geography` เมื่อข้อมูลต้นทางเปลี่ยน |
| `src/data/geography.json` | ข้อมูลต้นทาง; ไม่ bundle ทั้งชุดอีกต่อไป |
| `src/data/geography-options.json` | generated artifact ที่ UI ใช้; ควร regenerate ไม่แก้มือ |
| `src/data/thailand-geography-json.LICENSE.txt` | เก็บ license ของข้อมูลต้นทาง |
| `vite.config.js`, `package.json`, `package-lock.json` | React/Vite build, dependency versions และ scripts; ไม่เพิ่ม library runtime เพื่อทำฟอร์ม |
| `.env.example` | ชื่อตัวแปรตั้งค่าเท่านั้น; `.env.local` ถูก ignore |

### ตัวอย่าง flow บันทึกประกาศ

`JobForm.handleSubmit` ตรวจข้อมูล → ส่งพารามิเตอร์ `p_*` ไป RPC → PostgreSQL ตรวจสิทธิ์/ข้อมูล → บันทึกแถวงานและแท็ก → ส่ง ID กลับ → `JobManager.onSaved` ปิดฟอร์มและเพิ่ม `refreshKey` → effect โหลดรายการใหม่

`try` ทำงานที่อาจล้มเหลว, `catch` แสดงข้อผิดพลาดและคงข้อมูลฟอร์ม, `finally` คืนปุ่มจากสถานะกำลังบันทึก ส่วน `savingRef` ป้องกันการเรียกซ้ำก่อน React render รอบใหม่

## 5. รีวิวฐานข้อมูลรายไฟล์

มี **10 ตารางใน public**; `auth.users` เป็นอีก schema ที่ Supabase จัดการ จำนวนไฟล์ SQL ไม่ใช่จำนวนตาราง

| ไฟล์ | หน้าที่ |
|---|---|
| `prototypes/skills_setup.sql` | สร้าง skills/seed ไทย และ policy อ่านเฉพาะ active; ใช้เป็น prerequisite ของ schema 04 แม้อยู่โฟลเดอร์ prototypes |
| `schema/01_profiles.sql` | profile PK UUID อ้าง auth.users, role/contact/address และ constraints |
| `schema/02_profiles_policies.sql` | อ่าน/สร้าง/แก้เฉพาะตน; client สร้าง admin ไม่ได้ และแก้ role ไม่ได้ |
| `schema/03_updated_at_trigger.sql` | private schema และ trigger updated_at |
| `schema/04_patient_tables.sql` | conditions, patients, patient_conditions, patient_required_skills; owner/date/mobility constraints |
| `schema/05_patient_policies.sql` | patient owner policies, active reference data และสิทธิ์ join tables |
| `schema/06_patient_seed.sql` | สภาวะตัวอย่าง 3 รายการ; ไม่ใช่คำวินิจฉัยทางการแพทย์ |
| `schema/07_caregiver_tables.sql` | caregiver_profiles/caregiver_skills และ verification constraints; โครงรองรับ Sprint ถัดไป |
| `schema/08_caregiver_policies.sql` | caregiver จัดการตนเองได้ แต่ยืนยันตัวเองไม่ได้ |
| `schema/09_patient_atomic_save.sql` | save_patient_with_tags: insert/update และเปลี่ยนแท็กใน transaction เดียว |
| `schema/10_job_posts.sql` | job_posts/job_required_skills, FK คู่ patient+owner, status/date/pay constraints, deferred skill guard |
| `schema/11_job_policies.sql` | own job select/insert/update และ own editable skill relations; ไม่เปิดที่อยู่ละเอียดให้สาธารณะ |
| `schema/12_patient_open_job_guard.sql` | block soft delete เมื่อมี open/matched/in_progress |
| `schema/13_job_atomic_save.sql` | create_job_with_tags: lock patient, validate, draft→tags→open, คืน ID |
| `schema/14_job_atomic_update.sql` | update_job_with_tags และ close_job; ล็อกงาน, ป้องกันแก้/ปิดข้ามเจ้าของและงานที่ปิดแล้ว |
| `schema/15_sprint1_integrity.sql` | patient/skill locking, title length, finite timestamps, phone constraint สำหรับการเขียนใหม่ |
| `schema/16_sprint1_indexes_and_dates.sql` | covering FK indexes; birth date finite และวันปัจจุบันแบบไทย |

### กฎสำคัญที่ผู้รีวิวต้องตรวจ

- RPC เป็น `SECURITY INVOKER`; ใช้ RLS/column grants ของผู้เรียก ไม่มี service-role ฝัง frontend
- `auth.uid()` คือเจ้าของจาก session ไม่รับ `employer_id` จากฟอร์มให้เลือกเอง
- `job_posts` ใช้ FK `(patient_id, employer_id)` กันเชื่อมผู้ป่วยของคนอื่น
- `close_job` ต้อง update ได้จริงจึงส่ง ID กลับ; stale/ไม่มีสิทธิ์ไม่แสดงสำเร็จ
- งานเปิดต้องมีอย่างน้อยหนึ่งทักษะ; deferred trigger ตรวจตอนจบ transaction
- ที่อยู่ของประกาศเป็น snapshot จากผู้ป่วย ณ ตอนบันทึก; แก้ผู้ป่วยอย่างเดียวไม่เปลี่ยนงานย้อนหลัง
- ผู้ว่าจ้างปิดผู้ป่วยไม่ได้เมื่อมีงานที่ยัง active; เมื่อปิดประกาศจึงปิดผู้ป่วยได้
- identity sequence อาจมีเลขข้ามหลัง rollback เป็นพฤติกรรมปกติ ไม่ใช่ข้อมูลหาย

## 6. หลักฐานการทดสอบ

### อัตโนมัติ/ฐานข้อมูล

| รายการ | ผลจริง |
|---|---|
| `npm run lint` ใน frontend | ผ่าน |
| `npm run build` ใน frontend | ผ่าน; หลังลด/แยกข้อมูลพื้นที่ ไม่มี chunk-size warning |
| `sprint1_integration_test.sql` | true ทั้ง 6 กลุ่ม: profiles_and_roles, patient_guard, job_create_update_close, atomic_rollback, cross_account, anon_denied |
| `patient_atomic_save_test.sql` | patient_atomic_save_passed = true |
| `job_posts_id4_test.sql` | true ทั้ง 6 ค่า: patient guard, caregiver rejected, owner hidden/update rejected, job closed, patient deactivated |
| SQL fixtures | ครอบด้วย BEGIN/ROLLBACK; ไม่ทิ้ง auth/profile/job fixtures ของชุด integration |
| UI fixture จริง | ประกาศทดสอบปิดแล้ว; ผู้ป่วยสมมติ is_active=false; ค่าตอบแทน 1500 และทักษะเหลือ 1 หลัง edit |

### เบราว์เซอร์ Chromium ผ่าน Playwright CLI

- login ผู้ว่าจ้าง/ผู้ดูแล/แอดมิน → หน้าถูก role
- รหัสผิด → ข้อความผิดพลาด; reload ผู้ดูแล → session ยังอยู่
- ฟอร์มผู้ป่วย: เพิ่มจริง, สลับแท็บแล้วค่าที่กรอกไม่หาย
- สร้างงานไม่มีทักษะ → ไม่บันทึก
- จำลอง RPC 503 → ข้อผิดพลาดและค่าเดิมยังอยู่ → เอา mock ออก → บันทึกจริงสำเร็จ
- edit งาน: ค่าเวลา 08:00–17:00 กลับมาครบ ไม่กลายเป็น UTC; เปลี่ยนค่าจ้าง/ทักษะจริง
- mobile 390px: job form ไม่มี horizontal overflow; ตรวจ screenshot
- ปิดผู้ป่วยขณะงานเปิด → DB ปฏิเสธและ UI แจ้งเหตุผล
- ยกเลิก confirm ปิดประกาศ → ยังแก้ได้; ยืนยัน → closed
- filter เปิดรับ/หน้าแรก → งานปิดไม่ปรากฏ; จากนั้นปิดผู้ป่วยสำเร็จ
- สมัครรหัสไม่ตรง → ถูกปฏิเสธ; mock HTTP 429 → ข้อความไทย; ไม่ส่งเมลจริงใน test นี้

ภาพ/สคริปต์การทดสอบอยู่ `output/playwright/` ภายในเครื่องและถูก ignore เพื่อไม่เผยแพร่ session/test credentials ไม่ควรนำทั้งโฟลเดอร์ commit

### ข้อจำกัดของหลักฐาน

- ทดสอบที่ localhost กับ Supabase จริง; ไม่เท่ากับตรวจ Vercel deployment สำเร็จจนกว่าจะเห็น build ของ commit นี้
- SQL locking ถูกตรวจโค้ดและทดสอบ invariant แบบ transaction แต่ยังไม่ได้ทำ concurrent load test หลาย connection
- ชุด test เก่า `profiles_rls_test.sql`, `patients_rls_test.sql`, `caregiver_profiles_rls_test.sql`, `skills_rls_test.sql` เป็นแบบฝึกหลายช่วงและมี prerequisite ต่างกัน ไม่ควรเหมารวมว่า run ทุกไฟล์ครั้งเดียวผ่าน; ใช้ integration suite ใหม่สำหรับ Sprint 1 regression
- `skills_crud_test.sql` เป็น demo ที่แก้ข้อมูลจริง ไม่ได้ครอบ rollback ทั้งไฟล์ จึงไม่รันระหว่างตรวจรอบนี้

## 7. ข้อสังเกตคงเหลือและความเสี่ยง

| ระดับ | ประเด็น | วิธีจัดการ |
|---|---|---|
| ข้อมูลเดิม | เบอร์เก่า 1 แถวไม่ผ่านรูปแบบ | constraint `profiles_phone_digits` เป็น NOT VALID: ตรวจการ insert/update ใหม่ แต่ยังไม่รับรองข้อมูลเดิม; ให้เจ้าของแก้แล้วค่อย VALIDATE CONSTRAINT |
| การตั้งค่า Auth | Supabase แจ้ง leaked-password protection ยังไม่เปิด | ตรวจความพร้อมแผนบริการและเปิดใน Auth ตาม [เอกสาร Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); ไม่เปลี่ยนแพ็กเกจ/ค่าใช้จ่ายเอง |
| Auth operational | SMTP quota และ Site URL/Redirect URLs เป็นค่าภายนอก repo | production ต้องอนุญาต `https://matchcare-chi.vercel.app/`; ทดสอบอีเมลจริงหลัง deploy |
| ขอบเขต product | หน้าค้นหาผู้ดูแล/ค้นหางาน/ใบสมัคร/ตรวจเอกสาร/ประวัติยังไม่ทำ | Sprint ถัดไป ไม่ใช่ฟังก์ชันเสร็จเพราะมีชื่อเมนูแล้ว |
| การแก้พร้อมกัน | edit สองหน้าพร้อมกันเป็น last successful write wins | หากต้องรักษาร่างหลายคน ให้เพิ่ม optimistic concurrency ด้วย updated_at ใน Sprint ต่อไป |
| ปริมาณข้อมูล | รายการ jobs ยังไม่มี pagination | เหมาะกับข้อมูลโครงงาน; เพิ่ม pagination ก่อนมีข้อมูลมาก |
| ข้อมูลอ้างอิง | ทักษะ inactive ที่เคยเลือกอาจถูกซ่อนโดย RLS | ก่อนเพิ่มหน้า Admin ปิดทักษะ ต้องออกแบบการแสดง historical tags/การเปลี่ยนแท็กให้ชัดเจน |
| การบำรุงรักษา | schema เป็น numbered scripts ไม่ใช่ migration runner เต็มรูปแบบ | รันตามลำดับบนฐานใหม่; ฐานเดิมใช้ migration ที่ยังไม่เคยรัน ไม่รัน CREATE TABLE ซ้ำ |

Supabase Performance Advisor เคยแจ้ง FK ที่ขาด index 2 จุด ซึ่งเพิ่มแล้วใน schema 16; unused indexes ของข้อมูลขนาดเล็กไม่ใช่เหตุให้ลบทันที ดู [คำอธิบาย linter](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

## 8. วิธีรันและตรวจด้วยตนเอง

```powershell
cd frontend
npm ci
# สร้าง .env.local จาก .env.example แล้วใส่ URL และ publishable key ของโปรเจกต์
npm run dev
npm run lint
npm run build
```

ตั้ง Vercel Root Directory = `frontend`, Framework = Vite, Build = `npm run build`, Output = `dist`; ตั้ง env ใน Vercel แล้ว redeploy เมื่อเปลี่ยนค่า env

ฐานใหม่: `prototypes/skills_setup.sql` → schema `01` ถึง `16` ตามลำดับ ส่วนฐานเดิมที่ใช้ทดสอบมีการ apply migrations แล้ว ไม่ต้องรัน CREATE TABLE ซ้ำ

Regression ที่แนะนำ: รัน `database/tests/sprint1_integration_test.sql` ทั้งไฟล์ใน SQL Editor พร้อม BEGIN/ROLLBACK; ต้องได้ true ทั้งหกค่า ไม่มีรหัสผ่านในไฟล์นี้

## 9. คำถามสำหรับการรีวิวร่วมกัน

1. อธิบายได้หรือไม่ว่าทำไมผู้ใช้เปลี่ยน role เป็น admin ด้วย API ไม่ได้?
2. เพราะอะไรต้องบันทึกประกาศกับ skills ใน transaction เดียว?
3. หาก RPC error ทำไมจึงไม่ควรปิดฟอร์มหรือแสดง success?
4. ข้อมูลอะไรเป็นของผู้ป่วย และอะไรเป็น snapshot ในประกาศ?
5. การไม่เห็นแถวเพราะ RLS ต่างจากไม่มีแถวในฐานข้อมูลอย่างไร?
6. งานที่ปิดแล้วหายเฉพาะจากรายการเปิดรับ หรือถูกลบจากฐานข้อมูล?
7. เมนูใดเป็น Sprint 1 จริง และเมนูใดเป็น placeholder ของ Sprint ต่อไป?

## 10. เอกสารเดิมที่ต้องอ่านอย่างระวัง

`development-plan.md` เป็นแผนเดิมที่มีวันที่เก่า ไม่ใช้ยืนยันวันปิดโครงการแทนข้อตกลงวันที่ 30 กันยายน; `database-audit.md` และ `mvp-schema-plan.md` อธิบายการออกแบบ/ช่องว่างเดิม ไม่ใช่รายการฟังก์ชันที่ทำเสร็จแล้วทั้งหมด

## 11. การตรวจฟอร์มรอบสุดท้าย

ทดสอบโทรศัพท์เกิน 10 หลักถูกตัดเหลือ 10 หลัก, ตัวเลือกจังหวัด–อำเภอ–ตำบล, หน้าจอ 390px ไม่ล้นแนวนอน และ submit โปรไฟล์ด้วย HTTP mock เพื่อไม่แก้บัญชีจริง ผ่านแล้ว ฟอร์มผู้ป่วยว่างแสดง inline error พร้อม aria-invalid; วันเกิดในอนาคตแสดงข้อความไทย; Escape ปิด modal ได้

ตัวจำลองโปรไฟล์ครั้งแรกมีข้อผิดพลาด route already handled และคำขอถูกฐานข้อมูลปฏิเสธด้วย duplicate key จึงไม่มีข้อมูลถูกเขียน; แก้ตัวจำลองแล้วรันผ่าน ข้อผิดพลาดนี้อยู่ใน test harness ไม่ใช่โค้ดแอป

## 12. แก้การเลือกที่อยู่ในฟอร์มผู้ป่วย

หลังเปลี่ยนช่องจังหวัดเป็นรายการค้นหา พบว่าค่าที่เลือกแล้วกรองรายการเหลือเพียงจังหวัดเดิม จึงเปลี่ยนจังหวัดยาก และรายการแบบใหม่กระทบการคลิกช่องถัดไป คืนช่องจังหวัดเป็น select ตามเดิม โดยหยุดตัวจัดการ input ของฟอร์มไม่ให้เปลี่ยน state ระหว่างเลือก select; แต่ละ select ล้างข้อความผิดพลาดใน onChange ของตัวเอง ทดสอบพะเยา → เมืองพะเยา → ตำบลหนึ่งรายการบน localhost ทุกค่ายังอยู่หลังออกจากช่อง เปลี่ยนพะเยาเป็นเชียงใหม่ได้ อำเภอ/ตำบลเดิมถูกล้าง และเลือกอำเภอใหม่ได้ ต้องทดสอบซ้ำบน Vercel หลัง deploy commit นี้
