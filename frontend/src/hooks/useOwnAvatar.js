import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { avatarChangedEvent, signedAvatarUrl } from '../lib/caregiverAvatars'

export default function useOwnAvatar(caregiverId) {
  const [avatar, setAvatar] = useState(null)
  useEffect(() => {
    if (!caregiverId) return undefined
    let active = true
    let revision = 0
    async function refresh() {
      const current = ++revision
      try {
        const { data, error } = await supabase.from('caregiver_profiles')
          .select('avatar_path').eq('caregiver_id', caregiverId).maybeSingle()
        if (error) throw error
        const url = await signedAvatarUrl(data?.avatar_path)
        if (active && current === revision) setAvatar({ caregiverId, url })
      } catch {
        if (active && current === revision) setAvatar({ caregiverId, url: '' })
      }
    }
    const changed = event => {
      if (event.detail?.caregiverId === caregiverId) refresh()
    }
    const visible = () => { if (!document.hidden) refresh() }
    refresh()
    // URL รูปมีอายุหนึ่งชั่วโมง จึงขอใหม่ก่อนหมดอายุและเมื่อกลับมาเปิดแท็บ
    const timer = window.setInterval(refresh, 50 * 60 * 1000)
    window.addEventListener(avatarChangedEvent, changed)
    document.addEventListener('visibilitychange', visible)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener(avatarChangedEvent, changed)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [caregiverId])
  return avatar?.caregiverId === caregiverId ? avatar.url : ''
}
