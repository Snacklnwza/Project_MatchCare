import { useState } from 'react'
import RoleNavigation from '../components/RoleNavigation'
import AdminDashboard from './AdminDashboard'
import CaregiverDashboard from './CaregiverDashboard'
import EmployerDashboard from './EmployerDashboard'

const pageDetails = {
  employer: {
    patients: {
      title: 'ข้อมูลผู้ป่วย',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ป่วย',
    },
    jobs: {
      title: 'ประกาศงาน',
      emptyMessage: 'ยังไม่มีประกาศงาน',
    },
    caregivers: {
      title: 'ค้นหาผู้ดูแล',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ดูแล',
    },
  },
  caregiver: {
    profile: {
      title: 'โปรไฟล์ผู้ดูแล',
      emptyMessage: 'ยังไม่มีข้อมูลโปรไฟล์ผู้ดูแล',
    },
    jobs: {
      title: 'ค้นหางาน',
      emptyMessage: 'ยังไม่มีประกาศงาน',
    },
    applications: {
      title: 'งานที่สมัคร',
      emptyMessage: 'ยังไม่มีรายการสมัครงาน',
    },
  },
  admin: {
    verifications: {
      title: 'ตรวจสอบผู้ดูแล',
      emptyMessage: 'ไม่มีผู้ดูแลที่รอการตรวจสอบ',
    },
    users: {
      title: 'จัดการผู้ใช้',
      emptyMessage: 'ยังไม่มีข้อมูลผู้ใช้',
    },
  },
}

function RoleDashboard({ profile }) {
  const [activePage, setActivePage] = useState('dashboard')

  let dashboard

  if (profile.role === 'employer') {
    dashboard = <EmployerDashboard profile={profile} />
  } else if (profile.role === 'caregiver') {
    dashboard = <CaregiverDashboard profile={profile} />
  } else if (profile.role === 'admin') {
    dashboard = <AdminDashboard profile={profile} />
  } else {
    return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
  }

  const selectedPage = pageDetails[profile.role]?.[activePage]

  return (
    <>
      <RoleNavigation
        role={profile.role}
        activePage={activePage}
        onSelect={setActivePage}
      />

      {activePage === 'dashboard' ? (
        dashboard
      ) : (
        <section className="role-dashboard">
          <h2>{selectedPage?.title}</h2>
          <p>{selectedPage?.emptyMessage}</p>
        </section>
      )}
    </>
  )
}

export default RoleDashboard