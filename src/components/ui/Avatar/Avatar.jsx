import { cx } from '@/utils/cx'
import styles from './Avatar.module.css'

const PALETTE = ['#5B3DE8', '#12B886', '#E8A93D', '#E0405A', '#3F8CE8', '#B03DE8', '#E86A3D']

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
}

function getColor(seed = '') {
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}

export function Avatar({ name, src, size = 40, online = false, className }) {
  return (
    <span
      className={cx(styles.avatar, className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: src ? undefined : getColor(name) }}
      title={name}
    >
      {src ? <img src={src} alt={name} className={styles.image} /> : getInitials(name)}
      {online && <span className={styles.online} aria-label="En línea" />}
    </span>
  )
}
