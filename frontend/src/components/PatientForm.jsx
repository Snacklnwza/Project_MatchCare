import { useEffect, useState } from 'react'
import geography from '../data/geography.json'
import { supabase } from '../lib/supabase'

const provinces = [
    ...new Set(geography.map((location) => location.provinceNameTh)),
]

function PatientForm({ patient = null, onCancel, onSaved }) {
    const [firstName, setFirstName] = useState(patient?.first_name ?? '')
    const [lastName, setLastName] = useState(patient?.last_name ?? '')
    const [birthDate, setBirthDate] = useState(patient?.birth_date ?? '')
    const [mobilityStatus, setMobilityStatus] = useState(
        patient?.mobility_status ?? '',
    )
    const [careNotes, setCareNotes] = useState(patient?.care_notes ?? '')
    const [province, setProvince] = useState(patient?.province ?? '')
    const [district, setDistrict] = useState(patient?.district ?? '')
    const [subdistrict, setSubdistrict] = useState(
        patient?.subdistrict ?? '',
    )
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

    useEffect(() => {
        async function loadOptions() {
            setOptionsLoading(true)

            const [conditionResult, skillResult] = await Promise.all([
                supabase
                    .from('conditions')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name'),
                supabase
                    .from('skills')
                    .select('id, name, description')
                    .eq('is_active', true)
                    .order('name'),
            ])

            if (conditionResult.error || skillResult.error) {
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
    }, [])

    function toggleSelectedId(id, setSelectedIds) {
        setSelectedIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((currentId) => currentId !== id)
                : [...currentIds, id],
        )
    }

    const districts = [
        ...new Set(
            geography
                .filter((location) => location.provinceNameTh === province)
                .map((location) => location.districtNameTh),
        ),
    ]

    const subdistricts = [
        ...new Set(
            geography
                .filter(
                    (location) =>
                        location.provinceNameTh === province &&
                        location.districtNameTh === district,
                )
                .map((location) => location.subdistrictNameTh),
        ),
    ]

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)
        setError('')

        try {
            const { data: userData, error: userError } =
                await supabase.auth.getUser()

            if (userError) {
                throw userError
            }

            if (!userData.user) {
                throw new Error('ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่')
            }

            const patientData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                birth_date: birthDate,
                mobility_status: mobilityStatus,
                care_notes: careNotes.trim() || null,
                province,
                district,
                subdistrict,
                address_detail: addressDetail.trim(),
            }

            let query = supabase.from('patients')

            if (patient) {
                query = query.update(patientData).eq('id', patient.id)
            } else {
                query = query.insert({
                    ...patientData,
                    employer_id: userData.user.id,
                })
            }

            const { data, error: saveError } = await query
                .select(
                    `
            id,
            first_name,
            last_name,
            birth_date,
            mobility_status,
            care_notes,
            province,
            district,
            subdistrict,
            address_detail
          `,
                )
                .single()

            if (saveError) {
                throw saveError
            }

            if (patient) {
                const [conditionDelete, skillDelete] = await Promise.all([
                    supabase
                        .from('patient_conditions')
                        .delete()
                        .eq('patient_id', data.id),
                    supabase
                        .from('patient_required_skills')
                        .delete()
                        .eq('patient_id', data.id),
                ])

                if (conditionDelete.error || skillDelete.error) {
                    throw (
                        conditionDelete.error ||
                        skillDelete.error
                    )
                }
            }

            const conditionRows = selectedConditionIds.map((conditionId) => ({
                patient_id: data.id,
                condition_id: conditionId,
            }))
            const skillRows = selectedSkillIds.map((skillId) => ({
                patient_id: data.id,
                skill_id: skillId,
            }))

            const [conditionInsert, skillInsert] = await Promise.all([
                conditionRows.length > 0
                    ? supabase.from('patient_conditions').insert(conditionRows)
                    : Promise.resolve({ error: null }),
                skillRows.length > 0
                    ? supabase
                          .from('patient_required_skills')
                          .insert(skillRows)
                    : Promise.resolve({ error: null }),
            ])

            if (conditionInsert.error || skillInsert.error) {
                throw conditionInsert.error || skillInsert.error
            }

            onSaved({
                ...data,
                patient_conditions: selectedConditionIds.map(
                    (conditionId) => ({ condition_id: conditionId }),
                ),
                patient_required_skills: selectedSkillIds.map((skillId) => ({
                    skill_id: skillId,
                })),
            })
        } catch (submitError) {
            setError(submitError.message || 'ไม่สามารถบันทึกข้อมูลผู้ป่วยได้')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form className="patient-form" onSubmit={handleSubmit}>
            <div className="patient-form-header">
                <h3>
                    {patient
                        ? 'แก้ไขข้อมูลผู้ป่วย'
                        : 'เพิ่มข้อมูลผู้ป่วยใหม่'}
                </h3>

                <button type="button" onClick={onCancel} aria-label="ปิดฟอร์ม">
                    ✕
                </button>
            </div>

            <label htmlFor="patient-first-name">ชื่อผู้ป่วย</label>
            <input
                id="patient-first-name"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
            />

            <label htmlFor="patient-last-name">นามสกุลผู้ป่วย</label>
            <input
                id="patient-last-name"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
            />

            <label htmlFor="patient-birth-date">วัน/เดือน/ปีเกิด</label>
            <input
                id="patient-birth-date"
                type="date"
                value={birthDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(event) => setBirthDate(event.target.value)}
                required
            />

            <label htmlFor="patient-mobility-status">
                สถานะการเคลื่อนไหว
            </label>
            <select
                id="patient-mobility-status"
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

            <fieldset className="patient-option-group">
                <legend>สภาวะหรือโรคประจำตัว</legend>

                {optionsLoading ? (
                    <p>กำลังโหลดสภาวะ...</p>
                ) : (
                    conditions.map((condition) => (
                        <label key={condition.id}>
                            <input
                                type="checkbox"
                                checked={selectedConditionIds.includes(
                                    condition.id,
                                )}
                                onChange={() =>
                                    toggleSelectedId(
                                        condition.id,
                                        setSelectedConditionIds,
                                    )
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
                                onChange={() =>
                                    toggleSelectedId(
                                        skill.id,
                                        setSelectedSkillIds,
                                    )
                                }
                            />
                            {skill.description || skill.name}
                        </label>
                    ))
                )}
            </fieldset>

            <label htmlFor="patient-province">จังหวัด</label>
            <select
                id="patient-province"
                value={province}
                onChange={(event) => {
                    setProvince(event.target.value)
                    setDistrict('')
                    setSubdistrict('')
                }}
                required
            >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((provinceName) => (
                    <option key={provinceName} value={provinceName}>
                        {provinceName}
                    </option>
                ))}
            </select>

            <label htmlFor="patient-district">อำเภอ/เขต</label>
            <select
                id="patient-district"
                value={district}
                onChange={(event) => {
                    setDistrict(event.target.value)
                    setSubdistrict('')
                }}
                disabled={!province}
                required
            >
                <option value="">เลือกอำเภอ/เขต</option>
                {districts.map((districtName) => (
                    <option key={districtName} value={districtName}>
                        {districtName}
                    </option>
                ))}
            </select>

            <label htmlFor="patient-subdistrict">ตำบล/แขวง</label>
            <select
                id="patient-subdistrict"
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

            <label htmlFor="patient-address-detail">รายละเอียดที่อยู่</label>
            <textarea
                id="patient-address-detail"
                value={addressDetail}
                onChange={(event) => setAddressDetail(event.target.value)}
                required
            />

            <label htmlFor="patient-care-notes">
                รายละเอียดการดูแลเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
                id="patient-care-notes"
                value={careNotes}
                onChange={(event) => setCareNotes(event.target.value)}
            />

            {error && <p role="alert">{error}</p>}

            <div className="patient-form-actions">
                <button type="button" onClick={onCancel} disabled={saving}>
                    ยกเลิก
                </button>

                <button type="submit" disabled={saving || optionsLoading}>
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
