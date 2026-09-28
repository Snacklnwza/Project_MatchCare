import { useRef, useState } from 'react'
import DocumentList from '../components/DocumentList'
import { documentLabels, uploadDocument, workflowError } from '../lib/workflow'

export default function CaregiverDocuments({ profile }) {
  const [type, setType] = useState('identity')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [version, setVersion] = useState(0)
  const busy = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    setError('')
    setSuccess('')
    if (
      !file ||
      !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) ||
      file.size < 1 ||
      file.size > 5242880 ||
      file.name.length > 255
    ) {
      setError(
        'เลือกไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5 MB และชื่อไม่เกิน 255 ตัวอักษร',
      )
      return
    }
    busy.current = true
    setSaving(true)
    try {
      await uploadDocument(profile.id, file, type)
      setSuccess('ส่งเอกสารแล้ว แอดมินจะตรวจสอบข้อมูลของคุณ')
      setVersion((value) => value + 1)
      setFile(null)
      setType('identity')
      event.target.reset()
    } catch (issue) {
      setError(workflowError(issue))
    } finally {
      setSaving(false)
      busy.current = false
    }
  }
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">
          เตรียมพร้อมรับงาน · ขั้นตอนยืนยันตัวตน
        </p>
        <h1>เอกสารของฉัน</h1>
        <p>
          ส่งเอกสารยืนยันตัวตนก่อน
          เพื่อให้แอดมินตรวจสอบและเปิดการค้นพบโปรไฟล์ของคุณ
        </p>
      </header>
      <div className="workflow-columns">
        <form className="workflow-card" onSubmit={submit}>
          <h2>ส่งเอกสารตรวจสอบ</h2>
          <p>
            บันทึกโปรไฟล์ผู้ดูแลก่อนส่งเอกสาร
            ใช้ข้อมูลสมมติสำหรับการทดสอบโครงการ
          </p>
          <label htmlFor="document-type">ประเภทเอกสาร</label>
          <select
            id="document-type"
            value={type}
            disabled={saving}
            onChange={(event) => setType(event.target.value)}
          >
            {Object.entries(documentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="document-file">เลือกไฟล์</label>
          <input
            id="document-file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            disabled={saving}
            required
            onChange={(event) => setFile(event.target.files[0] ?? null)}
          />
          <p className="workflow-hint">
            JPG, PNG หรือ PDF · สูงสุด 5 MB ต่อไฟล์
            <br />
            เอกสารเปิดดูได้เฉพาะคุณและแอดมินที่ตรวจสอบ
          </p>
          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}
          <button type="submit" disabled={saving}>
            {saving ? 'กำลังส่งเอกสาร...' : 'ส่งให้แอดมินตรวจสอบ'}
          </button>
        </form>
        <section className="workflow-card">
          <h2>เอกสารที่ส่งแล้ว</h2>
          <DocumentList key={version} caregiverId={profile.id} />
        </section>
      </div>
    </section>
  )
}
