import { claimsService } from './claims'
import { listingsService } from './listings'
import { reviewsService } from './reviews'
import { usersService } from './users'
import { REVIEW_COMMENT_MAX_LENGTH, REVIEW_TAGS } from '@/data/constants'

const MIN_LOW_RATING_COMMENT = 10

function findReview(claimId, reviewerId) {
  return reviewsService.all().find((review) => review.claimId === claimId && review.reviewerId === reviewerId) ?? null
}

function describe(claim, userId) {
  if (!claim || claim.status !== 'completed') return null
  const listing = listingsService.getDetailed(claim.listingId)
  if (!listing?.card) return null

  const sellerId = listing.userId
  const buyerId = claim.claimantId
  if (userId !== sellerId && userId !== buyerId) return null

  const counterpartId = userId === sellerId ? buyerId : sellerId
  return {
    claim,
    listing,
    role: userId === sellerId ? 'seller' : 'buyer',
    counterpart: usersService.toPublic(usersService.findById(counterpartId)),
    myReview: findReview(claim.id, userId),
    theirReview: findReview(claim.id, counterpartId),
  }
}

export const feedbackService = {
  getForClaim(claimId, userId) {
    return describe(claimsService.findById(claimId), userId)
  },

  getPendingForUser(userId) {
    return claimsService
      .where((claim) => claim.status === 'completed')
      .map((claim) => describe(claim, userId))
      .filter((item) => item && item.counterpart && !item.myReview)
      .sort((a, b) => (b.claim.closedAt ?? b.claim.createdAt).localeCompare(a.claim.closedAt ?? a.claim.createdAt))
  },

  validate({ rating, comment = '' }) {
    const errors = {}
    const text = comment.trim()
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Elegí de 1 a 5 estrellas.'
    if (text.length > REVIEW_COMMENT_MAX_LENGTH) errors.comment = `Máximo ${REVIEW_COMMENT_MAX_LENGTH} caracteres.`
    else if (rating >= 1 && rating <= 2 && text.length < MIN_LOW_RATING_COMMENT) {
      errors.comment = `Contanos qué pasó (al menos ${MIN_LOW_RATING_COMMENT} caracteres) para que la reseña sea útil.`
    }
    return errors
  },

  submit({ claimId, reviewerId, rating, tags = [], comment = '' }) {
    const context = feedbackService.getForClaim(claimId, reviewerId)
    if (!context) throw new Error('Solo podés calificar transacciones completadas en las que participaste.')
    if (context.myReview) throw new Error('Ya calificaste esta transacción.')
    if (!context.counterpart) throw new Error('La otra cuenta ya no existe.')

    const [, message] = Object.entries(feedbackService.validate({ rating, comment }))[0] ?? []
    if (message) throw new Error(message)

    return reviewsService.create({
      listingId: context.listing.id,
      claimId,
      reviewerId,
      revieweeId: context.counterpart.id,
      rating,
      tags: tags.filter((tag) => REVIEW_TAGS.includes(tag)),
      comment: comment.trim(),
    })
  },
}
