import { useState } from 'react'
import PasswordInput from './PasswordInput'
import { supabase } from '../lib/supabase'
import logo from '../assets/navbar/logo.png'

export default function PasswordRecoveryForm({
  mode,
  onBack,
  onComplete,
  onPasswordUpdated,
}) {
  const updating = mode === 'update'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setError('')

    if (updating && password !== confirmation) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }

    setBusy(true)
    try {
      if (updating) {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        })
        if (updateError) throw updateError
        onPasswordUpdated?.()
        setUpdated(true)
        setPassword('')
        setConfirmation('')
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/` },
        )
        if (resetError) throw resetError
        setSent(true)
      }
    } catch (issue) {
      setError(
        issue.status === 429 || issue.code === 'over_email_send_rate_limit'
          ? 'ส่งอีเมลถี่เกินไป กรุณารอสักครู่ก่อนลองใหม่'
          : updating
            ? 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านแล้วลองอีกครั้ง'
            : 'ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่ภายหลัง',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form auth-card" onSubmit={submit}>
      {onBack && (
        <button className="auth-back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">‹</span>
          กลับไปเข้าสู่ระบบ
        </button>
      )}

      <div className="auth-card-header">
        <span className="auth-card-logo" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
        <h2>{updating ? 'ตั้งรหัสผ่านใหม่' : 'ลืมรหัสผ่าน?'}</h2>
        <p>
          {updating
            ? 'เลือกรหัสผ่านใหม่สำหรับบัญชีของคุณ'
            : 'กรอกอีเมลที่ใช้สมัคร แล้วตรวจสอบลิงก์ในอีเมล'}
        </p>
      </div>

      {sent || updated ? (
        <>
          <p role="status" className="auth-info-notice">
            {updated
              ? 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว'
              : 'หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ กรุณาตรวจสอบกล่องจดหมายและอีเมลขยะ'}
          </p>
          <button
            type="button"
            className="auth-primary-action"
            onClick={updated ? onComplete : onBack}
          >
            {updated ? 'ไปยังบัญชีของฉัน' : 'กลับไปเข้าสู่ระบบ'}
          </button>
        </>
      ) : updating ? (
        <>
          <label htmlFor="new-password">รหัสผ่านใหม่</label>
          <PasswordInput
            id="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={busy}
          />
          <label htmlFor="confirm-new-password">ยืนยันรหัสผ่านใหม่</label>
          <PasswordInput
            id="confirm-new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={busy}
          />
          <small className="form-help">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</small>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </>
      ) : (
        <>
          <label htmlFor="recovery-email">อีเมล</label>
          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="example@email.com"
            required
            disabled={busy}
          />
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
          </button>
        </>
      )}
    </form>
  )
}
