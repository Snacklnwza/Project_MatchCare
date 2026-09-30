import { useCallback, useRef, useState } from 'react'
import geography from '../data/geography-options.json'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate, payUnitLabels } from '../lib/jobs'
import {
  getOpenJobDetails,
  JOB_PAGE_SIZE,
  loadJobSkillOptions,
  searchOpenJobs,
} from '../lib/openJobs'
import { callWorkflow, loadMyApplications, workflowError } from '../lib/workflow'
import '../styles/JobSearch.css'

const provinces = Object.keys(geography).sort((a, b) => a.localeCompare(b, 'th'))
const emptyFilters = {
  province: '', district: '', workDate: '', skillId: '',
  payUnit: '', minimumPay: '', maximumPay: '',
}

function JobSearch() {
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [skillId, setSkillId] = useState('')
  const [payUnit, setPayUnit] = useState('')
  const [minimumPay, setMinimumPay] = useState('')
  const [maximumPay, setMaximumPay] = useState('')
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [filterError, setFilterError] = useState('')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [applyError, setApplyError] = useState('')
  const [applying, setApplying] = useState(false)
  const [submittedIds, setSubmittedIds] = useState(() => new Set())
  const detailRequest = useRef(0)
  const applyBusy = useRef(false)

  const loadJobs = useCallback(
    () => searchOpenJobs(appliedFilters, page),
    [appliedFilters, page],
  )
  const { data: jobs, loading, error, reload } = useRemoteList(loadJobs)
  const {
    data: skillOptions,
    loading: skillsLoading,
    error: skillsError,
    reload: reloadSkills,
  } = useRemoteList(loadJobSkillOptions)
  const { data: applications, reload: reloadApplications } = useRemoteList(loadMyApplications)
  const visibleJobs = jobs.slice(0, JOB_PAGE_SIZE)
  const districts = province ? Object.keys(geography[province] ?? {}) : []

  function clearDetail() {
    detailRequest.current += 1
    setSelectedId(null)
    setDetail(null)
    setDetailError('')
    setApplyError('')
    setDetailLoading(false)
  }

  function changeFilter(setter, value) {
    setter(value)
    setFilterError('')
  }

  function handleSearch(event) {
    event.preventDefault()
    if (minimumPay !== '' && maximumPay !== '' &&
      Number(minimumPay) > Number(maximumPay)) {
      setFilterError('ค่าตอบแทนสูงสุดต้องไม่น้อยกว่าค่าต่ำสุด')
      return
    }
    setFilterError('')
    setAppliedFilters({
      province, district, workDate, skillId, payUnit, minimumPay, maximumPay,
    })
    setPage(0)
    clearDetail()
  }

  function clearFilters() {
    setProvince('')
    setDistrict('')
    setWorkDate('')
    setSkillId('')
    setPayUnit('')
    setMinimumPay('')
    setMaximumPay('')
    setAppliedFilters(emptyFilters)
    setFilterError('')
    setPage(0)
    clearDetail()
  }

  async function openDetails(jobId) {
    if (selectedId === jobId) {
      clearDetail()
      return
    }
    const request = ++detailRequest.current
    setSelectedId(jobId)
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    try {
      const result = await getOpenJobDetails(jobId)
      if (request !== detailRequest.current) return
      if (!result) {
        setDetailError('ประกาศนี้ปิดรับแล้ว รายการกำลังโหลดใหม่')
        reload()
      } else {
        setDetail(result)
      }
    } catch {
      if (request === detailRequest.current) {
        setDetailError('เปิดรายละเอียดไม่สำเร็จ กรุณาลองอีกครั้ง')
      }
    } finally {
      if (request === detailRequest.current) setDetailLoading(false)
    }
  }

  async function apply(jobId) {
    if (applyBusy.current || !window.confirm('ยืนยันสมัครงานนี้?')) return
    applyBusy.current = true
    setApplying(true)
    setApplyError('')
    try {
      await callWorkflow('submit_application', { p_job_id: jobId })
      setSubmittedIds((current) => new Set(current).add(jobId))
      reloadApplications()
    } catch (issue) {
      setApplyError(issue?.message === 'caregiver_not_eligible'
        ? 'ต้องผ่านการยืนยันตัวตนและเปิดพร้อมรับงานก่อนสมัคร กรุณาไปที่โปรไฟล์ผู้ดูแลและเอกสารของฉัน'
        : workflowError(issue))
      if (issue?.message === 'job_not_open') {
        reload()
      }
    } finally {
      applyBusy.current = false
      setApplying(false)
    }
  }

  function changePage(nextPage) {
    clearDetail()
    setPage(nextPage)
  }

  return (
    <main className="job-search" aria-labelledby="job-search-title">
      <header className="job-search-heading">
        <div>
          <p className="job-search-eyebrow">สำหรับผู้ดูแล</p>
          <h1 id="job-search-title">ค้นหางานดูแล</h1>
          <p>ดูประกาศที่เปิดรับ แล้วเลือกงานที่ตรงกับทักษะและเวลาของคุณ</p>
        </div>
      </header>

      <section className="job-search-filters" aria-labelledby="job-filter-title">
        <div className="job-search-filter-heading">
          <h2 id="job-filter-title">ตัวกรอง</h2>
          <button type="button" className="job-search-text-button" onClick={clearFilters}>
            ล้างตัวกรอง
          </button>
        </div>
        <form onSubmit={handleSearch}>
        <div className="job-search-filter-grid">
          <label>
            จังหวัด
            <select
              value={province}
              onChange={(event) => {
                setDistrict('')
                changeFilter(setProvince, event.target.value)
              }}
            >
              <option value="">ทุกจังหวัด</option>
              {provinces.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            อำเภอ/เขต
            <select
              value={district}
              disabled={!province}
              onChange={(event) => changeFilter(setDistrict, event.target.value)}
            >
              <option value="">ทุกอำเภอ/เขต</option>
              {districts.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            วันที่ต้องการทำงาน
            <input
              type="date"
              value={workDate}
              onChange={(event) => changeFilter(setWorkDate, event.target.value)}
            />
          </label>
          <label>
            ทักษะที่ต้องการ
            <select
              value={skillId}
              disabled={skillsLoading || Boolean(skillsError)}
              onChange={(event) => changeFilter(setSkillId, event.target.value)}
            >
              <option value="">ทุกทักษะ</option>
              {skillOptions.map((skill) => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
          </label>
          <label>
            หน่วยค่าตอบแทน
            <select
              value={payUnit}
              onChange={(event) => {
                setMinimumPay('')
                setMaximumPay('')
                changeFilter(setPayUnit, event.target.value)
              }}
            >
              <option value="">ทุกหน่วย</option>
              {Object.entries(payUnitLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            ค่าตอบแทนขั้นต่ำ (บาท)
            <input
              type="number"
              min="0"
              step="0.01"
              value={minimumPay}
              disabled={!payUnit}
              onChange={(event) => {
                const value = event.target.value
                if (value === '' || Number(value) >= 0) {
                  changeFilter(setMinimumPay, value)
                }
              }}
            />
          </label>
          <label>
            ค่าตอบแทนสูงสุด (บาท)
            <input
              type="number"
              min="0"
              step="0.01"
              value={maximumPay}
              disabled={!payUnit}
              onChange={(event) => {
                const value = event.target.value
                if (value === '' || Number(value) >= 0) {
                  changeFilter(setMaximumPay, value)
                }
              }}
            />
          </label>
        </div>
        {filterError && <p role="alert">{filterError}</p>}
        <div className="job-search-search-actions">
          <button type="submit">ค้นหา</button>
        </div>
        </form>
        {skillsError && (
          <p role="alert">
            โหลดทักษะไม่สำเร็จ{' '}
            <button type="button" onClick={reloadSkills}>ลองอีกครั้ง</button>
          </p>
        )}
      </section>

      <section className="job-search-results" aria-labelledby="job-results-title">
        <div className="job-search-results-heading">
          <h2 id="job-results-title">ประกาศที่เปิดรับ</h2>
          {!loading && !error && <span>หน้า {page + 1}</span>}
        </div>
        {loading && <p role="status">กำลังโหลดประกาศงาน...</p>}
        {error && (
          <div className="job-search-message" role="alert">
            <p>{error}</p>
            <button type="button" onClick={reload}>ลองอีกครั้ง</button>
          </div>
        )}
        {!loading && !error && visibleJobs.length === 0 && (
          <div className="job-search-message">
            <p>{page === 0
              ? 'ไม่พบประกาศที่ตรงกับเงื่อนไข ลองเปลี่ยนตัวกรองแล้วกดค้นหาอีกครั้ง'
              : 'ไม่พบประกาศในหน้านี้ กรุณากลับหน้าก่อน'}</p>
          </div>
        )}
        {!loading && !error && visibleJobs.map((job) => (
          <article className="job-search-card" key={job.job_id}>
            <div className="job-search-card-main">
              <div>
                <span className="job-search-status">เปิดรับสมัคร</span>
                <h3>{job.title}</h3>
                <p>{job.care_summary}</p>
                <div className="job-search-meta">
                  <span>📍 {job.district} จ.{job.province}</span>
                  <span>🗓 เริ่ม {formatJobDate(job.starts_at)}</span>
                  <span>฿ {Number(job.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[job.pay_unit]}</span>
                </div>
                <div className="job-search-tags" aria-label="ทักษะที่ต้องการ">
                  {job.required_skills?.map((skill) => (
                    <span key={skill.id}>{skill.name}</span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                aria-expanded={selectedId === job.job_id}
                aria-controls={`job-detail-${job.job_id}`}
                onClick={() => openDetails(job.job_id)}
              >
                {selectedId === job.job_id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
              </button>
            </div>
            {selectedId === job.job_id && (
              <div className="job-search-detail" id={`job-detail-${job.job_id}`}>
                {detailLoading && <p role="status">กำลังโหลดรายละเอียด...</p>}
                {detailError && <p role="alert">{detailError}</p>}
                {detail && (
                  <>
                    <h4>รายละเอียดงาน</h4>
                    <p>{detail.description}</p>
                    <h4>การดูแลที่ต้องการ</h4>
                    <p>{detail.care_summary}</p>
                    <dl>
                      <div><dt>ช่วงเวลาทำงาน</dt><dd>{formatJobDate(detail.starts_at)} – {formatJobDate(detail.ends_at)}</dd></div>
                      <div><dt>สถานที่โดยประมาณ</dt><dd>{detail.district} จ.{detail.province}</dd></div>
                      <div><dt>ค่าตอบแทน</dt><dd>{Number(detail.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[detail.pay_unit]}</dd></div>
                    </dl>
                    <h4>ทักษะที่ต้องการ</h4>
                    <div className="job-search-tags">
                      {detail.required_skills?.map((skill) => (
                        <span key={skill.id}>{skill.name}</span>
                      ))}
                    </div>
                    {submittedIds.has(job.job_id) || applications.some((item) => item.job_post_id === job.job_id) ? (
                      <p role="status" className="job-search-hint">สมัครงานนี้แล้ว ดูสถานะได้ที่เมนูงานที่สมัคร</p>
                    ) : (
                      <button type="button" disabled={applying} onClick={() => apply(job.job_id)}>
                        {applying ? 'กำลังส่งใบสมัคร...' : 'สมัครงานนี้'}
                      </button>
                    )}
                    {applyError && <p role="alert">{applyError}</p>}
                  </>
                )}
              </div>
            )}
          </article>
        ))}
        {!loading && !error && (page > 0 || jobs.length > JOB_PAGE_SIZE) && (
          <div className="job-search-pagination">
            <button type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>
              ก่อนหน้า
            </button>
            <span>หน้า {page + 1}</span>
            <button
              type="button"
              disabled={jobs.length <= JOB_PAGE_SIZE}
              onClick={() => changePage(page + 1)}
            >
              ถัดไป
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default JobSearch
