import { Link } from 'react-router'
import { Eye, Pencil, ShieldCheck, ShieldOff, ShieldPlus, Trash2, UserCheck } from 'lucide-react'
import { Avatar, Badge, StarRating } from '@/components/ui'
import { ROLE_LABELS, ROLES, USER_STATUSES } from '@/data/constants'
import { cx } from '@/utils/cx'
import { formatDate, formatRelative } from '@/utils/format'
import styles from './AdminUsersPage.module.css'

function IconAction({ icon: Icon, label, onClick, to, disabled, danger, disabledReason }) {
  const className = cx(styles.iconAction, danger && styles.iconDanger)
  const title = disabled && disabledReason ? disabledReason : label
  if (to) {
    return (
      <Link to={to} className={className} title={label} aria-label={label}>
        <Icon size={16} />
      </Link>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled} title={title} aria-label={title}>
      <Icon size={16} />
    </button>
  )
}

export function UsersTable({ users, currentUserId, onEdit, onToggleRole, onSuspend, onReactivate, onDelete }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Usuario</th>
            <th scope="col">Email</th>
            <th scope="col">Rol</th>
            <th scope="col">Estado</th>
            <th scope="col">Reputación</th>
            <th scope="col" className={styles.numeric}>
              Publ.
            </th>
            <th scope="col">Alta</th>
            <th scope="col">Último ingreso</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            const isAdmin = user.role === ROLES.ADMIN
            const suspended = user.status === 'suspendido'
            return (
              <tr key={user.id} className={cx(suspended && styles.rowSuspended)}>
                <td>
                  <div className={styles.userCell}>
                    <Avatar name={user.displayName} src={user.avatarUrl} size={36} />
                    <div>
                      <strong>
                        {user.displayName}
                        {isSelf && <span className={styles.selfTag}>Vos</span>}
                      </strong>
                      <span>@{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.email}>{user.email}</td>
                <td>
                  <Badge tone={isAdmin ? 'primary' : 'neutral'} variant={isAdmin ? 'solid' : 'soft'} icon={isAdmin ? ShieldCheck : undefined}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </td>
                <td>
                  <Badge tone={suspended ? 'danger' : 'success'} dot>
                    {USER_STATUSES[user.status]}
                  </Badge>
                  {suspended && user.suspensionReason && (
                    <p className={styles.reason} title={user.suspensionReason}>
                      {user.suspensionReason}
                    </p>
                  )}
                </td>
                <td>
                  {user.rating.count > 0 ? (
                    <span className={styles.rating}>
                      <StarRating value={user.rating.average} size={11} />
                      <span>({user.rating.count})</span>
                    </span>
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </td>
                <td className={styles.numeric}>{user.activeListings}</td>
                <td className={styles.muted}>{formatDate(user.createdAt)}</td>
                <td className={styles.muted}>{user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Nunca'}</td>
                <td>
                  <div className={styles.actions}>
                    <IconAction icon={Eye} label="Ver perfil" to={`/usuarios/${user.id}`} />
                    <IconAction icon={Pencil} label="Editar" onClick={() => onEdit(user)} />
                    <IconAction
                      icon={isAdmin ? ShieldOff : ShieldPlus}
                      label={isAdmin ? 'Quitar rol de administrador' : 'Hacer administrador'}
                      onClick={() => onToggleRole(user)}
                      disabled={isSelf}
                      disabledReason="No podés cambiar tu propio rol"
                    />
                    {suspended ? (
                      <IconAction icon={UserCheck} label="Reactivar cuenta" onClick={() => onReactivate(user)} />
                    ) : (
                      <IconAction
                        icon={ShieldOff}
                        label="Suspender cuenta"
                        onClick={() => onSuspend(user)}
                        disabled={isSelf}
                        disabledReason="No podés suspender tu propia cuenta"
                        danger
                      />
                    )}
                    <IconAction
                      icon={Trash2}
                      label="Eliminar cuenta"
                      onClick={() => onDelete(user)}
                      disabled={isSelf || !user.canDelete}
                      disabledReason={
                        isSelf ? 'No podés eliminar tu propia cuenta' : 'Tiene historial de transacciones: suspendela en su lugar'
                      }
                      danger
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
