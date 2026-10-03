import profileIllustration from '../assets/dashboard/caregiver-profile.svg'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/CaregiverDashboard.css'

const verificationLabels = {
  not_submitted: 'ยังไม่ได้ส่งยืนยัน',
  pending: 'รอการตรวจสอบ',
  verified: 'ยืนยันแล้ว',
  rejected: 'ต้องแก้ไขเอกสาร',
}

function CaregiverDashboard({ profile, onNavigate }) {
  const [info, setInfo] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const [details, tags] = await Promise.all([
          supabase
            .from('caregiver_profiles')
            .select('bio, availability_status, verification_status')
            .eq('caregiver_id', profile.id)
            .maybeSingle(),
          supabase
            .from('caregiver_skills')
            .select('skill_id, skills(name)')
            .eq('caregiver_id', profile.id),
        ])
        if (details.error || tags.error) throw new Error('load_failed')
        if (active) {
          setInfo(details.data)
          setSkills(tags.data ?? [])
        }
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [profile.id, retry])
  function openProfile() {
    onNavigate('profile')
  }

  const verified = info?.verification_status === 'verified'
  const pendingVerification = info?.verification_status === 'pending'
  const available = info?.availability_status === 'available'
  const steps = [
    {
      done: Boolean(info?.bio?.trim()),
      title: 'แนะนำตัวให้ผู้ว่าจ้างรู้จัก',
      text: 'เพิ่มประสบการณ์และแนวทางการดูแลของคุณ',
    },
    {
      done: skills.length > 0,
      title: 'เพิ่มทักษะการดูแล',
      text: 'ช่วยให้ผู้ว่าจ้างพบคุณจากทักษะที่ตรงกับงาน',
    },
    {
      done: verified,
      title: 'ยืนยันตัวตนผู้ดูแล',
      text: 'ต้องผ่านการตรวจสอบก่อนปรากฏในผลค้นหา',
    },
  ]
  const nextAction = !info?.bio?.trim() || !skills.length
    ? { label: 'เติมข้อมูลโปรไฟล์', page: 'profile', hint: 'แนะนำตัวและเพิ่มทักษะ เพื่อให้ผู้ว่าจ้างรู้จักคุณมากขึ้น' }
    : pendingVerification
      ? { label: 'ดูสถานะเอกสาร', page: 'documents', hint: 'เอกสารอยู่ระหว่างการตรวจสอบ คุณกลับมาดูสถานะได้ที่นี่' }
      : !verified
        ? { label: 'ส่งเอกสารยืนยันตัวตน', page: 'documents', hint: 'ยืนยันตัวตนก่อนให้ผู้ว่าจ้างพบคุณในผลค้นหา' }
        : !available
          ? { label: 'เปิดพร้อมรับงาน', page: 'profile', hint: 'เปิดสถานะพร้อมรับงานเพื่อให้ผู้ว่าจ้างค้นพบคุณ' }
          : { label: 'ค้นหางานดูแล', page: 'jobs', hint: 'โปรไฟล์พร้อมแล้ว เลือกประกาศที่เหมาะกับทักษะของคุณ' }
  return (
    <section className="care-home" aria-labelledby="care-home-title">
      <header className="care-home-heading">
        <div>
          <h1 id="care-home-title">สวัสดี คุณ{profile.first_name}</h1>
          <p>ดูแลโปรไฟล์ให้พร้อม สำหรับโอกาสดูแลครั้งต่อไป</p>
        </div>
        <button type="button" className="care-outline" onClick={openProfile}>
          ดูโปรไฟล์ของฉัน ↗
        </button>
      </header>
      <div className="care-welcome">
        <div>
          <h2>
            ให้ทักษะของคุณ
            <br />
            ได้พบกับคนที่ต้องการการดูแล
          </h2>
          <p>{loading ? 'กำลังตรวจความพร้อมของโปรไฟล์...' : nextAction.hint}</p>
          <button type="button" disabled={loading || error} onClick={() => onNavigate(nextAction.page)}>
            {nextAction.label} <span aria-hidden="true">→</span>
          </button>
        </div>
        <img className="care-art" src={profileIllustration} alt="" />
      </div>
      {loading && <p role="status">กำลังโหลดภาพรวมของคุณ...</p>}
      {!loading && error && (
        <div className="care-panel" role="alert">
          <p>โหลดภาพรวมไม่สำเร็จ</p>
          <button
            className="care-outline"
            type="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="care-summary" aria-label="ภาพรวมโปรไฟล์">
            <article className="care-stat">
              <span>สถานะรับงาน</span>
              <strong>
                <i className={available ? 'care-dot ready' : 'care-dot'} />
                {available ? 'พร้อมรับงาน' : 'ยังไม่พร้อมรับงาน'}
              </strong>
              <small>ปรับสถานะได้ในหน้าโปรไฟล์</small>
            </article>
            <article className="care-stat">
              <span>การยืนยันตัวตน</span>
              <strong>
                {verificationLabels[
                  info?.verification_status ?? 'not_submitted'
                ] ?? 'ไม่ทราบสถานะ'}
              </strong>
              <small>
                {verified
                  ? 'ผ่านการตรวจสอบแล้ว'
                  : 'ยืนยันเพื่อให้ผู้ว่าจ้างค้นพบคุณ'}
              </small>
            </article>
            <article className="care-stat">
              <span>ทักษะในโปรไฟล์</span>
              <strong>{skills.length} ทักษะ</strong>
              <small>ใช้ประกอบการจับคู่กับประกาศงาน</small>
            </article>
          </div>
          <div className="care-columns">
            <section className="care-panel">
              <div className="care-panel-heading">
                <h2>เตรียมตัวให้พร้อมรับโอกาส</h2>
                <span>
                  {steps.filter((step) => step.done).length}/3 ขั้นตอน
                </span>
              </div>
              <ol className="care-checklist">
                {steps.map((step, index) => (
                  <li key={step.title}>
                    <span
                      className={step.done ? 'care-step complete' : 'care-step'}
                      aria-label={step.done ? 'เสร็จแล้ว' : 'ยังไม่เสร็จ'}
                    >
                      {step.done ? '✓' : index + 1}
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {!verified && (
                <button
                  type="button"
                  className="care-outline"
                  onClick={() => onNavigate('documents')}
                >
                  ส่งเอกสารยืนยันตัวตน
                </button>
              )}
            </section>
            <section className="care-panel">
              <div className="care-panel-heading">
                <h2>ทักษะของคุณ</h2>
                <button
                  className="care-text"
                  type="button"
                  onClick={openProfile}
                >
                  แก้ไข
                </button>
              </div>
              <p className="care-muted">
                สิ่งที่คุณถนัด ช่วยให้เราเชื่อมคุณกับงานที่เหมาะสม
              </p>
              {skills.length ? (
                <ul className="care-tags">
                  {skills.map((skill) => (
                    <li key={skill.skill_id}>
                      {skill.skills?.name ?? 'ทักษะการดูแล'}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="care-empty">
                  <strong>คุณถนัดดูแลด้านไหนบ้าง?</strong>
                  <p>เพิ่มทักษะแรกเพื่อเริ่มเตรียมโปรไฟล์ของคุณ</p>
                  <button
                    type="button"
                    className="care-outline"
                    onClick={openProfile}
                  >
                    + เพิ่มทักษะการดูแล
                  </button>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export default CaregiverDashboard
