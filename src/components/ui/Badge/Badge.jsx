import { cx } from '@/utils/cx'
import styles from './Badge.module.css'

export function Badge({ tone = 'neutral', variant = 'soft', icon: Icon, dot = false, className, children }) {
  return (
    <span className={cx(styles.badge, styles[tone], styles[variant], className)}>
      {dot && <span className={styles.dot} aria-hidden />}
      {Icon && <Icon size={13} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  )
}
