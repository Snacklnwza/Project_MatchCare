function CaregiverDashboard({ profile }) {
  return (
    <section className="role-dashboard">
      <h2>หน้าหลักผู้ดูแล</h2>

      <p>
        ยินดีต้อนรับ คุณ{profile.first_name} {profile.last_name}
      </p>

      <p>คุณสามารถจัดการโปรไฟล์ ทักษะ และค้นหาประกาศงานได้จากหน้านี้</p>
    </section>
  )
}

export default CaregiverDashboard