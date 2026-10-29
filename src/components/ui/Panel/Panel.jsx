import { cx } from '@/utils/cx'
import styles from './Panel.module.css'

export function Panel({ as: Component = 'section', title, subtitle, actions, padded = true, interactive = false, className, children, ...props }) {
  return (
    <Component className={cx(styles.panel, padded && styles.padded, interactive && styles.interactive, className)} {...props}>
      {(title || actions) && (
        <header className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </Component>
  )
}
