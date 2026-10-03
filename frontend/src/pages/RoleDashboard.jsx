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
    dashboard = <AdminDashboard profile={profile} onNavigate={setActivePage} />
  } else {
    return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
  }

  let content = dashboard

  if (profile.role === 'employer' && activePage === 'patients') {
    content = <PatientManager />
  } else if (profile.role === 'employer' && activePage === 'jobs') {
    content = <JobManager />
  } else if (profile.role === 'employer' && activePage === 'caregivers') {
    content = <CaregiverSearch onNavigate={setActivePage} />
  } else if (profile.role === 'employer' && activePage === 'receivedApplications') {
    content = <EmployerApplications onNavigate={setActivePage} />
  } else if (profile.role === 'caregiver' && activePage === 'jobs') {
    content = <JobSearch />
  } else if (profile.role === 'caregiver' && activePage === 'profile') {
    content = <CaregiverProfile profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'documents') {
    content = <CaregiverDocuments profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'applications') {
    content = <Applications onNavigate={setActivePage} />
  } else if (profile.role === 'admin' && activePage === 'verifications') {
    content = <AdminVerifications />
  } else if (profile.role === 'admin' && activePage === 'catalog') {
    content = <AdminCatalog />
  } else if (
    ['employer', 'caregiver'].includes(profile.role) &&
    activePage === 'invitations'
  ) {
    content = <Invitations profile={profile} onNavigate={setActivePage} />
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
