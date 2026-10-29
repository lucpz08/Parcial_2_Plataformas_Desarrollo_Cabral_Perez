import { cx } from '@/utils/cx'
import { Spinner } from '../Spinner/Spinner'
import styles from './Button.module.css'

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}) {
  const isButton = Component === 'button'

  return (
    <Component
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        !children && styles.iconOnly,
        className,
      )}
      disabled={isButton ? disabled || loading : undefined}
      aria-disabled={!isButton && disabled ? true : undefined}
      aria-busy={loading || undefined}
      type={isButton ? (props.type ?? 'button') : undefined}
      {...props}
    >
      {loading ? <Spinner size={size === 'lg' ? 20 : 16} /> : Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 16 : 18} />}
    </Component>
  )
}
