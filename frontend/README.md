# MatchCare Frontend

React + Vite ใช้ Supabase Auth และ PostgreSQL ผ่าน RLS/RPC

ดู [README หลัก](../README.md) และ [ผลรีวิว Sprint 1](../docs/SPRINT1_CODE_REVIEW.md)

| คำสั่ง | หน้าที่ |
|---|---|
| npm run dev | เปิดเว็บพัฒนา |
| npm run lint | ตรวจด้วย Oxlint |
| npm run build | สร้าง bundle ใน dist |
| npm run preview | เปิด bundle ที่ build แล้ว |
| npm run generate:geography | สร้างข้อมูลพื้นที่แบบย่อ |

ห้ามใส่ service-role key หรือรหัสผ่านในตัวแปร VITE_* เพราะถูกส่งไปยังเบราว์เซอร์ ใช้ publishable key และบังคับสิทธิ์ด้วย RLS
