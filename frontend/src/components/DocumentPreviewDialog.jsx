import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

export default function DocumentPreviewDialog({ document: item, onClose }) {
  const dialog = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let cancelled = false
    let url
    dialog.current.showModal()
    async function load() {
      try {
        const { data, error } = await supabase.storage
          .from('caregiver-documents')
          .download(item.storage_path)
        if (error) throw error
        if (cancelled) return
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(data.type))
          throw new Error('unsupported')
        url = URL.createObjectURL(data)
        setPreview({ url, type: data.type })
      } catch {
        if (!cancelled)
          setError('เปิดตัวอย่างไม่สำเร็จ กรุณาปิดแล้วใช้ปุ่มดาวน์โหลด')
      }
    }
    load()
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [item])
  return createPortal(
    <dialog
      ref={dialog}
      className="policy-dialog document-preview-dialog"
      aria-labelledby="document-preview-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <h2 id="document-preview-title">{item.original_file_name}</h2>
      {!preview && !error && <p role="status">กำลังโหลดเอกสาร...</p>}
      {error && <p role="alert">{error}</p>}
      {preview &&
        (preview.type === 'application/pdf' ? (
          <iframe src={preview.url} title="ตัวอย่างเอกสาร PDF" />
        ) : (
          <img src={preview.url} alt="เอกสารที่ส่งตรวจ" />
        ))}
      <button type="button" onClick={onClose}>
        ปิดตัวอย่าง
      </button>
    </dialog>,
    window.document.body,
  )
}
