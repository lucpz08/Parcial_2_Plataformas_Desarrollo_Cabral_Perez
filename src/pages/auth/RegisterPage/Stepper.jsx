import { Check } from 'lucide-react'
import { cx } from '@/utils/cx'
import styles from './RegisterPage.module.css'

export function Stepper({ steps, current }) {
  return (
    <ol className={styles.stepper}>
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className={cx(styles.step, done && styles.stepDone, active && styles.stepActive)}>
            <span className={styles.stepNumber}>{done ? <Check size={14} strokeWidth={3} /> : index + 1}</span>
            <span className={styles.stepLabel}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
