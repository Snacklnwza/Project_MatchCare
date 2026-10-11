import { useCallback, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import {
  activeJob,
  jobsOnDate,
  loadMySchedule,
  scheduleDate,
} from '../lib/schedule'
import { formatJobDate, jobStatusLabels } from '../lib/jobs'
import '../styles/CaregiverSchedule.css'

const weekdays = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.']
const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
const labelDate = (date) =>
  new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'long',
  }).format(new Date(`${date}T12:00:00+07:00`))

export default function CaregiverSchedule({ onNavigate }) {
  const [selected, setSelected] = useState(today)
  const [month, setMonth] = useState(() => today().slice(0, 7) + '-01')
  const [view, setView] = useState('month')
  const loader = useCallback(() => loadMySchedule(month), [month])
  const { data: loadedJobs, loading, error, reload } = useRemoteList(loader)
  const jobs = loadedJobs.filter(activeJob)
  const [year, monthNumber] = month.split('-').map(Number)
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const leading = (new Date(`${month}T12:00:00+07:00`).getUTCDay() + 6) % 7
  const monthLabel = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}T12:00:00+07:00`))
  const visible = view === 'month' ? jobsOnDate(jobs, selected) : jobs
  function changeMonth(offset) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
    const date = scheduleDate(next.getUTCFullYear(), next.getUTCMonth())
    setMonth(date)
    setSelected(date)
  }
  return (
    <section className="workflow-page schedule-page">
      <header>
        <h1>ปฏิทินงานของฉัน</h1>
        <p>ดูงานที่ตอบรับแล้วและวางแผนรับงานช่วงถัดไป · เวลาไทย</p>
      </header>
      <div className="schedule-toolbar">
        <div className="schedule-month-nav">
          <button
            type="button"
            className="secondary-button"
            aria-label="เดือนก่อนหน้า"
            onClick={() => changeMonth(-1)}
          >
            ‹
          </button>
          <h2 aria-live="polite">{monthLabel}</h2>
          <button
            type="button"
            className="secondary-button"
            aria-label="เดือนถัดไป"
            onClick={() => changeMonth(1)}
          >
            ›
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              const date = today()
              setMonth(date.slice(0, 7) + '-01')
              setSelected(date)
            }}
          >
            วันนี้
          </button>
        </div>
        <div className="schedule-view" aria-label="มุมมองตาราง">
          <button
            type="button"
            aria-pressed={view === 'month'}
            onClick={() => setView('month')}
          >
            ปฏิทิน
          </button>
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            รายการงาน
          </button>
        </div>
      </div>
      <p className="workflow-hint">
        คำเชิญและใบสมัครที่รอคำตอบยังไม่จองเวลา
        ระบบจะตรวจเวลาซ้ำเมื่อมีการตอบรับงาน
      </p>
      {loading ? (
        <p role="status">กำลังโหลดตารางงาน...</p>
      ) : error ? (
        <div role="alert">
          <p>โหลดตารางงานไม่สำเร็จ กรุณาลองใหม่</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      ) : (
        <>
          {view === 'month' && (
            <div
              className="schedule-calendar"
              aria-label={`ปฏิทิน ${monthLabel}`}
            >
              {weekdays.map((day) => (
                <div className="schedule-weekday" key={day}>
                  {day}
                </div>
              ))}
              {Array.from({ length: leading }, (_, index) => (
                <div
                  className="schedule-blank"
                  key={`blank-${index}`}
                  aria-hidden="true"
                />
              ))}
              {Array.from({ length: days }, (_, index) => {
                const date = scheduleDate(year, monthNumber - 1, index + 1)
                const daily = jobsOnDate(jobs, date)
                const busy = daily.filter(activeJob).length
                return (
                  <button
                    type="button"
                    className={`schedule-day${busy ? ' is-busy' : ''}${date === today() ? ' is-today' : ''}`}
                    key={date}
                    aria-pressed={selected === date}
                    aria-label={`${labelDate(date)} · ${busy ? `มีงานที่รับแล้ว ${busy} งาน` : 'ไม่มีงานที่รับแล้วค้างอยู่'}${daily.length ? ` · รวม ${daily.length} งาน` : ''}`}
                    onClick={() => setSelected(date)}
                  >
                    <strong>{index + 1}</strong>
                    {daily.slice(0, 2).map((job) => (
                      <span
                        className="schedule-event is-active"
                        key={job.job_post_id}
                      >
                        {job.title}
                      </span>
                    ))}
                    {daily.length > 2 && (
                      <small>อีก {daily.length - 2} งาน</small>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          <div className="schedule-legend">
            <span>● งานที่รับแล้ว / กำลังดูแล / รอยืนยันจบ</span>
          </div>
          <section
            className="schedule-detail"
            aria-labelledby="schedule-detail-title"
          >
            <h2 id="schedule-detail-title">
              {view === 'month'
                ? labelDate(selected)
                : `งานทั้งหมดใน${monthLabel}`}
            </h2>
            {!visible.length ? (
              <p>
                ไม่มีงานที่ตอบรับใน{view === 'month' ? 'วันนี้' : 'เดือนนี้'}
              </p>
            ) : (
              <div className="workflow-stack">
                {visible.map((job) => (
                  <article className="workflow-card" key={job.job_post_id}>
                    <div className="schedule-job-heading">
                      <h3>{job.title}</h3>
                      <span
                        className="workflow-badge"
                        data-status={job.job_status}
                      >
                        {jobStatusLabels[job.job_status] || job.job_status}
                      </span>
                    </div>
                    <p>
                      {formatJobDate(job.starts_at)} –{' '}
                      {formatJobDate(job.ends_at)}
                    </p>
                    <p>
                      อ.{job.district} จ.{job.province}
                    </p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        onNavigate(
                          job.request_type === 'application'
                            ? 'applications'
                            : 'invitations',
                          {
                            source_type: 'job',
                            source_id: job.job_post_id,
                            origin: 'schedule',
                          },
                        )
                      }
                    >
                      เปิดรายละเอียดงาน
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}
