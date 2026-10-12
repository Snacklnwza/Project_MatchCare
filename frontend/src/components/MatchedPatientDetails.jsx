import { useCallback } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { callWorkflow } from '../lib/workflow'
import {
  areaLabels,
  assistanceLabels,
  mobilityLabels,
  sideLabels,
} from '../lib/patients'

export default function MatchedPatientDetails({ requestId }) {
  const load = useCallback(
    () => callWorkflow('get_matched_patient_details', { p_request_id: requestId }),
    [requestId],
  )
  const { data, loading, error, reload } = useRemoteList(load)

  if (loading) return <p role="status">กำลังโหลดข้อมูลผู้ป่วย...</p>
  if (error) {
    return (
      <div role="alert" className="matched-patient-details">
        <p>โหลดข้อมูลผู้ป่วยไม่สำเร็จ</p>
        <button type="button" className="secondary-button" onClick={reload}>ลองใหม่</button>
      </div>
    )
  }
  if (!data?.patient_name) return null

  return (
    <section className="matched-patient-details" aria-label="ข้อมูลผู้ป่วยในงานที่รับแล้ว">
      <h3>ข้อมูลผู้ป่วยและการดูแล</h3>
      <p><strong>ผู้ป่วย:</strong> {data.patient_name}{data.age_years !== null && ` · อายุ ${data.age_years} ปี`}</p>
      <p><strong>การดูแลที่ต้องการ:</strong> {data.care_summary}</p>
      <p><strong>การเคลื่อนไหว:</strong> {mobilityLabels[data.mobility_status] ?? 'ไม่ได้ระบุ'}</p>
      {data.chronic_conditions && <p><strong>โรคประจำตัว/อาการ:</strong> {data.chronic_conditions}</p>}
      {data.care_notes && <p><strong>ข้อควรรู้ในการดูแล:</strong> {data.care_notes}</p>}
      {data.care_conditions?.length > 0 && <p><strong>สภาวะการดูแล:</strong> {data.care_conditions.join(' · ')}</p>}
      {data.affected_area && (
        <p><strong>บริเวณที่เคลื่อนไหวลำบาก:</strong> {areaLabels[data.affected_area]} {sideLabels[data.affected_side]}</p>
      )}
      {data.transfer_assistance && <p><strong>การย้ายตัว:</strong> {assistanceLabels[data.transfer_assistance]}</p>}
      {data.required_skills?.length > 0 && <p><strong>ทักษะที่งานต้องการ:</strong> {data.required_skills.join(' · ')}</p>}
    </section>
  )
}
