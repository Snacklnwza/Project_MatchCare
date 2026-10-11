import { useEffect, useState } from 'react'
import { loadCaregiverAvatarUrls } from '../lib/caregiverAvatars'

export default function useCaregiverAvatars(ids) {
  const [urls, setUrls] = useState({})
  const key = ids.join(',')
  useEffect(() => {
    let active = true
    if (!key) return undefined
    loadCaregiverAvatarUrls(key.split(','))
      .then((loaded) => { if (active) setUrls(loaded) })
      .catch(() => { if (active) setUrls({}) })
    return () => { active = false }
  }, [key])
  return urls
}
