import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'

export const UnsavedChangesContext = createContext(null)

export default function useUnsavedChanges(dirty) {
  const register = useContext(UnsavedChangesContext)
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])
  useEffect(() => {
    const unregister = register?.(
      () =>
        !dirtyRef.current ||
        window.confirm(
          'มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่?',
        ),
    )
    const beforeUnload = (event) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      unregister?.()
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [register])
  const confirmDiscard = useCallback(
    () =>
      !dirtyRef.current ||
      window.confirm(
        'มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่?',
      ),
    [],
  )
  const markSaved = useCallback(() => {
    dirtyRef.current = false
  }, [])
  return { confirmDiscard, markSaved }
}
