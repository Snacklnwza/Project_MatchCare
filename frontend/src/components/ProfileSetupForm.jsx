import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { saveOwnAvatar } from '../lib/caregiverAvatars'
import geography from '../data/geography-options.json'
import logo from '../assets/navbar/logo.png'
import AvatarCropper from './AvatarCropper'
import CaregiverAvatar from './CaregiverAvatar'

const provinces = Object.keys(geography)

function ProfileSetupForm({ userId, email, onSignOut, onProfileCreated }) {
  const submitting = useRef(false)
  const [role, setRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [lineId, setLineId] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [subdistrict, setSubdistrict] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [caregiverSaved, setCaregiverSaved] = useState(false)
  const districts = Object.keys(geography[province] ?? {})
  const subdistricts = geography[province]?.[district] ?? []

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  function chooseAvatar(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10485760) {
      setError('เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB')
      return
    }
    setError('')
    setSelectedImage(file)
  }

  function handlePhoneChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digitsOnly)
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
    if (!form.reportValidity()) return
    submitting.current = true
    setLoading(true)
    setError('')
    let stage = 'account'

    try {
      if (!profileSaved) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          role,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          line_id: lineId.trim() || null,
          province: province.trim(),
          district: district.trim(),
          subdistrict: subdistrict.trim(),
          address_detail: addressDetail.trim(),
        })

        if (insertError) throw insertError
        setProfileSaved(true)
      }

      // บัญชีผู้ดูแลต้องมีแถวโปรไฟล์ก่อน จึงจะผูกรูปที่อัปโหลดได้
      if (role === 'caregiver' && !caregiverSaved) {
        stage = 'caregiver'
        const { error: caregiverError } = await supabase.from('caregiver_profiles')
          .insert({ caregiver_id: userId })
        if (caregiverError) throw caregiverError
        setCaregiverSaved(true)
      }

      if (role === 'caregiver' && avatarFile) {
        stage = 'avatar'
        await saveOwnAvatar(userId, avatarFile, null)
      }

      await onProfileCreated()
    } catch (insertError) {
      setError(stage === 'avatar'
        ? 'บันทึกข้อมูลบัญชีแล้ว แต่รูปโปรไฟล์ยังไม่สำเร็จ ลองอีกครั้งหรือข้ามไปเปลี่ยนรูปในหน้าโปรไฟล์'
        : stage === 'caregiver'
          ? 'บันทึกข้อมูลบัญชีแล้ว แต่สร้างโปรไฟล์ผู้ดูแลไม่สำเร็จ กรุณาลองอีกครั้ง'
          : insertError.message || 'ไม่สามารถสร้างโปรไฟล์ได้')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <form
      className="profile-setup-form"
      onSubmit={handleSubmit}
      onInput={(event) => event.target.setCustomValidity?.('')}
    >
      <header className="profile-setup-header">
        <span className="auth-card-logo" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
        <div>
          <h2>ตั้งค่าโปรไฟล์</h2>
          <p>กรอกข้อมูลส่วนตัวก่อนเริ่มใช้งาน MatchCare</p>
        </div>
      </header>

      <div className="profile-account-notice">
        <span>
          เข้าสู่ระบบด้วย <strong>{email}</strong>
        </span>
        <button type="button" onClick={onSignOut}>
          เปลี่ยนบัญชี
        </button>
      </div>

      <fieldset className="profile-role-options">
        <legend>
          เลือกประเภทบัญชี <span>*</span>
        </legend>
        <div className="profile-role-grid">
          <label className={role === 'employer' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === 'employer'}
              disabled={profileSaved}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span>
              <strong>ผู้ว่าจ้าง</strong>
              <small>ต้องการค้นหาผู้ดูแล</small>
            </span>
          </label>

          <label className={role === 'caregiver' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="caregiver"
              checked={role === 'caregiver'}
              disabled={profileSaved}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span>
              <strong>ผู้ดูแล</strong>
              <small>ต้องการค้นหางานดูแล</small>
            </span>
          </label>
        </div>
      </fieldset>

      {role === 'caregiver' && (
        <section className="profile-setup-avatar" aria-label="รูปโปรไฟล์ผู้ดูแล">
          <CaregiverAvatar name={firstName} url={avatarPreview} className="caregiver-avatar-preview" />
          <div>
            <strong>รูปโปรไฟล์ (ไม่บังคับ)</strong>
            <p>ผู้ว่าจ้างจะเห็นรูปหลังยืนยันตัวตนแล้ว เลือกและครอบภาพได้ตอนนี้ หรือเพิ่มภายหลัง</p>
            <label className="caregiver-avatar-upload">
              {avatarFile ? 'เปลี่ยนรูปที่เลือก' : 'เลือกรูป'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="เลือกรูปโปรไฟล์ผู้ดูแล"
                onChange={chooseAvatar}
                disabled={loading}
              />
            </label>
            {avatarFile && (
              <button type="button" className="secondary-button" onClick={() => { setAvatarFile(null); setAvatarPreview('') }}>
                เอารูปที่เลือกออก
              </button>
            )}
            <small>JPG, PNG หรือ WebP ไม่เกิน 10 MB · ระบบจะบันทึกเป็นภาพสี่เหลี่ยมจัตุรัส</small>
          </div>
        </section>
      )}

      <div className="profile-form-row">
        <div className="profile-field">
          <label htmlFor="profile-first-name">
            ชื่อ <span>*</span>
          </label>
          <input
            id="profile-first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            placeholder="ชื่อจริง"
            required
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-last-name">
            นามสกุล <span>*</span>
          </label>
          <input
            id="profile-last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            placeholder="นามสกุล"
            required
          />
        </div>
      </div>

      <div className="profile-form-row">
        <div className="profile-field">
          <label htmlFor="profile-phone">
            เบอร์โทรศัพท์ <span>*</span>
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            inputMode="numeric"
            maxLength={10}
            pattern="[0-9]{9,10}"
            title="กรอกเบอร์โทรศัพท์ 9–10 หลัก"
            autoComplete="tel"
            placeholder="08XXXXXXXX"
            required
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-line-id">
            Line ID <small>(ไม่บังคับ)</small>
          </label>
          <input
            id="profile-line-id"
            type="text"
            value={lineId}
            onChange={(event) => setLineId(event.target.value)}
            placeholder="Line ID"
          />
        </div>
      </div>

      <section
        className="profile-address-section"
        aria-labelledby="profile-address-heading"
      >
        <h3 id="profile-address-heading">พื้นที่อยู่อาศัย</h3>
        <div className="profile-location-grid">
          <div className="profile-field">
            <label htmlFor="profile-province">
              จังหวัด <span>*</span>
            </label>
            <select
              id="profile-province"
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
          </div>

          <div className="profile-field">
            <label htmlFor="profile-district">
              อำเภอ/เขต <span>*</span>
            </label>
            <select
              id="profile-district"
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
          </div>

          <div className="profile-field">
            <label htmlFor="profile-subdistrict">
              ตำบล/แขวง <span>*</span>
            </label>
            <select
              id="profile-subdistrict"
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
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-address-detail">
            รายละเอียดที่อยู่ <span>*</span>
          </label>
          <textarea
            id="profile-address-detail"
            value={addressDetail}
            onChange={(event) => setAddressDetail(event.target.value)}
            autoComplete="street-address"
            placeholder="บ้านเลขที่ ถนน หรือรายละเอียดเพิ่มเติม"
            required
          />
        </div>
      </section>

      {error && <p role="alert">{error}</p>}
      {profileSaved && caregiverSaved && <button type="button" className="profile-skip-avatar" onClick={onProfileCreated}>ไปหน้าโปรไฟล์ก่อน</button>}

      <button
        className="profile-submit-button"
        type="submit"
        disabled={loading}
      >
        {loading ? 'กำลังบันทึก...' : profileSaved ? 'ลองบันทึกต่อ' : 'บันทึกและเริ่มใช้งาน'}
      </button>
      {selectedImage && (
        <AvatarCropper
          file={selectedImage}
          onCancel={() => setSelectedImage(null)}
          onConfirm={(cropped) => {
            setAvatarFile(cropped)
            setAvatarPreview(URL.createObjectURL(cropped))
            setSelectedImage(null)
          }}
        />
      )}
    </form>
  )
}

export default ProfileSetupForm
