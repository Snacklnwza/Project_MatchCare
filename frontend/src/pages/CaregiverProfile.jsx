import useUnsavedChanges from '../hooks/useUnsavedChanges'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CaregiverReviews from '../components/CaregiverReviews'
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
  const [caregiverData, setCaregiverData] = useState(null)
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
  const dirty =
    !loading &&
    !skillsLoading &&
    (bio !== (caregiverData?.bio ?? '') ||
      experienceYears !== String(caregiverData?.experience_years ?? 0) ||
      JSON.stringify([...selectedSkillIds].sort()) !==
        JSON.stringify([...savedSkills].sort()))
  const { markSaved } = useUnsavedChanges(dirty)

  useEffect(() => {
    let active = true

    async function loadCaregiverData() {
      setLoading(true)
      setError('')

      const [caregiverResult, contactResult] = await Promise.all([
        supabase
          .from('caregiver_profiles')
          .select(
            'bio, experience_years, availability_status, verification_status',
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
    if (saving || availabilitySaving) return
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
      markSaved()
      setSaveSuccess('บันทึกโปรไฟล์แล้ว')
    } catch {
      setSaveError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }
  async function handleAvailabilityToggle() {
    if (!caregiverData || saving || availabilitySaving) return

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
                  <div>
                    <dt>เบอร์โทรศัพท์</dt>
                    <dd>{contactData?.phone || 'ไม่ได้ระบุ'}</dd>
                  </div>
                  <div>
                    <dt>LINE ID</dt>
                    <dd>{contactData?.line_id || 'ไม่ได้ระบุ'}</dd>
                  </div>
                </dl>
                <p className="caregiver-profile-hint">
                  หน้านี้แสดงข้อมูลบัญชี
                  ส่วนคำแนะนำตัวและทักษะแก้ไขได้ในหมวดโปรไฟล์การดูแล
                </p>
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
                    <ul>
                      {skills
                        .filter(
                          (skill) =>
                            skill.is_active ||
                            selectedSkillIds.includes(skill.id),
                        )
                        .map((skill) => (
                          <li key={skill.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={selectedSkillIds.includes(skill.id)}
                                disabled={!skill.is_active}
                                onChange={() =>
                                  setSelectedSkillIds((current) =>
                                    current.includes(skill.id)
                                      ? current.filter((id) => id !== skill.id)
                                      : [...current, skill.id],
                                  )
                                }
                              />
                              {skill.name}
                              {!skill.is_active &&
                                ' (ปิดใช้งานแล้ว · เก็บข้อมูลเดิม)'}
                            </label>
                          </li>
                        ))}
                    </ul>
                  )}
                </fieldset>
                {saveError && <p role="alert">{saveError}</p>}
                {saveSuccess && <p role="status">{saveSuccess}</p>}
                <button
                  type="submit"
                  disabled={
                    saving ||
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
              <span className="caregiver-summary-avatar" aria-hidden="true">
                {profile.first_name?.charAt(0)}
              </span>
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
                    disabled={!caregiverData || saving || availabilitySaving}
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
            <CaregiverReviews caregiverId={profile.id} />
          </aside>
        </div>
      )}
    </section>
  )
}

export default CaregiverProfile
