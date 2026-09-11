import { useState } from 'react'
import { supabase } from '../lib/supabase'

function RegisterForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
            return
        }

        setLoading(true)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            })

            if (signUpError) {
                throw signUpError
            }

            if (data.session) {
                setMessage('สมัครสมาชิกสำเร็จ')
            } else {
                setMessage('สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี')
            }
        } catch (signUpError) {
            setError(signUpError.message || 'ไม่สามารถสมัครสมาชิกได้')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>สมัครสมาชิก</h2>

            <label htmlFor="register-email">อีเมล</label>
            <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
            />

            <label htmlFor="register-password">รหัสผ่าน</label>
            <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
            />

            <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
            <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
            />
            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
        </form>
    )
}

export default RegisterForm