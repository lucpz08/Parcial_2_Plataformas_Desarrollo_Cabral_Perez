import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function HomeRedirect() {
  const { isAdmin } = useAuth()
  return <Navigate to={isAdmin ? '/admin' : '/explorar'} replace />
}
