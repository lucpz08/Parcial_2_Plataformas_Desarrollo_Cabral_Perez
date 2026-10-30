import { chatsService } from './chats'
import { claimsService } from './claims'
import { feedbackService } from './feedback'
import { listingsService } from './listings'
import { matchesService } from './matches'
import { usersService } from './users'
import { now } from '@/utils/id'

const MAX_ITEMS = 12

export const notificationsService = {
  getForUser(userId) {
    const user = usersService.findById(userId)
    if (!user) return []

    const matches = matchesService.getWantedMatches(userId).flatMap(({ card, offers }) =>
      offers.map((offer) => ({
        id: `match-${offer.id}`,
        type: 'match',
        at: offer.createdAt,
        title: `Publicaron ${card.name}, que estás buscando`,
        body: `${offer.seller.displayName} · ${offer.withinBudget === false ? 'arriba de tu presupuesto' : offer.intent === 'cambiar' ? 'para cambio' : 'dentro de tu presupuesto'}`,
        to: `/explorar/${offer.id}`,
      })),
    )

    const demand = matchesService.getDemandMatches(userId).flatMap(({ card, requests }) =>
      requests.map((request) => ({
        id: `demand-${request.id}`,
        type: 'demand',
        at: request.createdAt,
        title: `${request.seller.displayName} busca tu ${card.name}`,
        body: 'Tenés esta carta en tu álbum',
        to: `/explorar/${request.id}`,
      })),
    )

    const reservations = claimsService
      .where(
        (claim) =>
          claim.status === 'active' &&
          claim.claimantId !== userId &&
          listingsService.findById(claim.listingId)?.userId === userId,
      )
      .map((claim) => {
        const listing = listingsService.getDetailed(claim.listingId)
        const claimant = usersService.findById(claim.claimantId)
        return {
          id: `claim-${claim.id}`,
          type: 'claim',
          at: claim.createdAt,
          title: `${claimant?.displayName ?? 'Alguien'} reservó tu ${listing?.card?.name ?? 'carta'}`,
          body: 'Coordiná por chat',
          to: `/explorar/${claim.listingId}`,
        }
      })

    const reviews = feedbackService.getPendingForUser(userId).map((pending) => ({
      id: `review-${pending.claim.id}`,
      type: 'review',
      at: pending.claim.closedAt ?? pending.claim.createdAt,
      title: `Calificá a ${pending.counterpart.displayName}`,
      body: `Por ${pending.listing.card.name}`,
      to: `/explorar/${pending.listing.id}`,
    }))

    const unread = chatsService
      .getForUser(userId)
      .filter((conversation) => conversation.unreadCount > 0)
      .map((conversation) => ({
        id: `chat-${conversation.id}`,
        type: 'message',
        at: conversation.lastMessageAt,
        title: `${conversation.peer.displayName} te escribió`,
        body: conversation.lastMessage?.body ?? '',
        to: `/chats/${conversation.id}`,
      }))

    const seenAt = user.notificationsSeenAt ?? ''
    return [...matches, ...demand, ...reservations, ...reviews, ...unread]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, MAX_ITEMS)
      .map((notification) => ({ ...notification, unread: notification.at > seenAt }))
  },

  getUnreadCount(userId) {
    return notificationsService.getForUser(userId).filter((notification) => notification.unread).length
  },

  markAllSeen(userId) {
    usersService.update(userId, { notificationsSeenAt: now() })
  },
}
