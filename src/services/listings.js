import { createRepository } from './repository'
import { cardsService } from './cards'
import { collectionService } from './collection'
import { usersService } from './users'

const repository = createRepository('listings', 'l')

function withRelations(listing) {
  return {
    ...listing,
    card: cardsService.findById(listing.cardId),
    collectionItem: listing.collectionItemId ? collectionService.findById(listing.collectionItemId) : null,
    seller: usersService.toPublic(usersService.findById(listing.userId)),
  }
}

export const listingsService = {
  ...repository,

  withRelations,

  getDetailed(id) {
    const listing = repository.findById(id)
    return listing ? withRelations(listing) : null
  },

  search({ query = '', intent = '', province = '', status = 'disponible', minPrice, maxPrice } = {}) {
    const text = query.trim().toLowerCase()
    return repository
      .all()
      .map(withRelations)
      .filter(
        (listing) =>
          (!status || listing.status === status) &&
          (!intent || listing.intent === intent) &&
          (!province || listing.province === province) &&
          (minPrice == null || (listing.price ?? 0) >= minPrice) &&
          (maxPrice == null || (listing.price ?? 0) <= maxPrice) &&
          (!text || listing.card?.name.toLowerCase().includes(text)),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getByUser(userId) {
    return repository
      .where((listing) => listing.userId === userId)
      .map(withRelations)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
}
