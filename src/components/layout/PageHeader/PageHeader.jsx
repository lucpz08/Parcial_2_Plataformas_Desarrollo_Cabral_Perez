import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './PageHeader.module.css'

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  useDocumentTitle(title)

  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <span className="label">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
