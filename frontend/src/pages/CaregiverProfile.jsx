import useUnsavedChanges from '../hooks/useUnsavedChanges'
import { useEffect, useRef, useState } from 'react'
import { saveCaregiverContact } from '../lib/profiles'
import { removeOwnAvatar, saveOwnAvatar, signedAvatarUrl } from '../lib/caregiverAvatars'
import { supabase } from '../lib/supabase'
import CaregiverAvatar from '../components/CaregiverAvatar'
import AvatarCropper from '../components/AvatarCropper'
import SkillPicker from '../components/SkillPicker'
import ReviewSummary from '../components/ReviewSummary'
import '../styles/CaregiverProfile.css'

const verificationLabels = {
  verified: 'ยืนยันตัวตนแล้ว',
  pending: 'รอแอดมินตรวจสอบ',
  rejected: 'เอกสารต้องแก้ไข',
  not_submitted: 'ยังไม่ได้ส่งเอกสาร',
}

function CaregiverProfile({ profile, email, onNavigate }) {
  const [section, setSection] = useState('care')
  const [contactData, setContactData] = useState(null)
  const [contactDraft, setContactDraft] = useState({ phone: '', line_id: '' })
  const [contactSaving, setContactSaving] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState('')
  const contactBusy = useRef(false)
  const [caregiverData, setCaregiverData] = useState(null)
  const [signedAvatar, setSignedAvatar] = useState({ path: '', url: '' })
  const avatarUrl = caregiverData?.avatar_path === signedAvatar.path
    ? signedAvatar.url : ''
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [skills, setSkills] = useState([])
  const [selectedSkillIds, setSelectedSkillIds] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState('')
  const [skillsRetry, setSkillsRetry] = useState(0)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [savedSkills, setSavedSkills] = useState([])
  const careDirty =
    !loading &&
    !skillsLoading &&
    (bio !== (caregiverData?.bio ?? '') ||
      experienceYears !== String(caregiverData?.experience_years ?? 0) ||
      JSON.stringify([...selectedSkillIds].sort()) !==
        JSON.stringify([...savedSkills].sort()))
  const contactDirty =
    !loading &&
    (contactDraft.phone !== (contactData?.phone ?? '') ||
      contactDraft.line_id !== (contactData?.line_id ?? ''))
  // รวมร่างทั้งสองหมวดไว้ในการเตือนเดียว บันทึกหมวดหนึ่งแล้วอีกหมวดยังต้องเตือนอยู่
  useUnsavedChanges(careDirty || contactDirty)

  useEffect(() => {
    let active = true

    async function loadCaregiverData() {
      setLoading(true)
      setError('')

      const [caregiverResult, contactResult] = await Promise.all([
        supabase
          .from('caregiver_profiles')
          .select(
            'bio, experience_years, availability_status, verification_status, avatar_path',
          )
          .eq('caregiver_id', profile.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('phone, line_id')
          .eq('id', profile.id)
          .single(),
      ])
      const { data, error: loadError } = caregiverResult

      if (!active) return

      if (loadError || contactResult.error) {
        setError('โหลดข้อมูลผู้ดูแลไม่สำเร็จ')
      } else {
        setCaregiverData(data)
        setContactData(contactResult.data)
        setContactDraft({
          phone: contactResult.data.phone,
          line_id: contactResult.data.line_id ?? '',
        })
        setBio(data?.bio ?? '')
        setExperienceYears(String(data?.experience_years ?? 0))
      }
      setLoading(false)
    }

    loadCaregiverData()

    return () => {
      active = false
    }
  }, [profile.id, retryKey])
  useEffect(() => {
    let active = true
    const path = caregiverData?.avatar_path
    if (!path) return undefined
    signedAvatarUrl(path)
      .then((url) => { if (active) setSignedAvatar({ path, url }) })
      .catch(() => { if (active) setAvatarError('โหลดรูปโปรไฟล์ไม่สำเร็จ') })
    return () => { active = false }
  }, [caregiverData?.avatar_path])

  function chooseAvatar(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || avatarBusy || !caregiverData) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10485760) {
      setAvatarError('เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB')
      return
    }
    setAvatarError('')
    setSelectedAvatar(file)
  }

  async function changeAvatar(file) {
    setAvatarBusy(true)
    setAvatarError('')
    setAvatarMessage('')
    try {
      const { path, cleanupFailed } = await saveOwnAvatar(
        profile.id, file, caregiverData.avatar_path,
      )
      setCaregiverData((current) => ({ ...current, avatar_path: path }))
      setSelectedAvatar(null)
      setAvatarMessage(cleanupFailed
        ? 'เปลี่ยนรูปแล้ว แต่ลบไฟล์รูปเก่าไม่สำเร็จ'
        : 'เปลี่ยนรูปโปรไฟล์แล้ว')
    } catch (issue) {
      setAvatarError(issue.message || 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function removeAvatar() {
    if (!caregiverData?.avatar_path || avatarBusy) return
    setAvatarBusy(true)
    setAvatarError('')
    setAvatarMessage('')
    try {
      const { cleanupFailed } = await removeOwnAvatar(profile.id, caregiverData.avatar_path)
      setCaregiverData((current) => ({ ...current, avatar_path: null }))
      setAvatarMessage(cleanupFailed
        ? 'เอารูปออกจากโปรไฟล์แล้ว แต่ลบไฟล์เดิมไม่สำเร็จ'
        : 'เอารูปโปรไฟล์ออกแล้ว')
    } catch {
      setAvatarError('เอารูปออกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setAvatarBusy(false)
    }
  }
  useEffect(() => {
    let active = true

    async function loadSkills() {
      setSkillsLoading(true)
      setSkillsError('')

      const [skillsResult, selectedResult] = await Promise.all([
        supabase.from('skills').select('id, name, is_active').order('name'),
        supabase
          .from('caregiver_skills')
          .select('skill_id')
          .eq('caregiver_id', profile.id),
      ])

      if (!active) return

      if (skillsResult.error || selectedResult.error) {
        setSkillsError('โหลดรายการทักษะไม่สำเร็จ')
      } else {
        setSkills(skillsResult.data ?? [])
        setSavedSkills((selectedResult.data ?? []).map((item) => item.skill_id))
        setSelectedSkillIds(
          (selectedResult.data ?? []).map((item) => item.skill_id),
        )
      }
      setSkillsLoading(false)
    }

    loadSkills()

    return () => {
      active = false
    }
  }, [profile.id, skillsRetry])

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving || availabilitySaving || contactSaving) return
    setSaveError('')
    setSaveSuccess('')

    const years = Number(experienceYears)

    if (!bio.trim()) {
      setSaveError('กรุณากรอกคำแนะนำตัว')
      return
    }

    if (
      experienceYears.trim() === '' ||
      !Number.isInteger(years) ||
      years < 0 ||
      years > 80
    ) {
      setSaveError('ประสบการณ์ต้องเป็นจำนวนเต็ม 0–80 ปี')
      return
    }
    if (skillsLoading || skillsError) {
      setSaveError('กรุณารอให้โหลดทักษะสำเร็จก่อน')
      return
    }
    setSaving(true)

    try {
      // RPC บันทึกโปรไฟล์และทักษะพร้อมกัน ถ้าล้มเหลวจะย้อนกลับทั้งหมด
      const { data, error: saveFailure } = await supabase
        .rpc('save_caregiver_profile_with_skills', {
          p_bio: bio.trim(),
          p_experience_years: years,
          p_skill_ids: selectedSkillIds,
        })
        .single()

      if (saveFailure) throw saveFailure
      setCaregiverData(data)
      setBio(data.bio ?? bio.trim())
      setExperienceYears(String(data.experience_years ?? years))
      setSavedSkills([...selectedSkillIds])
      setSaveSuccess('บันทึกโปรไฟล์แล้ว')
    } catch {
      setSaveError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }
  async function handleAvailabilityToggle() {
    if (!caregiverData || saving || availabilitySaving || contactSaving) return

    const previousStatus = caregiverData.availability_status
    const nextStatus =
      previousStatus === 'available' ? 'unavailable' : 'available'

    setAvailabilityError('')
    setAvailabilitySaving(true)
    setCaregiverData((current) => ({
      ...current,
      availability_status: nextStatus,
    }))

    try {
      const { data, error: updateError } = await supabase
        .from('caregiver_profiles')
        .update({ availability_status: nextStatus })
        .eq('caregiver_id', profile.id)
        .select('availability_status')
        .single()

      if (updateError) throw updateError

      setCaregiverData((current) => ({
        ...current,
        availability_status: data.availability_status,
      }))
    } catch {
      setCaregiverData((current) => ({
        ...current,
        availability_status: previousStatus,
      }))
      setAvailabilityError('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setAvailabilitySaving(false)
    }
  }
  function changeContact(field, value) {
    setContactDraft((current) => ({ ...current, [field]: value }))
    setContactError('')
    setContactSuccess('')
  }
  async function handleContactSubmit(event) {
    event.preventDefault()
    if (contactBusy.current || !contactDirty || saving || availabilitySaving)
      return
    contactBusy.current = true
    setContactSaving(true)
    setContactError('')
    setContactSuccess('')
    try {
      const saved = await saveCaregiverContact(profile.id, contactDraft)
      setContactData(saved)
      setContactDraft({ phone: saved.phone, line_id: saved.line_id ?? '' })
      setContactSuccess('บันทึกข้อมูลติดต่อแล้ว')
    } catch (issue) {
      setContactError(issue.message)
    } finally {
      contactBusy.current = false
      setContactSaving(false)
    }
  }
  return (
    <section className="caregiver-profile">
      <header className="caregiver-profile-heading">
        <h1>โปรไฟล์ผู้ดูแล</h1>
        <p>
          คุณ{profile.first_name} {profile.last_name} ·
          แนะนำตัวและเลือกทักษะเพื่อให้ผู้ว่าจ้างพบคุณ
        </p>
      </header>
      {loading && <p>กำลังโหลดข้อมูลผู้ดูแล...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
            ลองใหม่
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="caregiver-settings-layout">
          <nav
            className="caregiver-settings-nav"
            aria-label="หมวดโปรไฟล์ผู้ดูแล"
          >
            <h2>จัดการโปรไฟล์</h2>
            <label className="caregiver-mobile-section">
              เลือกหมวด
              <select
                aria-label="เลือกหมวด"
                value={section}
                onChange={(event) => {
                  const next = event.target.value
                  if (next === 'documents') onNavigate('documents')
                  else setSection(next)
                }}
              >
                <option value="personal">ข้อมูลส่วนตัว</option>
                <option value="care">โปรไฟล์การดูแล</option>
                <option value="documents">เอกสารยืนยันตัวตน</option>
              </select>
            </label>
            <button
              type="button"
              aria-current={section === 'personal' ? 'page' : undefined}
              onClick={() => setSection('personal')}
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              type="button"
              aria-current={section === 'care' ? 'page' : undefined}
              onClick={() => setSection('care')}
            >
              โปรไฟล์การดูแล
            </button>
            <button type="button" onClick={() => onNavigate('documents')}>
              เอกสารยืนยันตัวตน <span aria-hidden="true">↗</span>
            </button>
          </nav>
          <div className="caregiver-settings-content">
            {section === 'personal' && (
              <section
                className="caregiver-personal-card"
                aria-labelledby="caregiver-personal-title"
              >
                <h2 id="caregiver-personal-title">ข้อมูลส่วนตัว</h2>
                <p className="caregiver-profile-hint">
                  ข้อมูลบัญชีที่คุณใช้สมัครและติดต่อเมื่อจับคู่สำเร็จ
                </p>
                <div className="caregiver-avatar-editor">
                  <CaregiverAvatar
                    name={profile.first_name}
                    url={avatarUrl}
                    className="caregiver-avatar-preview"
                  />
                  <div>
                    <strong>รูปโปรไฟล์ (ไม่บังคับ)</strong>
                    <p>ผู้ว่าจ้างที่เข้าสู่ระบบจะเห็นรูปเมื่อบัญชีผ่านการยืนยันตัวตน รูปนี้แยกจากเอกสารยืนยันตัวตน</p>
                    <label className="caregiver-avatar-upload">
                      {avatarBusy ? 'กำลังบันทึกรูป...' : caregiverData?.avatar_path ? 'เปลี่ยนรูป' : 'เพิ่มรูป'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={avatarBusy || !caregiverData}
                        aria-label="เลือกรูปโปรไฟล์ผู้ดูแล"
                        onChange={chooseAvatar}
                      />
                    </label>
                    {caregiverData?.avatar_path && (
                      <button type="button" className="secondary-button" disabled={avatarBusy} onClick={removeAvatar}>
                        เอารูปออก
                      </button>
                    )}
                    <small>JPG, PNG หรือ WebP ไม่เกิน 10 MB · ครอบภาพก่อนบันทึก</small>
                    {avatarError && <p role="alert">{avatarError}</p>}
                    {avatarMessage && <p role="status">{avatarMessage}</p>}
                  </div>
                </div>
                {selectedAvatar && (
                  <AvatarCropper file={selectedAvatar} busy={avatarBusy}
                    onCancel={() => setSelectedAvatar(null)} onConfirm={changeAvatar} />
                )}
                <dl>
                  <div>
                    <dt>ชื่อและนามสกุล</dt>
                    <dd>
                      {profile.first_name} {profile.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt>อีเมล</dt>
                    <dd>{email || 'ไม่ได้ระบุ'}</dd>
                  </div>
                </dl>
                <form
                  className="caregiver-contact-form"
                  onSubmit={handleContactSubmit}
                >
                  <fieldset disabled={contactSaving}>
                    <legend>ช่องทางติดต่อ</legend>
                    <label htmlFor="caregiver-phone">เบอร์โทรศัพท์</label>
                    <input
                      id="caregiver-phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                      pattern="[0-9]{9,10}"
                      maxLength={10}
                      title="กรอกเบอร์โทรศัพท์ 9–10 หลัก"
                      value={contactDraft.phone}
                      onChange={(event) =>
                        changeContact(
                          'phone',
                          event.target.value.replace(/\D/g, '').slice(0, 10),
                        )
                      }
                    />
                    <label htmlFor="caregiver-line">
                      LINE ID <span>(ไม่บังคับ)</span>
                    </label>
                    <input
                      id="caregiver-line"
                      maxLength={100}
                      autoCapitalize="none"
                      spellCheck={false}
                      value={contactDraft.line_id}
                      onChange={(event) =>
                        changeContact('line_id', event.target.value)
                      }
                    />
                    <p className="caregiver-profile-hint">
                      ลบ LINE ID ได้หากไม่ใช้แล้ว
                      ข้อมูลติดต่อเปิดให้ผู้ว่าจ้างที่จับคู่กับคุณแล้วเห็นเท่านั้น
                    </p>
                  </fieldset>
                  {contactError && <p role="alert">{contactError}</p>}
                  {contactSuccess && <p role="status">{contactSuccess}</p>}
                  <div className="caregiver-contact-actions">
                    <button
                      type="submit"
                      disabled={
                        !contactDirty ||
                        contactSaving ||
                        saving ||
                        availabilitySaving
                      }
                    >
                      {contactSaving
                        ? 'กำลังบันทึก...'
                        : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!contactDirty || contactSaving}
                      onClick={() => {
                        setContactDraft({
                          phone: contactData.phone,
                          line_id: contactData.line_id ?? '',
                        })
                        setContactError('')
                        setContactSuccess('')
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </section>
            )}
            {/* เก็บฟอร์มไว้เมื่อสลับหมวด เพื่อไม่ให้ร่างที่ยังไม่บันทึกหาย */}
            <div hidden={section !== 'care'}>
              <form className="caregiver-profile-form" onSubmit={handleSubmit}>
                <h2>
                  {caregiverData ? 'ข้อมูลการดูแลของฉัน' : 'เริ่มสร้างโปรไฟล์'}
                </h2>
                <label htmlFor="caregiver-bio">แนะนำตัว</label>
                <textarea
                  id="caregiver-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
                <p className="caregiver-profile-hint">
                  เขียนประสบการณ์และแนวทางการดูแล
                  ไม่ต้องใส่เบอร์โทรหรือช่องทางติดต่อ
                </p>

                <label htmlFor="caregiver-experience">
                  ประสบการณ์ดูแล (ปี)
                </label>
                <input
                  id="caregiver-experience"
                  type="number"
                  min="0"
                  max="80"
                  step="1"
                  value={experienceYears}
                  onChange={(event) => setExperienceYears(event.target.value)}
                />
                <fieldset>
                  <legend>ทักษะการดูแล</legend>
                  {skillsLoading && <p>กำลังโหลดทักษะ...</p>}
                  {skillsError && (
                    <div role="alert">
                      <p>{skillsError}</p>
                      <button
                        type="button"
                        onClick={() => setSkillsRetry((key) => key + 1)}
                      >
                        ลองใหม่
                      </button>
                    </div>
                  )}
                  {!skillsLoading && !skillsError && (
                    <SkillPicker skills={skills} selectedIds={selectedSkillIds}
                      onToggle={(id) => setSelectedSkillIds((current) =>
                        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
                      )} />
                  )}
                </fieldset>
                {saveError && <p role="alert">{saveError}</p>}
                {saveSuccess && <p role="status">{saveSuccess}</p>}
                <button
                  type="submit"
                  disabled={
                    saving ||
                    contactSaving ||
                    availabilitySaving ||
                    skillsLoading ||
                    Boolean(skillsError)
                  }
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
                </button>
              </form>
            </div>
          </div>
          <aside
            className="caregiver-settings-summary"
            aria-label="สถานะและรีวิวของฉัน"
          >
            <section className="caregiver-status-card">
              <CaregiverAvatar name={profile.first_name} url={avatarUrl} className="caregiver-summary-avatar" />
              <h2>
                {profile.first_name} {profile.last_name}
              </h2>
              <p>ผู้ดูแล</p>
              <h3>การยืนยันตัวตน</h3>
              <p className="caregiver-verification-status">
                {verificationLabels[caregiverData?.verification_status] ||
                  'ยังไม่ได้ส่งเอกสาร'}
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onNavigate('documents')}
              >
                ดูเอกสารของฉัน
              </button>
              <div className="caregiver-profile-availability">
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={caregiverData?.availability_status === 'available'}
                    onChange={handleAvailabilityToggle}
                    disabled={
                      !caregiverData ||
                      saving ||
                      availabilitySaving ||
                      contactSaving
                    }
                  />
                  พร้อมรับงาน
                </label>
                <p>
                  {caregiverData
                    ? caregiverData.availability_status === 'available'
                      ? 'สถานะ: พร้อมรับงาน'
                      : 'สถานะ: ยังไม่พร้อมรับงาน'
                    : 'บันทึกโปรไฟล์ก่อนเปลี่ยนสถานะ'}
                </p>
                {availabilityError && <p role="alert">{availabilityError}</p>}
                <p className="caregiver-profile-hint">
                  ผู้ว่าจ้างค้นพบคุณได้เมื่อยืนยันตัวตนแล้วและเปิดพร้อมรับงาน
                </p>
              </div>
            </section>
            <ReviewSummary caregiverId={profile.id} />
          </aside>
        </div>
      )}
    </section>
  )
}

export default CaregiverProfile
