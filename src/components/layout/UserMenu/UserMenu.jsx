import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronDown, LayoutDashboard, Library, LogOut, RotateCcw, Settings, UserCircle } from 'lucide-react'
import { Avatar, Badge, ConfirmDialog } from '@/components/ui'
import { ROLE_LABELS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { resetDatabase } from '@/services/storage'
import { cx } from '@/utils/cx'
import styles from './UserMenu.module.css'

const LINKS = {
  coleccionista: [
    { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
    { to: '/album', label: 'Mi álbum', icon: Library },
    { to: '/perfil/editar', label: 'Editar perfil', icon: Settings },
  ],
  admin: [{ to: '/admin', label: 'Panel de administración', icon: LayoutDashboard }],
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleLogout() {
    setOpen(false)
    logout()
    toast.info('Cerraste sesión', '¡Volvé pronto!')
    navigate('/login')
  }

  function handleReset() {
    setConfirmReset(false)
    resetDatabase()
    toast.success('Datos restablecidos', 'Se cargaron nuevamente los datos de demostración.')
  }

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={cx(styles.trigger, open && styles.triggerOpen)}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.displayName} src={user.avatarUrl} size={36} />
        <span className={styles.triggerInfo}>
          <strong>{user.displayName}</strong>
          <span>{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.header}>
            <Avatar name={user.displayName} src={user.avatarUrl} size={44} />
            <div className={styles.headerInfo}>
              <strong>{user.displayName}</strong>
              <span>{user.email}</span>
              <Badge tone={user.role === 'admin' ? 'gold' : 'primary'}>{ROLE_LABELS[user.role]}</Badge>
            </div>
          </div>

          <div className={styles.section}>
            {LINKS[user.role].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>

          <div className={styles.section}>
            <button
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                setConfirmReset(true)
              }}
            >
              <RotateCcw size={18} />
              Restablecer datos de demo
            </button>
            <button type="button" className={cx(styles.item, styles.danger)} role="menuitem" onClick={handleLogout}>
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="¿Restablecer los datos?"
        message="Se van a perder todos los cambios (usuarios, cartas, publicaciones y mensajes) y se cargarán los datos de demostración originales."
        confirmLabel="Restablecer"
        danger
      />
    </div>
  )
}
