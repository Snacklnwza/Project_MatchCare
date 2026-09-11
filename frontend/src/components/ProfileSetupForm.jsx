import { useState } from 'react'
import { supabase } from '../lib/supabase'
import geography from '../data/geography.json'

const provinces = [
  ...new Set(geography.map((location) => location.provinceNameTh)),
]

function ProfileSetupForm({ userId, onProfileCreated }) {
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
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>ตั้งค่าโปรไฟล์</h2>
      <p>กรอกข้อมูลส่วนตัวก่อนเริ่มใช้งาน MatchCare</p>
      <fieldset>
        <legend>เลือกประเภทบัญชี</legend>

        <label>
          <input
            type="radio"
            name="role"
            value="employer"
            checked={role === 'employer'}
            onChange={(event) => setRole(event.target.value)}
            required
          />
          ผู้ว่าจ้าง
        </label>

        <label>
          <input
            type="radio"
            name="role"
            value="caregiver"
            checked={role === 'caregiver'}
            onChange={(event) => setRole(event.target.value)}
            required
          />
          ผู้ดูแล
        </label>
      </fieldset>
      <label htmlFor="profile-first-name">ชื่อ</label>
      <input
        id="profile-first-name"
        type="text"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        autoComplete="given-name"
        required
      />

      <label htmlFor="profile-last-name">นามสกุล</label>
      <input
        id="profile-last-name"
        type="text"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        autoComplete="family-name"
        required
      />
      <label htmlFor="profile-phone">เบอร์โทรศัพท์</label>
      <input
        id="profile-phone"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        autoComplete="tel"
        required
      />

      <label htmlFor="profile-line-id">Line ID (ไม่บังคับ)</label>
      <input
        id="profile-line-id"
        type="text"
        value={lineId}
        onChange={(event) => setLineId(event.target.value)}
      />

      <label htmlFor="profile-province">จังหวัด</label>
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

      <label htmlFor="profile-district">อำเภอ/เขต</label>
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

      <label htmlFor="profile-subdistrict">ตำบล/แขวง</label>
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

      <label htmlFor="profile-address-detail">รายละเอียดที่อยู่</label>
      <textarea
        id="profile-address-detail"
        value={addressDetail}
        onChange={(event) => setAddressDetail(event.target.value)}
        autoComplete="street-address"
        required
      />
      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
      </button>
    </form>
  )
}

export default ProfileSetupForm