import { cloneElement, useId } from 'react'
import { cx } from '@/utils/cx'
import styles from './Field.module.css'

export function Field({ label, hint, error, required, className, children }) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || hint

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {cloneElement(children, {
        id,
        invalid: Boolean(error),
        required,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={cx(styles.message, error && styles.error)}>
          {message}
        </p>
      )}
    </div>
  )
}
