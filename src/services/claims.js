import { createRepository } from './repository'
import { cardsService } from './cards'
import { chatsService } from './chats'
import { listingsService } from './listings'
import { now } from '@/utils/id'

const repository = createRepository('claims', 'cl')

const OPENING_MESSAGES = {
  vender: (card) => `¡Hola! Acabo de reservar tu ${card.name}. ¿Cómo coordinamos el pago y la entrega?`,
  cambiar: (card) => `¡Hola! Me interesa tu ${card.name} para cambiar. ¿Vemos qué cartas te sirven?`,
  busco: (card) => `¡Hola! Tengo el ${card.name} que estás buscando. ¿Lo coordinamos?`,
}

function fail(message) {
  throw new Error(message)
}

function getActiveClaimOrFail(claimId) {
  const claim = repository.findById(claimId)
  if (!claim || claim.status !== 'active') fail('Esta reserva ya no está activa.')
  return claim
}

export const claimsService = {
  ...repository,

  getActiveForListing(listingId) {
    return repository.all().find((claim) => claim.listingId === listingId && claim.status === 'active') ?? null
  },

  getByClaimant(userId) {
    return repository.where((claim) => claim.claimantId === userId)
  },

  getLastForListing(listingId) {
    return (
      repository
        .where((claim) => claim.listingId === listingId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    )
  },

  claim(listingId, userId) {
    const listing = listingsService.findById(listingId)
    if (!listing) fail('La publicación ya no existe.')
    if (listing.userId === userId) fail('No podés reservar tu propia publicación.')
    if (listing.status !== 'disponible' || claimsService.getActiveForListing(listingId)) {
      fail('Alguien se te adelantó: esta carta ya fue reservada.')
    }

    const claim = repository.create({ listingId, claimantId: userId, status: 'active' })
    listingsService.update(listingId, { status: 'reservado' })

    const conversation = chatsService.getOrCreate({ userId, peerId: listing.userId, listingId, claimId: claim.id })
    chatsService.send(conversation.id, userId, OPENING_MESSAGES[listing.intent](cardsService.findById(listing.cardId)))

    return { claim, conversation }
  },

  cancel(claimId, userId) {
    const claim = getActiveClaimOrFail(claimId)
    const listing = listingsService.findById(claim.listingId)
    if (claim.claimantId !== userId && listing?.userId !== userId) fail('No podés cancelar esta reserva.')

    const updated = repository.update(claimId, { status: 'cancelled', cancelledBy: userId, closedAt: now() })
    if (listing?.status === 'reservado') listingsService.update(listing.id, { status: 'disponible' })
    return updated
  },

  complete(claimId, userId) {
    const claim = getActiveClaimOrFail(claimId)
    const listing = listingsService.findById(claim.listingId)
    if (listing?.userId !== userId) fail('Solo quien publicó puede marcar la transacción como completada.')

    const updated = repository.update(claimId, { status: 'completed', closedAt: now() })
    listingsService.update(listing.id, { status: 'completado' })
    return updated
  },
}
