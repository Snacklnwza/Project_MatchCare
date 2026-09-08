# MatchCare MVP Schema Plan

> เวอร์ชัน: 1.0
>
> วันที่จัดทำ: 8 กันยายน 2569
> สถานะ: Logical Schema พร้อมใช้เป็นต้นแบบสำหรับเขียน SQL, RLS และปรับ ER Diagram

## 1. เป้าหมาย

เอกสารนี้กำหนดโครงสร้างฐานข้อมูลขั้นต่ำของ MatchCare ให้สอดคล้องกับ Requirement ก่อนเขียน SQL จริง โดยระบุรายชื่อตาราง คอลัมน์ ชนิดข้อมูล ความสัมพันธ์ Constraint สถานะ การลบข้อมูล ดัชนี และแนวทาง Row Level Security (RLS)

หลักสำคัญของการออกแบบ:

- รองรับ User Flow ตั้งแต่สมัครสมาชิกจนจบงานและรีวิว
- ใช้ Supabase Auth จัดการบัญชีและรหัสผ่าน
- ผู้ใช้หนึ่งบัญชีมีหนึ่งบทบาทหลัก
- ผู้ดูแลดูประกาศได้ แต่สมัครได้เมื่อผ่านการยืนยันแล้วเท่านั้น
- ผู้ว่าจ้างส่งคำเชิญได้หลายคน แต่หนึ่งประกาศตอบรับผู้ดูแลได้หนึ่งคน
- ซ่อนชื่อผู้ป่วย ที่อยู่ละเอียด และข้อมูลติดต่อก่อนจับคู่สำเร็จ
- เปิด RLS สำหรับทุกตารางใน `public`
- ใช้ข้อมูลสมมติในการพัฒนา ทดสอบ และสาธิตเท่านั้น

## 2. ขอบเขตของฐานข้อมูล MVP

ฐานข้อมูลต้องรองรับ:

- การสมัคร เข้าสู่ระบบ และแยกบทบาท `employer`, `caregiver` และ `admin`
- การจัดการโปรไฟล์และที่อยู่ของผู้ใช้
- การจัดการผู้ป่วย สภาวะ และทักษะการดูแลที่ต้องการ
- การจัดการโปรไฟล์ ทักษะ ความพร้อม และเอกสารของผู้ดูแล
- การตรวจสอบและอนุมัติผู้ดูแลโดย Admin
- การสร้าง ค้นหา แก้ไข และยกเลิกประกาศงาน
- การสมัครงาน การส่งคำเชิญ และการตอบรับหรือปฏิเสธ
- การเลือกผู้ดูแลหนึ่งคนต่อประกาศ การเก็บประวัติงาน และรีวิวสองทาง
- การจำกัดสิทธิ์และการเปิดเผยข้อมูลด้วย RLS

สิ่งที่ไม่รวมใน MVP ได้แก่ ระบบชำระเงิน แชทแบบเรียลไทม์ GPS/e-KYC จริง เวชระเบียน ระบบแจ้งเตือนภายนอก และ Machine Learning

## 3. ข้อตกลงการตั้งชื่อและชนิดข้อมูล

- ตารางและคอลัมน์ใช้ตัวพิมพ์เล็กแบบ `snake_case`
- ID บัญชีใช้ `uuid` เพื่อเชื่อม `auth.users.id`
- ID ข้อมูลภายในใช้ `bigint generated always as identity`
- เงินใช้ `numeric(10,2)` ไม่ใช้ `float`
- วันเวลาเหตุการณ์ใช้ `timestamptz`; วันเกิดใช้ `date`
- สถานะใช้ `text` ร่วมกับ `check`
- Foreign Key ต้องมีดัชนี เว้นแต่ถูกครอบคลุมด้วย Primary Key หรือ Unique Index แล้ว
- ทุกตารางใน `public` ต้องเปิด RLS ก่อนให้ Frontend เข้าถึง

## 4. รายชื่อตาราง MVP

| ลำดับ | ตาราง | หน้าที่หลัก |
|---:|---|---|
| 1 | `profiles` | ข้อมูลทั่วไป ที่อยู่ และบทบาทของผู้ใช้ |
| 2 | `caregiver_profiles` | ประสบการณ์ ความพร้อม และสถานะตรวจสอบของผู้ดูแล |
| 3 | `caregiver_documents` | Metadata ของเอกสารใน Private Storage |
| 4 | `patients` | ข้อมูลผู้ป่วยของผู้ว่าจ้าง |
| 5 | `conditions` | รายการสภาวะหรือลักษณะการดูแลส่วนกลาง |
| 6 | `patient_conditions` | เชื่อมผู้ป่วยกับหลายสภาวะ |
| 7 | `skills` | รายการทักษะการดูแลส่วนกลาง |
| 8 | `patient_required_skills` | เชื่อมผู้ป่วยกับหลายทักษะที่ต้องการ |
| 9 | `caregiver_skills` | เชื่อมผู้ดูแลกับหลายทักษะที่มี |
| 10 | `job_posts` | ประกาศและสถานะงานตั้งแต่ร่างจนจบงาน |
| 11 | `job_required_skills` | Snapshot ทักษะที่ประกาศต้องการ |
| 12 | `match_requests` | ใบสมัคร คำเชิญ และผลการตอบรับ |
| 13 | `reviews` | คะแนนและรีวิวสองทางหลังงานเสร็จ |

### 4.1 ตารางของ Supabase

`auth.users` จัดการบัญชี อีเมล รหัสผ่าน และการยืนยันตัวตน MatchCare ไม่สร้างตารางนี้เองและไม่เก็บรหัสผ่านใน `profiles`

`storage.objects` เป็นตารางระบบของ Supabase Storage ไฟล์เอกสารผู้ดูแลต้องอยู่ใน Private Bucket ส่วน `caregiver_documents` เก็บเฉพาะข้อมูลอ้างอิงไฟล์และสถานะตรวจสอบ

### 4.2 เหตุผลที่ไม่ใช้ `care_jobs` แยกใน MVP

สถานะงานเก็บใน `job_posts` และผู้ดูแลที่ได้รับเลือกหาได้จาก `match_requests` สถานะ `accepted` การมี `care_jobs` เพิ่มจะทำให้มีสถานะงานสองแหล่งและเสี่ยงข้อมูลไม่ตรงกัน จึงใช้สองตารางนี้เป็นแหล่งข้อมูลหลักชุดเดียว

## 5. ความสัมพันธ์ระหว่างตาราง

| ตารางต้นทาง | Cardinality | ตารางปลายทาง | คำอธิบาย |
|---|:---:|---|---|
| `auth.users` | 1:1 | `profiles` | หนึ่งบัญชีมีหนึ่งโปรไฟล์ |
| `profiles` | 1:0..1 | `caregiver_profiles` | เฉพาะ Caregiver มีข้อมูลส่วนขยาย |
| `caregiver_profiles` | 1:N | `caregiver_documents` | ผู้ดูแลส่งเอกสารได้หลายรายการ |
| `profiles` | 1:N | `patients` | ผู้ว่าจ้างมีผู้ป่วยได้หลายคน |
| `patients` | N:M | `conditions` | เชื่อมผ่าน `patient_conditions` |
| `patients` | N:M | `skills` | เชื่อมผ่าน `patient_required_skills` |
| `caregiver_profiles` | N:M | `skills` | เชื่อมผ่าน `caregiver_skills` |
| `profiles` | 1:N | `job_posts` | ผู้ว่าจ้างสร้างประกาศได้หลายรายการ |
| `patients` | 1:N | `job_posts` | ผู้ป่วยหนึ่งคนมีประกาศได้หลายรายการตามช่วงเวลา |
| `job_posts` | N:M | `skills` | เชื่อมผ่าน `job_required_skills` |
| `job_posts` | 1:N | `match_requests` | หนึ่งประกาศมีใบสมัครและคำเชิญหลายรายการ |
| `job_posts` | 1:N | `reviews` | งานที่เสร็จแล้วมีรีวิวจากคู่สัญญาได้สูงสุดสองรายการ |

## 6. รายละเอียดคอลัมน์และ Constraint

### 6.1 `profiles`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` | ID เดียวกับบัญชี Auth |
| `role` | `text` | Not Null, Check | `employer`, `caregiver`, `admin` |
| `first_name` | `text` | Not Null, Not Blank | ชื่อ |
| `last_name` | `text` | Not Null, Not Blank | นามสกุล |
| `phone` | `text` | Not Null, Not Blank | ช่องทางติดต่อหลัก |
| `line_id` | `text` | Nullable | ช่องทางติดต่อเสริม |
| `province` | `text` | Not Null, Not Blank | จังหวัด |
| `district` | `text` | Not Null, Not Blank | อำเภอหรือเขต |
| `subdistrict` | `text` | Not Null, Not Blank | ตำบลหรือแขวง |
| `address_detail` | `text` | Not Null, Not Blank | ที่อยู่ละเอียดที่ต้องซ่อน |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- หนึ่งบัญชีมีหนึ่งบทบาท และผู้ใช้ทั่วไปเปลี่ยนตนเองเป็น Admin ไม่ได้
- ผู้ใช้ทุกบทบาทต้องกรอกที่อยู่ครบทั้งสี่ระดับ
- ก่อนจับคู่ ห้ามเปิดเผย `phone`, `line_id`, `subdistrict` และ `address_detail`
- สิทธิ์ Admin ต้องมาจากข้อมูลที่ผู้ใช้แก้เองไม่ได้ เช่น Auth `app_metadata`; ห้ามใช้ `user_metadata` ตัดสินสิทธิ์

### 6.2 `caregiver_profiles`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `caregiver_id` | `uuid` | PK, FK → `profiles(id)` | เจ้าของโปรไฟล์ผู้ดูแล |
| `bio` | `text` | Nullable | คำแนะนำตัว |
| `experience_years` | `smallint` | Not Null, Default `0`, Check 0–80 | ปีประสบการณ์ |
| `availability_status` | `text` | Not Null, Default `unavailable`, Check | `available`, `unavailable` |
| `verification_status` | `text` | Not Null, Default `not_submitted`, Check | `not_submitted`, `pending`, `verified`, `rejected` |
| `verified_by` | `uuid` | FK → `profiles(id)`, Nullable | Admin ผู้ตรวจสอบ |
| `verified_at` | `timestamptz` | Nullable | เวลาที่อนุมัติ |
| `rejection_reason` | `text` | Nullable | เหตุผลปฏิเสธ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- ต้องเป็นผู้ใช้บทบาท `caregiver` โดยตรวจผ่าน Trigger/ขั้นตอนสร้างโปรไฟล์ เพราะ Check ตรวจข้ามตารางไม่ได้
- ผู้ดูแลแก้ได้เฉพาะข้อมูลโปรไฟล์และความพร้อม; เฉพาะ Admin แก้ข้อมูลตรวจสอบ
- สถานะ `verified` ต้องมี `verified_by` และ `verified_at`; สถานะ `rejected` ต้องมีเหตุผล
- ผลค้นหาแสดงเฉพาะผู้ดูแล `verified` และ `available`

### 6.3 `caregiver_documents`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสเอกสาร |
| `caregiver_id` | `uuid` | FK → `caregiver_profiles(caregiver_id)`, Not Null | เจ้าของเอกสาร |
| `document_type` | `text` | Not Null, Check | `identity`, `care_certificate`, `other` |
| `storage_path` | `text` | Not Null, Unique, Not Blank | Path ใน Private Storage |
| `original_file_name` | `text` | Not Null, Not Blank | ชื่อไฟล์เดิม |
| `mime_type` | `text` | Not Null, Check | ชนิดไฟล์ที่อนุญาต |
| `review_status` | `text` | Not Null, Default `pending`, Check | `pending`, `approved`, `rejected` |
| `reviewed_by` | `uuid` | FK → `profiles(id)`, Nullable | Admin ผู้ตรวจ |
| `reviewed_at` | `timestamptz` | Nullable | เวลาตรวจ |
| `rejection_reason` | `text` | Nullable | เหตุผลปฏิเสธ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาอัปโหลด Metadata |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- การยื่นตรวจต้องมีเอกสาร `identity` อย่างน้อยหนึ่งรายการ และใช้ไฟล์สมมติเท่านั้น
- ไฟล์อยู่ใน Private Bucket และเปิดด้วย Signed URL ระยะสั้นตามสิทธิ์
- ผู้ดูแลเห็นของตนเอง; Admin เห็นรายการตรวจ; บุคคลอื่นห้ามเข้าถึง
- เอกสาร `rejected` ต้องมีเหตุผล

### 6.4 `patients`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสผู้ป่วย |
| `employer_id` | `uuid` | FK → `profiles(id)`, Not Null | เจ้าของข้อมูล |
| `first_name` | `text` | Not Null, Not Blank | ชื่อ ข้อมูลส่วนตัว |
| `last_name` | `text` | Not Null, Not Blank | นามสกุล ข้อมูลส่วนตัว |
| `birth_date` | `date` | Not Null | วันเกิด |
| `mobility_status` | `text` | Not Null, Check | `bedridden`, `wheelchair`, `walker`, `cane` |
| `care_notes` | `text` | Nullable | ข้อควรระวังในการดูแล |
| `province` | `text` | Not Null, Not Blank | จังหวัดสถานที่ดูแล |
| `district` | `text` | Not Null, Not Blank | อำเภอหรือเขต |
| `subdistrict` | `text` | Not Null, Not Blank | ตำบลหรือแขวง |
| `address_detail` | `text` | Not Null, Not Blank | ที่อยู่ละเอียดที่ต้องซ่อน |
| `is_active` | `boolean` | Not Null, Default `true` | Soft Delete |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- `employer_id` ต้องเป็นผู้ใช้บทบาท `employer`
- เพิ่ม Unique Constraint `(id, employer_id)` เพื่อให้ `job_posts` สร้าง Composite Foreign Key ตรวจเจ้าของผู้ป่วยได้
- วันเกิดห้ามอยู่ในอนาคต โดยตรวจใน Form และ Trigger ไม่ใช้ Check ที่อ้าง `current_date`
- ผู้ว่าจ้างจัดการได้เฉพาะผู้ป่วยของตน; ผู้ใช้อื่นห้ามอ่านแถวโดยตรง
- การนำออกจากรายการใช้ `is_active = false`; ผู้ป่วยที่ปิดใช้งานสร้างประกาศใหม่ไม่ได้

### 6.5 `conditions`

รายการสภาวะเพื่อจัดโครงสร้างความต้องการดูแล ไม่ใช่คำวินิจฉัยหรือมาตรฐานทางการแพทย์

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสรายการ |
| `name` | `text` | Not Null, Unique, Not Blank | ชื่อสภาวะ |
| `description` | `text` | Nullable | คำอธิบาย |
| `is_active` | `boolean` | Not Null, Default `true` | เปิดหรือปิดการเลือก |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- ผู้ใช้เลือกได้เฉพาะรายการ Active; เฉพาะ Admin เพิ่ม แก้ไข หรือปิดใช้งาน
- รายการที่เคยถูกอ้างอิงใช้ `is_active = false` แทนการลบ

### 6.6 `patient_conditions`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `patient_id` | `bigint` | Composite PK, FK → `patients(id)` | ผู้ป่วย |
| `condition_id` | `bigint` | Composite PK, FK → `conditions(id)` | สภาวะ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาเชื่อมข้อมูล |

- PK ร่วม `(patient_id, condition_id)` ป้องกันข้อมูลซ้ำ
- ลบความสัมพันธ์ตามเมื่อผู้ป่วยถูกลบจริง (`on delete cascade`)
- ผู้ว่าจ้างแก้ได้เฉพาะผู้ป่วยของตน และเพิ่มได้เฉพาะ Condition ที่ Active

### 6.7 `skills`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสทักษะ |
| `name` | `text` | Not Null, Unique, Not Blank | ชื่อทักษะ |
| `description` | `text` | Nullable | คำอธิบาย |
| `is_active` | `boolean` | Not Null, Default `true` | เปิดหรือปิดการเลือก |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- ผู้ใช้ทั่วไปอ่านได้เฉพาะ Active; เฉพาะ Admin เพิ่ม แก้ไข หรือปิดใช้งาน
- ตารางต้นแบบที่สร้างแล้วต้องเพิ่ม `updated_at` เมื่อย้ายเป็น Schema จริง

### 6.8 `patient_required_skills`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `patient_id` | `bigint` | Composite PK, FK → `patients(id)` | ผู้ป่วย |
| `skill_id` | `bigint` | Composite PK, FK → `skills(id)` | ทักษะที่ต้องการ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาเชื่อมข้อมูล |

- PK ร่วม `(patient_id, skill_id)` ป้องกันทักษะซ้ำ
- ผู้ป่วยต้องมีทักษะอย่างน้อยหนึ่งรายการก่อนนำไปสร้างประกาศ
- ผู้ว่าจ้างจัดการได้เฉพาะผู้ป่วยของตน และเพิ่มได้เฉพาะ Skill ที่ Active

### 6.9 `caregiver_skills`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `caregiver_id` | `uuid` | Composite PK, FK → `caregiver_profiles(caregiver_id)` | ผู้ดูแล |
| `skill_id` | `bigint` | Composite PK, FK → `skills(id)` | ทักษะที่มี |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาเชื่อมข้อมูล |

- PK ร่วม `(caregiver_id, skill_id)` ป้องกันทักษะซ้ำ
- ผู้ดูแลจัดการได้เฉพาะทักษะของตน และเพิ่มได้เฉพาะ Skill ที่ Active
- ต้องมีอย่างน้อยหนึ่งทักษะก่อนเปลี่ยนเป็นพร้อมรับงาน

### 6.10 `job_posts`

ประกาศเก็บ Snapshot ของข้อมูลที่จำเป็น เพื่อไม่ให้ประกาศเก่าเปลี่ยนตามการแก้ไขผู้ป่วยภายหลัง

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสประกาศ |
| `employer_id` | `uuid` | FK → `profiles(id)`, Not Null | เจ้าของประกาศ |
| `patient_id` | `bigint` | FK → `patients(id)`, Not Null | ผู้ป่วยต้นทาง |
| `title` | `text` | Not Null, Not Blank | ชื่อประกาศ |
| `description` | `text` | Not Null, Not Blank | รายละเอียดที่เปิดเผยได้ |
| `care_summary` | `text` | Not Null, Not Blank | สรุปลักษณะการดูแลที่เปิดเผยได้ โดยไม่ระบุตัวผู้ป่วย |
| `starts_at` | `timestamptz` | Not Null | เวลาเริ่มงาน |
| `ends_at` | `timestamptz` | Not Null | เวลาสิ้นสุดงาน |
| `pay_amount` | `numeric(10,2)` | Not Null, Check > 0 | ค่าตอบแทน |
| `pay_unit` | `text` | Not Null, Check | `hour`, `day`, `month`, `total` |
| `province` | `text` | Not Null, Not Blank | จังหวัด Snapshot |
| `district` | `text` | Not Null, Not Blank | อำเภอหรือเขต Snapshot |
| `subdistrict` | `text` | Not Null, Not Blank | ตำบลหรือแขวงที่ซ่อน |
| `address_detail` | `text` | Not Null, Not Blank | ที่อยู่ละเอียดที่ซ่อน |
| `status` | `text` | Not Null, Default `draft`, Check | `draft`, `open`, `matched`, `in_progress`, `completed`, `cancelled` |
| `cancellation_reason` | `text` | Nullable | เหตุผลยกเลิก |
| `published_at` | `timestamptz` | Nullable | เวลาเปิดประกาศ |
| `started_at` | `timestamptz` | Nullable | เวลาเริ่มงานจริง |
| `completed_at` | `timestamptz` | Nullable | เวลาจบงาน |
| `cancelled_at` | `timestamptz` | Nullable | เวลายกเลิก |
| `cancelled_by` | `uuid` | FK → `profiles(id)`, Nullable | ผู้ยกเลิก |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- `ends_at` ต้องอยู่หลัง `starts_at`
- ใช้ Composite FK `(patient_id, employer_id)` ไป `patients(id, employer_id)` เพื่อกันใช้ผู้ป่วยของผู้อื่น
- สร้างจากผู้ป่วย Active และต้องมีทักษะอย่างน้อยหนึ่งรายการก่อนเปิดประกาศ
- หน้าสาธารณะแสดงเฉพาะ `open` และซ่อนชื่อผู้ป่วย ตำบล ที่อยู่ละเอียด และข้อมูลติดต่อ
- หลังจับคู่ เฉพาะ Employer และ Caregiver คู่สัญญาจึงอ่านข้อมูลละเอียดได้
- เมื่อยกเลิกต้องมีเหตุผล เวลา และผู้ยกเลิก

### 6.11 `job_required_skills`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `job_post_id` | `bigint` | Composite PK, FK → `job_posts(id)` | ประกาศ |
| `skill_id` | `bigint` | Composite PK, FK → `skills(id)` | ทักษะที่ต้องการ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาเชื่อมข้อมูล |

- PK ร่วม `(job_post_id, skill_id)` ป้องกันทักษะซ้ำ
- เจ้าของประกาศแก้ได้เมื่อสถานะ `draft` หรือ `open` และยังไม่จับคู่
- เพิ่มได้เฉพาะ Skill ที่ Active

### 6.12 `match_requests`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสคำขอ |
| `job_post_id` | `bigint` | FK → `job_posts(id)`, Not Null | ประกาศ |
| `caregiver_id` | `uuid` | FK → `caregiver_profiles(caregiver_id)`, Not Null | ผู้ดูแล |
| `request_type` | `text` | Not Null, Check | `application`, `invitation` |
| `status` | `text` | Not Null, Default `pending`, Check | `pending`, `accepted`, `rejected`, `withdrawn`, `not_selected` |
| `message` | `text` | Nullable | ข้อความประกอบ |
| `responded_at` | `timestamptz` | Nullable | เวลาตอบ |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- Unique `(job_post_id, caregiver_id)` ป้องกันคู่ประกาศ–ผู้ดูแลซ้ำ
- `application` สร้างได้โดย Caregiver เจ้าของ ID ที่เป็น `verified` และประกาศ `open`
- `invitation` สร้างได้โดย Employer เจ้าของประกาศ และ Caregiver ต้อง `verified` กับ `available`
- Employer ตอบใบสมัคร; Caregiver ตอบคำเชิญ; Caregiver ถอนใบสมัครของตนเมื่อยัง Pending
- Partial Unique Index บน `job_post_id where status = 'accepted'` บังคับหนึ่งประกาศตอบรับได้หนึ่งคน
- การตอบรับทำใน Transaction เดียว: รับคำขอ เปลี่ยนประกาศเป็น `matched` และเปลี่ยนคำขอ Pending อื่นเป็น `not_selected`

### 6.13 `reviews`

| คอลัมน์ | ชนิดข้อมูล | Constraint / ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `id` | `bigint` | PK, Identity | รหัสรีวิว |
| `job_post_id` | `bigint` | FK → `job_posts(id)`, Not Null | งานที่รีวิว |
| `reviewer_id` | `uuid` | FK → `profiles(id)`, Not Null | ผู้เขียน |
| `reviewee_id` | `uuid` | FK → `profiles(id)`, Not Null | ผู้ได้รับรีวิว |
| `rating` | `smallint` | Not Null, Check 1–5 | คะแนน |
| `comment` | `text` | Nullable | ความคิดเห็น |
| `created_at` | `timestamptz` | Not Null, Default `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | Not Null, Default `now()` | เวลาแก้ไขล่าสุด |

- Unique `(job_post_id, reviewer_id)` จำกัดหนึ่งรีวิวต่อฝ่ายต่องาน
- `reviewer_id` ต้องไม่เท่ากับ `reviewee_id`
- สร้างได้เฉพาะงาน `completed` และทั้งสองคนต้องเป็นคู่สัญญา
- งาน `cancelled` รีวิวไม่ได้

## 7. State Transition

### 7.1 การตรวจสอบผู้ดูแล

```text
not_submitted -> pending
pending -> verified
pending -> rejected
rejected -> pending
```

### 7.2 ประกาศและงาน

```text
draft -> open -> matched -> in_progress -> completed
draft/open/matched/in_progress -> cancelled
```

- Employer เป็นผู้เปิดประกาศ เริ่มงาน และจบงาน
- ก่อนจับคู่ Employer ยกเลิกได้
- หลังจับคู่ Employer หรือ Caregiver คู่สัญญายกเลิกได้และต้องให้เหตุผล
- `completed` และ `cancelled` เป็นสถานะปลายทาง

### 7.3 คำขอจับคู่

```text
pending -> accepted
pending -> rejected
pending -> withdrawn
pending -> not_selected
```

- การตอบรับใบสมัครโดย Employer หรือคำเชิญโดย Caregiver ทำให้จับคู่สำเร็จทันที
- คำขอที่ออกจาก `pending` แล้วไม่เปลี่ยนกลับใน MVP

## 8. แนวทางการลบและ Foreign Key

| ความสัมพันธ์ | `on delete` | เหตุผล |
|---|---|---|
| `auth.users` → `profiles` | `cascade` | เมื่อลบบัญชีทดสอบ ให้ลบโปรไฟล์ตาม |
| `profiles` → `patients` | `restrict` | ป้องกันประวัติผู้ป่วยและงานหาย |
| `caregiver_profiles` → `caregiver_documents` | `cascade` | Metadata เป็นข้อมูลลูกโดยตรง |
| `patients` → ตารางกลาง | `cascade` | ลบความสัมพันธ์ที่ไม่มีความหมายเมื่อผู้ป่วยถูกลบจริง |
| `skills`/`conditions` → ตารางกลาง | `restrict` | ใช้ Soft Delete กับ Master Data ที่ถูกอ้างอิงแล้ว |
| `job_posts` → `match_requests`/`reviews` | `restrict` | รักษาประวัติคำขอและรีวิว |
| `profiles` → ผู้ตรวจ/ผู้ยกเลิก | `set null` | เก็บประวัติแม้บัญชีผู้ดำเนินการถูกลบ |

การใช้งานปกติควรเปลี่ยนสถานะหรือ `is_active` แทนการลบข้อมูลที่มีประวัติแล้ว

## 9. ดัชนีที่ต้องเตรียม

- `patients(employer_id)`
- `caregiver_profiles(verification_status, availability_status)`
- `caregiver_documents(caregiver_id, review_status)`
- `patient_conditions(condition_id)`
- `patient_required_skills(skill_id)`
- `caregiver_skills(skill_id)`
- `job_posts(employer_id)` และ `job_posts(patient_id)`
- Partial Index สำหรับประกาศ `open`
- `job_posts(province, district, status)`
- `job_required_skills(skill_id)`
- `match_requests(caregiver_id, status)` และ `match_requests(job_post_id, status)`
- Unique Partial Index `match_requests(job_post_id) where status = 'accepted'`
- `reviews(reviewee_id)`

## 10. แผนสิทธิ์ RLS

| ตาราง | แนวทางสิทธิ์ |
|---|---|
| `profiles` | เจ้าของแก้ข้อมูลที่อนุญาต; ข้อมูลส่วนตัวซ่อน; Admin อ่านตามหน้าที่ |
| `caregiver_profiles` | เจ้าของแก้โปรไฟล์; Admin แก้การตรวจสอบ; สาธารณะเห็นเฉพาะ Verified ตามขอบเขต |
| `caregiver_documents` | เจ้าของและ Admin เท่านั้น |
| `patients` | Employer เจ้าของและ Admin ตามความจำเป็น; ผู้ใช้อื่นห้ามอ่านแถวตรง |
| `conditions`, `skills` | `anon`/`authenticated` อ่าน Active; Admin เขียน |
| ตารางกลางของผู้ป่วย | Employer เจ้าของผู้ป่วยเท่านั้น |
| `caregiver_skills` | Caregiver เจ้าของจัดการ; โปรไฟล์ Verified เปิดเผยตามขอบเขต |
| `job_posts` | สาธารณะเห็นข้อมูลจำกัด; เจ้าของและคู่สัญญาเห็นตามสถานะ |
| `job_required_skills` | อ่านตามสิทธิ์ประกาศ; เจ้าของแก้ก่อนจับคู่ |
| `match_requests` | Employer เจ้าของประกาศหรือ Caregiver ที่เกี่ยวข้องเท่านั้น |
| `reviews` | คู่สัญญาสร้างหลังงานเสร็จ; อ่านตามขอบเขตที่กำหนด |

หลักการ Policy:

- ใช้ `to authenticated` ร่วมกับเงื่อนไขเจ้าของข้อมูล; `to authenticated` อย่างเดียวไม่เพียงพอ
- ใช้ `(select auth.uid())` ในเงื่อนไข RLS
- Update Policy ต้องมีทั้ง `using` และ `with check`
- เพิ่มดัชนีบนคอลัมน์ที่ใช้ตรวจเจ้าของ
- ห้ามใช้ `service_role` หรือ Secret Key ใน React
- หากใช้ View สาธารณะ ให้ใช้ `security_invoker = true` และเลือกเฉพาะคอลัมน์ที่เปิดเผยได้
- Data API Grant และ RLS เป็นคนละชั้น ต้องกำหนดและทดสอบทั้งคู่
- ทดสอบทุก Policy ทั้งกรณีอนุญาตและปฏิเสธ

## 11. การเปิดเผยข้อมูล

ก่อนจับคู่ แสดงได้เฉพาะจังหวัด อำเภอ รายละเอียดงานที่ตั้งใจเผยแพร่ เวลา ค่าตอบแทน สภาวะโดยรวม ทักษะที่ต้องการ และโปรไฟล์สาธารณะของผู้ดูแล

ก่อนจับคู่ต้องซ่อนชื่อผู้ป่วย ตำบล ที่อยู่ละเอียด หมายเลขโทรศัพท์ Line ID และเอกสารตรวจสอบ

หลังจับคู่ Employer และ Caregiver คู่สัญญาจึงเห็นข้อมูลติดต่อและสถานที่ดูแลที่จำเป็น ผู้ใช้คนอื่นยังต้องถูกปฏิเสธโดย RLS

### 11.1 View ที่วางแผนไว้สำหรับ Frontend

- `public_job_posts` เลือกเฉพาะประกาศ `open` และคอลัมน์ที่เปิดเผยได้ เช่น ชื่อประกาศ สรุปการดูแล จังหวัด อำเภอ เวลา ค่าตอบแทน และทักษะ
- `public_caregiver_profiles` เลือกเฉพาะ Caregiver ที่ `verified` และ `available` พร้อมข้อมูลสาธารณะ เช่น ชื่อแสดงผล ประสบการณ์ พื้นที่ และทักษะ
- View ต้องไม่ส่งชื่อผู้ป่วย ข้อมูลติดต่อ ตำบล ที่อยู่ละเอียด หรือ Path เอกสาร
- หากสร้าง View ให้กำหนด `security_invoker = true` เพื่อให้ใช้สิทธิ์ของผู้เรียกและทำงานร่วมกับ RLS

## 12. ข้อมูลตั้งต้นสำหรับทดสอบ

### ทักษะ

- Bedridden Care — การดูแลผู้ป่วยติดเตียง
- Suction — การดูดเสมหะ
- Physical Therapy — การช่วยทำกายภาพบำบัด
- Feeding Tube — การให้อาหารทางสายยาง
- First Aid — การปฐมพยาบาลเบื้องต้น

### สถานะการเคลื่อนไหว

- `bedridden` — ผู้ป่วยติดเตียง
- `wheelchair` — ใช้รถเข็น
- `walker` — ใช้อุปกรณ์ช่วยเดิน
- `cane` — ใช้ไม้เท้า

### สภาวะตัวอย่าง

- ต้องการความช่วยเหลือในกิจวัตรประจำวัน
- มีข้อจำกัดด้านการเคลื่อนไหว
- ต้องเฝ้าระวังเป็นพิเศษ

รายการทั้งหมดเป็น Mock Data สำหรับรายวิชา ไม่ใช่มาตรฐานหรือคำวินิจฉัยทางการแพทย์

## 13. กฎที่ Constraint อย่างเดียวไม่เพียงพอ

กฎต่อไปนี้ต้องใช้ Transaction, Trigger หรือ Database Function ที่ออกแบบและทดสอบ:

- ตรวจว่าบทบาทตรงกับตารางที่กำลังสร้างข้อมูล
- ตรวจวันเกิดไม่อยู่ในอนาคต
- ตรวจว่าผู้ป่วยและประกาศมีทักษะอย่างน้อยหนึ่งรายการ
- ตรวจว่าผู้ดูแลมีเอกสาร Identity ก่อนส่งตรวจ
- เปลี่ยนสถานะตามลำดับที่อนุญาต
- ตอบรับหนึ่งคำขอ ปิดคำขออื่น และเปลี่ยนสถานะประกาศแบบ Atomic
- ตรวจคู่สัญญาและสถานะงานก่อนสร้างรีวิว
- อัปเดต `updated_at` อัตโนมัติ

หากใช้ `security definer` ต้องวาง Function ใน Schema ที่ไม่เปิดผ่าน Data API, กำหนด `search_path`, ตรวจ `auth.uid()` ภายใน และจำกัดสิทธิ์ Execute ห้ามใช้เพื่อหลบ RLS โดยไม่มีการตรวจสิทธิ์

## 14. ลำดับการสร้างจริง

1. `profiles`
2. `skills` และ `conditions`
3. `caregiver_profiles` และ `patients`
4. `caregiver_documents`
5. ตารางกลางทั้งหมด
6. `job_posts` และ `job_required_skills`
7. `match_requests`
8. `reviews`
9. Trigger/Function สำหรับ State และ `updated_at`
10. Index, Grant และ RLS Policy
11. Seed Data
12. SQL Tests: Constraint, CRUD, RLS, State Transition และ Race Condition ขั้นพื้นฐาน

แต่ละกลุ่มต้องสร้างและทดสอบเป็นส่วนเล็ก ไม่รัน SQL ทั้งระบบโดยยังไม่ตรวจผล

## 15. Checklist ก่อนเขียน SQL

- [x] ตารางทุกตัวรองรับ Requirement P0
- [x] Primary Key, Foreign Key และ Cardinality ถูกกำหนด
- [x] ตารางกลางสำหรับความสัมพันธ์ N:M ครบ
- [x] ข้อมูลส่วนตัวและข้อมูลสาธารณะมีแนวทางแยกการเข้าถึง
- [x] State Transition ถูกกำหนด
- [x] หนึ่งประกาศต่อหนึ่งผู้ดูแลมีแนวทางบังคับระดับฐานข้อมูล
- [x] Verified ก่อนสมัครงานมีแนวทางบังคับระดับฐานข้อมูล
- [x] Soft Delete และ `on delete` ถูกกำหนด
- [x] ดัชนี Foreign Key และคอลัมน์ค้นหาหลักถูกวางแผน
- [ ] ตรวจ Logical Schema ร่วมกับทีม/อาจารย์ก่อนสร้าง Schema เต็มบน Supabase

## 16. เอกสารอ้างอิงภายในโปรเจกต์

- `docs/requirements.md`
- `docs/database-audit.md`
- `docs/development-plan.md`
- `database/prototypes/skills_setup.sql`
