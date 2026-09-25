import { useEffect, useRef, useState } from 'react'
import geography from '../data/geography-options.json'
import { toLocalDateTime } from '../lib/jobs'
import { supabase } from '../lib/supabase'

const provinces = Object.keys(geography)

function PatientForm({ patient = null, onCancel, onSaved }) {
  const submitting = useRef(false)
  const [firstName, setFirstName] = useState(patient?.first_name ?? '')
  const [lastName, setLastName] = useState(patient?.last_name ?? '')
  const [birthDate, setBirthDate] = useState(patient?.birth_date ?? '')
  const [mobilityStatus, setMobilityStatus] = useState(
    patient?.mobility_status ?? '',
  )
  const [careNotes, setCareNotes] = useState(patient?.care_notes ?? '')
  const [province, setProvince] = useState(patient?.province ?? '')
  const [provinceOptionsOpen, setProvinceOptionsOpen] = useState(false)
  const [activeProvinceIndex, setActiveProvinceIndex] = useState(0)
  const [district, setDistrict] = useState(patient?.district ?? '')
  const [subdistrict, setSubdistrict] = useState(patient?.subdistrict ?? '')
  const [addressDetail, setAddressDetail] = useState(
    patient?.address_detail ?? '',
  )
  const [conditions, setConditions] = useState([])
  const [skills, setSkills] = useState([])
  const [selectedConditionIds, setSelectedConditionIds] = useState(
    patient?.patient_conditions?.map((item) => item.condition_id) ?? [],
  )
  const [selectedSkillIds, setSelectedSkillIds] = useState(
    patient?.patient_required_skills?.map((item) => item.skill_id) ?? [],
  )
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [optionsError, setOptionsError] = useState(false)
  const [retryOptions, setRetryOptions] = useState(0)
  const formRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    formRef.current?.querySelector('input')?.focus()
    function handleKey(event) {
      if (event.key === 'Escape' && !submitting.current) {
        event.preventDefault()
        onCancel()
      }
      if (event.key !== 'Tab') return
      const controls = [
        ...formRef.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
        ),
      ]
      const first = controls[0],
        last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus()
    }
  }, [onCancel])

  useEffect(() => {
    let cancelled = false
    async function loadOptions() {
      setOptionsLoading(true)
      setOptionsError(false)
      setError('')

      const [conditionResult, skillResult] = await Promise.all([
        supabase
          .from('conditions')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('skills')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
      ])

      if (cancelled) return
      if (conditionResult.error || skillResult.error) {
        setOptionsError(true)
        setError(
          conditionResult.error?.message ||
            skillResult.error?.message ||
            'ไม่สามารถโหลดตัวเลือกได้',
        )
      } else {
        setConditions(conditionResult.data ?? [])
        setSkills(skillResult.data ?? [])
      }

      setOptionsLoading(false)
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [retryOptions])

  function toggleSelectedId(id, setSelectedIds) {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    )
  }

  const districts = Object.keys(geography[province] ?? {})
  const subdistricts = geography[province]?.[district] ?? []
  const matchingProvinces = provinces
    .filter((provinceName) => provinceName.includes(province.trim()))
    .slice(0, 10)

  function chooseProvince(provinceName) {
    setProvince(provinceName)
    setDistrict('')
    setSubdistrict('')
    setProvinceOptionsOpen(false)
    formRef.current?.elements['patient-province'].setCustomValidity('')
    setFieldErrors((errors) => ({ ...errors, 'patient-province': '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    for (const field of form.querySelectorAll(
      'input[required], textarea[required], select[required]',
    )) {
      field.setCustomValidity(
        field.value.trim() ? '' : 'กรุณากรอกข้อมูลช่องนี้',
      )
    }
    if (province && !Object.hasOwn(geography, province)) {
      form.elements['patient-province'].setCustomValidity(
        'กรุณาเลือกจังหวัดจากรายการ',
      )
      setFieldErrors((errors) => ({
        ...errors,
        'patient-province': 'กรุณาเลือกจังหวัดจากรายการ',
      }))
    }
    if (!form.reportValidity()) return
    submitting.current = true
    setSaving(true)
    setError('')

    try {
      const { data, error: saveError } = await supabase.rpc(
        'save_patient_with_tags',
        {
          p_patient_id: patient?.id ?? null,
          p_first_name: firstName.trim(),
          p_last_name: lastName.trim(),
          p_birth_date: birthDate,
          p_mobility_status: mobilityStatus,
          p_care_notes: careNotes.trim() || null,
          p_province: province,
          p_district: district,
          p_subdistrict: subdistrict,
          p_address_detail: addressDetail.trim(),
          p_condition_ids: selectedConditionIds,
          p_skill_ids: selectedSkillIds,
        },
      )

      if (!data && !saveError)
        throw new Error('ไม่ได้รับข้อมูลผู้ป่วยที่บันทึก')
      if (saveError) {
        throw saveError
      }

      onSaved({
        ...data,
        patient_conditions: selectedConditionIds.map((conditionId) => ({
          condition_id: conditionId,
        })),
        patient_required_skills: selectedSkillIds.map((skillId) => ({
          skill_id: skillId,
        })),
      })
    } catch (submitError) {
      setError(submitError.message || 'ไม่สามารถบันทึกข้อมูลผู้ป่วยได้')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <form
      ref={formRef}
      className="patient-form"
      onSubmit={handleSubmit}
      onInvalid={(event) => {
        const field = event.target
        setFieldErrors((errors) => ({
          ...errors,
          [field.id]: field.validity.rangeOverflow
            ? 'วันเกิดต้องไม่อยู่ในอนาคต'
            : field.validity.customError
              ? field.validationMessage
              : 'กรุณากรอกหรือเลือกข้อมูลช่องนี้ให้ถูกต้อง',
        }))
      }}
      onInput={(event) => {
        event.target.setCustomValidity?.('')
        setFieldErrors((errors) => ({ ...errors, [event.target.id]: '' }))
      }}
    >
      <div className="patient-form-header">
        <h3>{patient ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มข้อมูลผู้ป่วยใหม่'}</h3>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="ปิดฟอร์ม"
        >
          ✕
        </button>
      </div>

      <label htmlFor="patient-first-name">ชื่อผู้ป่วย</label>
      <input
        id="patient-first-name"
        aria-invalid={Boolean(fieldErrors['patient-first-name'])}
        aria-describedby={
          fieldErrors['patient-first-name']
            ? 'patient-first-name-error'
            : undefined
        }
        type="text"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        required
      />
      {fieldErrors['patient-first-name'] && (
        <small className="field-error" id="patient-first-name-error">
          {fieldErrors['patient-first-name']}
        </small>
      )}

      <label htmlFor="patient-last-name">นามสกุลผู้ป่วย</label>
      <input
        id="patient-last-name"
        aria-invalid={Boolean(fieldErrors['patient-last-name'])}
        aria-describedby={
          fieldErrors['patient-last-name']
            ? 'patient-last-name-error'
            : undefined
        }
        type="text"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        required
      />
      {fieldErrors['patient-last-name'] && (
        <small className="field-error" id="patient-last-name-error">
          {fieldErrors['patient-last-name']}
        </small>
      )}

      <label htmlFor="patient-birth-date">วัน/เดือน/ปีเกิด</label>
      <input
        id="patient-birth-date"
        aria-invalid={Boolean(fieldErrors['patient-birth-date'])}
        aria-describedby={
          fieldErrors['patient-birth-date']
            ? 'patient-birth-date-error'
            : undefined
        }
        type="date"
        value={birthDate}
        max={toLocalDateTime(new Date()).split('T')[0]}
        onChange={(event) => setBirthDate(event.target.value)}
        required
      />
      {fieldErrors['patient-birth-date'] && (
        <small className="field-error" id="patient-birth-date-error">
          {fieldErrors['patient-birth-date']}
        </small>
      )}

      <label htmlFor="patient-mobility-status">สถานะการเคลื่อนไหว</label>
      <select
        id="patient-mobility-status"
        aria-invalid={Boolean(fieldErrors['patient-mobility-status'])}
        aria-describedby={
          fieldErrors['patient-mobility-status']
            ? 'patient-mobility-status-error'
            : undefined
        }
        value={mobilityStatus}
        onChange={(event) => setMobilityStatus(event.target.value)}
        required
      >
        <option value="">เลือกสถานะการเคลื่อนไหว</option>
        <option value="bedridden">ผู้ป่วยติดเตียง</option>
        <option value="wheelchair">ใช้รถเข็น</option>
        <option value="walker">ใช้เครื่องช่วยเดิน</option>
        <option value="cane">ใช้ไม้เท้า</option>
      </select>
      {fieldErrors['patient-mobility-status'] && (
        <small className="field-error" id="patient-mobility-status-error">
          {fieldErrors['patient-mobility-status']}
        </small>
      )}

      <fieldset className="patient-option-group">
        <legend>สภาวะหรือโรคประจำตัว</legend>

        {optionsLoading ? (
          <p>กำลังโหลดสภาวะ...</p>
        ) : (
          conditions.map((condition) => (
            <label key={condition.id}>
              <input
                type="checkbox"
                checked={selectedConditionIds.includes(condition.id)}
                onChange={() =>
                  toggleSelectedId(condition.id, setSelectedConditionIds)
                }
              />
              {condition.name}
            </label>
          ))
        )}
      </fieldset>

      <fieldset className="patient-option-group">
        <legend>ทักษะผู้ดูแลที่ต้องการ</legend>

        {optionsLoading ? (
          <p>กำลังโหลดทักษะ...</p>
        ) : (
          skills.map((skill) => (
            <label key={skill.id}>
              <input
                type="checkbox"
                checked={selectedSkillIds.includes(skill.id)}
                onChange={() => toggleSelectedId(skill.id, setSelectedSkillIds)}
              />
              {skill.name}
            </label>
          ))
        )}
      </fieldset>

      <label htmlFor="patient-province">จังหวัด</label>
      <div className="patient-province-picker">
        <input
          id="patient-province"
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="patient-province-options"
          aria-expanded={provinceOptionsOpen}
          aria-activedescendant={
            provinceOptionsOpen && matchingProvinces.length
              ? `patient-province-option-${activeProvinceIndex}`
              : undefined
          }
          placeholder="พิมพ์ค้นหาจังหวัด เช่น เชียงใหม่"
          aria-invalid={Boolean(fieldErrors['patient-province'])}
          aria-describedby={
            fieldErrors['patient-province'] ? 'patient-province-error' : undefined
          }
          value={province}
          onFocus={() => setProvinceOptionsOpen(true)}
          onChange={(event) => {
            setProvince(event.target.value)
            setDistrict('')
            setSubdistrict('')
            setActiveProvinceIndex(0)
            setProvinceOptionsOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && provinceOptionsOpen) {
              event.stopPropagation()
              setProvinceOptionsOpen(false)
            } else if (event.key === 'ArrowDown' && matchingProvinces.length) {
              event.preventDefault()
              setActiveProvinceIndex((index) =>
                Math.min(index + 1, matchingProvinces.length - 1),
              )
            } else if (event.key === 'ArrowUp' && matchingProvinces.length) {
              event.preventDefault()
              setActiveProvinceIndex((index) => Math.max(index - 1, 0))
            } else if (
              event.key === 'Enter' &&
              provinceOptionsOpen &&
              matchingProvinces.length
            ) {
              event.preventDefault()
              chooseProvince(matchingProvinces[activeProvinceIndex])
            }
          }}
          onBlur={(event) => {
            setProvinceOptionsOpen(false)
            if (province && !Object.hasOwn(geography, province)) {
              event.target.setCustomValidity('กรุณาเลือกจังหวัดจากรายการ')
              setFieldErrors((errors) => ({
                ...errors,
                'patient-province': 'กรุณาเลือกจังหวัดจากรายการ',
              }))
            }
          }}
          required
        />
        {provinceOptionsOpen && (
          <div
            id="patient-province-options"
            role="listbox"
            aria-label="จังหวัด"
            className="patient-province-options"
          >
            {matchingProvinces.length ? (
              matchingProvinces.map((provinceName, index) => (
                <button
                  key={provinceName}
                  id={`patient-province-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeProvinceIndex}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => chooseProvince(provinceName)}
                >
                  {provinceName}
                </button>
              ))
            ) : (
              <p>ไม่พบจังหวัด กรุณาตรวจชื่อที่พิมพ์</p>
            )}
          </div>
        )}
      </div>
      {fieldErrors['patient-province'] && (
        <small className="field-error" id="patient-province-error">
          {fieldErrors['patient-province']}
        </small>
      )}

      <label htmlFor="patient-district">อำเภอ/เขต</label>
      <select
        id="patient-district"
        aria-invalid={Boolean(fieldErrors['patient-district'])}
        aria-describedby={
          fieldErrors['patient-district'] ? 'patient-district-error' : undefined
        }
        value={district}
        onChange={(event) => {
          setDistrict(event.target.value)
          setSubdistrict('')
        }}
        disabled={!Object.hasOwn(geography, province)}
        required
      >
        <option value="">เลือกอำเภอ/เขต</option>
        {districts.map((districtName) => (
          <option key={districtName} value={districtName}>
            {districtName}
          </option>
        ))}
      </select>
      {fieldErrors['patient-district'] && (
        <small className="field-error" id="patient-district-error">
          {fieldErrors['patient-district']}
        </small>
      )}

      <label htmlFor="patient-subdistrict">ตำบล/แขวง</label>
      <select
        id="patient-subdistrict"
        aria-invalid={Boolean(fieldErrors['patient-subdistrict'])}
        aria-describedby={
          fieldErrors['patient-subdistrict']
            ? 'patient-subdistrict-error'
            : undefined
        }
        value={subdistrict}
        onChange={(event) => setSubdistrict(event.target.value)}
        disabled={!district}
        required
      >
        <option value="">เลือกตำบล/แขวง</option>
        {subdistricts.map((subdistrictName) => (
          <option key={subdistrictName} value={subdistrictName}>
            {subdistrictName}
          </option>
        ))}
      </select>
      {fieldErrors['patient-subdistrict'] && (
        <small className="field-error" id="patient-subdistrict-error">
          {fieldErrors['patient-subdistrict']}
        </small>
      )}

      <label htmlFor="patient-address-detail">รายละเอียดที่อยู่</label>
      <textarea
        id="patient-address-detail"
        aria-invalid={Boolean(fieldErrors['patient-address-detail'])}
        aria-describedby={
          fieldErrors['patient-address-detail']
            ? 'patient-address-detail-error'
            : undefined
        }
        value={addressDetail}
        onChange={(event) => setAddressDetail(event.target.value)}
        required
      />
      {fieldErrors['patient-address-detail'] && (
        <small className="field-error" id="patient-address-detail-error">
          {fieldErrors['patient-address-detail']}
        </small>
      )}

      <label htmlFor="patient-care-notes">
        รายละเอียดการดูแลเพิ่มเติม (ไม่บังคับ)
      </label>
      <textarea
        id="patient-care-notes"
        value={careNotes}
        onChange={(event) => setCareNotes(event.target.value)}
      />

      {error && <p role="alert">{error}</p>}
      {optionsError && (
        <button type="button" onClick={() => setRetryOptions((key) => key + 1)}>
          โหลดตัวเลือกใหม่
        </button>
      )}

      <div className="patient-form-actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          ยกเลิก
        </button>

        <button
          type="submit"
          disabled={saving || optionsLoading || optionsError}
        >
          {saving
            ? 'กำลังบันทึก...'
            : patient
              ? 'บันทึกการแก้ไข'
              : 'บันทึกข้อมูลผู้ป่วย'}
        </button>
      </div>
    </form>
  )
}

export default PatientForm
