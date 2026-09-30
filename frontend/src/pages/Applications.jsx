import useRemoteList from '../hooks/useRemoteList'
import { formatJobDate, payUnitLabels } from '../lib/jobs'
import { applicationLabels, loadMyApplications } from '../lib/workflow'

export default function Applications() {
  const { data, loading, error, reload } = useRemoteList(loadMyApplications)

  return (
    <main className="workflow-page">
      <header>
        <p className="workflow-eyebrow">สำหรับผู้ดูแล</p>
        <h1>งานที่สมัคร</h1>
        <p>ติดตามใบสมัครที่ส่งแล้ว ผู้ว่าจ้างจะเห็นใบสมัครเพื่อพิจารณา</p>
      </header>
      {loading && <p role="status">กำลังโหลดใบสมัคร...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>ลองอีกครั้ง</button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <section className="workflow-card">
          <h2>ยังไม่มีใบสมัคร</h2>
          <p>ไปที่หน้าค้นหางาน เลือกประกาศที่สนใจ แล้วกดสมัครงาน</p>
        </section>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="workflow-stack">
          {data.map((application) => (
            <article className="workflow-card" key={application.request_id}>
              <div className="workflow-heading">
                <h2>{application.title}</h2>
                <span className="workflow-badge">
                  {applicationLabels[application.status] ?? application.status}
                </span>
              </div>
              <p>อ.{application.district} จ.{application.province}</p>
              <p>เริ่ม {formatJobDate(application.starts_at)} – {formatJobDate(application.ends_at)}</p>
              <p>{Number(application.pay_amount).toLocaleString('th-TH')} บาท {payUnitLabels[application.pay_unit]}</p>
              <p className="workflow-hint">สมัครเมื่อ {formatJobDate(application.created_at)}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
