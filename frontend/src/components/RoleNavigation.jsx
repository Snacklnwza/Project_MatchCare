const menuItemsByRole = {
    employer: [
        { id: 'dashboard', label: 'หน้าหลัก' },
        { id: 'patients', label: 'ข้อมูลผู้ป่วย' },
        { id: 'jobs', label: 'ประกาศงาน' },
        { id: 'caregivers', label: 'ค้นหาผู้ดูแล' },
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

function RoleNavigation({ role, activePage, onSelect }) {
    const menuItems = menuItemsByRole[role] ?? []

    return (
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
    )
}

export default RoleNavigation