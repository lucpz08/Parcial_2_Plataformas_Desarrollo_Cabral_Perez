import { NavLink } from 'react-router'
import { Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui'
import { ROLES } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { chatsService } from '@/services/chats'
import { matchesService } from '@/services/matches'
import { moderationService } from '@/services/moderation'
import { cx } from '@/utils/cx'
import { Logo } from '../Logo/Logo'
import { getNavigationFor } from './navigation'
import styles from './Sidebar.module.css'

function SidebarPromo({ user, onNavigate }) {
  if (!user) {
    return (
      <div className={styles.promo}>
        <strong>Sumate a Riolup</strong>
        <p>Creá tu cuenta para armar tu álbum y publicar cartas.</p>
        <Button as={NavLink} to="/registro" onClick={onNavigate} variant="gold" size="sm" icon={UserPlus} fullWidth>
          Crear cuenta
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.promo}>
      <strong>¿Tenés cartas repetidas?</strong>
      <p>Publicalas y encontrá coleccionistas de tu provincia.</p>
      <Button as={NavLink} to="/publicar" onClick={onNavigate} variant="gold" size="sm" icon={Plus} fullWidth>
        Publicar carta
      </Button>
    </div>
  )
}

function getModerationQueueSize() {
  const counts = moderationService.getCounts()
  return counts.verifications + counts.reports
}

export function Sidebar({ open, onNavigate }) {
  const { user } = useAuth()
  useDatabase()

  const badges = {
    unreadMessages: user ? chatsService.getUnreadCount(user.id) : 0,
    matches: matchesService.getCount(user?.id),
    moderationQueue: user?.role === ROLES.ADMIN ? getModerationQueueSize() : 0,
  }

  return (
    <aside className={cx(styles.sidebar, open && styles.open)} aria-label="Navegación principal">
      <div className={styles.brand}>
        <Logo to="/" />
      </div>

      <nav className={styles.nav}>
        {getNavigationFor(user).map((group) => (
          <div key={group.title} className={styles.group}>
            <span className={styles.groupTitle}>{group.title}</span>
            <ul className={styles.list}>
              {group.items.map(({ to, label, icon: Icon, end, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) => cx(styles.link, isActive && styles.active)}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                    {badge && badges[badge] > 0 && (
                      <span className={styles.badge} aria-label={`${badges[badge]} sin leer`}>
                        {badges[badge]}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <SidebarPromo user={user} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}
