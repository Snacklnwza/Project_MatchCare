import { useEffect, useRef, useState } from 'react'
import { cropPlacement } from '../lib/avatarCrop'
import '../styles/AvatarCropper.css'

const SIZE = 320
const OUTPUT_SIZE = 512

function drawCrop(canvas, image, zoom, horizontal, vertical) {
  const size = canvas.width
  const { x, y, width, height } = cropPlacement(
    size, image.width, image.height, zoom, horizontal, vertical,
  )
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, size, size)
  context.drawImage(image, x, y, width, height)
}

function AvatarCropper({ file, onCancel, onConfirm, busy = false }) {
  const canvasRef = useRef(null)
  const cancelRef = useRef(null)
  const dialogRef = useRef(null)
  const [image, setImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [horizontal, setHorizontal] = useState(0)
  const [vertical, setVertical] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const previous = document.activeElement
    cancelRef.current?.focus()
    function handleKey(event) {
      if (event.key === 'Escape' && !busy) onCancel()
      if (event.key !== 'Tab') return
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled)')]
      if (!focusable.length) return
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault()
        focusable.at(-1).focus()
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault()
        focusable[0].focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previous?.focus?.()
    }
  }, [busy, onCancel])

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const loaded = new Image()
    loaded.onload = () => setImage(loaded)
    loaded.onerror = () => setError('เปิดรูปไม่สำเร็จ กรุณาเลือกรูปใหม่')
    loaded.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCrop(canvasRef.current, image, zoom, horizontal, vertical)
    }
  }, [image, zoom, horizontal, vertical])

  async function confirmCrop() {
    if (!image || busy) return
    setError('')
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    drawCrop(canvas, image, zoom, horizontal, vertical)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
    if (!blob) {
      setError('ครอบรูปไม่สำเร็จ กรุณาลองใหม่')
      return
    }
    onConfirm(new File([blob], 'profile.jpg', { type: 'image/jpeg' }))
  }

  return (
    <div className="avatar-crop-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section ref={dialogRef} className="avatar-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
        <h2 id="avatar-crop-title">จัดตำแหน่งรูปโปรไฟล์</h2>
        <p>ปรับภาพให้ใบหน้าอยู่ในวงกลมก่อนบันทึก</p>
        <div className="avatar-crop-preview">
          <canvas ref={canvasRef} width={SIZE} height={SIZE} aria-label="ตัวอย่างรูปโปรไฟล์ที่ครอบแล้ว" role="img" />
          <span aria-hidden="true" />
        </div>
        <label>ขยายภาพ
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
        </label>
        <label>เลื่อนซ้าย–ขวา
          <input type="range" min="-1" max="1" step="0.01" value={horizontal} onChange={(event) => setHorizontal(Number(event.target.value))} />
        </label>
        <label>เลื่อนขึ้น–ลง
          <input type="range" min="-1" max="1" step="0.01" value={vertical} onChange={(event) => setVertical(Number(event.target.value))} />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="avatar-crop-actions">
          <button ref={cancelRef} type="button" className="secondary-button" disabled={busy} onClick={onCancel}>ยกเลิก</button>
          <button type="button" className="primary-button" disabled={!image || busy} onClick={confirmCrop}>
            {busy ? 'กำลังบันทึก...' : 'ใช้รูปนี้'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AvatarCropper
