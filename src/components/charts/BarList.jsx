import styles from './charts.module.css'

export function BarList({ data, label, formatValue = (value) => value }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <ul className={styles.barList} aria-label={label}>
      {data.map((item) => (
        <li key={item.label} className={styles.barRow}>
          <span className={styles.barLabel}>{item.label}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className={styles.barValue}>{formatValue(item.value)}</span>
        </li>
      ))}
    </ul>
  )
}
