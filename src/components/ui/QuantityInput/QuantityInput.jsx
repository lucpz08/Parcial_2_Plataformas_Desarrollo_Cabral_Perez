import { Minus, Plus } from 'lucide-react'
import styles from './QuantityInput.module.css'

export function QuantityInput({ value, onChange, min = 1, max = 99, id, ...props }) {
  function clamp(next) {
    return Math.min(max, Math.max(min, Number.isNaN(next) ? min : next))
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Restar uno"
      >
        <Minus size={16} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clamp(parseInt(event.target.value, 10)))}
        aria-describedby={props['aria-describedby']}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Sumar uno"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
