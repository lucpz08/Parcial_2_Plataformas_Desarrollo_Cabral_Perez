import { chatsService } from './chats'
import { claimsService } from './claims'
import { collectionService } from './collection'
import { listingsService } from './listings'
import { profilesService } from './profiles'
import { reviewsService } from './reviews'
import { getTable, setTable } from './storage'
import { usersService } from './users'
import { ROLES } from '@/data/constants'
import { now } from '@/utils/id'

const SUSPENSION_REASON_MIN = 10

const SORTERS = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  name: (a, b) => a.displayName.localeCompare(b.displayName),
  rating: (a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count,
  lastLogin: (a, b) => (b.lastLoginAt ?? '').localeCompare(a.lastLoginAt ?? ''),
}

function fail(message, field) {
  throw Object.assign(new Error(message), field ? { field } : {})
}

function getUserOrFail(id) {
  const user = usersService.findById(id)
  if (!user) fail('La cuenta ya no existe.')
  return user
}

function countActiveAdmins(excludeId) {
  return usersService.where((user) => user.role === ROLES.ADMIN && user.status === 'activo' && user.id !== excludeId).length
}

function assertNotLastAdmin(user, message) {
  if (user.role === ROLES.ADMIN && user.status === 'activo' && countActiveAdmins(user.id) === 0) fail(message)
}

function hasHistory(userId) {
  const sold = listingsService.where((listing) => listing.userId === userId && listing.status === 'completado').length
  const bought = claimsService.where((claim) => claim.claimantId === userId && claim.status === 'completed').length
  const reviews = reviewsService.where((review) => review.reviewerId === userId || review.revieweeId === userId).length
  return sold + bought + reviews > 0
}

export const adminUsersService = {
  list({ query = '', role = '', status = '', sort = 'recent' } = {}) {
    const text = query.trim().toLowerCase()
    return usersService
      .where(
        (user) =>
          (!role || user.role === role) &&
          (!status || user.status === status) &&
          (!text ||
            user.displayName.toLowerCase().includes(text) ||
            user.username.toLowerCase().includes(text) ||
            user.email.toLowerCase().includes(text)),
      )
      .map((user) => ({
        ...usersService.toPublic(user),
        activeListings: listingsService.where(
          (listing) => listing.userId === user.id && ['disponible', 'reservado'].includes(listing.status),
        ).length,
        cards: collectionService.where((item) => item.userId === user.id).length,
        canDelete: !hasHistory(user.id),
      }))
      .sort(SORTERS[sort] ?? SORTERS.recent)
  },

  getCounts() {
    const users = usersService.all()
    return {
      all: users.length,
      activo: users.filter((user) => user.status === 'activo').length,
      suspendido: users.filter((user) => user.status === 'suspendido').length,
      admin: users.filter((user) => user.role === ROLES.ADMIN).length,
    }
  },

  validate(data, userId = null) {
    const errors = profilesService.validateProfile(userId, data)
    if (!Object.values(ROLES).includes(data.role)) errors.role = 'Elegí un rol válido.'
    if (!userId || data.password) {
      if ((data.password ?? '').length < 6) errors.password = 'Usá al menos 6 caracteres.'
    }
    return errors
  },

  create(data) {
    const [field, message] = Object.entries(adminUsersService.validate(data))[0] ?? []
    if (field) fail(message, field)
    return usersService.toPublic(
      usersService.create({
        displayName: data.displayName.trim(),
        username: data.username.trim().toLowerCase(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
        status: 'activo',
        province: data.province || null,
        city: (data.city ?? '').trim(),
        bio: '',
        avatarUrl: null,
        lastLoginAt: null,
      }),
    )
  },

  update(id, actorId, data) {
    const user = getUserOrFail(id)
    const [field, message] = Object.entries(adminUsersService.validate(data, id))[0] ?? []
    if (field) fail(message, field)
    if (data.role !== user.role) adminUsersService.assertCanChangeRole(user, actorId)

    profilesService.updateProfile(id, { ...data, bio: user.bio ?? '', avatarUrl: user.avatarUrl ?? '' })
    return usersService.toPublic(
      usersService.update(id, { role: data.role, ...(data.password ? { password: data.password } : {}) }),
    )
  },

  assertCanChangeRole(user, actorId) {
    if (user.id === actorId) fail('No podés cambiar tu propio rol.')
    assertNotLastAdmin(user, 'Tiene que quedar al menos un administrador activo.')
  },

  setRole(id, actorId, role) {
    const user = getUserOrFail(id)
    if (!Object.values(ROLES).includes(role)) fail('Elegí un rol válido.')
    if (user.role === role) return usersService.toPublic(user)
    adminUsersService.assertCanChangeRole(user, actorId)
    return usersService.toPublic(usersService.update(id, { role }))
  },

  suspend(id, actorId, reason) {
    const user = getUserOrFail(id)
    if (id === actorId) fail('No podés suspender tu propia cuenta.')
    if (user.status === 'suspendido') fail('La cuenta ya está suspendida.')
    if ((reason ?? '').trim().length < SUSPENSION_REASON_MIN) {
      fail(`Explicá el motivo (al menos ${SUSPENSION_REASON_MIN} caracteres).`, 'reason')
    }
    assertNotLastAdmin(user, 'No podés suspender al último administrador activo.')

    const affected = claimsService.where((claim) => {
      if (claim.status !== 'active') return false
      return claim.claimantId === id || listingsService.findById(claim.listingId)?.userId === id
    })
    affected.forEach((claim) => {
      claimsService.update(claim.id, { status: 'cancelled', cancelledBy: actorId, closedAt: now() })
      const listing = listingsService.findById(claim.listingId)
      if (listing?.status === 'reservado') listingsService.update(listing.id, { status: 'disponible' })
    })

    usersService.update(id, {
      status: 'suspendido',
      suspendedAt: now(),
      suspendedBy: actorId,
      suspensionReason: reason.trim(),
    })
    return { cancelledClaims: affected.length }
  },

  reactivate(id) {
    const user = getUserOrFail(id)
    if (user.status === 'activo') fail('La cuenta ya está activa.')
    return usersService.toPublic(
      usersService.update(id, { status: 'activo', suspendedAt: null, suspendedBy: null, suspensionReason: null }),
    )
  },

  remove(id, actorId) {
    const user = getUserOrFail(id)
    if (id === actorId) fail('No podés eliminar tu propia cuenta.')
    assertNotLastAdmin(user, 'No podés eliminar al último administrador activo.')
    if (hasHistory(id)) fail('Tiene transacciones o reseñas registradas. Suspendé la cuenta en lugar de eliminarla.')

    const listingIds = listingsService.where((listing) => listing.userId === id).map((listing) => listing.id)
    const conversationIds = chatsService.conversations
      .where((conversation) => conversation.participants.includes(id))
      .map((conversation) => conversation.id)

    const releasedListings = claimsService
      .where((claim) => claim.claimantId === id && claim.status === 'active')
      .map((claim) => claim.listingId)

    setTable(
      'claims',
      getTable('claims').filter((claim) => claim.claimantId !== id && !listingIds.includes(claim.listingId)),
    )
    setTable(
      'listings',
      getTable('listings')
        .filter((listing) => listing.userId !== id)
        .map((listing) =>
          releasedListings.includes(listing.id) && listing.status === 'reservado'
            ? { ...listing, status: 'disponible', updatedAt: now() }
            : listing,
        ),
    )
    setTable('messages', getTable('messages').filter((message) => !conversationIds.includes(message.conversationId)))
    setTable('conversations', getTable('conversations').filter((conversation) => !conversationIds.includes(conversation.id)))
    setTable('collectionItems', getTable('collectionItems').filter((item) => item.userId !== id))
    setTable(
      'reports',
      getTable('reports').filter((report) => report.reporterId !== id && !listingIds.includes(report.listingId)),
    )
    usersService.remove(id)
  },
}
