import { ROLE_LABELS } from '@/data/constants'
import { NotFoundPage } from '../NotFoundPage/NotFoundPage'

export function ForbiddenPage({ requiredRoles = [] }) {
  const roles = requiredRoles.map((role) => ROLE_LABELS[role]).join(' o ')

  return (
    <NotFoundPage
      code="403"
      title="No tenés acceso a esta sección"
      message={
        roles
          ? `Esta pantalla está disponible solo para usuarios con rol ${roles}.`
          : 'Tu usuario no tiene permisos para ver esta pantalla.'
      }
    />
  )
}
