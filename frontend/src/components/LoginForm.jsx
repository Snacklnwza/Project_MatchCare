import { useState } from 'react'
import { supabase } from '../lib/supabase'


function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                })

            if (signInError) {
                throw signInError
            }
        } catch {
            setError('ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบอีเมลและรหัสผ่าน')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>เข้าสู่ระบบ</h2>

            <label htmlFor="email">อีเมล</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={loading}
            />

            <label htmlFor="password">รหัสผ่าน</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
        </form>
    )
}

export default LoginForm