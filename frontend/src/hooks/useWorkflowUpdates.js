import { useEffect, useId } from 'react'
import { supabase } from '../lib/supabase'

export default function useWorkflowUpdates(reload) {
  const id = useId()
  useEffect(() => {
    let pending
    const refresh = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(reload, 150)
    }
    const visible = () => { if (!document.hidden) refresh() }
    // notifications ใช้ RLS ของผู้รับ ไม่ติดตามคำขอหรือข้อมูลของบัญชีอื่น
    const channel = supabase.channel(`work-updates:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, refresh)
      .subscribe()
    const timer = window.setInterval(visible, 30000)
    window.addEventListener('focus', visible)
    document.addEventListener('visibilitychange', visible)
    return () => {
      window.clearTimeout(pending)
      window.clearInterval(timer)
      window.removeEventListener('focus', visible)
      document.removeEventListener('visibilitychange', visible)
      supabase.removeChannel(channel)
    }
  }, [id, reload])
}
