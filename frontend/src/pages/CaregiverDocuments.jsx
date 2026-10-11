import useUnsavedChanges from '../hooks/useUnsavedChanges'
import { useCallback, useEffect } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { supabase } from '../lib/supabase'
import FilePreview from '../components/FilePreview'
import { useRef, useState } from 'react'
import DocumentList from '../components/DocumentList'
import { documentLabels, uploadDocument, workflowError } from '../lib/workflow'

export default function CaregiverDocuments({ profile, onNavigate }) {
  const [type, setType] = useState('identity')
  const [file, setFile] = useState(null)
  useUnsavedChanges(Boolean(file))
  const [previewUrl, setPreviewUrl] = useState(null)
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [version, setVersion] = useState(0)
  const busy = useRef(false)
  const loader = useCallback(async () => {
    const { data, error } = await supabase
      .from('caregiver_profiles')
      .select('verification_status')
      .eq('caregiver_id', profile.id)
      .maybeSingle()
    if (error) throw error
    return data ? [data] : []
  }, [profile.id])
  const {
    data: statuses,
    loading: statusLoading,
    error: statusError,
    reload: reloadStatus,
  } = useRemoteList(loader)
  const verification = statuses[0]?.verification_status
  const profileMissing = !statusLoading && !statusError && !statuses.length
  const statusLabels = {
    verified: 'ยืนยันตัวตนแล้ว ไม่ต้องส่งเอกสารซ้ำ',
    pending: 'ส่งเอกสารแล้ว รอแอดมินตรวจสอบ',
    rejected: 'เอกสารยังไม่ผ่าน ดูเหตุผลในรายการแล้วส่งใหม่',
    not_submitted: 'ยังไม่ได้ส่งเอกสารยืนยันตัวตน',
  }
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
      reloadStatus()
      setFile(null)
      setPreviewUrl(null)
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
        <h1>เอกสารของฉัน</h1>
        <p>
          ส่งเอกสารยืนยันตัวตนก่อน
          เพื่อให้แอดมินตรวจสอบและเปิดการค้นพบโปรไฟล์ของคุณ
        </p>
      </header>
      {statusLoading && <p role="status">กำลังตรวจสถานะการยืนยัน...</p>}
      {statusError && (
        <div role="alert">
          <p>{statusError}</p>
          <button type="button" onClick={reloadStatus}>
            โหลดสถานะใหม่
          </button>
        </div>
      )}
      {verification && (
        <p className="document-status" role="status">
          {statusLabels[verification]}
        </p>
      )}
      <div className="workflow-columns">
        {profileMissing ? (
          <section className="workflow-card document-upload">
            <h2>บันทึกโปรไฟล์ก่อนส่งเอกสาร</h2>
            <p>
              บัญชีของคุณยังไม่มีโปรไฟล์การดูแล
              กรุณาแนะนำตัวและบันทึกโปรไฟล์ก่อน
              แล้วจึงกลับมาส่งเอกสารให้แอดมินตรวจสอบ
            </p>
            <button type="button" onClick={() => onNavigate('profile')}>
              ไปบันทึกโปรไฟล์
            </button>
          </section>
        ) : (
          <details
            className="workflow-card document-upload"
            open={verification !== 'verified'}
          >
            <summary>ส่งเอกสารตรวจสอบ</summary>
            <form onSubmit={submit}>
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
              <label htmlFor="document-file" className="document-file-label">
                {file ? 'เปลี่ยนไฟล์เอกสาร' : 'เลือกไฟล์เอกสาร'}
              </label>
              <input
                id="document-file"
                className="document-file-input"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                disabled={saving}
                required
                onChange={(event) => {
                  const selected = event.target.files[0] ?? null
                  setFile(selected)
                  setPreviewUrl(
                    selected &&
                      ['image/jpeg', 'image/png', 'application/pdf'].includes(
                        selected.type,
                      ) &&
                      selected.size <= 5242880
                      ? URL.createObjectURL(selected)
                      : null,
                  )
                }}
              />
              <FilePreview file={file} url={previewUrl} />
              <p className="workflow-hint">
                JPG, PNG หรือ PDF · สูงสุด 5 MB ต่อไฟล์
                <br />
                เอกสารเปิดดูได้เฉพาะคุณและแอดมินที่ตรวจสอบ
              </p>
              {error && <p role="alert">{error}</p>}
              {success && <p role="status">{success}</p>}
              <button
                type="submit"
                disabled={
                  saving ||
                  verification === 'verified' ||
                  statusLoading ||
                  !!statusError
                }
              >
                {saving ? 'กำลังส่งเอกสาร...' : 'ส่งให้แอดมินตรวจสอบ'}
              </button>
            </form>
          </details>
        )}
        <section className="workflow-card">
          <h2>เอกสารที่ส่งแล้ว</h2>
          <DocumentList key={version} caregiverId={profile.id} />
        </section>
      </div>
    </section>
  )
}
