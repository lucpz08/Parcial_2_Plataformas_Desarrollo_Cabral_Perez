import { cx } from '@/utils/cx'
import styles from './Skeleton.module.css'

export function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)', className }) {
  return <span className={cx(styles.skeleton, className)} style={{ width, height, borderRadius: radius }} aria-hidden />
}
