import { NavLink } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { cx } from '@/utils/cx'
import { Logo } from '../Logo/Logo'
import { NAVIGATION } from './navigation'
import styles from './Sidebar.module.css'

export function Sidebar({ open, onNavigate }) {
  return (
    <aside className={cx(styles.sidebar, open && styles.open)} aria-label="Navegación principal">
      <div className={styles.brand}>
        <Logo to="/explorar" />
      </div>

      <nav className={styles.nav}>
        {NAVIGATION.map((group) => (
          <div key={group.title} className={styles.group}>
            <span className={styles.groupTitle}>{group.title}</span>
            <ul className={styles.list}>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) => cx(styles.link, isActive && styles.active)}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.promo}>
          <strong>¿Tenés cartas repetidas?</strong>
          <p>Publicalas y encontrá coleccionistas de tu provincia.</p>
          <Button as={NavLink} to="/album" onClick={onNavigate} variant="gold" size="sm" icon={Plus} fullWidth>
            Publicar carta
          </Button>
        </div>
      </div>
    </aside>
  )
}
