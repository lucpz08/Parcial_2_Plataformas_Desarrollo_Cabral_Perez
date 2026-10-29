import { createRepository } from './repository'
import { cardsService } from './cards'

const repository = createRepository('collectionItems', 'ci')

export const collectionService = {
  ...repository,

  getByUser(userId) {
    return repository
      .where((item) => item.userId === userId)
      .map((item) => ({ ...item, card: cardsService.findById(item.cardId) }))
  },

  getStats(userId) {
    const items = collectionService.getByUser(userId)
    return {
      uniqueCards: items.length,
      totalCards: items.reduce((sum, item) => sum + item.quantity, 0),
      verified: items.filter((item) => item.verification === 'verified').length,
      estimatedValue: items.reduce((sum, item) => sum + (item.card?.referencePrice ?? 0) * item.quantity, 0),
    }
  },
}
