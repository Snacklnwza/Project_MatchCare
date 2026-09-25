import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import { supabase } from './lib/supabase'
import RegisterForm from './components/RegisterForm'
import RoleDashboard from './pages/RoleDashboard'
import LandingPage from './pages/LandingPage'
import { SpeedInsights } from '@vercel/speed-insights/react'

const ProfileSetupForm = lazy(() => import('./components/ProfileSetupForm'))

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authMode, setAuthMode] = useState('landing')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const manualSignOutRef = useRef(false)
  const [profileRetry, setProfileRetry] = useState(0)
  const [loadedUserId, setLoadedUserId] = useState(null)

  // Query profiles outside the Auth callback to avoid holding the auth lock.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        if (currentSession) setAuthError('')
        if (event === 'SIGNED_OUT') {
          setAuthMode(manualSignOutRef.current ? 'landing' : 'login')
          if (!manualSignOutRef.current)
            setAuthError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
          manualSignOutRef.current = false
        }
        setAuthLoading(false)
      },
    )
    return () => authListener.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      setProfile(null)
      setProfileError('')
      if (!userId) {
        setProfileLoading(false)
        return
      }
      setProfileLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name')
          .eq('id', userId)
          .maybeSingle()
        if (error) throw error
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setProfileError('ไม่สามารถโหลดโปรไฟล์ได้ กรุณาลองใหม่')
      } finally {
        if (!cancelled) {
          setLoadedUserId(userId)
          setProfileLoading(false)
        }
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [userId, profileRetry])

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
  const isProfilePending =
    profileLoading || (session && loadedUserId !== session.user.id)
  const isLandingPage = !session && authMode === 'landing'

  return (
    <main
      className={`app-shell${session && profile ? ' app-shell-dashboard' : ''}${isLandingPage ? ' app-shell-landing' : ''}`}
    >
      {isLandingPage && (
        <LandingPage
          onLogin={() => setAuthMode('login')}
          onRegister={() => setAuthMode('register')}
        />
      )}

      {session ? (
        <section className="auth-status">
          {isProfilePending && <p>กำลังโหลดข้อมูลโปรไฟล์...</p>}

          {profileError && (
            <div role="alert">
              <p>{profileError}</p>
              <button
                type="button"
                onClick={() => setProfileRetry((key) => key + 1)}
              >
                ลองใหม่
              </button>
              <button type="button" onClick={handleSignOut}>
                ออกจากระบบ
              </button>
            </div>
          )}

          {!isProfilePending && !profileError && profile && (
            <RoleDashboard
              key={profile.id}
              profile={profile}
              onSignOut={handleSignOut}
            />
          )}

          {!isProfilePending && !profileError && !profile && (
            <Suspense fallback={<p>กำลังโหลดแบบฟอร์ม...</p>}>
            <ProfileSetupForm
              userId={session.user.id}
              email={session.user.email}
              onSignOut={handleSignOut}
              onProfileCreated={() => setProfileRetry((key) => key + 1)}
            />
            </Suspense>
          )}

          {profile &&
            !['employer', 'caregiver', 'admin'].includes(profile.role) && (
              <button type="button" onClick={handleSignOut}>
                ออกจากระบบ
              </button>
            )}

          {authError && <p role="alert">{authError}</p>}
        </section>
      ) : !isLandingPage ? (
        <section className="auth-panel">
          {authError && <p role="alert">{authError}</p>}

          {authMode === 'login' ? (
            <LoginForm
              onBack={() => setAuthMode('landing')}
              onRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm
              onBack={() => setAuthMode('landing')}
              onLogin={() => setAuthMode('login')}
            />
          )}
        </section>
      ) : null}

      <SpeedInsights />
    </main>
  )
}

export default App
