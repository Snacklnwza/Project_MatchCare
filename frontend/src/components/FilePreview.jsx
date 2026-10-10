export default function FilePreview({ file, url }) {
  if (!file) return null
  return (
    <div className="document-preview">
      <p>
        <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB
      </p>
      {url &&
        (file.type === 'application/pdf' ? (
          <a href={url} target="_blank" rel="noreferrer">
            เปิดตรวจ PDF ก่อนส่ง (แท็บใหม่)
          </a>
        ) : (
          <img src={url} alt="ตัวอย่างเอกสารที่เลือก ยังไม่ได้ส่ง" />
        ))}
    </div>
  )
}
