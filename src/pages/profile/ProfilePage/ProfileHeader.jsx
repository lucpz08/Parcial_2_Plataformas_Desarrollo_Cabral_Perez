import { Link, useLocation } from 'react-router'
import { CalendarDays, MapPin, MessageCircle, Pencil, Plus, ShieldCheck, ShieldOff } from 'lucide-react'
import { Avatar, Badge, Button } from '@/components/ui'
import { ROLES } from '@/data/constants'
import { formatDate } from '@/utils/format'
import styles from './ProfilePage.module.css'

export function ProfileHeader({ user, isOwn, viewer, onMessage }) {
  const location = useLocation()
  const place = [user.city, user.province].filter(Boolean).join(', ')

  function renderActions() {
    if (isOwn) {
      return (
        <>
          <Button as={Link} to="/perfil/editar" variant="outline" icon={Pencil}>
            Editar perfil
          </Button>
          <Button as={Link} to="/publicar" icon={Plus}>
            Publicar
          </Button>
        </>
      )
    }
    if (user.status !== 'activo') return null
    if (!viewer) {
      return (
        <Button as={Link} to="/login" state={{ from: location.pathname }} icon={MessageCircle}>
          Ingresá para escribirle
        </Button>
      )
    }
    return (
      <Button icon={MessageCircle} onClick={onMessage}>
        Enviar mensaje
      </Button>
    )
  }

  return (
    <section className={styles.header}>
      <div className={styles.cover} aria-hidden />
      <div className={styles.headerBody}>
        <Avatar name={user.displayName} src={user.avatarUrl} size={104} className={styles.avatar} />
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1>{user.displayName}</h1>
            {user.role === ROLES.ADMIN && (
              <Badge tone="primary" variant="solid" icon={ShieldCheck}>
                Equipo Riolup
              </Badge>
            )}
            {user.status !== 'activo' && (
              <Badge tone="danger" icon={ShieldOff}>
                Suspendida
              </Badge>
            )}
          </div>
          <span className={styles.username}>@{user.username}</span>
          <ul className={styles.meta}>
            {place && (
              <li>
                <MapPin size={15} />
                {place}
              </li>
            )}
            <li>
              <CalendarDays size={15} />
              Miembro desde {formatDate(user.createdAt)}
            </li>
          </ul>
          {user.bio ? (
            <p className={styles.bio}>{user.bio}</p>
          ) : (
            isOwn && (
              <p className={styles.bioEmpty}>
                Todavía no escribiste una bio. <Link to="/perfil/editar">Contale a la comunidad qué coleccionás.</Link>
              </p>
            )
          )}
        </div>
        <div className={styles.headerActions}>{renderActions()}</div>
      </div>
    </section>
  )
}
