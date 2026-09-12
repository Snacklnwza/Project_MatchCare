import AdminDashboard from './AdminDashboard'
import CaregiverDashboard from './CaregiverDashboard'
import EmployerDashboard from './EmployerDashboard'

function RoleDashboard({ profile }) {
  if (profile.role === 'employer') {
    return <EmployerDashboard profile={profile} />
  }

  if (profile.role === 'caregiver') {
    return <CaregiverDashboard profile={profile} />
  }

  if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} />
  }

  return <p role="alert">ไม่พบบทบาทผู้ใช้งาน</p>
}

export default RoleDashboard