import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createId } from '@/utils/id'
import { ToastContext } from './ToastContext'
import styles from './Toast.module.css'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const DURATION = 3500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (tone, title, description) => {
      const id = createId('toast')
      setToasts((current) => [...current, { id, tone, title, description }])
      setTimeout(() => dismiss(id), DURATION)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (title, description) => show('success', title, description),
      error: (title, description) => show('error', title, description),
      info: (title, description) => show('info', title, description),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={styles.viewport} aria-live="polite">
          {toasts.map((toast) => {
            const Icon = ICONS[toast.tone]
            return (
              <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`} role="status">
                <Icon size={20} className={styles.icon} />
                <div className={styles.content}>
                  <strong>{toast.title}</strong>
                  {toast.description && <p>{toast.description}</p>}
                </div>
                <button type="button" className={styles.close} onClick={() => dismiss(toast.id)} aria-label="Cerrar">
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
