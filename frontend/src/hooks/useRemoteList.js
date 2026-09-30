import { useEffect, useState, useCallback } from 'react'

// loader ต้องมี reference คงที่ (ประกาศนอก component หรือใช้ useCallback)
export default function useRemoteList(loader) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    setVersion((value) => value + 1)
  }, [])
  useEffect(() => {
    let active = true
    loader()
      .then((rows) => {
        if (active) setData(rows ?? [])
      })
      .catch(() => {
        if (active) setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loader, version])
  return { data, loading, error, reload }
}
