import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Bell, BellOff, HandCoins, MessageCircle, Sparkles, Star, Ticket } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { notificationsService } from '@/services/notifications'
import { cx } from '@/utils/cx'
import { formatRelative } from '@/utils/format'
import styles from './NotificationsMenu.module.css'

const ICONS = {
  match: Sparkles,
  demand: HandCoins,
  claim: Ticket,
  review: Star,
  message: MessageCircle,
}

export function NotificationsMenu() {
  useDatabase()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const notifications = notificationsService.getForUser(user.id)
  const unread = notifications.filter((notification) => notification.unread).length

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

  function toggle() {
    if (open && unread > 0) notificationsService.markAllSeen(user.id)
    setOpen((value) => !value)
  }

  function close() {
    if (unread > 0) notificationsService.markAllSeen(user.id)
    setOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread > 0 ? `Notificaciones, ${unread} sin ver` : 'Notificaciones'}
      >
        <Bell size={20} />
        {unread > 0 && <span className={styles.count}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <header>
            <strong>Notificaciones</strong>
            {unread > 0 && (
              <button type="button" onClick={() => notificationsService.markAllSeen(user.id)}>
                Marcar todo como visto
              </button>
            )}
          </header>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <BellOff size={24} />
              <span>Estás al día</span>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => {
                const Icon = ICONS[notification.type] ?? Bell
                return (
                  <li key={notification.id}>
                    <Link
                      to={notification.to}
                      className={cx(styles.item, notification.unread && styles.unread)}
                      onClick={close}
                      role="menuitem"
                    >
                      <span className={cx(styles.icon, styles[notification.type])}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.text}>
                        <strong>{notification.title}</strong>
                        {notification.body && <span>{notification.body}</span>}
                        <time dateTime={notification.at}>{formatRelative(notification.at)}</time>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <footer>
            <Link to="/coincidencias" onClick={close}>
              Ver todas las coincidencias
            </Link>
          </footer>
        </div>
      )}
    </div>
  )
}
