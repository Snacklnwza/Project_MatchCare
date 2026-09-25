function AdminDashboard({ profile }) {
  return (
    <section className="role-dashboard">
      <h2>หน้าหลักผู้ดูแลระบบ</h2>

      <p>
        ยินดีต้อนรับ คุณ{profile.first_name} {profile.last_name}
      </p>

      <p>คุณสามารถตรวจสอบและอนุมัติข้อมูลผู้ดูแลได้จากหน้านี้</p>
    </section>
  )
}

export default AdminDashboard
