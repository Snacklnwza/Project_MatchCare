function EmployerDashboard({ profile }) {
  return (
    <section className="role-dashboard">
      <h2>หน้าหลักผู้ว่าจ้าง</h2>

      <p>
        ยินดีต้อนรับ คุณ{profile.first_name} {profile.last_name}
      </p>

      <p>คุณสามารถจัดการข้อมูลผู้ป่วยและประกาศงานได้จากหน้านี้</p>
    </section>
  )
}

export default EmployerDashboard