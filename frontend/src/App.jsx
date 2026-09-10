import { useEffect, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import { supabase } from './lib/supabase'

function App() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setAuthLoading(false)
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  async function handleSignOut() {
    setAuthError('')

    const { error: signOutError } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (signOutError) {
      setAuthError('ไม่สามารถออกจากระบบได้')
    }
  }
  async function loadSkills() {
    setLoading(true)
    setError('')

    try {
      const { data, error: queryError } = await supabase
        .from('skills')
        .select('id, name, description')
        .order('id')

      if (queryError) {
        throw queryError
      }

      setSkills(data ?? [])
      setHasLoaded(true)
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดทักษะได้')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
  }
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>MatchCare</h1>
        <p>ระบบจับคู่ผู้ดูแลกับผู้ที่ต้องการการดูแล</p>
      </header>

      {session ? (
        <section className="auth-status">
          <p>เข้าสู่ระบบแล้ว: {session.user.email}</p>

          <button type="button" onClick={handleSignOut}>
            ออกจากระบบ
          </button>

          {authError && <p role="alert">{authError}</p>}
        </section>
      ) : (
        <LoginForm />
      )}

      <section className="skills-demo" aria-labelledby="skills-heading">
        <h2 id="skills-heading">ทดสอบการเชื่อมต่อฐานข้อมูล</h2>

        <button type="button" onClick={loadSkills} disabled={loading}>
          {loading ? 'กำลังโหลด...' : 'โหลดทักษะ'}
        </button>

        {error && <p role="alert">{error}</p>}

        {hasLoaded && !loading && !error && skills.length === 0 && (
          <p>ไม่พบทักษะที่เปิดใช้งาน</p>
        )}

        <ul>
          {skills.map((skill) => (
            <li key={skill.id}>
              {skill.name} — {skill.description}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
