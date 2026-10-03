import { useCallback, useRef, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import { catalogError, catalogLabels, loadCatalog, saveCatalogItem } from '../lib/catalog'
import '../styles/Catalog.css'

export default function AdminCatalog() {
  const [kind, setKind] = useState('skills')
  return (
    <section className="workflow-page">
      <header>
        <p className="workflow-eyebrow">สำหรับผู้ดูแลระบบ</p>
        <h1>จัดการคลังกลาง</h1>
        <p>ดูแลรายการทักษะและสภาวะการดูแลที่ใช้ในโปรไฟล์ ผู้ป่วย และประกาศงาน</p>
      </header>
      <div className="workflow-actions catalog-tabs" aria-label="ประเภทคลังกลาง">
        {Object.entries(catalogLabels).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={kind === value}
            className={kind === value ? '' : 'secondary-button'} onClick={() => setKind(value)}>{label}</button>
        ))}
      </div>
      <CatalogEditor key={kind} kind={kind} />
    </section>
  )
}

function CatalogEditor({ kind }) {
  const loader = useCallback(() => loadCatalog(kind), [kind])
  const { data, loading, error, reload } = useRemoteList(loader)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [message, setMessage] = useState('')
  const busy = useRef(false)
  const nameInput = useRef(null)
  const visible = data.filter(item => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
    (status === 'all' || item.is_active === (status === 'active')))

  function resetForm() {
    setEditing(null)
    setName('')
    setDescription('')
    setSaveError('')
  }

  async function save(event) {
    event.preventDefault()
    if (busy.current) return
    setSaveError('')
    setMessage('')
    if (!name.trim()) { setSaveError('กรุณากรอกชื่อรายการ'); return }
    busy.current = true
    setSaving(true)
    try {
      await saveCatalogItem(kind, editing?.id, { name: name.trim(), description: description.trim() || null })
      setMessage(editing ? 'แก้ไขรายการแล้ว' : 'เพิ่มรายการแล้ว')
      resetForm()
      reload()
    } catch (issue) { setSaveError(catalogError(issue)) }
    finally { busy.current = false; setSaving(false) }
  }

  async function toggleActive(item) {
    if (busy.current || !window.confirm(item.is_active
      ? `ปิดใช้งาน “${item.name}”? รายการจะไม่เป็นตัวเลือกใหม่ แต่ข้อมูลเดิมยังอ่านได้`
      : `เปิดใช้งาน “${item.name}” อีกครั้ง?`)) return
    busy.current = true
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      await saveCatalogItem(kind, item.id, { is_active: !item.is_active })
      setMessage(item.is_active ? 'ปิดใช้งานแล้ว ข้อมูลที่เคยอ้างอิงยังคงอยู่' : 'เปิดใช้งานรายการแล้ว')
      reload()
    } catch (issue) { setSaveError(catalogError(issue)) }
    finally { busy.current = false; setSaving(false) }
  }

  return (
    <>
      {message && <p role="status">{message}</p>}
      {saveError && <p role="alert">{saveError}</p>}
      <div className="catalog-layout">
        <section className="workflow-card">
          <h2>{editing ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h2>
          <p className="workflow-hint">{catalogLabels[kind]} · รายการใหม่เปิดใช้งานโดยอัตโนมัติ</p>
          <form onSubmit={save}>
            <fieldset disabled={saving} className="catalog-fields">
              <label htmlFor="catalog-name">ชื่อรายการ <span aria-hidden="true">*</span></label>
              <input ref={nameInput} id="catalog-name" value={name} onChange={e => setName(e.target.value)} required maxLength={120} />
              <label htmlFor="catalog-description">คำอธิบาย (ไม่บังคับ)</label>
              <textarea id="catalog-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} />
              <div className="workflow-actions">
                <button type="submit">{saving ? 'กำลังบันทึก...' : 'บันทึกรายการ'}</button>
                {editing && <button type="button" className="secondary-button" onClick={resetForm}>ยกเลิกการแก้ไข</button>}
              </div>
            </fieldset>
          </form>
        </section>
        <section className="workflow-card" aria-label="รายการในคลังกลาง">
          <h2>{catalogLabels[kind]}</h2>
          <div className="catalog-filters">
            <label>ค้นหาชื่อ<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
            <label>สถานะ<select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">ทั้งหมด</option><option value="active">เปิดใช้งาน</option><option value="inactive">ปิดใช้งาน</option>
            </select></label>
          </div>
          {loading && <p role="status">กำลังโหลดคลังกลาง...</p>}
          {error && <div role="alert"><p>{error}</p><button type="button" onClick={reload}>ลองอีกครั้ง</button></div>}
          {!loading && !error && <>
            <p className="workflow-hint">พบ {visible.length} รายการ</p>
            {visible.length === 0 && <p>ไม่พบรายการ ลองเปลี่ยนคำค้นหรือเพิ่มรายการใหม่</p>}
            <ul className="catalog-list">
              {visible.map(item => <li key={item.id}>
                <div><strong>{item.name}</strong><span className="workflow-badge">{item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                  {item.description && <p>{item.description}</p>}</div>
                <div className="workflow-actions">
                  <button type="button" className="secondary-button" disabled={saving} aria-label={`แก้ไข ${item.name}`}
                    onClick={() => { setEditing(item); setName(item.name); setDescription(item.description ?? ''); setSaveError(''); setMessage(''); nameInput.current?.focus() }}>แก้ไข</button>
                  <button type="button" className="secondary-button" disabled={saving} onClick={() => toggleActive(item)}
                    aria-label={`${item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} ${item.name}`}>{item.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button>
                </div>
              </li>)}
            </ul>
          </>}
        </section>
      </div>
    </>
  )
}
