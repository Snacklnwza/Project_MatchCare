import logo from '../assets/navbar/logo.png'
import bell from '../assets/navbar/bell.svg'
import chevron from '../assets/navbar/chevron.svg'

const menuItemsByRole = {
  employer: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'patients', label: 'ผู้ป่วยของฉัน' },
    { id: 'jobs', label: 'ประกาศงาน' },
    { id: 'caregivers', label: 'ค้นหาผู้ดูแล' },
    { id: 'history', label: 'ประวัติการจ้างงาน' },
  ],
  caregiver: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'profile', label: 'โปรไฟล์ผู้ดูแล' },
    { id: 'jobs', label: 'ค้นหางาน' },
    { id: 'applications', label: 'งานที่สมัคร' },
  ],
  admin: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'verifications', label: 'ตรวจสอบผู้ดูแล' },
    { id: 'users', label: 'จัดการผู้ใช้' },
  ],
}

function Navbar({ profile, activePage, onSelect, onSignOut }) {
  const role = profile.role
  const menuItems = menuItemsByRole[role] ?? []
  const roleLabel = {
    employer: 'ผู้ว่าจ้าง',
    caregiver: 'ผู้ดูแล',
    admin: 'ผู้ดูแลระบบ',
  }[role]

  return (
    <header className="top-navbar">
      <div className="top-navbar-inner">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => onSelect('dashboard')}
          aria-label="MatchCare หน้าหลัก"
        >
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <span>MatchCare</span>
        </button>
        <nav className="role-navigation" aria-label="เมนูหลัก">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activePage === item.id ? 'active' : ''}
              aria-current={activePage === item.id ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="navbar-account">
          <details className="navbar-dropdown">
            <summary className="notification-toggle" aria-label="การแจ้งเตือน">
              <img src={bell} alt="" />
            </summary>
            <div className="navbar-popover">
              <strong>การแจ้งเตือน</strong>
              <p>ระบบแจ้งเตือนยังไม่เปิดใช้งาน</p>
            </div>
          </details>
          <details className="navbar-dropdown">
            <summary className="account-toggle">
              <span className="account-name">
                คุณ{profile.first_name || 'ผู้ใช้งาน'}
              </span>
              <span className="account-role">({roleLabel})</span>
              <img src={chevron} alt="" />
            </summary>
            <div className="navbar-popover">
              <button type="button" onClick={onSignOut}>
                ออกจากระบบ
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}

export default Navbar
