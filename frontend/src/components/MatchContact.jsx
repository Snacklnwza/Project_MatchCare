export default function MatchContact({ contact, onHide }) {
  return (
    <section className="workflow-contact" aria-label="ข้อมูลติดต่อคู่ที่จับสำเร็จ">
      <h3>{contact.display_name}</h3>
      <p>โทร: {contact.phone || 'ไม่ได้ระบุ'}</p>
      <p>LINE: {contact.line_id || 'ไม่ได้ระบุ'}</p>
      <p>สถานที่ดูแล: {contact.address_detail} {contact.subdistrict} {contact.district} {contact.province}</p>
      <button type="button" className="secondary-button" onClick={onHide}>ซ่อนข้อมูลติดต่อ</button>
    </section>
  )
}
