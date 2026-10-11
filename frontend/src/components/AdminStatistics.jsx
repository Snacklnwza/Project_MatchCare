import useRemoteList from '../hooks/useRemoteList'
import { callWorkflow } from '../lib/workflow'
import { formatJobDate, jobStatusLabels } from '../lib/jobs'
import '../styles/AdminStatistics.css'

async function loadStatistics() {
  return [await callWorkflow('get_admin_statistics')]
}

export default function AdminStatistics({ onNavigate }) {
  const { data, loading, error, reload } = useRemoteList(loadStatistics)
  const stats = data[0]
  return (
    <section aria-labelledby="statistics-title">
      <div className="statistics-heading">
        <h2 id="statistics-title">ภาพรวมระบบ</h2>
        <button
          type="button"
          className="secondary-button"
          disabled={loading}
          onClick={reload}
        >
          อัปเดตข้อมูล
        </button>
      </div>
      {loading && <p role="status">กำลังโหลดสถิติ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            ลองอีกครั้ง
          </button>
        </div>
      )}
      {stats && (
        <>
          <div className="admin-review-prompt">
            <div>
              <strong>เอกสารรอตรวจ {stats.pending_verifications} คน</strong>
              <p>ตรวจเอกสารก่อนเปิดให้ผู้ว่าจ้างค้นพบผู้ดูแล</p>
            </div>
            <button type="button" onClick={() => onNavigate('verifications')}>
              ไปตรวจเอกสาร →
            </button>
          </div>
          <div className="statistics-grid">
            <Stat
              title="ผู้ใช้ทั้งหมด"
              value={stats.total_users}
              hint={`ผู้ว่าจ้าง ${stats.employers} · ผู้ดูแล ${stats.caregivers} · แอดมิน ${stats.admins}`}
            />
            <Stat
              title="ผู้ดูแลที่ยืนยันแล้ว"
              value={stats.verified_caregivers}
              hint={`รอตรวจสอบ ${stats.pending_verifications} คน`}
            />
            <Stat
              title="ประกาศที่เผยแพร่"
              value={stats.published_jobs}
              hint={`เปิดรับอยู่ ${stats.open_jobs} งาน`}
            />
            <Stat
              title="งานที่จบแล้ว"
              value={stats.completed_jobs}
              hint="ผู้ว่าจ้างยืนยันจบงานแล้ว"
            />
          </div>
          <article className="workflow-card statistics-statuses">
            <h3>ประกาศแยกตามสถานะ</h3>
            <dl>
              {Object.entries(jobStatusLabels).map(([status, label]) => (
                <div key={status}>
                  <dt>{label}</dt>
                  <dd>{stats.jobs_by_status?.[status] ?? 0} งาน</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="workflow-card statistics-rate">
            <div>
              <h3>อัตราการจับคู่</h3>
              <p>
                จับคู่แล้ว {stats.matched_jobs} จาก {stats.published_jobs}{' '}
                ประกาศที่เผยแพร่
              </p>
            </div>
            <strong>{stats.match_rate}%</strong>
            <progress
              max="100"
              value={stats.match_rate}
              aria-label="อัตราการจับคู่"
            />
            <p className="workflow-hint">
              นับประกาศที่มีผู้ดูแลตอบรับ รวมงานที่กำลังทำและจบแล้ว
              เทียบกับประกาศที่เคยเผยแพร่ทั้งหมด
            </p>
          </article>
          <p className="workflow-hint">
            ช่วงข้อมูล: ทั้งหมดตั้งแต่เริ่มระบบ · อัปเดตล่าสุด{' '}
            {formatJobDate(stats.updated_at)}
          </p>
        </>
      )}
    </section>
  )
}

function Stat({ title, value, hint }) {
  return (
    <article className="workflow-card statistics-card">
      <h3>{title}</h3>
      <strong>{Number(value).toLocaleString('th-TH')}</strong>
      <p>{hint}</p>
    </article>
  )
}
