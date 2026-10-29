import { useState } from 'react'
import { Star } from 'lucide-react'
import { cx } from '@/utils/cx'
import styles from './StarRating.module.css'

export function StarRating({ value = 0, count, onChange, size = 16, showValue = false }) {
  const [hovered, setHovered] = useState(0)
  const interactive = Boolean(onChange)
  const displayed = hovered || value

  return (
    <span className={styles.rating} onMouseLeave={() => setHovered(0)}>
      <span className={styles.stars} role={interactive ? 'radiogroup' : 'img'} aria-label={`${value.toFixed(1)} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayed >= star - 0.25
          const icon = <Star size={size} className={cx(styles.star, filled && styles.filled)} />
          if (!interactive) return <span key={star}>{icon}</span>
          return (
            <button
              key={star}
              type="button"
              className={styles.button}
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)}
            >
              {icon}
            </button>
          )
        })}
      </span>
      {showValue && (
        <span className={styles.value}>
          {value > 0 ? value.toFixed(1) : 'Sin reseñas'}
          {count > 0 && <span className={styles.count}> ({count})</span>}
        </span>
      )}
    </span>
  )
}
