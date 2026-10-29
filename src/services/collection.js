import { createRepository } from './repository'
import { cardsService } from './cards'
import { getTable } from './storage'

const repository = createRepository('collectionItems', 'ci')

const OPEN_LISTING_STATUSES = ['disponible', 'reservado']

function getOpenListing(itemId) {
  return getTable('listings').find(
    (listing) => listing.collectionItemId === itemId && OPEN_LISTING_STATUSES.includes(listing.status),
  ) ?? null
}

export const collectionService = {
  ...repository,

  getByUser(userId) {
    return repository
      .where((item) => item.userId === userId)
      .map((item) => ({
        ...item,
        card: cardsService.findById(item.cardId),
        openListing: getOpenListing(item.id),
      }))
  },

  getStats(userId) {
    const items = collectionService.getByUser(userId)
    return {
      uniqueCards: items.length,
      totalCards: items.reduce((sum, item) => sum + item.quantity, 0),
      verified: items.filter((item) => item.verification === 'verified').length,
      published: items.filter((item) => item.openListing).length,
      estimatedValue: items.reduce((sum, item) => sum + (item.card?.referencePrice ?? 0) * item.quantity, 0),
    }
  },

  requestVerification(id) {
    return repository.update(id, { verification: 'pending', verificationRequestedAt: new Date().toISOString() })
  },

  removeMany(ids) {
    const blocked = ids.filter((id) => getOpenListing(id))
    const removable = ids.filter((id) => !blocked.includes(id))
    removable.forEach((id) => repository.remove(id))
    return { removed: removable.length, blocked: blocked.length }
  },
}
