import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import JobForm from './JobForm'

function JobManager() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filter, setFilter] = useState('all')
  const [closingId, setClosingId] = useState(null)
  const closingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      setLoading(true)
      setError('')
      try {
        const { data, error: queryError } = await supabase
          .from('job_posts')
          .select(
            'id, patient_id, title, description, care_summary, starts_at, ends_at, pay_amount, pay_unit, status, province, district, subdistrict, address_detail, job_required_skills(skill_id, skills(name))',
          )
          .order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (!cancelled) setJobs(data ?? [])
      } catch {
        if (!cancelled) setError('ไม่สามารถโหลดประกาศงานได้ กรุณาลองใหม่')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadJobs()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  async function closeJob(job) {
    if (
      closingRef.current ||
      !window.confirm(
        `ปิดรับสมัครประกาศ “${job.title}” ใช่หรือไม่? หลังปิดจะไม่แสดงในงานที่เปิดรับและแก้ไขไม่ได้`,
      )
    )
      return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: closeError } = await supabase.rpc('close_job', {
        p_job_id: job.id,
      })
      if (closeError) throw closeError
      if (!data) throw new Error('ไม่พบประกาศที่ปิดได้')
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status: 'closed' } : item,
        ),
      )
      setSuccessMessage('ปิดประกาศสำเร็จ')
    } catch (closeError) {
      setError(`ปิดประกาศไม่สำเร็จ: ${closeError.message ?? 'กรุณาลองใหม่'}`)
    } finally {
      closingRef.current = false
      setClosingId(null)
    }
  }

  function openForm(job = null) {
    setEditingJob(job)
    setSuccessMessage('')
    setError('')
    setShowForm(true)
  }

  if (showForm)
    return (
      <JobForm
        key={editingJob?.id ?? 'new'}
        job={editingJob}
        onCancel={() => setShowForm(false)}
        onSaved={() => {
          setShowForm(false)
          setSuccessMessage(
            editingJob ? 'แก้ไขประกาศสำเร็จ' : 'สร้างประกาศสำเร็จ',
          )
          setRefreshKey((current) => current + 1)
        }}
      />
    )

  const visibleJobs = jobs.filter(
    (job) => filter === 'all' || job.status === filter,
  )
  return (
    <section className="job-manager" aria-labelledby="jobs-heading">
      <div className="job-heading">
        <div>
          <h2 id="jobs-heading">ประกาศงานของฉัน</h2>
          <p>จัดการประกาศและความต้องการดูแลของคุณ</p>
        </div>
        <button
          type="button"
          disabled={closingId !== null}
          onClick={() => openForm()}
        >
          + สร้างประกาศ
        </button>
      </div>
      {successMessage && (
        <p className="success-notice" role="status">
          {successMessage}
        </p>
      )}
      {error && (
        <div className="form-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
            โหลดรายการใหม่
          </button>
        </div>
      )}
      <label className="job-filter">
        แสดงประกาศ
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="open">เปิดรับสมัคร</option>
          <option value="closed">ปิดรับสมัคร</option>
        </select>
      </label>
      {loading ? (
        <p role="status">กำลังโหลดประกาศงาน...</p>
      ) : !error && visibleJobs.length === 0 ? (
        <div className="job-empty">
          <h3>ยังไม่มีประกาศในรายการนี้</h3>
          <p>เริ่มสร้างประกาศโดยเลือกผู้ป่วยและทักษะที่ต้องการ</p>
        </div>
      ) : (
        <div className="job-list">
          {visibleJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-heading">
                <h3>{job.title}</h3>
                <span className={`job-status job-status-${job.status}`}>
                  {jobStatusLabels[job.status] ?? job.status}
                </span>
              </div>
              <p className="job-description">{job.description}</p>
              <p>
                <strong>การดูแล:</strong> {job.care_summary}
              </p>
              <p>
                <strong>สถานที่:</strong> {job.subdistrict} อ.{job.district} จ.
                {job.province}
              </p>
              <p>
                <strong>วันเวลา:</strong> {formatJobDate(job.starts_at)} –{' '}
                {formatJobDate(job.ends_at)}
              </p>
              <p>
                <strong>ค่าตอบแทน:</strong>{' '}
                {Number(job.pay_amount).toLocaleString('th-TH')} บาท{' '}
                {payUnitLabels[job.pay_unit]}
              </p>
              <div className="job-tags">
                {job.job_required_skills?.map((item) => (
                  <span key={item.skill_id}>
                    {item.skills?.name ?? 'ทักษะที่ปิดใช้งาน'}
                  </span>
                ))}
              </div>
              {['draft', 'open'].includes(job.status) && (
                <div className="job-actions">
                  <button
                    type="button"
                    disabled={closingId !== null}
                    onClick={() => openForm(job)}
                  >
                    แก้ไขประกาศ
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={closingId !== null}
                    onClick={() => closeJob(job)}
                  >
                    {closingId === job.id ? 'กำลังปิด...' : 'ปิดประกาศ'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
export default JobManager
