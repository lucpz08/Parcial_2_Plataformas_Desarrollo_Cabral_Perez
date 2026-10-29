import styles from './charts.module.css'

export function StackedBar({ segments, label }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0)
  const visible = segments.filter((segment) => segment.value > 0)

  return (
    <div className={styles.stacked}>
      <div className={styles.stackedTrack} role="group" aria-label={label}>
        {visible.map((segment) => {
          const tooltip = `${segment.label}: ${segment.value} (${percent(segment.value)}%)`
          return (
            <div
              key={segment.key}
              className={styles.stackedSegment}
              style={{ flexGrow: segment.value, '--segment-color': segment.color }}
              tabIndex={0}
              aria-label={tooltip}
            >
              <span className={styles.tooltip} role="tooltip">
                {tooltip}
              </span>
            </div>
          )
        })}
        {total === 0 && <div className={styles.stackedEmpty}>Sin datos</div>}
      </div>

      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.key}>
            <span className={styles.swatch} style={{ background: segment.color }} aria-hidden />
            <span className={styles.legendLabel}>{segment.label}</span>
            <strong>{segment.value}</strong>
            <span className={styles.legendShare}>{percent(segment.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
