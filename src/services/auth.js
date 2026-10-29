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

  logout() {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      return
    }
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

  async register({ email, password, displayName, username, province, city }) {
    await wait(700)

    if (usersService.findByEmail(email)) {
      throw Object.assign(new Error('Ya existe una cuenta con ese email.'), { field: 'email' })
    }
    if (usersService.findByUsername(username)) {
      throw Object.assign(new Error('Ese nombre de usuario ya está en uso.'), { field: 'username' })
    }

    const user = usersService.create({
      email: email.trim().toLowerCase(),
      password,
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      role: 'coleccionista',
      status: 'activo',
      province,
      city: city.trim(),
      bio: '',
      avatarUrl: null,
      lastLoginAt: now(),
    })
    writeSession(user.id, true)
    return usersService.toPublic(user)
  },
}
