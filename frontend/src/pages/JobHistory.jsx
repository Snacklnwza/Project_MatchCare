import { useCallback, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'
import { historyFilters, historyPageSize, loadHistoryDetails, loadJobHistory } from '../lib/history'
import '../styles/JobHistory.css'

function HistoryDetails({ jobId }) {
  const loader = useCallback(() => loadHistoryDetails(jobId), [jobId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const detail = data[0]
  if (loading) return <p role="status">กำลังโหลดรายละเอียด...</p>
  if (error) return <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองอีกครั้ง</button></div>
  if (!detail) return <p role="status">ไม่พบรายละเอียดของงานนี้</p>
  return (
    <div className="history-details">
      <h3>รายละเอียดการดูแล</h3>
      <p className="history-text">{detail.description}</p>
      <p className="history-text"><strong>การดูแลที่ต้องการ:</strong> {detail.care_summary}</p>
      <p><strong>ทักษะ:</strong> {detail.required_skills?.join(' · ') || 'ไม่ได้ระบุ'}</p>
      <dl className="history-facts">
        {detail.started_at && <div><dt>เริ่มปฏิบัติงาน</dt><dd>{formatJobDate(detail.started_at)}</dd></div>}
        {detail.completion_requested_at && <div><dt>แจ้งจบงาน</dt><dd>{formatJobDate(detail.completion_requested_at)}</dd></div>}
        {detail.completed_at && <div><dt>ยืนยันจบงาน</dt><dd>{formatJobDate(detail.completed_at)}</dd></div>}
        {detail.cancelled_at && <div><dt>ยกเลิกเมื่อ</dt><dd>{formatJobDate(detail.cancelled_at)}</dd></div>}
      </dl>
      {detail.cancellation_reason && <p>เหตุผลที่ยกเลิก: {detail.cancellation_reason}</p>}
    </div>
  )
}

export default function JobHistory({ profile }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState(null)
  const loader = useCallback(() => loadJobHistory(filter, page), [filter, page])
  const { data, loading, error, reload } = useRemoteList(loader)
  const rows = data.slice(0, historyPageSize)
  const hasNext = data.length > historyPageSize
  const employer = profile.role === 'employer'

  function changePage(nextPage) {
    setExpandedId(null)
    setPage(nextPage)
  }

  return (
    <section className="workflow-page" aria-labelledby="history-title">
      <header>
        <h1 id="history-title">{employer ? 'ประวัติการจ้างงาน' : 'ประวัติการรับงาน'}</h1>
        <p>รวมงานที่จับคู่แล้วจากใบสมัครและคำเชิญ ดูสถานะและรายละเอียดย้อนหลังได้ที่นี่</p>
      </header>
      <div className="history-filter">
        <label htmlFor="history-status">สถานะงาน</label>
        <select id="history-status" value={filter} onChange={(event) => {
          setFilter(event.target.value)
          changePage(0)
        }}>
          {Object.entries(historyFilters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" className="secondary-button" onClick={reload} disabled={loading}>โหลดใหม่</button>
      </div>
      {loading && <p role="status">กำลังโหลดประวัติงาน...</p>}
      {error && <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองอีกครั้ง</button></div>}
      {!loading && !error && rows.length === 0 && (
        <div className="workflow-card workflow-empty">
          <h2>{filter === 'all' && page === 0 ? 'ยังไม่มีประวัติงาน' : 'ไม่พบงานในรายการนี้'}</h2>
          <p>งานจะปรากฏหลังจากทั้งสองฝ่ายตกลงจับคู่สำเร็จ</p>
        </div>
      )}
      {!loading && !error && (
        <div className="workflow-stack">
          {rows.map((job) => (
            <article className="workflow-card" key={job.job_post_id}>
              <div className="workflow-heading">
                <h2>{job.title}</h2>
                <span className="workflow-badge" data-status={job.job_status}>{jobStatusLabels[job.job_status]}</span>
              </div>
              <p>{employer ? 'ผู้ดูแล' : 'ผู้ว่าจ้าง'}: {job.counterpart_name}</p>
              <dl className="history-facts">
                <div><dt>พื้นที่</dt><dd>อ.{job.district} จ.{job.province}</dd></div>
                <div><dt>ช่วงเวลางาน</dt><dd>{formatJobDate(job.starts_at)} – {formatJobDate(job.ends_at)}</dd></div>
                <div><dt>ค่าตอบแทน</dt><dd>{Number(job.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[job.pay_unit]}</dd></div>
              </dl>
              <button type="button" className="secondary-button" aria-expanded={expandedId === job.job_post_id}
                aria-controls={`history-detail-${job.job_post_id}`}
                onClick={() => setExpandedId(expandedId === job.job_post_id ? null : job.job_post_id)}>
                {expandedId === job.job_post_id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดงาน'}
              </button>
              {expandedId === job.job_post_id && <div id={`history-detail-${job.job_post_id}`}><HistoryDetails jobId={job.job_post_id} /></div>}
            </article>
          ))}
        </div>
      )}
      {!error && (page > 0 || hasNext) && (
        <nav className="workflow-actions" aria-label="หน้าประวัติงาน">
          <button type="button" className="secondary-button" disabled={loading || page === 0} onClick={() => changePage(page - 1)}>ก่อนหน้า</button>
          <span>หน้า {page + 1}</span>
          <button type="button" className="secondary-button" disabled={loading || !hasNext} onClick={() => changePage(page + 1)}>ถัดไป</button>
        </nav>
      )}
    </section>
  )
}
