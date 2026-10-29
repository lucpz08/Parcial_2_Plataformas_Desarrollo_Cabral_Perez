import { cx } from '@/utils/cx'
import styles from './Tabs.module.css'

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          className={cx(styles.tab, tab.value === value && styles.active)}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && <span className={styles.count}>{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
