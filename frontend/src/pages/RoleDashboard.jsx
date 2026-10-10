import { PageTargetContext } from '../hooks/useRevealItem'
import { UnsavedChangesContext } from '../hooks/useUnsavedChanges'
import { useCallback, useRef, useState } from 'react'
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
import JobHistory from './JobHistory'
import EmployerProfile from './EmployerProfile'
import '../styles/Workflow.css'

function RoleDashboard({ profile, email, onProfileUpdated, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [target, setTarget] = useState(null)
  const guard = useRef(null)
  const registerGuard = useCallback((check) => {
    guard.current = check
    return () => {
      if (guard.current === check) guard.current = null
    }
  }, [])
  function navigate(page, item = null) {
    if (page === activePage || !guard.current || guard.current()) {
      setTarget(item)
      setActivePage(page)
    }
  }
  function signOut() {
    if (!guard.current || guard.current()) onSignOut()
  }

  let dashboard

  if (profile.role === 'employer') {
    dashboard = <EmployerDashboard onNavigate={navigate} />
  } else if (profile.role === 'caregiver') {
    dashboard = <CaregiverDashboard profile={profile} onNavigate={navigate} />
  } else if (profile.role === 'admin') {
    dashboard = <AdminDashboard profile={profile} onNavigate={navigate} />
  } else {
    return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
  }

  let content = dashboard

  if (
    ['employer', 'caregiver'].includes(profile.role) &&
    activePage === 'history'
  ) {
    content = <JobHistory profile={profile} />
  } else if (profile.role === 'employer' && activePage === 'profile') {
    content = (
      <EmployerProfile
        profile={profile}
        email={email}
        onProfileUpdated={onProfileUpdated}
      />
    )
  } else if (profile.role === 'employer' && activePage === 'patients') {
    content = <PatientManager />
  } else if (profile.role === 'employer' && activePage === 'jobs') {
    content = <JobManager onNavigate={navigate} />
  } else if (profile.role === 'employer' && activePage === 'caregivers') {
    content = <CaregiverSearch onNavigate={navigate} />
  } else if (
    profile.role === 'employer' &&
    activePage === 'receivedApplications'
  ) {
    content = <EmployerApplications onNavigate={navigate} />
  } else if (profile.role === 'caregiver' && activePage === 'jobs') {
    content = <JobSearch />
  } else if (profile.role === 'caregiver' && activePage === 'profile') {
    content = (
      <CaregiverProfile profile={profile} email={email} onNavigate={navigate} />
    )
  } else if (profile.role === 'caregiver' && activePage === 'documents') {
    content = <CaregiverDocuments profile={profile} />
  } else if (profile.role === 'caregiver' && activePage === 'applications') {
    content = <Applications onNavigate={navigate} />
  } else if (profile.role === 'admin' && activePage === 'verifications') {
    content = <AdminVerifications />
  } else if (profile.role === 'admin' && activePage === 'catalog') {
    content = <AdminCatalog />
  } else if (
    ['employer', 'caregiver'].includes(profile.role) &&
    activePage === 'invitations'
  ) {
    content = <Invitations profile={profile} onNavigate={navigate} />
  }

  return (
    <UnsavedChangesContext.Provider value={registerGuard}>
      <Navbar
        profile={profile}
        onSignOut={signOut}
        activePage={activePage}
        onSelect={navigate}
      />
      {target && (
        <aside
          className="notification-context"
          aria-label="รายการจากการแจ้งเตือน"
        >
          <p>
            เปิดจากการแจ้งเตือน: {target.source_type === 'job' ? 'งาน' : 'คำขอ'}{' '}
            #{target.source_id} · รายการที่เน้นอาจอยู่นอกตัวกรองที่เลือก
          </p>
          <button type="button" onClick={() => setTarget(null)}>
            กลับดูตามตัวกรอง
          </button>
        </aside>
      )}
      <PageTargetContext.Provider value={target}>
        {content}
      </PageTargetContext.Provider>
      <Footer />
    </UnsavedChangesContext.Provider>
  )
}

export default RoleDashboard
