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
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingPatient, setEditingPatient] = useState(null)

    useEffect(() => {
        async function loadPatients() {
            setLoading(true)
            setError('')

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
                setError(queryError.message)
                setPatients([])
            } else {
                setPatients(data ?? [])
            }

            setLoading(false)
        }

        loadPatients()
    }, [])

    function handlePatientSaved(savedPatient) {
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
    }

    async function handleDeactivate(patient) {
        const confirmed = window.confirm(
            `ต้องการปิดใช้งานข้อมูลของ ${patient.first_name} ใช่หรือไม่`,
        )

        if (!confirmed) {
            return
        }

        setError('')

        const { error: updateError } = await supabase
            .from('patients')
            .update({ is_active: false })
            .eq('id', patient.id)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setPatients((currentPatients) =>
            currentPatients.filter(
                (currentPatient) => currentPatient.id !== patient.id,
            ),
        )
    }

    if (loading) {
        return <p>กำลังโหลดข้อมูลผู้ป่วย...</p>
    }

    if (error) {
        return <p role="alert">ไม่สามารถโหลดข้อมูลผู้ป่วย: {error}</p>
    }

    return (
        <section className="patient-manager">
            <h2>รายชื่อผู้ป่วยในการดูแล</h2>

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
