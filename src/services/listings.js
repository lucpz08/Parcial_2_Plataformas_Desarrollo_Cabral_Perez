import { createRepository } from './repository'
import { cardsService } from './cards'
import { collectionService } from './collection'
import { usersService } from './users'

const repository = createRepository('listings', 'l')

const byRecent = (a, b) => b.createdAt.localeCompare(a.createdAt)

const SORTERS = {
  recent: byRecent,
  price_asc: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || byRecent(a, b),
  price_desc: (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity) || byRecent(a, b),
}

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

  search({
    query = '',
    intent = '',
    province = '',
    condition = '',
    status = 'disponible',
    minPrice = null,
    maxPrice = null,
    verifiedOnly = false,
    sort = 'recent',
  } = {}) {
    const text = query.trim().toLowerCase()
    const filtersByPrice = minPrice != null || maxPrice != null

    return repository
      .all()
      .map(withRelations)
      .filter(
        (listing) =>
          listing.card &&
          listing.seller?.status === 'activo' &&
          (!status || listing.status === status) &&
          (!intent || listing.intent === intent) &&
          (!province || listing.province === province) &&
          (!condition || listing.collectionItem?.condition === condition) &&
          (!verifiedOnly || listing.collectionItem?.verification === 'verified') &&
          (!filtersByPrice || listing.price != null) &&
          (minPrice == null || listing.price >= minPrice) &&
          (maxPrice == null || listing.price <= maxPrice) &&
          (!text || listing.card.name.toLowerCase().includes(text) || listing.card.setName.toLowerCase().includes(text)),
      )
      .sort(SORTERS[sort] ?? SORTERS.recent)
  },

  getRelated(listing, limit = 4) {
    const available = listingsService.search().filter((other) => other.id !== listing.id)
    return {
      sameCard: available.filter((other) => other.cardId === listing.cardId).slice(0, limit),
      sameSeller: available.filter((other) => other.userId === listing.userId).slice(0, limit),
    }
  },

  close(id, userId) {
    const listing = repository.findById(id)
    if (!listing) throw new Error('La publicación ya no existe.')
    if (listing.userId !== userId) throw new Error('Solo podés dar de baja tus publicaciones.')
    if (listing.status !== 'disponible') throw new Error('Solo se pueden dar de baja publicaciones disponibles.')
    return repository.update(id, { status: 'cancelado' })
  },

  getByUser(userId) {
    return repository
      .where((listing) => listing.userId === userId)
      .map(withRelations)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
}
