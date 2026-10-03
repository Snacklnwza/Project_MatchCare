function AdminDashboard({ profile, onNavigate }) {
  return (
    <section className="workflow-page admin-home" aria-labelledby="admin-home-title">
      <header className="admin-home-heading">
        <p className="workflow-eyebrow">พื้นที่ผู้ดูแลระบบ</p>
        <h1 id="admin-home-title">สวัสดี คุณ{profile.first_name}</h1>
        <p>เลือกงานที่ต้องจัดการเพื่อให้ข้อมูลผู้ดูแลและการค้นหาพร้อมใช้งาน</p>
      </header>
      <div className="admin-home-grid">
        <article className="workflow-card">
          <span className="admin-home-step">01 · ตรวจสอบ</span>
          <h2>ยืนยันตัวตนผู้ดูแล</h2>
          <p>เปิดเอกสารที่ส่งมา แล้วอนุมัติหรือแจ้งเหตุผลให้แก้ไข</p>
          <button type="button" onClick={() => onNavigate('verifications')}>ไปตรวจเอกสาร <span aria-hidden="true">→</span></button>
        </article>
        <article className="workflow-card">
          <span className="admin-home-step">02 · จัดการข้อมูล</span>
          <h2>ทักษะและสภาวะการดูแล</h2>
          <p>เพิ่ม แก้ไข หรือปิดรายการที่ใช้ในโปรไฟล์ผู้ดูแลและประกาศงาน</p>
          <button type="button" className="secondary-button" onClick={() => onNavigate('catalog')}>ไปคลังกลาง <span aria-hidden="true">→</span></button>
        </article>
      </div>
    </section>
  )
}

export default AdminDashboard
