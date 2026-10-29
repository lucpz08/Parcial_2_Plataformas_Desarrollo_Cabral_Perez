import styles from './charts.module.css'

const TICK_COUNT = 4

function getScale(max) {
  const step = Math.max(1, Math.ceil(max / TICK_COUNT))
  return { top: step * TICK_COUNT, ticks: Array.from({ length: TICK_COUNT + 1 }, (_, index) => index * step) }
}

export function ColumnChart({ data, label, formatValue = (value) => value, formatTooltip }) {
  const { top, ticks } = getScale(Math.max(...data.map((item) => item.value), 0))
  const lastIndex = data.length - 1

  return (
    <div className={styles.column} role="group" aria-label={label}>
      <div className={styles.columnPlot}>
        <div className={styles.columnGrid} aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>
              <em>{formatValue(tick)}</em>
            </span>
          ))}
        </div>
        <div className={styles.columnBars}>
          {data.map((item, index) => {
            const tooltip = formatTooltip ? formatTooltip(item) : `${item.label}: ${formatValue(item.value)}`
            return (
              <div key={item.key} className={styles.columnSlot} tabIndex={0} aria-label={tooltip}>
                <span
                  className={styles.columnBar}
                  style={{ height: item.value ? `${(item.value / top) * 100}%` : 0 }}
                >
                  {index === lastIndex && <span className={styles.columnValue}>{formatValue(item.value)}</span>}
                  <span className={styles.tooltip} role="tooltip">
                    {tooltip}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles.columnLabels} aria-hidden>
        {data.map((item) => (
          <span key={item.key}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
