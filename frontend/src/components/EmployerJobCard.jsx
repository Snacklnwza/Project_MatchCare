import { useState } from 'react'
import { formatJobDate, jobStatusLabels, payUnitLabels } from '../lib/jobs'

const nextStep = {
  draft: 'เติมรายละเอียดให้ครบ แล้วเผยแพร่ประกาศเพื่อเริ่มหาผู้ดูแล',
  open: 'เปิดรับอยู่ เลือกผู้ดูแลที่เหมาะกับงานหรือรอใบสมัคร',
  matched: 'จับคู่แล้ว พร้อมเริ่มงานเมื่อทั้งสองฝ่ายตกลงกัน',
  in_progress: 'กำลังดูแล รอผู้ดูแลแจ้งจบงาน',
  completion_pending: 'ผู้ดูแลแจ้งจบแล้ว ตรวจงานก่อนยืนยัน',
  completed: 'งานจบแล้ว ดูรายละเอียดและรีวิวได้ในประวัติงาน',
  closed: 'ปิดรับสมัครแล้ว',
  cancelled: 'งานนี้ถูกยกเลิกแล้ว',
}

export default function EmployerJobCard({ job, busy, processing, onMatch, onEdit, onClose, onStart, onComplete, onHistory }) {
  const [showAllSkills, setShowAllSkills] = useState(false)
  const skills = job.job_required_skills ?? []
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 3)
  return (
    <article className="job-card employer-job-card">
      <div className="job-heading">
        <div>
          <h2>{job.title}</h2>
          <p className="employer-job-patient">สำหรับ: {job.patients
            ? `${job.patients.first_name} ${job.patients.last_name}` : 'ไม่พบข้อมูลผู้ป่วย'}</p>
        </div>
        <span className={`job-status job-status-${job.status}`}>{jobStatusLabels[job.status] ?? job.status}</span>
      </div>
      <dl className="employer-job-info">
        <div><dt>สถานที่ดูแล</dt><dd>{job.subdistrict} อ.{job.district} จ.{job.province}</dd></div>
        <div className="employer-job-pay"><dt>ค่าตอบแทน</dt><dd><strong>{Number(job.pay_amount).toLocaleString('th-TH')} บาท</strong><span>{payUnitLabels[job.pay_unit]}</span></dd></div>
        <div><dt>ช่วงเวลางาน</dt><dd>{formatJobDate(job.starts_at)} - {formatJobDate(job.ends_at)}</dd></div>
      </dl>
      {skills.length > 0 && <div className="job-tags employer-job-tags" aria-label="ทักษะที่ต้องการ">
        {visibleSkills.map((item) => <span key={item.skill_id}>{item.skills?.name ?? 'ทักษะที่ปิดใช้งาน'}</span>)}
        {skills.length > 3 && <button type="button" className="employer-job-more-skills"
          aria-expanded={showAllSkills} onClick={() => setShowAllSkills((value) => !value)}>
          {showAllSkills ? 'แสดงน้อยลง' : `+${skills.length - 3} ทักษะ`}
        </button>}
      </div>}
      <details className="employer-job-description">
        <summary>รายละเอียดการดูแล</summary>
        <p><strong>การดูแลที่ต้องการ:</strong> {job.care_summary}</p>
        {job.description && <p className="job-description">{job.description}</p>}
      </details>
      <div className="employer-job-footer">
        <p className="employer-job-next-step" role={processing ? 'status' : undefined}>{processing ? 'กำลังดำเนินการ...' : nextStep[job.status]}</p>
        <div className="job-actions">
          {job.status === 'open' && <button type="button" disabled={busy} onClick={() => onMatch(job)}>หาผู้ดูแล</button>}
          {['draft', 'open'].includes(job.status) && <>
            <button type="button" className={job.status === 'open' ? 'secondary-button' : undefined}
              disabled={busy} onClick={() => onEdit(job)}>แก้ไขประกาศ</button>
            <details className="employer-job-options" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false
            }} onKeyDown={(event) => {
              if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus() }
            }}>
              <summary aria-label={`ตัวเลือกเพิ่มเติมสำหรับ ${job.title}`}>•••</summary>
              <div><button type="button" disabled={busy} onClick={(event) => {
                event.currentTarget.closest('details').open = false
                onClose(job)
              }}>ปิดประกาศ</button></div>
            </details>
          </>}
          {job.status === 'matched' && <button type="button" disabled={busy} onClick={() => onStart(job)}>เริ่มงาน</button>}
          {job.status === 'completion_pending' && <button type="button" disabled={busy} onClick={() => onComplete(job)}>ยืนยันจบงาน</button>}
          {job.status === 'completed' && <button type="button" className="secondary-button" onClick={onHistory}>ดูประวัติงาน</button>}
        </div>
      </div>
    </article>
  )
}
