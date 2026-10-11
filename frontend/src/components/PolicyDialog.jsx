import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function PolicyDialog({ type, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [])
  const privacy = type === 'privacy'
  return createPortal(
    <dialog
      ref={ref}
      className="policy-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      aria-labelledby="policy-title"
    >
      <h2 id="policy-title">
        {privacy ? 'การใช้ข้อมูลใน MatchCare' : 'ข้อตกลงการใช้งานโครงการ'}
      </h2>
      {privacy ? (
        <>
          <p>
            ระบบใช้ข้อมูลบัญชี โปรไฟล์
            และทักษะเพื่อค้นหาและจับคู่ผู้ดูแลกับประกาศงาน
          </p>
          <p>
            ข้อมูลผู้ป่วยจัดการโดยผู้ว่าจ้าง
            ส่วนข้อมูลติดต่อและที่อยู่สำหรับดูแลเปิดให้คู่ที่ตอบรับงานแล้ว
            เอกสารยืนยันตัวตนใช้สำหรับให้แอดมินตรวจสอบ
          </p>
          <p>
            โครงการนี้ใช้เพื่อการศึกษา กรุณาใช้ข้อมูลสมมติในการทดสอบ
            และไม่อัปโหลดเอกสารส่วนตัวจริง
          </p>
        </>
      ) : (
        <>
          <p>
            MatchCare เป็นโครงการเพื่อการศึกษา ใช้ทดลองขั้นตอนสร้างประกาศ
            สมัครงาน ส่งคำเชิญ และติดตามการดูแล
          </p>
          <p>
            กรอกข้อมูลทดสอบให้ตรงกับบทบาทของคุณ ไม่ใช้บัญชีผู้อื่น
            และไม่เผยแพร่ข้อมูลส่วนตัวของผู้ป่วยหรือผู้ใช้งาน
          </p>
          <p>
            การยืนยันตัวตนและคะแนนทักษะในโครงการใช้ประกอบการทดลองระบบ
            ไม่ใช่การรับรองคุณสมบัติทางวิชาชีพ
          </p>
        </>
      )}
      <button type="button" onClick={onClose}>
        ปิด
      </button>
    </dialog>,
    document.body,
  )
}
