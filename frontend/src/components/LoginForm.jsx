import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/navbar/logo.png'


function LoginForm({ onBack, onRegister }) {
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
        <form className="auth-form auth-card" onSubmit={handleSubmit}>
            <button className="auth-back-button" type="button" onClick={onBack}>
                <span aria-hidden="true">‹</span>
                ย้อนกลับ
            </button>

            <div className="auth-card-header">
                <span className="auth-card-logo" aria-hidden="true">
                    <img src={logo} alt="" />
                </span>
                <h2>เข้าสู่ระบบ</h2>
                <p>ยินดีต้อนรับกลับสู่ MatchCare</p>
            </div>

            <label htmlFor="email">อีเมล</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="example@email.com"
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
                placeholder="กรอกรหัสผ่าน"
                required
                disabled={loading}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

            <p className="auth-switch-copy">
                ยังไม่มีบัญชี?{' '}
                <button type="button" onClick={onRegister}>
                    สมัครสมาชิก
                </button>
            </p>
        </form>
    )
}

export default LoginForm
