import { usersService } from './users'
import { now } from '@/utils/id'
import { wait } from '@/utils/validation'

const SESSION_KEY = 'riolup-tcg:session'

function readSession(storage) {
  try {
    return storage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function writeSession(userId, remember) {
  try {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(SESSION_KEY, userId)
  } catch {
    return
  }
}

export const authService = {
  getSessionUserId() {
    return readSession(localStorage) ?? readSession(sessionStorage)
  },

  async login(email, password, remember = true) {
    await wait(600)
    const user = usersService.findByEmail(email)

    if (!user || user.password !== password) {
      throw new Error('El email o la contraseña son incorrectos.')
    }
    if (user.status === 'suspendido') {
      throw new Error('Tu cuenta está suspendida. Contactá al equipo de Riolup para más información.')
    }

    const updatedUser = usersService.update(user.id, { lastLoginAt: now() })
    writeSession(user.id, remember)
    return usersService.toPublic(updatedUser)
  },
}
