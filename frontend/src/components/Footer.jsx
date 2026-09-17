import logo from '../assets/navbar/logo.png'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <span className="navbar-logo"><img src={logo} alt="" /></span>
          <strong>MATCHCARE</strong>
        </div>
        <p>© 2026 MatchCare Healthcare Matching. สงวนลิขสิทธิ์</p>
        <nav aria-label="ข้อมูลเว็บไซต์">
          <span>นโยบายความเป็นส่วนตัว</span>
          <span>ข้อตกลงการใช้งาน</span>
          <span>ติดต่อเรา</span>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
