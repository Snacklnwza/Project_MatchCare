import logo from '../assets/navbar/logo.png'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <strong>MatchCare</strong>
        </div>
        <p>© 2026 MatchCare Healthcare Matching. สงวนลิขสิทธิ์</p>
        <span className="footer-note">พื้นที่จับคู่การดูแลอย่างใส่ใจ</span>
      </div>
    </footer>
  )
}

export default Footer
