import { createContext, useContext, useEffect } from 'react'

export const PageTargetContext = createContext(null)

export default function useRevealItem(rows, type, idField) {
  const target = useContext(PageTargetContext)
  const matching = !target
    ? null
    : target.source_type === type
      ? rows.find((row) => String(row[idField]) === String(target.source_id))
      : type === 'request' && target.source_type === 'job'
        ? rows.find(
            (row) =>
              row.status === 'accepted' &&
              String(row.job_post_id) === String(target.source_id),
          )
        : null
  const targetId = matching?.[idField] ?? null
  useEffect(() => {
    if (targetId === null) return
    const element = document.getElementById(`${type}-${targetId}`)
    if (!element) return
    element.scrollIntoView({
      block: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
    element.focus({ preventScroll: true })
  }, [rows, target, type, targetId])
  return targetId
}
