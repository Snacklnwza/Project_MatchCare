import { requestMatches, requestStatus } from '../lib/requestStatus'

const filters = {
  current: 'รายการปัจจุบัน',
  waiting: 'รอคำตอบ',
  active: 'งานที่ตอบรับแล้ว',
  ended: 'สิ้นสุดแล้ว',
  all: 'ทั้งหมด',
}

export default function RequestFilters({ data, value, onChange }) {
  return (
    <div className="request-filters" role="group" aria-label="กรองสถานะรายการ">
      {Object.entries(filters).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className="secondary-button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label}{' '}
          <span>
            {data.filter((request) => requestMatches(request, key)).length}
          </span>
        </button>
      ))}
    </div>
  )
}

export function RequestBadge({ request, labels }) {
  const state = requestStatus(request, labels)
  return (
    <span className="workflow-badge" data-status={state.status}>
      {state.label}
    </span>
  )
}
