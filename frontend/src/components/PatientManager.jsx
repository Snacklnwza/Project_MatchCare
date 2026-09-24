import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PatientForm from './PatientForm'

const mobilityLabels = {
    bedridden: 'ผู้ป่วยติดเตียง',
    wheelchair: 'ใช้รถเข็น',
    walker: 'ใช้เครื่องช่วยเดิน',
    cane: 'ใช้ไม้เท้า',
}

function PatientManager() {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [feedback, setFeedback] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingPatient, setEditingPatient] = useState(null)

    useEffect(() => {
        async function loadPatients() {
            setLoading(true)
            setLoadError('')

            const { data, error: queryError } = await supabase
                .from('patients')
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
                        address_detail,
                        patient_conditions(condition_id),
                        patient_required_skills(skill_id)
                    `,
                )
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (queryError) {
                setLoadError(queryError.message)
                setPatients([])
            } else {
                setPatients(data ?? [])
            }

            setLoading(false)
        }

        loadPatients()
    }, [])

    useEffect(() => {
        if (feedback?.type !== 'success') {
            return undefined
        }

        const timeoutId = window.setTimeout(() => setFeedback(null), 4000)
        return () => window.clearTimeout(timeoutId)
    }, [feedback])

    function handlePatientSaved(savedPatient) {
        const wasEditing = Boolean(editingPatient)

        setPatients((currentPatients) => {
            const patientExists = currentPatients.some(
                (patient) => patient.id === savedPatient.id,
            )

            if (patientExists) {
                return currentPatients.map((patient) =>
                    patient.id === savedPatient.id ? savedPatient : patient,
                )
            }

            return [savedPatient, ...currentPatients]
        })

        setEditingPatient(null)
        setShowForm(false)
        setFeedback({
            type: 'success',
            message: wasEditing
                ? 'แก้ไขข้อมูลผู้ป่วยสำเร็จ'
                : 'เพิ่มข้อมูลผู้ป่วยสำเร็จ',
        })
    }

    async function handleDeactivate(patient) {
        const confirmed = window.confirm(
            `ต้องการปิดใช้งานข้อมูลของ ${patient.first_name} ใช่หรือไม่`,
        )

        if (!confirmed) {
            return
        }

        setFeedback(null)

        const { error: updateError } = await supabase
            .from('patients')
            .update({ is_active: false })
            .eq('id', patient.id)

        if (updateError) {
            setFeedback({
                type: 'error',
                message: `ไม่สามารถปิดใช้งานผู้ป่วยได้: ${updateError.message}`,
            })
            return
        }

        setPatients((currentPatients) =>
            currentPatients.filter(
                (currentPatient) => currentPatient.id !== patient.id,
            ),
        )
        setFeedback({
            type: 'success',
            message: 'ปิดใช้งานข้อมูลผู้ป่วยสำเร็จ',
        })
    }

    if (loading) {
        return <p>กำลังโหลดข้อมูลผู้ป่วย...</p>
    }

    if (loadError) {
        return <p role="alert">ไม่สามารถโหลดข้อมูลผู้ป่วย: {loadError}</p>
    }

    return (
        <section className="patient-manager">
            <h2>รายชื่อผู้ป่วยในการดูแล</h2>

            {feedback && (
                <div
                    className={`patient-feedback patient-feedback-${feedback.type}`}
                    role={feedback.type === 'error' ? 'alert' : 'status'}
                >
                    <span>{feedback.message}</span>
                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        aria-label="ปิดข้อความแจ้งเตือน"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="patient-grid">
                {patients.map((patient) => (
                    <article className="patient-card" key={patient.id}>
                        <h3>
                            {patient.first_name} {patient.last_name}
                        </h3>

                        <p>
                            {mobilityLabels[patient.mobility_status] ??
                                patient.mobility_status}
                        </p>

                        <p>
                            อ.{patient.district} จ.{patient.province}
                        </p>
                        <div className="patient-card-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setFeedback(null)
                                    setEditingPatient(patient)
                                    setShowForm(true)
                                }}
                            >
                                แก้ไข
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDeactivate(patient)}
                            >
                                ปิดใช้งาน
                            </button>
                        </div>
                    </article>
                ))}

                <button
                    className="add-patient-card"
                    type="button"
                    onClick={() => {
                        setFeedback(null)
                        setEditingPatient(null)
                        setShowForm(true)
                    }}
                >
                    <span aria-hidden="true">＋</span>
                    เพิ่มผู้ป่วยของคุณ
                </button>
            </div>

            {showForm && (
                <div className="patient-form-overlay">
                    <div
                        className="patient-form-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label={
                            editingPatient
                                ? 'แก้ไขข้อมูลผู้ป่วย'
                                : 'เพิ่มข้อมูลผู้ป่วยใหม่'
                        }
                    >
                        <PatientForm
                            patient={editingPatient}
                            onCancel={() => {
                                setEditingPatient(null)
                                setShowForm(false)
                            }}
                            onSaved={handlePatientSaved}
                        />
                    </div>
                </div>
            )}
        </section>
    )
}
export default PatientManager
