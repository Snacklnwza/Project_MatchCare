import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function CaregiverProfile({ profile }) {
    const [caregiverData, setCaregiverData] = useState(null)
    const [bio, setBio] = useState('')
    const [experienceYears, setExperienceYears] = useState('0')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retryKey, setRetryKey] = useState(0)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [saveSuccess, setSaveSuccess] = useState('')
    const [skills, setSkills] = useState([])
    const [selectedSkillIds, setSelectedSkillIds] = useState([])
    const [skillsLoading, setSkillsLoading] = useState(true)
    const [skillsError, setSkillsError] = useState('')
    const [skillsRetry, setSkillsRetry] = useState(0)
    const [availabilitySaving, setAvailabilitySaving] = useState(false)
    const [availabilityError, setAvailabilityError] = useState('')

    useEffect(() => {
        let active = true

        async function loadCaregiverData() {
            setLoading(true)
            setError('')

            const { data, error: loadError } = await supabase
                .from('caregiver_profiles')
                .select('bio, experience_years, availability_status, verification_status')
                .eq('caregiver_id', profile.id)
                .maybeSingle()

            if (!active) return

            if (loadError) {
                setError('โหลดข้อมูลผู้ดูแลไม่สำเร็จ')
            } else {
                setCaregiverData(data)
                setBio(data?.bio ?? '')
                setExperienceYears(String(data?.experience_years ?? 0))
            }
            setLoading(false)
        }

        loadCaregiverData()

        return () => {
            active = false
        }
    }, [profile.id, retryKey])
    useEffect(() => {
        let active = true

        async function loadSkills() {
            setSkillsLoading(true)
            setSkillsError('')

            const [skillsResult, selectedResult] = await Promise.all([
                supabase
                    .from('skills')
                    .select('id, name')
                    .eq('is_active', true)
                    .order('name'),
                supabase
                    .from('caregiver_skills')
                    .select('skill_id')
                    .eq('caregiver_id', profile.id),
            ])

            if (!active) return

            if (skillsResult.error || selectedResult.error) {
                setSkillsError('โหลดรายการทักษะไม่สำเร็จ')
            } else {
                setSkills(skillsResult.data ?? [])
                setSelectedSkillIds(
                    (selectedResult.data ?? []).map((item) => item.skill_id),
                )
            }
            setSkillsLoading(false)
        }

        loadSkills()

        return () => {
            active = false
        }
    }, [profile.id, skillsRetry])

    async function handleSubmit(event) {
        event.preventDefault()
        setSaveError('')
        setSaveSuccess('')

        const years = Number(experienceYears)

        if (!bio.trim()) {
            setSaveError('กรุณากรอกคำแนะนำตัว')
            return
        }

        if (
            experienceYears.trim() === '' ||
            !Number.isInteger(years) ||
            years < 0 ||
            years > 80
        ) {
            setSaveError('ประสบการณ์ต้องเป็นจำนวนเต็ม 0–80 ปี')
            return
        }
        if (skillsLoading || skillsError) {
            setSaveError('กรุณารอให้โหลดทักษะสำเร็จก่อน')
            return
        }
        setSaving(true)

        try {
            const values = {
                bio: bio.trim(),
                experience_years: years,
            }

            const query = caregiverData
                ? supabase
                    .from('caregiver_profiles')
                    .update(values)
                    .eq('caregiver_id', profile.id)
                : supabase
                    .from('caregiver_profiles')
                    .insert({ caregiver_id: profile.id, ...values })

            const { data, error: saveFailure } = await query
                .select('bio, experience_years, availability_status, verification_status')
                .single()

            if (saveFailure) throw saveFailure

            setCaregiverData(data)
            const { data: savedSkills, error: readError } = await supabase
                .from('caregiver_skills')
                .select('skill_id')
                .eq('caregiver_id', profile.id)

            if (readError) throw readError

            const savedIds = new Set((savedSkills ?? []).map((item) => item.skill_id))
            const toAdd = selectedSkillIds.filter((id) => !savedIds.has(id))
            const toRemove = [...savedIds].filter(
                (id) => !selectedSkillIds.includes(id),
            )

            if (toAdd.length > 0) {
                const { error: addError } = await supabase
                    .from('caregiver_skills')
                    .insert(
                        toAdd.map((skillId) => ({
                            caregiver_id: profile.id,
                            skill_id: skillId,
                        })),
                    )
                if (addError) throw addError
            }

            if (toRemove.length > 0) {
                const { error: removeError } = await supabase
                    .from('caregiver_skills')
                    .delete()
                    .eq('caregiver_id', profile.id)
                    .in('skill_id', toRemove)
                if (removeError) throw removeError
            }
            setSaveSuccess('บันทึกโปรไฟล์แล้ว')
        } catch {
            setSaveError('บันทึกข้อมูลไม่ครบ กรุณาลองใหม่')
        } finally {
            setSaving(false)
        }
    }
    async function handleAvailabilityToggle() {
        if (!caregiverData || saving || availabilitySaving) return

        const previousStatus = caregiverData.availability_status
        const nextStatus =
            previousStatus === 'available' ? 'unavailable' : 'available'

        setAvailabilityError('')
        setAvailabilitySaving(true)
        setCaregiverData((current) => ({
            ...current,
            availability_status: nextStatus,
        }))

        try {
            const { data, error: updateError } = await supabase
                .from('caregiver_profiles')
                .update({ availability_status: nextStatus })
                .eq('caregiver_id', profile.id)
                .select('availability_status')
                .single()

            if (updateError) throw updateError

            setCaregiverData((current) => ({
                ...current,
                availability_status: data.availability_status,
            }))
        } catch {
            setCaregiverData((current) => ({
                ...current,
                availability_status: previousStatus,
            }))
            setAvailabilityError('เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่')
        } finally {
            setAvailabilitySaving(false)
        }
    }
    return (

        <section className="role-dashboard caregiver-profile">
            <h2>โปรไฟล์ผู้ดูแล</h2>
            <p>คุณ{profile.first_name} {profile.last_name}</p>
            {loading && <p>กำลังโหลดข้อมูลผู้ดูแล...</p>}
            {error && (
                <div role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
                        ลองใหม่
                    </button>
                </div>
            )}
            {!loading && !error && (
                <form className="caregiver-profile-form" onSubmit={handleSubmit}>
                    <p>{caregiverData ? 'แก้ไขโปรไฟล์ผู้ดูแล' : 'สร้างโปรไฟล์ผู้ดูแล'}</p>
                    <label htmlFor="caregiver-bio">แนะนำตัว</label>
                    <textarea
                        id="caregiver-bio"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                    />

                    <label htmlFor="caregiver-experience">ประสบการณ์ดูแล (ปี)</label>
                    <input
                        id="caregiver-experience"
                        type="number"
                        min="0"
                        max="80"
                        step="1"
                        value={experienceYears}
                        onChange={(event) => setExperienceYears(event.target.value)}
                    />
                    <fieldset>
                        <legend>ทักษะการดูแล</legend>
                        {skillsLoading && <p>กำลังโหลดทักษะ...</p>}
                        {skillsError && (
                            <div role="alert">
                                <p>{skillsError}</p>
                                <button type="button" onClick={() => setSkillsRetry((key) => key + 1)}>
                                    ลองใหม่
                                </button>
                            </div>
                        )}
                        {!skillsLoading && !skillsError && (
                            <ul>
                                {skills.map((skill) => (
                                    <li key={skill.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedSkillIds.includes(skill.id)}
                                                onChange={() =>
                                                    setSelectedSkillIds((current) =>
                                                        current.includes(skill.id)
                                                            ? current.filter((id) => id !== skill.id)
                                                            : [...current, skill.id],
                                                    )
                                                }
                                            />
                                            {skill.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>
                    {saveError && <p role="alert">{saveError}</p>}
                    {saveSuccess && <p role="status">{saveSuccess}</p>}
                    <button
                        type="submit"
                        disabled={saving || availabilitySaving || skillsLoading || Boolean(skillsError)}
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
                    </button>
                </form>
            )}
            {!loading && !error && (
                <div className="caregiver-profile-availability">
                    <label>
                        <input
                            type="checkbox"
                            role="switch"
                            checked={caregiverData?.availability_status === 'available'}
                            onChange={handleAvailabilityToggle}
                            disabled={!caregiverData || saving || availabilitySaving}
                        />
                        พร้อมรับงาน
                    </label>
                    <p>
                        {caregiverData
                            ? caregiverData.availability_status === 'available'
                                ? 'สถานะ: พร้อมรับงาน'
                                : 'สถานะ: ยังไม่พร้อมรับงาน'
                            : 'บันทึกโปรไฟล์ก่อนเปลี่ยนสถานะ'}
                    </p>
                    {availabilityError && <p role="alert">{availabilityError}</p>}
                </div>
            )}
        </section>
    )
}

export default CaregiverProfile