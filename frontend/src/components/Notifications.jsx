import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatJobDate } from '../lib/jobs'
import '../styles/Notifications.css'

export default function Notifications({ userId, onSelect }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [unread, setUnread] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [connectionWarning, setConnectionWarning] = useState('')
  const [busy, setBusy] = useState(false)
  const root = useRef(null)
  const active = useRef(false)
  const fetching = useRef(false)
  const writing = useRef(false)

  const refresh = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      const [list, count] = await Promise.all([
        supabase
          .from('notifications')
          .select(
            'id, title, target_page, source_type, source_id, created_at, read_at',
          )
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(30),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .is('read_at', null),
      ])
      if (list.error || count.error) throw list.error || count.error
      if (active.current) {
        setRows(list.data ?? [])
        setUnread(count.count ?? 0)
        setError('')
      }
    } catch {
      if (active.current) setError('โหลดการแจ้งเตือนไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      fetching.current = false
      if (active.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    active.current = true
    Promise.resolve().then(refresh)
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        refresh,
      )
      .subscribe((status) => {
        if (!active.current) return
        if (status === 'SUBSCRIBED') {
          setConnectionWarning('')
          refresh()
        } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status))
          setConnectionWarning(
            'การอัปเดตสดขัดข้อง ระบบจะโหลดข้อมูลซ้ำอัตโนมัติ เปิดรายการใหม่เพื่อดูข้อมูลล่าสุดได้',
          )
      })
    // โหลดสำรองเมื่อเน็ตสะดุดหรือแท็บกลับมาเปิด ใช้ข้อมูลจากฐานเสมอ
    const timer = window.setInterval(() => {
      if (!document.hidden) refresh()
    }, 30000)
    const visible = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', visible)
    return () => {
      active.current = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', visible)
      supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        root.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  async function markRead(item) {
    if (writing.current) return
    writing.current = true
    setBusy(true)
    try {
      let query = supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .is('read_at', null)
      if (item) query = query.eq('id', item.id)
      const { error: issue } = await query
      if (issue) throw issue
      await refresh()
      if (item) {
        setOpen(false)
        onSelect(item.target_page, item)
      }
    } catch {
      setError('ทำเครื่องหมายว่าอ่านแล้วไม่ได้ กรุณาลองอีกครั้ง')
    } finally {
      writing.current = false
      setBusy(false)
    }
  }

  return (
    <div className="notifications" ref={root}>
      <button
        type="button"
        className="notification-toggle"
        aria-label={`การแจ้งเตือน${unread ? ` ยังไม่อ่าน ${unread} รายการ` : ''}`}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={() => {
          setOpen((value) => !value)
          refresh()
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3V8ZM10 21h4" />
        </svg>
        {unread > 0 && (
          <span className="notification-count" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && (
        <section
          id="notification-panel"
          className="notification-panel"
          aria-label="การแจ้งเตือน"
        >
          <div className="notification-heading">
            <h2>การแจ้งเตือน</h2>
            <button
              type="button"
              className="secondary-button"
              disabled={busy || !unread}
              onClick={() => markRead(null)}
            >
              อ่านทั้งหมดแล้ว
            </button>
          </div>
          {loading && <p role="status">กำลังโหลด...</p>}
          {connectionWarning && (
            <p role="status" className="workflow-hint">
              {connectionWarning}
            </p>
          )}
          {error && (
            <div role="alert">
              <p>{error}</p>
              <button type="button" onClick={refresh}>
                ลองอีกครั้ง
              </button>
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <p>ยังไม่มีการแจ้งเตือน</p>
          )}
          <ul className="notification-list">
            {rows.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`notification-item${item.read_at ? '' : ' unread'}`}
                  disabled={busy}
                  onClick={() => markRead(item)}
                >
                  <span>{item.title}</span>
                  <small>
                    {item.source_type === 'job' ? 'งาน' : 'คำขอ'} #
                    {item.source_id}
                  </small>
                  <small>
                    {formatJobDate(item.created_at)}
                    {!item.read_at && ' · ยังไม่อ่าน'}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {rows.length === 30 && (
            <p className="workflow-hint">
              แสดง 30 รายการล่าสุด
              ดูรายละเอียดงานทั้งหมดได้ในเมนูคำขอและประวัติงาน
            </p>
          )}
        </section>
      )}
    </div>
  )
}
