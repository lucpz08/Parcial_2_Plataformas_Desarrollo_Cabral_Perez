import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { ForbiddenPage } from '@/pages/ForbiddenPage/ForbiddenPage'

export function RequireAuth({ roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <ForbiddenPage requiredRoles={roles} />
  }

  return <Outlet />
}
