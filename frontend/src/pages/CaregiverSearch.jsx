import { useCallback, useState } from 'react'
import geography from '../data/geography-options.json'
import useRemoteList from '../hooks/useRemoteList'
import { searchCaregivers, CAREGIVER_PAGE_SIZE } from '../lib/caregivers'
import { loadJobSkillOptions } from '../lib/openJobs'
import '../styles/CaregiverSearch.css'

const provinces = Object.keys(geography).sort((a, b) => a.localeCompare(b, 'th'))
const emptyFilters = { province: '', district: '', skillId: '', minExperience: '', maxExperience: '' }

export default function CaregiverSearch({ onNavigate }) {
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [page, setPage] = useState(0)
  const [filterError, setFilterError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const loader = useCallback(() => searchCaregivers(appliedFilters, page), [appliedFilters, page])
  const { data: results, loading, error, reload } = useRemoteList(loader)
  const { data: skills, loading: skillsLoading, error: skillsError, reload: reloadSkills } = useRemoteList(loadJobSkillOptions)
  const visible = results.slice(0, CAREGIVER_PAGE_SIZE)
  const districts = filters.province ? Object.keys(geography[filters.province] ?? {}) : []

  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value, ...(key === 'province' ? { district: '' } : {}) }))
    setFilterError('')
  }

  function search(event) {
    event.preventDefault()
    const min = filters.minExperience === '' ? null : Number(filters.minExperience)
    const max = filters.maxExperience === '' ? null : Number(filters.maxExperience)
    if ((min !== null && (!Number.isInteger(min) || min < 0 || min > 80)) ||
        (max !== null && (!Number.isInteger(max) || max < 0 || max > 80)) ||
        (min !== null && max !== null && min > max)) {
      setFilterError('ระบุประสบการณ์ 0–80 ปี และให้ค่าสูงสุดไม่น้อยกว่าค่าต่ำสุด')
      return
    }
    setFilterError('')
    setExpandedId(null)
    setPage(0)
    setAppliedFilters({ ...filters })
    reload()
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setFilterError('')
    setExpandedId(null)
    setPage(0)
    reload()
  }

  return (
    <section className="caregiver-search" aria-labelledby="caregiver-search-title">
      <header>
        <h1 id="caregiver-search-title">ค้นหาผู้ดูแล</h1>
        <p>ดูผู้ดูแลที่ยืนยันตัวตนและพร้อมรับงาน แล้วเลือกคนที่เหมาะกับงานของคุณ</p>
      </header>
      <section className="caregiver-search-panel" aria-labelledby="caregiver-filter-heading">
        <div className="caregiver-search-heading">
          <h2 id="caregiver-filter-heading">ตัวกรอง</h2>
          <button type="button" className="caregiver-search-link" onClick={clearFilters}>ล้างตัวกรอง</button>
        </div>
        <form onSubmit={search}>
          <div className="caregiver-search-fields">
            <label>ทักษะ
              <select value={filters.skillId} disabled={skillsLoading || !!skillsError}
                onChange={(event) => update('skillId', event.target.value)}>
                <option value="">ทุกทักษะ</option>
                {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
              </select>
            </label>
            <label>จังหวัด
              <select value={filters.province} onChange={(event) => update('province', event.target.value)}>
                <option value="">ทุกจังหวัด</option>
                {provinces.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>อำเภอ/เขต
              <select value={filters.district} disabled={!filters.province}
                onChange={(event) => update('district', event.target.value)}>
                <option value="">ทุกอำเภอ/เขต</option>
                {districts.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>ประสบการณ์ขั้นต่ำ (ปี)
              <input type="number" min="0" max="80" step="1" placeholder="ไม่จำกัด"
                value={filters.minExperience} onChange={(event) => update('minExperience', event.target.value)} />
            </label>
            <label>ประสบการณ์สูงสุด (ปี)
              <input type="number" min="0" max="80" step="1" placeholder="ไม่จำกัด"
                value={filters.maxExperience} onChange={(event) => update('maxExperience', event.target.value)} />
            </label>
          </div>
          {filterError && <p className="caregiver-search-error" role="alert">{filterError}</p>}
          {skillsError && <div className="caregiver-search-error" role="alert">โหลดทักษะไม่สำเร็จ <button type="button" onClick={reloadSkills}>ลองอีกครั้ง</button></div>}
          <div className="caregiver-search-actions"><button type="submit" disabled={loading}>ค้นหาผู้ดูแล</button></div>
        </form>
      </section>
      <section aria-labelledby="caregiver-results-heading">
        <div className="caregiver-search-heading">
          <h2 id="caregiver-results-heading">ผลการค้นหา</h2>
          {!loading && !error && <span role="status">{visible.length} คนในหน้านี้</span>}
        </div>
        {loading ? <p role="status">กำลังค้นหาผู้ดูแล...</p> : error ? (
          <div className="caregiver-search-panel" role="alert">
            <p>ค้นหาผู้ดูแลไม่สำเร็จ กรุณาลองอีกครั้ง</p>
            <button type="button" onClick={reload}>ลองอีกครั้ง</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="caregiver-search-panel caregiver-search-empty">
            <h3>ไม่พบผู้ดูแลที่ตรงกับเงื่อนไข</h3>
            <p>ลองเปลี่ยนทักษะ ประสบการณ์ หรือพื้นที่ แล้วค้นหาใหม่</p>
            <button type="button" onClick={clearFilters}>ล้างตัวกรอง</button>
          </div>
        ) : <>
          <ul className="caregiver-search-list">
            {visible.map((caregiver) => (
              <li className="caregiver-search-card" key={caregiver.caregiver_id}>
                <div className="caregiver-search-card-head">
                  <div><h3>{caregiver.display_name}</h3><p>อ.{caregiver.district} จ.{caregiver.province} · ประสบการณ์ {caregiver.experience_years} ปี</p></div>
                  <span className="caregiver-search-badge">ยืนยันแล้ว · พร้อมรับงาน</span>
                </div>
                <div className="caregiver-search-tags" aria-label="ทักษะ">
                  {caregiver.skills?.length ? caregiver.skills.map((skill) => <span key={skill.id}>{skill.name}</span>) : <span>ยังไม่ระบุทักษะ</span>}
                </div>
                <button type="button" className="caregiver-search-link" aria-expanded={expandedId === caregiver.caregiver_id}
                  onClick={() => setExpandedId((id) => id === caregiver.caregiver_id ? null : caregiver.caregiver_id)}>
                  {expandedId === caregiver.caregiver_id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                </button>
                {expandedId === caregiver.caregiver_id && <div className="caregiver-search-detail">
                  <h4>ข้อมูลผู้ดูแล</h4>
                  <p>ประสบการณ์ดูแล {caregiver.experience_years} ปี · พื้นที่ อ.{caregiver.district} จ.{caregiver.province}</p>
                  <p>สถานะ: ยืนยันตัวตนแล้ว และพร้อมรับงาน</p>
                  <p>หากสนใจผู้ดูแลคนนี้ ให้เลือกประกาศงานของคุณเพื่อค้นหาและส่งคำเชิญ</p>
                  <button type="button" onClick={() => onNavigate('jobs')}>ไปที่ประกาศงานของฉัน</button>
                </div>}
              </li>
            ))}
          </ul>
          <nav className="caregiver-search-pages" aria-label="หน้าผลการค้นหา">
            <button type="button" disabled={page === 0} onClick={() => { setPage(page - 1); setExpandedId(null) }}>ก่อนหน้า</button>
            <span>หน้า {page + 1}</span>
            <button type="button" disabled={results.length <= CAREGIVER_PAGE_SIZE}
              onClick={() => { setPage(page + 1); setExpandedId(null) }}>ถัดไป</button>
          </nav>
        </>}
      </section>
    </section>
  )
}
