import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/navbar/logo.png'

function RegisterForm({ onBack, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
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
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        setMessage('สมัครสมาชิกสำเร็จ')
      } else {
        setMessage(
          'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี หากเคยสมัครแล้วให้เข้าสู่ระบบด้วยบัญชีเดิม',
        )
      }
    } catch (signUpError) {
      setError(
        signUpError.status === 429 || signUpError.code === 'over_email_send_rate_limit'
          ? 'ส่งอีเมลยืนยันถี่เกินไป กรุณารอสักครู่ก่อนลองใหม่'
          : 'ไม่สามารถสมัครสมาชิกได้ หากเคยสมัครแล้วให้เข้าสู่ระบบ หรือลองใหม่ภายหลัง',
      )
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
        <h2>สมัครสมาชิก</h2>
        <p>สร้างบัญชีเพื่อเริ่มใช้งาน MatchCare</p>
      </div>

      <label htmlFor="register-email">อีเมล</label>
      <input
        id="register-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        placeholder="example@email.com"
        required
      />

      <label htmlFor="register-password">รหัสผ่าน</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
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
        placeholder="ระบุรหัสผ่านอีกครั้ง"
        minLength={8}
        required
      />

      <p className="auth-info-notice">
        <span aria-hidden="true">ⓘ</span>
        หลังยืนยันอีเมล คุณจะได้เลือกประเภทบัญชีและกรอกข้อมูลโปรไฟล์
      </p>

      <label className="auth-terms">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          required
        />
        <span>
          ฉันยอมรับ <strong>ข้อตกลงการใช้งาน</strong> และ{' '}
          <strong>นโยบายความเป็นส่วนตัว</strong>
        </span>
      </label>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={loading || !acceptedTerms}>
        {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
      </button>

      <p className="auth-switch-copy">
        มีบัญชีอยู่แล้ว?{' '}
        <button type="button" onClick={onLogin}>
          เข้าสู่ระบบ
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
