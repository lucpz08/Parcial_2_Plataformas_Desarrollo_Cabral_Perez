import { Link } from 'react-router'
import { cx } from '@/utils/cx'
import styles from './Logo.module.css'

export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="riolup-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B3DE8" />
          <stop offset="1" stopColor="#8B6AF0" />
        </linearGradient>
      </defs>
      <rect x="14" y="6" width="36" height="52" rx="6" fill="url(#riolup-logo)" transform="rotate(-8 32 32)" />
      <circle cx="32" cy="32" r="9" fill="none" stroke="#F2C868" strokeWidth="4" />
      <circle cx="32" cy="32" r="3" fill="#F2C868" />
    </svg>
  )
}

export function Logo({ to = '/', light = false, className }) {
  return (
    <Link to={to} className={cx(styles.logo, light && styles.light, className)} aria-label="Riolup TCG, ir al inicio">
      <LogoMark />
      <span className={styles.text}>
        Riolup<span className={styles.accent}>TCG</span>
      </span>
    </Link>
  )
}
