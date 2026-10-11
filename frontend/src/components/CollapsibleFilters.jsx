import { useId, useState } from 'react'

export default function CollapsibleFilters({ count, children }) {
  const id = useId()
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="collapsible-filters">
      <button
        type="button"
        className="mobile-filter-toggle"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'ซ่อนตัวกรอง' : 'เปิดตัวกรอง'}
        {count > 0 ? ` · ใช้อยู่ ${count} เงื่อนไข` : ' · ทุกพื้นที่'}
      </button>
      <div
        id={id}
        className="collapsible-filter-content"
        data-expanded={expanded}
      >
        {children}
      </div>
    </div>
  )
}
