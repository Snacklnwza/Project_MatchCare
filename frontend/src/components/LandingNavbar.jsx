import logo from '../assets/navbar/logo.png'

function LandingNavbar({ onLogin, onRegister }) {
  return (
    <header className="landing-navbar">
      <div className="landing-navbar-inner">
        <button className="landing-brand" type="button" aria-label="MatchCare หน้าหลัก">
          <span className="navbar-logo"><img src={logo} alt="" /></span>
          <strong>MatchCare</strong>
        </button>

        <nav className="landing-auth-actions" aria-label="บัญชีผู้ใช้">
          <button className="landing-login-button" type="button" onClick={onLogin}>
            เข้าสู่ระบบ
          </button>
          <button className="landing-register-button" type="button" onClick={onRegister}>
            สมัครสมาชิก
          </button>
        </nav>
      </div>
    </header>
  )
}

export default LandingNavbar
