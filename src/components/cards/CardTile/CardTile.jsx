import { useState } from 'react'
import { cx } from '@/utils/cx'
import styles from './CardTile.module.css'

export function CardImage({ card, size = 'small', className }) {
  const [failed, setFailed] = useState(false)
  const src = size === 'large' ? card.imageLarge : card.imageSmall

  if (failed || !src) {
    return (
      <div className={cx(styles.fallback, className)}>
        <span className={styles.fallbackName}>{card.name}</span>
        <span className={styles.fallbackSet}>{card.setName}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${card.name} — ${card.setName} ${card.number}/${card.setTotal}`}
      loading="lazy"
      className={cx(styles.image, className)}
      onError={() => setFailed(true)}
    />
  )
}

export function CardTile({ card, badges, onClick, selected = false, children }) {
  const Component = onClick ? 'button' : 'article'

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 10}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${x * 10}deg`)
    event.currentTarget.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`)
    event.currentTarget.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`)
  }

  function handleMouseLeave(event) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={cx(styles.tile, onClick && styles.clickable, selected && styles.selected)}
      onClick={onClick}
    >
      <div className={styles.frame} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <CardImage card={card} />
        <span className={styles.glare} aria-hidden />
        {badges && <div className={styles.badges}>{badges}</div>}
      </div>
      <div className={styles.info}>
        <strong className={styles.name}>{card.name}</strong>
        <span className={styles.meta}>
          {card.setName} · {card.number}/{card.setTotal}
        </span>
        {children}
      </div>
    </Component>
  )
}
