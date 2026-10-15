import { jobStatusLabels } from '../lib/jobs'
import useRevealItem from '../hooks/useRevealItem'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import JobForm from './JobForm'
import CaregiverMatches from './CaregiverMatches'
import EmployerJobCard from './EmployerJobCard'
import '../styles/EmployerJobs.css'

const currentStatuses = [
  'draft',
  'open',
  'matched',
  'in_progress',
  'completion_pending',
]
function matchesJobFilter(job, filter) {
  return (
    filter === 'all' ||
    (filter === 'current'
      ? currentStatuses.includes(job.status)
      : job.status === filter)
  )
}
const filters = { current: 'งานปัจจุบัน', all: 'ทั้งหมด', ...jobStatusLabels }

function JobManager({ onNavigate }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const targetId = useRevealItem(jobs, 'job', 'id')
  const [filter, setFilter] = useState('current')
  const [closingId, setClosingId] = useState(null)
  const closingRef = useRef(false)
  const [matchingJob, setMatchingJob] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      setLoading(true)
      setError('')
      try {
        const { data, error: queryError } = await supabase
          .from('job_posts')
          .select(
            'id, patient_id, title, description, care_summary, starts_at, ends_at, pay_amount, pay_unit, status, province, district, subdistrict, address_detail, patients(first_name, last_name, mobility_status, affected_area, affected_side, transfer_assistance, chronic_conditions, care_notes, patient_conditions(conditions(name))), job_required_skills(skill_id, skills(name))',
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

  async function startJob(job) {
    if (
      closingRef.current ||
      !window.confirm(`เริ่มงานดูแลผู้ป่วยตามประกาศ “${job.title}” ใช่หรือไม่?`)
    )
      return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: startError } = await supabase.rpc(
        'start_matched_job',
        {
          p_job_id: job.id,
        },
      )
      if (startError) throw startError
      if (!data) throw new Error('ไม่พบประกาศที่พร้อมเริ่มงาน')
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: 'in_progress',
                started_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setSuccessMessage('เริ่มงานแล้ว')
    } catch {
      setError('เริ่มงานไม่สำเร็จ สถานะอาจเปลี่ยนแล้ว กรุณาโหลดรายการใหม่')
    } finally {
      closingRef.current = false
      setClosingId(null)
    }
  }

  async function confirmCompletion(job) {
    if (
      closingRef.current ||
      !window.confirm(
        `ผู้ดูแลแจ้งว่างาน “${job.title}” เสร็จแล้ว ยืนยันจบงานใช่หรือไม่?`,
      )
    )
      return
    closingRef.current = true
    setClosingId(job.id)
    setError('')
    setSuccessMessage('')
    try {
      const { data, error: confirmError } = await supabase.rpc(
        'confirm_job_completion',
        {
          p_job_id: job.id,
        },
      )
      if (confirmError) throw confirmError
      if (!data) throw new Error('ไม่พบคำขอจบงานที่รอยืนยัน')
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: 'completed',
                completed_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setSuccessMessage('ยืนยันจบงานแล้ว')
    } catch {
      setError('ยืนยันจบงานไม่สำเร็จ สถานะอาจเปลี่ยนแล้ว กรุณาโหลดรายการใหม่')
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

  if (matchingJob)
    return (
      <CaregiverMatches
        job={matchingJob}
        onNavigate={onNavigate}
        onBack={() => {
          setMatchingJob(null)
          setRefreshKey((value) => value + 1)
        }}
      />
    )

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
    (job) =>
      String(job.id) === String(targetId) || matchesJobFilter(job, filter),
  )
  return (
    <section className="job-manager" aria-labelledby="jobs-heading">
      <header className="job-heading page-intro">
        <div>
          <h1 id="jobs-heading">ประกาศงานของฉัน</h1>
          <p>จัดการประกาศและความต้องการดูแลของคุณ</p>
        </div>
        <button
          type="button"
          disabled={closingId !== null}
          onClick={() => openForm()}
        >
          + สร้างประกาศ
        </button>
      </header>
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
          {Object.entries(filters).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
              {!loading && !error
                ? ` (${jobs.filter((job) => matchesJobFilter(job, value)).length})`
                : ''}
            </option>
          ))}
        </select>
      </label>
      {loading ? (
        <p role="status">กำลังโหลดประกาศงาน...</p>
      ) : !error && visibleJobs.length === 0 ? (
        <div className="job-empty">
          <h3>
            {jobs.length === 0 ? 'ยังไม่มีประกาศงาน' : 'ไม่พบประกาศในสถานะนี้'}
          </h3>
          <p>
            {jobs.length === 0
              ? 'เริ่มสร้างประกาศโดยเลือกผู้ป่วยและทักษะที่ต้องการ'
              : 'ลองเลือกสถานะอื่นหรือแสดงประกาศทั้งหมด'}
          </p>
          {jobs.length > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => setFilter('all')}
            >
              แสดงทั้งหมด
            </button>
          )}
        </div>
      ) : (
        <div className="job-list">
          {visibleJobs.map((job) => (
            <EmployerJobCard
              key={job.id}
              job={job}
              highlighted={String(targetId) === String(job.id)}
              busy={closingId !== null}
              processing={closingId === job.id}
              onMatch={setMatchingJob}
              onEdit={openForm}
              onClose={closeJob}
              onStart={startJob}
              onComplete={confirmCompletion}
              onHistory={() => onNavigate('history')}
            />
          ))}
        </div>
      )}
    </section>
  )
}
export default JobManager
