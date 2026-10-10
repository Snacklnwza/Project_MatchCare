import { useState } from 'react'

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-field">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        disabled={props.disabled}
        aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? 'ซ่อน' : 'แสดง'}
      </button>
    </div>
  )
}
