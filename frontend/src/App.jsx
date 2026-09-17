import { useEffect, useRef, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import { supabase } from './lib/supabase'
import RegisterForm from './components/RegisterForm'
import ProfileSetupForm from './components/ProfileSetupForm'
import RoleDashboard from './pages/RoleDashboard'
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const manualSignOutRef = useRef(false)
  const loadedProfileUserIdRef = useRef(null)

  async function loadProfile(userId) {
    setProfileLoading(true)
    setProfileError('')

    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name')
        .eq('id', userId)
        .maybeSingle()

      if (queryError) {
        throw queryError
      }

      setProfile(data)
    } catch (queryError) {
      loadedProfileUserIdRef.current = null
      setProfile(null)
      setProfileError(queryError.message || 'ไม่สามารถโหลดโปรไฟล์ได้')
    } finally {
      setProfileLoading(false)
    }
  }


  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)

        if (currentSession) {
          setAuthError('')

          const userId = currentSession.user.id

          if (loadedProfileUserIdRef.current !== userId) {
            loadedProfileUserIdRef.current = userId
            loadProfile(userId)
          }
        } else {
          loadedProfileUserIdRef.current = null
          setProfile(null)
          setProfileLoading(false)
          setProfileError('')
        }

        if (event === 'SIGNED_OUT') {
          const wasManualSignOut = manualSignOutRef.current
          manualSignOutRef.current = false

          if (!wasManualSignOut) {
            setAuthError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
          }
        }

        setAuthLoading(false)
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  async function handleSignOut() {
    setAuthError('')
    manualSignOutRef.current = true

    const { error: signOutError } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (signOutError) {
      manualSignOutRef.current = false
      setAuthError('ไม่สามารถออกจากระบบได้')
    }
  }
  if (authLoading) {
    return <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
  }
  return (
    <main className={`app-shell${session && profile ? ' app-shell-dashboard' : ''}`}>
      {!(session && profile) && <header className="app-header">
        <h1>MatchCare</h1>
        <p>ระบบจับคู่ผู้ดูแลกับผู้ที่ต้องการการดูแล</p>
      </header>}

      {session ? (
        <section className="auth-status">
          {!profile && <p>เข้าสู่ระบบแล้ว: {session.user.email}</p>}
          {profileLoading && <p>กำลังโหลดข้อมูลโปรไฟล์...</p>}

          {profileError && <p role="alert">{profileError}</p>}

          {!profileLoading && !profileError && profile && (
            <RoleDashboard profile={profile} onSignOut={handleSignOut} />
          )}

          {!profileLoading && !profileError && !profile && (
            <ProfileSetupForm
              userId={session.user.id}
              onProfileCreated={() => loadProfile(session.user.id)}
            />
          )}

          {(!profile || !['employer', 'caregiver', 'admin'].includes(profile.role)) && <button type="button" onClick={handleSignOut}>
            ออกจากระบบ
          </button>}

          {authError && <p role="alert">{authError}</p>}
        </section>
      ) : (
        <section className="auth-panel">
          {authError && <p role="alert">{authError}</p>}

          {authMode === 'login' ? <LoginForm /> : <RegisterForm />}

          <button
            type="button"
            onClick={() =>
              setAuthMode(authMode === 'login' ? 'register' : 'login')
            }
          >
            {authMode === 'login'
              ? 'ยังไม่มีบัญชี? สมัครสมาชิก'
              : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
          </button>
        </section>
      )}

    </main>
  )
}

export default App
