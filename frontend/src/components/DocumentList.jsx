import { useCallback, useState } from 'react'
import useRemoteList from '../hooks/useRemoteList'
import {
  loadDocuments,
  downloadDocument,
  documentLabels,
  reviewLabels,
} from '../lib/workflow'

export default function DocumentList({ caregiverId }) {
  const loader = useCallback(() => loadDocuments(caregiverId), [caregiverId])
  const { data, loading, error, reload } = useRemoteList(loader)
  const [downloadError, setDownloadError] = useState('')
  const [downloading, setDownloading] = useState(null)
  async function download(document) {
    setDownloading(document.id)
    setDownloadError('')
    try {
      await downloadDocument(document)
    } catch {
      setDownloadError('ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setDownloading(null)
    }
  }
  if (loading) return <p role="status">กำลังโหลดเอกสาร...</p>
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={reload}>
          ลองอีกครั้ง
        </button>
      </div>
    )
  return (
    <div>
      {downloadError && <p role="alert">{downloadError}</p>}
      {!data.length && <p>ยังไม่มีเอกสารที่ส่งตรวจ</p>}
      <ul className="workflow-list">
        {data.map((document) => (
          <li key={document.id}>
            <div>
              <strong>{documentLabels[document.document_type]}</strong>
              <p>{document.original_file_name}</p>
              <span className="workflow-badge">
                {reviewLabels[document.review_status]}
              </span>
              {document.rejection_reason && (
                <p>เหตุผล: {document.rejection_reason}</p>
              )}
            </div>
            <button
              type="button"
              className="secondary-button"
              disabled={downloading !== null}
              onClick={() => download(document)}
            >
              {downloading === document.id ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
