import { createRepository } from './repository'
import { getTable } from './storage'

const repository = createRepository('cards', 'card')

export const cardsService = {
  ...repository,

  search({ query = '', setId = '', type = '', includeInactive = false } = {}) {
    const text = query.trim().toLowerCase()
    return repository.where(
      (card) =>
        (includeInactive || card.active) &&
        (!text || card.name.toLowerCase().includes(text) || card.setName.toLowerCase().includes(text)) &&
        (!setId || card.setId === setId) &&
        (!type || card.type === type),
    )
  },

  getMarketSummary(cardId) {
    const listings = getTable('listings').filter((listing) => listing.cardId === cardId && listing.status === 'disponible')
    const forSale = listings.filter((listing) => listing.intent === 'vender' && listing.price != null)
    return {
      forSale: forSale.length,
      forTrade: listings.filter((listing) => listing.intent === 'cambiar').length,
      wanted: listings.filter((listing) => listing.intent === 'busco').length,
      lowestPrice: forSale.length ? Math.min(...forSale.map((listing) => listing.price)) : null,
    }
  },

  getSets() {
    const sets = new Map()
    repository.all().forEach((card) => {
      if (!sets.has(card.setId)) sets.set(card.setId, { id: card.setId, name: card.setName, total: card.setTotal })
    })
    return [...sets.values()]
  },
}
