import { cardsService } from './cards'
import { claimsService } from './claims'
import { collectionService } from './collection'
import { listingsService } from './listings'
import { moderationService } from './moderation'
import { reviewsService } from './reviews'
import { usersService } from './users'
import { INTENTS } from '@/data/constants'

const DAY_MS = 86400000
const WEEKS = 8
const STALE_RESERVATION_DAYS = 7
const TOP_PROVINCES = 6

const weekLabel = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

function startOfWeek(date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (day.getDay() + 6) % 7
  return new Date(day.getTime() - offset * DAY_MS)
}

function buildWeeklySeries(dates, now) {
  const currentWeek = startOfWeek(now)
  return Array.from({ length: WEEKS }, (_, index) => {
    const start = new Date(currentWeek.getTime() - (WEEKS - 1 - index) * 7 * DAY_MS)
    const end = new Date(start.getTime() + 7 * DAY_MS)
    return {
      key: start.toISOString(),
      label: weekLabel.format(start),
      value: dates.filter((date) => date >= start && date < end).length,
      current: index === WEEKS - 1,
    }
  })
}

function groupProvinces(listings) {
  const counts = new Map()
  listings.forEach((listing) => {
    const province = listing.province ?? 'Sin provincia'
    counts.set(province, (counts.get(province) ?? 0) + 1)
  })
  const sorted = [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  if (sorted.length <= TOP_PROVINCES) return sorted
  const rest = sorted.slice(TOP_PROVINCES - 1)
  return [
    ...sorted.slice(0, TOP_PROVINCES - 1),
    { label: `Otras (${rest.length})`, value: rest.reduce((sum, item) => sum + item.value, 0) },
  ]
}

function buildActivity({ users, listings, claims, reviews }) {
  const userName = (id) => usersService.findById(id)?.displayName ?? 'Usuario eliminado'
  const cardName = (listingId) => {
    const listing = listingsService.findById(listingId)
    return listing ? (cardsService.findById(listing.cardId)?.name ?? 'una carta') : 'una carta'
  }

  return [
    ...users.map((user) => ({
      id: `u-${user.id}`,
      type: 'user',
      at: user.createdAt,
      text: `${user.displayName} creó su cuenta`,
      to: `/usuarios/${user.id}`,
    })),
    ...listings.map((listing) => ({
      id: `l-${listing.id}`,
      type: 'listing',
      at: listing.createdAt,
      text: `${userName(listing.userId)} publicó ${cardsService.findById(listing.cardId)?.name ?? 'una carta'}`,
      to: `/explorar/${listing.id}`,
    })),
    ...claims.map((claim) => ({
      id: `c-${claim.id}`,
      type: claim.status === 'completed' ? 'completed' : 'claim',
      at: claim.closedAt && claim.status === 'completed' ? claim.closedAt : claim.createdAt,
      text:
        claim.status === 'completed'
          ? `Se completó la transacción de ${cardName(claim.listingId)}`
          : `${userName(claim.claimantId)} reservó ${cardName(claim.listingId)}`,
      to: `/explorar/${claim.listingId}`,
    })),
    ...reviews.map((review) => ({
      id: `r-${review.id}`,
      type: 'review',
      at: review.createdAt,
      text: `${userName(review.reviewerId)} calificó a ${userName(review.revieweeId)} con ${review.rating}★`,
      to: `/usuarios/${review.revieweeId}`,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8)
}

export const adminService = {
  getDashboard(now = new Date()) {
    const users = usersService.all()
    const listings = listingsService.all()
    const claims = claimsService.all()
    const reviews = reviewsService.all()
    const monthAgo = new Date(now.getTime() - 30 * DAY_MS)
    const available = listings.filter((listing) => listing.status === 'disponible')
    const completedClaims = claims.filter((claim) => claim.status === 'completed')
    const activeClaims = claims.filter((claim) => claim.status === 'active')

    const volume = completedClaims.reduce((sum, claim) => {
      const listing = listingsService.findById(claim.listingId)
      return listing?.intent === 'vender' && listing.price ? sum + listing.price : sum
    }, 0)

    return {
      kpis: {
        activeUsers: users.filter((user) => user.status === 'activo').length,
        newUsers: users.filter((user) => new Date(user.createdAt) >= monthAgo).length,
        availableListings: available.length,
        reservedListings: listings.filter((listing) => listing.status === 'reservado').length,
        completedTransactions: completedClaims.length,
        volume,
        pendingVerifications: collectionService.where((item) => item.verification === 'pending').length,
        averageRating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
        reviewCount: reviews.length,
      },
      weeklyListings: buildWeeklySeries(
        listings.map((listing) => new Date(listing.createdAt)),
        now,
      ),
      intentMix: INTENTS.map(({ value, label }) => ({
        key: value,
        label,
        value: available.filter((listing) => listing.intent === value).length,
      })),
      provinces: groupProvinces(available),
      attention: {
        pendingVerifications: collectionService.where((item) => item.verification === 'pending').length,
        suspendedUsers: users.filter((user) => user.status === 'suspendido').length,
        pendingReports: moderationService.getCounts().reports,
        staleReservations: activeClaims.filter(
          (claim) => now.getTime() - new Date(claim.createdAt).getTime() > STALE_RESERVATION_DAYS * DAY_MS,
        ).length,
      },
      topCollectors: users
        .filter((user) => user.role !== 'admin' && user.status === 'activo')
        .map((user) => {
          const rating = usersService.getRating(user.id)
          const transactions = completedClaims.filter(
            (claim) => claim.claimantId === user.id || listingsService.findById(claim.listingId)?.userId === user.id,
          ).length
          return {
            user: usersService.toPublic(user),
            rating,
            transactions,
            activeListings: available.filter((listing) => listing.userId === user.id).length,
          }
        })
        .sort((a, b) => b.transactions - a.transactions || b.rating.average - a.rating.average)
        .slice(0, 5),
      activity: buildActivity({ users, listings, claims, reviews }),
    }
  },
}
