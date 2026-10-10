import { useCallback, useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { loadCatalog } from '../lib/catalog'
import { supabase } from '../lib/supabase'

// แยกการตั้งเกณฑ์จับคู่ออกจากฟอร์มชื่อแท็ก เพื่อไม่ให้ฟอร์มซ้อนกัน
export default function ConditionSkillsEditor() {
  const loader = useCallback(async () => {
    const [conditions, skills, links] = await Promise.all([
      loadCatalog('conditions'), loadCatalog('skills'), supabase.from('condition_skills').select('condition_id, skill_id'),
    ])
    if (links.error) throw links.error
    return [{ conditions, skills, links: links.data ?? [] }]
  }, [])
  const { data, loading, error, reload } = useRemoteList(loader)
  const [selected, setSelected] = useState(null)
  const [skillIds, setSkillIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const busy = useRef(false)
  const catalog = data[0]

  async function save(event) {
    event.preventDefault()
    if (busy.current || !selected) return
    busy.current = true
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      const { error: issue } = await supabase.rpc('save_condition_skills', {
        p_condition_id: selected, p_skill_ids: skillIds,
      })
      if (issue) throw issue
      setSelected(null)
      setMessage('บันทึกเกณฑ์จับคู่แล้ว')
      reload()
    } catch {
      setSaveError('บันทึกไม่ได้ กรุณาตรวจว่ารายการยังเปิดใช้งาน แล้วลองอีกครั้ง')
    } finally { busy.current = false; setSaving(false) }
  }

  return <section className="workflow-card condition-skills-editor">
    <h2>ทักษะที่เกี่ยวข้องกับสภาวะการดูแล</h2>
    <button type="button" className="secondary-button" disabled={saving || loading} onClick={() => { setSelected(null); reload() }}>โหลดรายการล่าสุด</button>
    <p>เลือกทักษะที่ใช้เป็นเกณฑ์แนะนำผู้ดูแล หากไม่เลือก ระบบจะคิดคะแนนจากทักษะในประกาศ</p>
    {message && <p role="status">{message}</p>}
    {saveError && <p role="alert">{saveError}</p>}
    {loading ? <p role="status">กำลังโหลดเกณฑ์...</p> : error ? <div role="alert"><p>{error}</p><button onClick={reload}>ลองอีกครั้ง</button></div> : catalog && <>
      <label>สภาวะการดูแล<select disabled={saving} value={selected ?? ''} onChange={event => {
        const id = event.target.value ? Number(event.target.value) : null
        setSelected(id)
        setSkillIds(catalog.links.filter(link => link.condition_id === id).map(link => link.skill_id)
          .filter(skillId => catalog.skills.some(skill => skill.id === skillId && skill.is_active)))
        setSaveError(''); setMessage('')
      }}><option value="">เลือกสภาวะที่ต้องการตั้งเกณฑ์</option>
        {catalog.conditions.filter(item => item.is_active).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      {selected && <form onSubmit={save}>
        <fieldset disabled={saving} className="catalog-fields condition-skills-options"><legend>ทักษะที่เกี่ยวข้อง</legend>
          {catalog.skills.filter(item => item.is_active).map(skill => <label key={skill.id}>
            <input type="checkbox" checked={skillIds.includes(skill.id)} onChange={event => setSkillIds(ids =>
              event.target.checked ? [...ids, skill.id] : ids.filter(id => id !== skill.id))} /> {skill.name}
          </label>)}
          <button type="submit">{saving ? 'กำลังบันทึก...' : 'บันทึกเกณฑ์จับคู่'}</button>
        </fieldset>
      </form>}
    </>}
  </section>
}
