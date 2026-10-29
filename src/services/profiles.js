import { cardsService } from './cards'
import { claimsService } from './claims'
import { collectionService } from './collection'
import { listingsService } from './listings'
import { reviewsService } from './reviews'
import { usersService } from './users'
import { PROFILE_BIO_MAX_LENGTH } from '@/data/constants'
import { isBlank, isEmail, isValidUsername } from '@/utils/validation'

const OPEN_STATUSES = ['disponible', 'reservado']

function fieldError(field, message) {
  return Object.assign(new Error(message), { field })
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const profilesService = {
  getProfile(userId) {
    const user = usersService.toPublic(usersService.findById(userId))
    if (!user) return null

    const listings = listingsService.getByUser(userId).filter((listing) => listing.card)
    const collection = collectionService.getByUser(userId).filter((item) => item.card)
    const completedTransactions = claimsService.where((claim) => {
      if (claim.status !== 'completed') return false
      return claim.claimantId === userId || listingsService.findById(claim.listingId)?.userId === userId
    }).length

    const reviews = reviewsService.getForUser(userId).map((review) => {
      const listing = listingsService.findById(review.listingId)
      return {
        ...review,
        reviewer: usersService.toPublic(usersService.findById(review.reviewerId)),
        card: listing ? cardsService.findById(listing.cardId) : null,
      }
    })

    const activeListings = listings.filter((listing) => OPEN_STATUSES.includes(listing.status))

    return {
      user,
      activeListings,
      pastListings: listings.filter((listing) => !OPEN_STATUSES.includes(listing.status)),
      collection,
      reviews,
      stats: {
        rating: user.rating,
        completedTransactions,
        activeListings: activeListings.length,
        cards: collection.reduce((sum, item) => sum + item.quantity, 0),
      },
    }
  },

  getRatingDistribution(reviews) {
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => review.rating === stars).length,
    }))
  },

  getClaimsMadeBy(userId) {
    return claimsService
      .getByClaimant(userId)
      .map((claim) => ({ ...claim, listing: listingsService.getDetailed(claim.listingId) }))
      .filter((claim) => claim.listing?.card)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  isUsernameAvailable(username, userId) {
    const existing = usersService.findByUsername(username)
    return !existing || existing.id === userId
  },

  validateProfile(userId, { displayName = '', username = '', email = '', bio = '', avatarUrl = '' }) {
    const errors = {}
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedEmail = email.trim().toLowerCase()
    const emailOwner = usersService.findByEmail(normalizedEmail)

    if (isBlank(displayName) || displayName.trim().length < 3) errors.displayName = 'Ingresá un nombre de al menos 3 caracteres.'
    if (!isValidUsername(normalizedUsername)) {
      errors.username = 'Usá de 3 a 20 caracteres: minúsculas, números, punto o guion bajo.'
    } else if (!profilesService.isUsernameAvailable(normalizedUsername, userId)) {
      errors.username = 'Ese nombre de usuario ya está en uso.'
    }
    if (!isEmail(normalizedEmail)) errors.email = 'Ingresá un email válido.'
    else if (emailOwner && emailOwner.id !== userId) errors.email = 'Ya existe una cuenta con ese email.'
    if (bio.trim().length > PROFILE_BIO_MAX_LENGTH) errors.bio = `La bio admite hasta ${PROFILE_BIO_MAX_LENGTH} caracteres.`
    if (avatarUrl.trim() && !isValidUrl(avatarUrl.trim())) errors.avatarUrl = 'Ingresá una URL que empiece con http:// o https://'
    return errors
  },

  updateProfile(userId, data) {
    if (!usersService.findById(userId)) throw new Error('La cuenta ya no existe.')
    const [field, message] = Object.entries(profilesService.validateProfile(userId, data))[0] ?? []
    if (field) throw fieldError(field, message)

    return usersService.toPublic(
      usersService.update(userId, {
        displayName: data.displayName.trim(),
        username: data.username.trim().toLowerCase(),
        email: data.email.trim().toLowerCase(),
        bio: (data.bio ?? '').trim(),
        province: data.province || null,
        city: (data.city ?? '').trim(),
        avatarUrl: (data.avatarUrl ?? '').trim() || null,
      }),
    )
  },

  changePassword(userId, { currentPassword, newPassword }) {
    const user = usersService.findById(userId)
    if (!user) throw new Error('La cuenta ya no existe.')
    if (user.password !== currentPassword) throw fieldError('currentPassword', 'La contraseña actual no es correcta.')
    if (newPassword.length < 6) throw fieldError('newPassword', 'Usá al menos 6 caracteres.')
    if (newPassword === currentPassword) throw fieldError('newPassword', 'La nueva contraseña tiene que ser distinta a la actual.')
    usersService.update(userId, { password: newPassword, passwordChangedAt: new Date().toISOString() })
  },
}
