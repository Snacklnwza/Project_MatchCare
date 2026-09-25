import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toLocalDateTime } from '../lib/jobs'

function JobForm({ job = null, onCancel, onSaved }) {
  const savingRef = useRef(false)
  const [retryOptions, setRetryOptions] = useState(0)
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState(job ? String(job.patient_id) : '')
  const [title, setTitle] = useState(job?.title ?? '')
  const [description, setDescription] = useState(job?.description ?? '')
  const [careSummary, setCareSummary] = useState(job?.care_summary ?? '')
  const [startsAt, setStartsAt] = useState(toLocalDateTime(job?.starts_at))
  const [endsAt, setEndsAt] = useState(toLocalDateTime(job?.ends_at))
  const [payAmount, setPayAmount] = useState(job?.pay_amount ?? '')
  const [payUnit, setPayUnit] = useState(job?.pay_unit ?? '')
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [patientError, setPatientError] = useState('')
  const [skills, setSkills] = useState([])
  const [selectedSkillIds, setSelectedSkillIds] = useState(
    job?.job_required_skills?.map((item) => item.skill_id) ?? [],
  )
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [skillError, setSkillError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPatients() {
      setLoadingPatients(true)
      setPatientError('')
      const { data, error: queryError } = await supabase
        .from('patients')
        .select(
          'id, first_name, last_name, province, district, subdistrict, address_detail',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        setPatientError('ไม่สามารถโหลดรายชื่อผู้ป่วยได้')
      } else {
        setPatients(data ?? [])
      }
      setLoadingPatients(false)
    }

    loadPatients()
    return () => {
      cancelled = true
    }
  }, [retryOptions])
  useEffect(() => {
    let cancelled = false

    async function loadSkills() {
      setLoadingSkills(true)
      setSkillError('')
      const { data, error: queryError } = await supabase
        .from('skills')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (cancelled) return

      if (queryError) {
        setSkillError('ไม่สามารถโหลดรายการทักษะได้')
      } else {
        setSkills(data ?? [])
      }
      setLoadingSkills(false)
    }

    loadSkills()
    return () => {
      cancelled = true
    }
  }, [retryOptions])
  function toggleSkill(skillId) {
    setSelectedSkillIds((currentIds) =>
      currentIds.includes(skillId)
        ? currentIds.filter((id) => id !== skillId)
        : [...currentIds, skillId],
    )
  }
  const selectedPatient = patients.find(
    (patient) => String(patient.id) === patientId,
  )
  async function handleSubmit(event) {
    event.preventDefault()
    if (savingRef.current) return
    setFormError('')

    if (selectedSkillIds.length === 0) {
      setFormError('กรุณาเลือกทักษะอย่างน้อย 1 รายการ')
      return
    }
    const startTime = new Date(startsAt).getTime()
    const endTime = new Date(endsAt).getTime()

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      endTime <= startTime
    ) {
      setFormError('วันเวลาสิ้นสุดต้องอยู่หลังวันเวลาเริ่มงาน')
      return
    }

    const amount = Number(payAmount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999.99) {
      setFormError('ค่าตอบแทนต้องมากกว่า 0 และไม่เกิน 99,999,999.99 บาท')
      return
    }
    if (!selectedPatient) {
      setFormError('กรุณาเลือกผู้ป่วย')
      return
    }

    if ([title, description, careSummary].some((value) => !value.trim())) {
      setFormError('กรุณากรอกหัวข้อ รายละเอียด และสรุปการดูแล')
      return
    }

    if (!payUnit) {
      setFormError('กรุณาเลือกหน่วยค่าตอบแทน')
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const { data, error: saveError } = await supabase.rpc(
        job ? 'update_job_with_tags' : 'create_job_with_tags',
        {
          ...(job ? { p_job_id: job.id } : {}),
          p_patient_id: selectedPatient.id,
          p_title: title.trim(),
          p_description: description.trim(),
          p_care_summary: careSummary.trim(),
          p_starts_at: new Date(startsAt).toISOString(),
          p_ends_at: new Date(endsAt).toISOString(),
          p_pay_amount: amount,
          p_pay_unit: payUnit,
          p_skill_ids: selectedSkillIds,
        },
      )

      if (saveError) throw saveError
      if (!data)
        throw new Error('ไม่ได้รับผลการบันทึก กรุณาตรวจสอบรายการอีกครั้ง')
      onSaved()
    } catch (error) {
      setFormError(`บันทึกประกาศไม่สำเร็จ: ${error?.message ?? 'กรุณาลองใหม่'}`)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }
  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h2>{job ? 'แก้ไขประกาศงาน' : 'สร้างประกาศงาน'}</h2>
      <p>เลือกผู้ป่วย ระบุการดูแล วันเวลา และค่าตอบแทนให้ครบถ้วน</p>
      {(patientError || skillError) && (
        <button type="button" onClick={() => setRetryOptions((key) => key + 1)}>
          โหลดตัวเลือกใหม่
        </button>
      )}
      <fieldset className="job-form-fields" disabled={saving}>
        {loadingPatients ? (
          <p>กำลังโหลดรายชื่อผู้ป่วย...</p>
        ) : patientError ? (
          <p role="alert">{patientError}</p>
        ) : patients.length === 0 ? (
          <p>ยังไม่มีผู้ป่วยที่ใช้งานอยู่ กรุณาเพิ่มผู้ป่วยก่อนสร้างประกาศ</p>
        ) : (
          <>
            <label htmlFor="job-patient">ผู้ป่วยที่ต้องการจ้างผู้ดูแลให้</label>

            <select
              id="job-patient"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
            >
              <option value="">เลือกผู้ป่วย</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
          </>
        )}
        {selectedPatient && (
          <p>
            สถานที่ดูแล: {selectedPatient.subdistrict} อ.
            {selectedPatient.district} จ.{selectedPatient.province}
          </p>
        )}
        <label htmlFor="job-title">หัวข้อประกาศ</label>
        <input
          id="job-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
        />
        <label htmlFor="job-description">รายละเอียดประกาศงาน</label>
        <textarea
          id="job-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          required
        />
        <label htmlFor="job-care-summary">สรุปการดูแลที่ต้องการ</label>
        <textarea
          id="job-care-summary"
          value={careSummary}
          onChange={(event) => setCareSummary(event.target.value)}
          rows={3}
          required
        />
        <label htmlFor="job-starts-at">วันเวลาเริ่มงาน</label>
        <input
          id="job-starts-at"
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          required
        />

        <label htmlFor="job-ends-at">วันเวลาสิ้นสุดงาน</label>
        <input
          id="job-ends-at"
          type="datetime-local"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          min={startsAt || undefined}
          required
        />
        <label htmlFor="job-pay-amount">ค่าตอบแทน (บาท)</label>
        <input
          id="job-pay-amount"
          type="number"
          min="0.01"
          max="99999999.99"
          step="0.01"
          value={payAmount}
          onChange={(event) => setPayAmount(event.target.value)}
          required
        />

        <label htmlFor="job-pay-unit">คิดค่าตอบแทน</label>
        <select
          id="job-pay-unit"
          value={payUnit}
          onChange={(event) => setPayUnit(event.target.value)}
          required
        >
          <option value="">เลือกหน่วย</option>
          <option value="hour">ต่อชั่วโมง</option>
          <option value="day">ต่อวัน</option>
          <option value="month">ต่อเดือน</option>
          <option value="total">เหมาทั้งงาน</option>
        </select>
        <fieldset>
          <legend>ทักษะผู้ดูแลที่ต้องการ</legend>

          {loadingSkills ? (
            <p>กำลังโหลดทักษะ...</p>
          ) : skillError ? (
            <p role="alert">{skillError}</p>
          ) : skills.length === 0 ? (
            <p>ไม่มีทักษะให้เลือกในขณะนี้</p>
          ) : (
            skills.map((skill) => (
              <label key={skill.id}>
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
                {skill.name}
              </label>
            ))
          )}
        </fieldset>
      </fieldset>
      {formError && (
        <p role="alert" className="form-error">
          {formError}
        </p>
      )}
      <div className="job-actions">
        <button
          type="submit"
          disabled={
            saving ||
            loadingPatients ||
            loadingSkills ||
            !!patientError ||
            !!skillError ||
            !patients.length ||
            !skills.length
          }
        >
          {saving ? 'กำลังบันทึก...' : job ? 'บันทึกการแก้ไข' : 'สร้างประกาศ'}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={saving}
          onClick={onCancel}
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}

export default JobForm
