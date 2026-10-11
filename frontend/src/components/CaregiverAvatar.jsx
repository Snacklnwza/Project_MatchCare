export default function CaregiverAvatar({ name, url, className = '' }) {
  return (
    <span className={`caregiver-avatar ${className}`} aria-hidden="true">
      {url ? <img src={url} alt="" /> : name?.trim().charAt(0) || 'ผ'}
    </span>
  )
}
