import { cx } from '@/utils/cx'
import styles from './Chip.module.css'

export function Chip({ selected = false, icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      className={cx(styles.chip, selected && styles.selected)}
      aria-pressed={selected}
      onClick={onClick}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
