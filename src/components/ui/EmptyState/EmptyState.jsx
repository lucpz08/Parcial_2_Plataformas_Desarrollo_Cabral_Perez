import { Inbox } from 'lucide-react'
import styles from './EmptyState.module.css'

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon size={30} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
