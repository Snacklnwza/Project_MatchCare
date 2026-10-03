import { useEffect, useState, useCallback } from 'react'

// loader ต้องมี reference คงที่ (ประกาศนอก component หรือใช้ useCallback)
export default function useRemoteList(loader) {
  const [result, setResult] = useState({ loader: null, version: -1, data: [], error: '' })
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => {
    setVersion((value) => value + 1)
  }, [])
  useEffect(() => {
    let active = true
    Promise.resolve().then(loader)
      .then((rows) => {
        if (active) setResult({ loader, version, data: rows ?? [], error: '' })
      })
      .catch(() => {
        if (active) setResult({ loader, version, data: [], error: 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่' })
      })
    return () => {
      active = false
    }
  }, [loader, version])
  // ผลเก่าไม่ใช่ผลของหน้า/ตัวกรองปัจจุบัน จึงแสดง loading จนได้ผลชุดใหม่
  const loading = result.loader !== loader || result.version !== version
  return { data: loading ? [] : result.data, loading, error: loading ? '' : result.error, reload }
}
