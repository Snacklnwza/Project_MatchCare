import { useId, useState } from 'react'
import { groupSkills } from '../lib/skillCategories'
import '../styles/SkillPicker.css'

function SkillPicker({ skills, selectedIds, onToggle }) {
  const [query, setQuery] = useState('')
  const [expandedGroup, setExpandedGroup] = useState(null)
  const pickerId = useId()
  const search = query.trim().toLocaleLowerCase('th-TH')
  const selected = skills.filter(skill => selectedIds.includes(skill.id))
  const visible = skills
    .filter((skill) => skill.is_active || selectedIds.includes(skill.id))
    .filter((skill) => skill.name.toLocaleLowerCase('th-TH').includes(search))
  const groups = groupSkills(visible)

  return (
    <div className="skill-picker">
      <div className="skill-picker-selected" aria-label="ทักษะที่เลือก">
        <strong>ทักษะที่เลือก ({selectedIds.length})</strong>
        {selected.length ? <ul>
          {selected.map(skill => <li key={skill.id}>
            <span>{skill.name}{!skill.is_active && ' (ปิดใช้งานแล้ว)'}</span>
            <button type="button" aria-label={`เอาทักษะ ${skill.name} ออก`} onClick={() => onToggle(skill.id)}>×</button>
          </li>)}
        </ul> : <p>ยังไม่ได้เลือกทักษะ เลือกจากหมวดด้านล่างหรือค้นหา</p>}
      </div>
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
        <div className="skill-picker-groups">
          {groups.map(group => {
            const open = Boolean(search) || (expandedGroup ?? groups[0].id) === group.id
            return <section className="skill-picker-group" key={group.id}>
              <h4><button type="button" aria-expanded={open} aria-controls={`${pickerId}-${group.id}`}
                onClick={() => setExpandedGroup(open ? '' : group.id)}>
                <span>{group.name} <small>เลือก {group.skills.filter(skill => selectedIds.includes(skill.id)).length}/{group.skills.length}</small></span>
                <span aria-hidden="true">{open ? '−' : '+'}</span>
              </button></h4>
              {open && <div className="skill-picker-options" id={`${pickerId}-${group.id}`}>
          {group.skills.map((skill) => (
            <label key={skill.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(skill.id)}
                disabled={!skill.is_active && !selectedIds.includes(skill.id)}
                onChange={() => onToggle(skill.id)}
              />
              <span>{skill.name}{!skill.is_active && ' (ปิดใช้งานแล้ว · เก็บข้อมูลเดิม)'}</span>
            </label>
          ))}
              </div>}
            </section>
          })}
        </div>
      ) : <p className="skill-picker-empty">ไม่พบทักษะที่ค้นหา</p>}
    </div>
  )
}

export default SkillPicker
