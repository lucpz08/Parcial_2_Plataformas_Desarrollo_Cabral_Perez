import { cx } from '@/utils/cx'
import styles from './StatCard.module.css'

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary', highlight = false }) {
  return (
    <div className={cx(styles.card, styles[tone], highlight && styles.highlight)}>
      <span className={styles.icon}>
        <Icon size={22} />
      </span>
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        <strong className={styles.value}>{value}</strong>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </div>
  )
}
