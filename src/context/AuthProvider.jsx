import { useCallback, useMemo, useState } from 'react'
import { authService } from '@/services/auth'
import { usersService } from '@/services/users'
import { useDatabase } from '@/hooks/useDatabase'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const db = useDatabase()
  const [userId, setUserId] = useState(() => authService.getSessionUserId())

  const user = useMemo(() => {
    const found = db.users.find((candidate) => candidate.id === userId)
    return found ? usersService.toPublic(found) : null
  }, [db, userId])

  const login = useCallback(async (email, password, remember) => {
    const loggedUser = await authService.login(email, password, remember)
    setUserId(loggedUser.id)
    return loggedUser
  }, [])

  const register = useCallback(async (data) => {
    const newUser = await authService.register(data)
    setUserId(newUser.id)
    return newUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
    }),
    [user, login, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
