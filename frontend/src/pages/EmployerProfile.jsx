import { useCallback, useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { loadEmployerProfile, saveEmployerProfile } from '../lib/profiles'
import '../styles/AccountProfile.css'

function ProfileForm({ initial, email, onProfileUpdated }) {
  const [values, setValues] = useState({ ...initial, line_id: initial.line_id ?? '' })
  const [saved, setSaved] = useState(values)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const submitting = useRef(false)
  const dirty = ['first_name', 'last_name', 'phone', 'line_id'].some((key) => values[key] !== saved[key])

  function change(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current || !dirty) return
    submitting.current = true
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await saveEmployerProfile(initial.id, values)
      const next = { ...updated, line_id: updated.line_id ?? '' }
      setValues(next)
      setSaved(next)
      onProfileUpdated(updated)
      setSuccess('บันทึกโปรไฟล์แล้ว')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <div className="account-profile-layout">
      <aside className="workflow-card account-profile-summary">
        <span className="account-profile-avatar" aria-hidden="true">{saved.first_name.charAt(0)}</span>
        <h2>{saved.first_name} {saved.last_name}</h2>
        <span className="workflow-badge">ผู้ว่าจ้าง</span>
        <p>ข้อมูลติดต่อที่ถูกต้องช่วยให้ผู้ดูแลติดต่อคุณได้เมื่อจับคู่สำเร็จ</p>
        <div className="account-profile-privacy">
          <strong>ใครเห็นข้อมูลติดต่อ?</strong>
          <p>เบอร์โทรและ LINE เปิดให้ผู้ดูแลที่จับคู่กับคุณแล้วเห็น ส่วนข้อมูลผู้ป่วยและสถานที่ดูแลจัดการแยกในหน้าผู้ป่วยและประกาศงาน</p>
        </div>
      </aside>
      <form className="workflow-card account-profile-form" onSubmit={handleSubmit}>
        <h2>ข้อมูลส่วนตัวและการติดต่อ</h2>
        <p className="workflow-hint">กรอกชื่อและเบอร์โทรให้ครบ ส่วน LINE ID ไม่บังคับ</p>
        <fieldset disabled={saving}>
          <div className="account-profile-fields">
            <div>
              <label htmlFor="employer-first-name">ชื่อ</label>
              <input id="employer-first-name" autoComplete="given-name" required maxLength={100}
                value={values.first_name} onChange={(event) => change('first_name', event.target.value)} />
            </div>
            <div>
              <label htmlFor="employer-last-name">นามสกุล</label>
              <input id="employer-last-name" autoComplete="family-name" required maxLength={100}
                value={values.last_name} onChange={(event) => change('last_name', event.target.value)} />
            </div>
            <div>
              <label htmlFor="employer-phone">เบอร์โทรศัพท์</label>
              <input id="employer-phone" type="tel" autoComplete="tel" inputMode="numeric" required
                pattern="[0-9]{9,10}" maxLength={10} title="กรอกเบอร์โทรศัพท์ 9-10 หลัก"
                value={values.phone} onChange={(event) => change('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            <div>
              <label htmlFor="employer-line">LINE ID <span>(ไม่บังคับ)</span></label>
              <input id="employer-line" maxLength={100} autoCapitalize="none" spellCheck={false}
                value={values.line_id} onChange={(event) => change('line_id', event.target.value)} />
            </div>
          </div>
          <label htmlFor="employer-email">อีเมลที่ใช้เข้าสู่ระบบ</label>
          <input id="employer-email" type="email" value={email ?? ''} readOnly aria-describedby="employer-email-hint" />
          <p id="employer-email-hint" className="workflow-hint">อีเมลของบัญชีนี้แสดงเพื่ออ้างอิง</p>
        </fieldset>
        {error && <p className="account-profile-error" role="alert">{error}</p>}
        {success && <p className="account-profile-success" role="status">{success}</p>}
        <div className="account-profile-actions">
          <button type="submit" disabled={saving || !dirty}>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</button>
          <button type="button" className="secondary-button" disabled={saving || !dirty}
            onClick={() => { setValues(saved); setError(''); setSuccess('') }}>คืนค่าที่บันทึกไว้</button>
        </div>
      </form>
    </div>
  )
}

export default function EmployerProfile({ profile, email, onProfileUpdated }) {
  const loader = useCallback(() => loadEmployerProfile(profile.id), [profile.id])
  const { data, loading, error, reload } = useRemoteList(loader)
  return (
    <section className="workflow-page account-profile-page">
      <header>
        <h1>โปรไฟล์และตั้งค่า</h1>
        <p>จัดการชื่อและช่องทางติดต่อของคุณให้พร้อมสำหรับการจ้างผู้ดูแล</p>
      </header>
      {loading ? <p role="status">กำลังโหลดโปรไฟล์...</p> : error ? (
        <div className="workflow-card"><p role="alert">{error}</p><button type="button" onClick={reload}>ลองใหม่</button></div>
      ) : <ProfileForm key={profile.id} initial={data} email={email} onProfileUpdated={onProfileUpdated} />}
    </section>
  )
}
