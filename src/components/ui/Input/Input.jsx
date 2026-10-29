import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cx } from '@/utils/cx'
import styles from './Input.module.css'

export function Input({ icon: Icon, invalid, type = 'text', className, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={cx(styles.wrapper, invalid && styles.invalid, className)}>
      {Icon && <Icon size={18} className={styles.icon} aria-hidden />}
      <input
        className={styles.control}
        type={isPassword && showPassword ? 'text' : type}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  )
}

export function Textarea({ invalid, className, rows = 4, ...props }) {
  return (
    <div className={cx(styles.wrapper, styles.multiline, invalid && styles.invalid, className)}>
      <textarea className={styles.control} rows={rows} aria-invalid={invalid || undefined} {...props} />
    </div>
  )
}

export function Select({ options, placeholder, invalid, className, ...props }) {
  return (
    <div className={cx(styles.wrapper, styles.select, invalid && styles.invalid, className)}>
      <select className={styles.control} aria-invalid={invalid || undefined} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const { value, label } = typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
    </div>
  )
}
