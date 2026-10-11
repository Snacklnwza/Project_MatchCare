import { useState } from 'react'

export default function MatchContact({ contact, onHide }) {
  const [notice, setNotice] = useState('')
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value)
      setNotice('คัดลอกแล้ว')
    } catch {
      setNotice('คัดลอกไม่สำเร็จ กรุณาเลือกข้อความเพื่อคัดลอก')
    }
  }
  return (
    <section
      className="workflow-contact"
      aria-label="ข้อมูลติดต่อคู่ที่จับสำเร็จ"
    >
      <h3>{contact.display_name}</h3>
      <p>
        โทร:{' '}
        {contact.phone ? (
          <a href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`}>
            {contact.phone}
          </a>
        ) : (
          'ไม่ได้ระบุ'
        )}
      </p>
      <p>LINE: {contact.line_id || 'ไม่ได้ระบุ'}</p>
      <div className="workflow-actions">
        {contact.phone && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => copy(contact.phone)}
          >
            คัดลอกเบอร์โทร
          </button>
        )}
        {contact.line_id && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => copy(contact.line_id)}
          >
            คัดลอก LINE ID
          </button>
        )}
      </div>
      {notice && <p role="status">{notice}</p>}
      <p>
        สถานที่ดูแล: {contact.address_detail} {contact.subdistrict}{' '}
        {contact.district} {contact.province}
      </p>
      <button type="button" className="secondary-button" onClick={onHide}>
        ซ่อนข้อมูลติดต่อ
      </button>
    </section>
  )
}
