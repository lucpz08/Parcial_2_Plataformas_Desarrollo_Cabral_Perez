import styles from './Spinner.module.css'

export function Spinner({ size = 20, label = 'Cargando' }) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  )
}
