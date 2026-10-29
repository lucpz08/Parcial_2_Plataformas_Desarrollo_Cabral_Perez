import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cx } from '@/utils/cx'
import styles from './Alert.module.css'

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
}

export function Alert({ tone = 'info', title, children, className }) {
  const Icon = ICONS[tone]

  return (
    <div className={cx(styles.alert, styles[tone], className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={20} className={styles.icon} />
      <div>
        {title && <strong className={styles.title}>{title}</strong>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  )
}
