import { useEffect, useState } from 'react'
import addIcon from '../assets/dashboard/add.svg'
import careIcon from '../assets/dashboard/care.svg'
import emptyJobsIcon from '../assets/dashboard/empty-jobs.svg'
import locationIcon from '../assets/dashboard/location.svg'
import patientIcon from '../assets/dashboard/patient.svg'
import { supabase } from '../lib/supabase'
import { formatJobDate, payUnitLabels } from '../lib/jobs'

const mobilityLabels = {
  bedridden: 'ผู้ป่วยติดเตียง',
  wheelchair: 'ใช้รถเข็น',
  walker: 'ใช้เครื่องช่วยเดิน',
  cane: 'ใช้ไม้เท้า',
}

function EmployerDashboard({ onNavigate }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadJobs() {
      try {
        const { data, error: queryError } = await supabase
          .from('job_posts')
          .select(
            'id, title, starts_at, pay_amount, pay_unit, province, district',
          )
          .eq('status', 'open')
          .order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (!cancelled) setJobs(data ?? [])
      } catch {
        if (!cancelled)
          setJobsError(
            'ไม่สามารถโหลดประกาศงานได้ กรุณาเปิดหน้าประกาศงานเพื่อลองใหม่',
          )
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }
    loadJobs()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    async function loadPatients() {
      const { data, error: queryError } = await supabase
        .from('patients')
        .select(
          'id, first_name, last_name, mobility_status, district, province',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (queryError) {
        setError('ไม่สามารถโหลดข้อมูลผู้ป่วยได้')
      } else {
        setPatients(data ?? [])
      }

      setLoading(false)
    }

    loadPatients()
  }, [])

  return (
    <section className="employer-dashboard" aria-label="ภาพรวมผู้ว่าจ้าง">
      <aside className="dashboard-patients">
        <div className="dashboard-section-heading">
          <h2>รายชื่อผู้ป่วยในการดูแล</h2>
        </div>

        {loading && (
          <p className="dashboard-state">กำลังโหลดข้อมูลผู้ป่วย...</p>
        )}
        {error && (
          <p className="dashboard-state" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="dashboard-state dashboard-empty-patients">
            <p>ยังไม่มีข้อมูลผู้ป่วยในการดูแล</p>
            <button type="button" onClick={() => onNavigate('patients')}>
              เพิ่มผู้ป่วย
            </button>
          </div>
        )}

        <div className="dashboard-patient-list">
          {patients.map((patient) => (
            <article className="dashboard-patient-card" key={patient.id}>
              <div className="dashboard-patient-header">
                <span className="dashboard-patient-avatar">
                  <img src={patientIcon} alt="" />
                </span>
                <div>
                  <h3>
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p>ผู้ป่วยในการดูแล</p>
                </div>
              </div>
              <p className="dashboard-patient-detail">
                <img src={careIcon} alt="" />
                {mobilityLabels[patient.mobility_status] ??
                  patient.mobility_status}
              </p>
              <p className="dashboard-patient-detail">
                <img src={locationIcon} alt="" />
                อ.{patient.district} จ.{patient.province}
              </p>
            </article>
          ))}
        </div>
      </aside>

      <section className="dashboard-jobs">
        <h2>ประกาศงานที่เปิดรับ</h2>
        {jobsLoading ? (
          <p role="status">กำลังโหลดประกาศงาน...</p>
        ) : jobsError ? (
          <p role="alert">{jobsError}</p>
        ) : jobs.length > 0 ? (
          <div className="job-list">
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>
                  อ.{job.district} จ.{job.province}
                </p>
                <p>เริ่มงาน {formatJobDate(job.starts_at)}</p>
                <p>
                  {Number(job.pay_amount).toLocaleString('th-TH')} บาท{' '}
                  {payUnitLabels[job.pay_unit]}
                </p>
                <button type="button" onClick={() => onNavigate('jobs')}>
                  จัดการประกาศ
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-jobs">
            <span className="dashboard-empty-icon">
              <img src={emptyJobsIcon} alt="" />
            </span>
            <p className="dashboard-empty-title">
              คุณยังไม่มีประกาศงานที่เปิดรับในขณะนี้
            </p>
            <p className="dashboard-empty-description">
              เริ่มสร้างประกาศงานแรกของคุณเพื่อค้นหาผู้ดูแลที่เหมาะสม
              <br />
              สำหรับคนที่คุณรัก
            </p>
            <button type="button" onClick={() => onNavigate('jobs')}>
              <img src={addIcon} alt="" />
              ไปที่หน้าประกาศงาน
            </button>
          </div>
        )}
      </section>
    </section>
  )
}

export default EmployerDashboard
