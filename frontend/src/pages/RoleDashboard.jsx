import { useState } from 'react'
import Navbar from '../components/Navbar'
import AdminDashboard from './AdminDashboard'
import AdminCatalog from './AdminCatalog'
import CaregiverDashboard from './CaregiverDashboard'
import CaregiverProfile from './CaregiverProfile'
import EmployerDashboard from './EmployerDashboard'
import PatientManager from '../components/PatientManager'
import Footer from '../components/Footer'
import JobManager from '../components/JobManager'
import CaregiverDocuments from './CaregiverDocuments'
import JobSearch from './JobSearch'
import AdminVerifications from './AdminVerifications'
import Invitations from './Invitations'
import Applications from './Applications'
import EmployerApplications from './EmployerApplications'
import CaregiverSearch from './CaregiverSearch'
import '../styles/Workflow.css'

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
    dashboard = (
      <CaregiverDashboard profile={profile} onNavigate={setActivePage} />
    )
  } else if (profile.role === 'admin') {
    dashboard = <AdminDashboard profile={profile} />
  } else {
    return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
  }

  const selectedPage = pageDetails[profile.role]?.[activePage]
  let content = (
    <section className="role-dashboard">
      <h2>{selectedPage?.title}</h2>
      <p>{selectedPage?.emptyMessage}</p>
    </section>
  )

  if (activePage === 'dashboard') {
    content = dashboard
  } else if (profile.role === 'employer' && activePage === 'patients') {
    content = <PatientManager />
  } else if (profile.role === 'employer' && activePage === 'jobs') {
    content = <JobManager />
  } else if (profile.role === 'employer' && activePage === 'caregivers') {
    content = <CaregiverSearch onNavigate={setActivePage} />
  } else if (profile.role === 'employer' && activePage === 'receivedApplications') {
    content = <EmployerApplications />
  } else if (profile.role === 'caregiver' && activePage === 'jobs') {
    content = <JobSearch />
  } else if (profile.role === 'caregiver' && activePage === 'profile') {
    content = <CaregiverProfile profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'documents') {
    content = <CaregiverDocuments profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'applications') {
    content = <Applications />
  } else if (profile.role === 'admin' && activePage === 'verifications') {
    content = <AdminVerifications />
  } else if (profile.role === 'admin' && activePage === 'catalog') {
    content = <AdminCatalog />
  } else if (
    ['employer', 'caregiver'].includes(profile.role) &&
    activePage === 'invitations'
  ) {
    content = <Invitations profile={profile} />
  }

  return (
    <>
      <Navbar
        profile={profile}
        onSignOut={onSignOut}
        activePage={activePage}
        onSelect={setActivePage}
      />
      {content}
      <Footer />
    </>
  )
}

export default RoleDashboard
