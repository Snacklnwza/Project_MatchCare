import { useState } from 'react'
import Navbar from '../components/Navbar'
import AdminDashboard from './AdminDashboard'
import CaregiverDashboard from './CaregiverDashboard'
import EmployerDashboard from './EmployerDashboard'
import PatientManager from '../components/PatientManager'
import Footer from '../components/Footer'
import JobManager from '../components/JobManager'

const pageDetails = {
  employer: {
    history: {
      title: 'ประวัติการจ้างงาน',
      emptyMessage: 'ระบบประวัติการจ้างงานยังไม่เปิดใช้งาน',
    },
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

function RoleDashboard({ profile, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard')

  let dashboard

  if (profile.role === 'employer') {
    dashboard = <EmployerDashboard onNavigate={setActivePage} />
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
      <Navbar
        profile={profile}
        onSignOut={onSignOut}
        activePage={activePage}
        onSelect={setActivePage}
      />
      {activePage === 'dashboard' ? (
        dashboard
      ) : activePage === 'patients' && profile.role === 'employer' ? (
        <PatientManager />
      ) : activePage === 'jobs' && profile.role === 'employer' ? (
        <JobManager />
      ) : (
        <section className="role-dashboard">
          <h2>{selectedPage?.title}</h2>
          <p>{selectedPage?.emptyMessage}</p>
        </section>
      )}
      <Footer />
    </>
  )
}

export default RoleDashboard
