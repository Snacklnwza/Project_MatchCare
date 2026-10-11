import { useState } from 'react'
import '../styles/SkillPicker.css'

function SkillPicker({ skills, selectedIds, onToggle }) {
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase('th-TH')
  const visible = skills
    .filter((skill) => skill.is_active || selectedIds.includes(skill.id))
    .filter((skill) => skill.name.toLocaleLowerCase('th-TH').includes(search))
    .sort((a, b) => Number(selectedIds.includes(b.id)) - Number(selectedIds.includes(a.id)))

  return (
    <div className="skill-picker">
      <div className="skill-picker-toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาทักษะ เช่น อาบน้ำ รถเข็น"
          aria-label="ค้นหาทักษะการดูแล"
        />
        <span aria-live="polite">เลือกแล้ว {selectedIds.length} ทักษะ</span>
      </div>
      {visible.length ? (
        <div className="skill-picker-options">
          {visible.map((skill) => (
            <label key={skill.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(skill.id)}
                disabled={!skill.is_active}
                onChange={() => onToggle(skill.id)}
              />
              <span>{skill.name}{!skill.is_active && ' (ปิดใช้งานแล้ว · เก็บข้อมูลเดิม)'}</span>
            </label>
          ))}
        </div>
      ) : <p className="skill-picker-empty">ไม่พบทักษะที่ค้นหา</p>}
    </div>
  )
}

export default SkillPicker
