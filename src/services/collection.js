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

  findDuplicate({ userId, cardId, condition, language }) {
    return (
      repository
        .all()
        .find(
          (item) =>
            item.userId === userId &&
            item.cardId === cardId &&
            item.condition === condition &&
            item.language === language,
        ) ?? null
    )
  },

  addCard({ userId, cardId, condition, language, quantity, notes, requestVerification }) {
    const duplicate = collectionService.findDuplicate({ userId, cardId, condition, language })
    const verificationChanges = requestVerification
      ? { verification: 'pending', verificationRequestedAt: new Date().toISOString() }
      : {}

    if (duplicate) {
      const shouldVerify = requestVerification && ['none', 'rejected'].includes(duplicate.verification)
      const item = repository.update(duplicate.id, {
        quantity: duplicate.quantity + quantity,
        notes: notes.trim() || duplicate.notes,
        ...(shouldVerify ? verificationChanges : {}),
      })
      return { item, merged: true }
    }

    const item = repository.create({
      userId,
      cardId,
      quantity,
      condition,
      language,
      notes: notes.trim(),
      photoUrl: null,
      verification: 'none',
      ...verificationChanges,
    })
    return { item, merged: false }
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
