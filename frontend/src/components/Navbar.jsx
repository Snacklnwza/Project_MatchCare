import { useState } from 'react'
import logo from '../assets/navbar/logo.png'
import chevron from '../assets/navbar/chevron.svg'

const menuItemsByRole = {
  employer: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'patients', label: 'ผู้ป่วยของฉัน' },
    { id: 'jobs', label: 'ประกาศงาน' },
    { id: 'caregivers', label: 'ค้นหาผู้ดูแล' },
    {
      id: 'requests', label: 'คำขอ', children: [
        { id: 'receivedApplications', label: 'ใบสมัครที่ได้รับ' },
        { id: 'invitations', label: 'คำเชิญที่ส่ง' },
      ],
    },
  ],
  caregiver: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'jobs', label: 'ค้นหางาน' },
    { id: 'applications', label: 'งานที่สมัคร' },
    { id: 'invitations', label: 'คำเชิญและงานของฉัน' },
  ],
  admin: [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'catalog', label: 'คลังกลาง' },
    { id: 'verifications', label: 'ตรวจสอบผู้ดูแล' },
  ],
}

function Navbar({ profile, activePage, onSelect, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const role = profile.role
  const menuItems = menuItemsByRole[role] ?? []
  const roleLabel = {
    employer: 'ผู้ว่าจ้าง',
    caregiver: 'ผู้ดูแล',
    admin: 'ผู้ดูแลระบบ',
  }[role]

  function selectPage(page) {
    setMenuOpen(false)
    onSelect(page)
  }

  return (
    <header className="top-navbar">
      <div className="top-navbar-inner">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => selectPage('dashboard')}
          aria-label="MatchCare หน้าหลัก"
        >
          <span className="navbar-logo">
            <img src={logo} alt="" />
          </span>
          <span>MatchCare</span>
        </button>
        <nav id="role-navigation" className={`role-navigation${menuOpen ? ' is-open' : ''}`} aria-label="เมนูหลัก">
          {menuItems.map((item) => item.children ? (
            <details className="navbar-nav-group" key={`${item.id}-${activePage}`}>
              <summary className={item.children.some((child) => child.id === activePage) ? 'active' : ''}>
                {item.label}<img src={chevron} alt="" />
              </summary>
              <div className="navbar-nav-popover">
                {item.children.map((child) => (
                  <button key={child.id} type="button"
                    className={activePage === child.id ? 'active' : ''}
                    aria-current={activePage === child.id ? 'page' : undefined}
                    onClick={(event) => {
                      event.currentTarget.closest('details').open = false
                      selectPage(child.id)
                    }}>
                    {child.label}
                  </button>
                ))}
              </div>
            </details>
          ) : (
            <button key={item.id} type="button"
              className={activePage === item.id ? 'active' : ''}
              aria-current={activePage === item.id ? 'page' : undefined}
              onClick={() => selectPage(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="navbar-account">
          <button className="navbar-menu-toggle" type="button" aria-controls="role-navigation"
            aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? 'ปิดเมนู' : 'เมนู'} <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          </button>
          <details className="navbar-dropdown">
            <summary className="account-toggle" aria-label={`บัญชีคุณ${profile.first_name || 'ผู้ใช้งาน'} (${roleLabel})`}>
              <span className="account-avatar" aria-hidden="true">{profile.first_name?.charAt(0) || 'ผ'}</span>
              <span className="account-name">
                คุณ{profile.first_name || 'ผู้ใช้งาน'}
              </span>
              <span className="account-role">({roleLabel})</span>
              <img src={chevron} alt="" />
            </summary>
            <div className="navbar-popover account-menu">
              {role === 'caregiver' && (
                <button
                  type="button"
                  aria-current={activePage === 'profile' ? 'page' : undefined}
                  onClick={(event) => {
                    event.currentTarget.closest('details').open = false
                    selectPage('profile')
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                  โปรไฟล์ผู้ดูแล
                </button>
              )}
              {role === 'caregiver' && (
                <button
                  type="button"
                  aria-current={activePage === 'documents' ? 'page' : undefined}
                  onClick={(event) => {
                    event.currentTarget.closest('details').open = false
                    selectPage('documents')
                  }}
                >
                  เอกสารยืนยันตัวตน
                </button>
              )}
              {role === 'caregiver' && <hr />}
              <button
                className="account-signout"
                type="button"
                onClick={onSignOut}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4" />
                </svg>
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
