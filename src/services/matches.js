import { collectionService } from './collection'
import { listingsService } from './listings'

const OFFER_INTENTS = ['vender', 'cambiar']

function fitsBudget(offer, maxPrice) {
  if (offer.intent !== 'vender' || offer.price == null || maxPrice == null) return null
  return offer.price <= maxPrice
}

export const matchesService = {
  getWantedMatches(userId) {
    const available = listingsService.search()
    return available
      .filter((listing) => listing.userId === userId && listing.intent === 'busco')
      .map((wanted) => {
        const offers = available
          .filter((offer) => offer.cardId === wanted.cardId && offer.userId !== userId && OFFER_INTENTS.includes(offer.intent))
          .map((offer) => ({ ...offer, withinBudget: fitsBudget(offer, wanted.price) }))
          .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
        return { wanted, card: wanted.card, offers }
      })
      .filter((match) => match.offers.length > 0)
  },

  getDemandMatches(userId) {
    const owned = collectionService.getByUser(userId).filter((item) => item.card)
    const requests = listingsService.search({ intent: 'busco' }).filter((listing) => listing.userId !== userId)
    return owned
      .map((item) => ({
        item,
        card: item.card,
        requests: requests
          .filter((request) => request.cardId === item.cardId)
          .sort((a, b) => (b.price ?? 0) - (a.price ?? 0)),
      }))
      .filter((match) => match.requests.length > 0)
  },

  getCount(userId) {
    if (!userId) return 0
    return matchesService.getWantedMatches(userId).length + matchesService.getDemandMatches(userId).length
  },
}
