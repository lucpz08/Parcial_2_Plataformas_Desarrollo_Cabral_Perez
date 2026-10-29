import { getPasswordStrength } from '@/utils/validation'
import styles from './RegisterPage.module.css'

const COLORS = ['var(--color-danger)', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-accent)']

export function PasswordStrength({ password }) {
  if (!password) return null
  const { score, label } = getPasswordStrength(password)

  return (
    <div className={styles.strength} aria-live="polite">
      <div className={styles.strengthBars}>
        {[0, 1, 2, 3].map((index) => (
          <span key={index} style={{ background: index < score ? COLORS[score] : undefined }} />
        ))}
      </div>
      <span style={{ color: COLORS[score] }}>{label}</span>
    </div>
  )
}
