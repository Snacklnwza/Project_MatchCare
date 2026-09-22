import { useState } from 'react'
import { supabase } from '../lib/supabase'
import geography from '../data/geography.json'
import logo from '../assets/navbar/logo.png'

const provinces = [
  ...new Set(geography.map((location) => location.provinceNameTh)),
]

function ProfileSetupForm({ userId, email, onSignOut, onProfileCreated }) {
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
    setLoading(true)
    setError('')

    try {
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

      if (insertError) {
        throw insertError
      }

      await onProfileCreated()
    } catch (insertError) {
      setError(insertError.message || 'ไม่สามารถสร้างโปรไฟล์ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="profile-setup-form" onSubmit={handleSubmit}>
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
        <span>เข้าสู่ระบบด้วย <strong>{email}</strong></span>
        <button type="button" onClick={onSignOut}>เปลี่ยนบัญชี</button>
      </div>

      <fieldset className="profile-role-options">
        <legend>เลือกประเภทบัญชี <span>*</span></legend>
        <div className="profile-role-grid">
          <label className={role === 'employer' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === 'employer'}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span><strong>ผู้ว่าจ้าง</strong><small>ต้องการค้นหาผู้ดูแล</small></span>
          </label>

          <label className={role === 'caregiver' ? 'selected' : ''}>
            <input
              type="radio"
              name="role"
              value="caregiver"
              checked={role === 'caregiver'}
              onChange={(event) => setRole(event.target.value)}
              required
            />
            <span><strong>ผู้ดูแล</strong><small>ต้องการค้นหางานดูแล</small></span>
          </label>
        </div>
      </fieldset>

      <div className="profile-form-row">
        <div className="profile-field">
          <label htmlFor="profile-first-name">ชื่อ <span>*</span></label>
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
          <label htmlFor="profile-last-name">นามสกุล <span>*</span></label>
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
          <label htmlFor="profile-phone">เบอร์โทรศัพท์ <span>*</span></label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            placeholder="08X-XXX-XXXX"
            required
          />
        </div>

        <div className="profile-field">
          <label htmlFor="profile-line-id">Line ID <small>(ไม่บังคับ)</small></label>
          <input
            id="profile-line-id"
            type="text"
            value={lineId}
            onChange={(event) => setLineId(event.target.value)}
            placeholder="Line ID"
          />
        </div>
      </div>

      <section className="profile-address-section" aria-labelledby="profile-address-heading">
        <h3 id="profile-address-heading">พื้นที่อยู่อาศัย</h3>
        <div className="profile-location-grid">
          <div className="profile-field">
            <label htmlFor="profile-province">จังหวัด <span>*</span></label>
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
                <option key={provinceName} value={provinceName}>{provinceName}</option>
              ))}
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-district">อำเภอ/เขต <span>*</span></label>
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
                <option key={districtName} value={districtName}>{districtName}</option>
              ))}
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-subdistrict">ตำบล/แขวง <span>*</span></label>
            <select
              id="profile-subdistrict"
              value={subdistrict}
              onChange={(event) => setSubdistrict(event.target.value)}
              disabled={!district}
              required
            >
              <option value="">เลือกตำบล/แขวง</option>
              {subdistricts.map((subdistrictName) => (
                <option key={subdistrictName} value={subdistrictName}>{subdistrictName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-address-detail">รายละเอียดที่อยู่ <span>*</span></label>
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

      <button className="profile-submit-button" type="submit" disabled={loading}>
        {loading ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน'}
      </button>
    </form>
  )
}

export default ProfileSetupForm
