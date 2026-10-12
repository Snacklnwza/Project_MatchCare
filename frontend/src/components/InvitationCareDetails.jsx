import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { callWorkflow } from '../lib/workflow'
import { areaLabels, assistanceLabels, mobilityLabels, sideLabels } from '../lib/patients'

export default function InvitationCareDetails({ jobId }) {
  const load = useCallback(
    () => callWorkflow('get_open_job_details', { p_job_id: jobId }),
    [jobId],
  )
  const { data, loading, error, reload } = useRemoteList(load)

  if (loading) return <p role="status">กำลังโหลดรายละเอียดงานและผู้ป่วย...</p>
  if (error || !data) {
    return (
      <div className="invitation-care-details" role="alert">
        <p>โหลดรายละเอียดงานไม่สำเร็จ กรุณาลองใหม่ก่อนตัดสินใจรับงาน</p>
        <button type="button" className="secondary-button" onClick={reload}>ลองใหม่</button>
      </div>
    )
  }

  return (
    <section className="invitation-care-details" aria-label="รายละเอียดงานและผู้ป่วยก่อนตอบรับ">
      <h3>รายละเอียดก่อนตอบรับงาน</h3>
      <p><strong>รายละเอียดงาน:</strong> {data.description}</p>
      <p><strong>สรุปการดูแลที่ต้องการ:</strong> {data.care_summary}</p>
      <div className="invitation-care-tags" aria-label="ทักษะที่งานต้องการ">
        {data.required_skills?.map((skill) => <span key={skill.id}>{skill.name}</span>)}
      </div>
      <h4>ข้อมูลผู้ป่วยที่เกี่ยวกับการดูแล</h4>
      <p><strong>การเคลื่อนไหว:</strong> {mobilityLabels[data.mobility_status] ?? 'ไม่ได้ระบุ'}</p>
      {data.chronic_conditions && <p><strong>โรคประจำตัว/อาการ:</strong> {data.chronic_conditions}</p>}
      {data.care_notes && <p><strong>ข้อควรรู้ในการดูแล:</strong> {data.care_notes}</p>}
      {data.care_conditions?.length > 0 && <p><strong>สภาวะการดูแล:</strong> {data.care_conditions.join(' · ')}</p>}
      {data.affected_area && (
        <p><strong>บริเวณที่เคลื่อนไหวลำบาก:</strong> {areaLabels[data.affected_area]} {sideLabels[data.affected_side]}</p>
      )}
      {data.transfer_assistance && <p><strong>การย้ายตัว:</strong> {assistanceLabels[data.transfer_assistance]}</p>}
    </section>
  )
}
