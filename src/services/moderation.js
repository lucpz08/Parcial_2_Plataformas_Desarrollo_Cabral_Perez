import { cardsService } from './cards'
import { claimsService } from './claims'
import { collectionService } from './collection'
import { listingsService } from './listings'
import { createRepository } from './repository'
import { usersService } from './users'
import { MODERATION_REASON_MIN_LENGTH, REPORT_REASON_LABELS } from '@/data/constants'
import { now } from '@/utils/id'

const reports = createRepository('reports', 'rp')

const DAY_MS = 86400000
const STALE_RESERVATION_DAYS = 7
const REPORT_DETAILS_MAX = 300
const PRICE_HIGH_RATIO = 1.8
const PRICE_LOW_RATIO = 0.4

function fail(message, field) {
  throw Object.assign(new Error(message), field ? { field } : {})
}

function requireReason(reason) {
  if ((reason ?? '').trim().length < MODERATION_REASON_MIN_LENGTH) {
    fail(`Explicá el motivo (al menos ${MODERATION_REASON_MIN_LENGTH} caracteres).`, 'reason')
  }
  return reason.trim()
}

function getPendingVerificationOrFail(itemId) {
  const item = collectionService.findById(itemId)
  if (!item) fail('La carta ya no está en el álbum del usuario.')
  if (item.verification !== 'pending') fail('Esta verificación ya fue resuelta.')
  return item
}

function resolveReports(listingId, adminId, status) {
  const pending = reports.where((report) => report.listingId === listingId && report.status === 'pending')
  pending.forEach((report) => reports.update(report.id, { status, resolvedAt: now(), resolvedBy: adminId }))
  return pending.length
}

function getPriceFlag(listing, card) {
  if (listing.intent !== 'vender' || !listing.price || !card?.referencePrice) return null
  const ratio = listing.price / card.referencePrice
  if (ratio >= PRICE_HIGH_RATIO) return { type: 'high', ratio }
  if (ratio <= PRICE_LOW_RATIO) return { type: 'low', ratio }
  return null
}

export const moderationService = {
  reports,

  getCounts() {
    return {
      verifications: collectionService.where((item) => item.verification === 'pending').length,
      reports: new Set(reports.where((report) => report.status === 'pending').map((report) => report.listingId)).size,
      flagged: moderationService.getListingsForReview().filter((listing) => listing.flags.length > 0).length,
      staleReservations: moderationService.getStaleReservations().length,
    }
  },

  getVerificationQueue() {
    return collectionService
      .where((item) => item.verification === 'pending')
      .map((item) => ({
        ...item,
        requestedAt: item.verificationRequestedAt ?? item.createdAt,
        card: cardsService.findById(item.cardId),
        owner: usersService.toPublic(usersService.findById(item.userId)),
      }))
      .filter((item) => item.card && item.owner)
      .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
  },

  getResolvedVerifications(limit = 8) {
    return collectionService
      .where((item) => ['verified', 'rejected'].includes(item.verification) && item.verifiedAt)
      .map((item) => ({
        ...item,
        card: cardsService.findById(item.cardId),
        owner: usersService.toPublic(usersService.findById(item.userId)),
        reviewer: usersService.toPublic(usersService.findById(item.verifiedBy)),
      }))
      .sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt))
      .slice(0, limit)
  },

  approveVerification(itemId, adminId) {
    const item = getPendingVerificationOrFail(itemId)
    if (item.userId === adminId) fail('No podés verificar cartas de tu propio álbum.')
    return collectionService.update(itemId, {
      verification: 'verified',
      verifiedAt: now(),
      verifiedBy: adminId,
      verificationNote: null,
    })
  },

  rejectVerification(itemId, adminId, note) {
    const item = getPendingVerificationOrFail(itemId)
    if (item.userId === adminId) fail('No podés verificar cartas de tu propio álbum.')
    return collectionService.update(itemId, {
      verification: 'rejected',
      verifiedAt: now(),
      verifiedBy: adminId,
      verificationNote: requireReason(note),
    })
  },

  hasPendingReport(listingId, reporterId) {
    return reports.all().some(
      (report) => report.listingId === listingId && report.reporterId === reporterId && report.status === 'pending',
    )
  },

  report({ listingId, reporterId, reason, details = '' }) {
    const listing = listingsService.findById(listingId)
    if (!listing) fail('La publicación ya no existe.')
    if (listing.userId === reporterId) fail('No podés denunciar tu propia publicación.')
    if (!['disponible', 'reservado'].includes(listing.status)) fail('La publicación ya no está activa.')
    if (!REPORT_REASON_LABELS[reason]) fail('Elegí un motivo.', 'reason')
    const text = details.trim()
    if (text.length > REPORT_DETAILS_MAX) fail(`Máximo ${REPORT_DETAILS_MAX} caracteres.`, 'details')
    if (reason === 'other' && text.length < MODERATION_REASON_MIN_LENGTH) {
      fail('Contanos qué pasa para que podamos revisarlo.', 'details')
    }
    if (moderationService.hasPendingReport(listingId, reporterId)) fail('Ya denunciaste esta publicación. La estamos revisando.')
    return reports.create({ listingId, reporterId, reason, details: text, status: 'pending' })
  },

  getReportQueue() {
    const pending = reports.where((report) => report.status === 'pending')
    const byListing = new Map()
    pending.forEach((report) => {
      const group = byListing.get(report.listingId) ?? []
      group.push({ ...report, reporter: usersService.toPublic(usersService.findById(report.reporterId)) })
      byListing.set(report.listingId, group)
    })
    return [...byListing.entries()]
      .map(([listingId, items]) => ({
        listing: listingsService.getDetailed(listingId),
        reports: items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      }))
      .filter((group) => group.listing?.card)
      .sort((a, b) => b.reports.length - a.reports.length || a.reports[0].createdAt.localeCompare(b.reports[0].createdAt))
  },

  dismissReports(listingId, adminId) {
    const count = resolveReports(listingId, adminId, 'dismissed')
    if (count === 0) fail('No hay denuncias pendientes para esta publicación.')
    return count
  },

  takeDownListing(listingId, adminId, reason) {
    const listing = listingsService.findById(listingId)
    if (!listing) fail('La publicación ya no existe.')
    if (!['disponible', 'reservado'].includes(listing.status)) fail('La publicación ya no está activa.')
    const text = requireReason(reason)

    const activeClaim = claimsService.getActiveForListing(listingId)
    if (activeClaim) claimsService.update(activeClaim.id, { status: 'cancelled', cancelledBy: adminId, closedAt: now() })

    listingsService.update(listingId, {
      status: 'cancelado',
      moderatedAt: now(),
      moderatedBy: adminId,
      moderationReason: text,
    })
    return { resolvedReports: resolveReports(listingId, adminId, 'actioned'), cancelledClaim: Boolean(activeClaim) }
  },

  getListingsForReview({ query = '', onlyFlagged = false } = {}) {
    const text = query.trim().toLowerCase()
    const pendingReports = reports.where((report) => report.status === 'pending')

    return listingsService
      .all()
      .filter((listing) => ['disponible', 'reservado'].includes(listing.status))
      .map((listing) => {
        const detailed = listingsService.withRelations(listing)
        const priceFlag = getPriceFlag(listing, detailed.card)
        const reportCount = pendingReports.filter((report) => report.listingId === listing.id).length
        const flags = [
          priceFlag && { key: 'price', label: priceFlag.type === 'high' ? 'Precio muy alto' : 'Precio muy bajo', ratio: priceFlag.ratio },
          reportCount > 0 && { key: 'reports', label: `${reportCount} denuncia${reportCount > 1 ? 's' : ''}` },
          detailed.seller?.status !== 'activo' && { key: 'seller', label: 'Vendedor suspendido' },
        ].filter(Boolean)
        return { ...detailed, flags }
      })
      .filter(
        (listing) =>
          listing.card &&
          (!onlyFlagged || listing.flags.length > 0) &&
          (!text ||
            listing.card.name.toLowerCase().includes(text) ||
            listing.seller?.displayName.toLowerCase().includes(text)),
      )
      .sort((a, b) => b.flags.length - a.flags.length || b.createdAt.localeCompare(a.createdAt))
  },

  getStaleReservations(reference = new Date()) {
    return claimsService
      .where(
        (claim) =>
          claim.status === 'active' &&
          reference.getTime() - new Date(claim.createdAt).getTime() > STALE_RESERVATION_DAYS * DAY_MS,
      )
      .map((claim) => ({
        ...claim,
        days: Math.floor((reference.getTime() - new Date(claim.createdAt).getTime()) / DAY_MS),
        listing: listingsService.getDetailed(claim.listingId),
        claimant: usersService.toPublic(usersService.findById(claim.claimantId)),
      }))
      .filter((claim) => claim.listing?.card)
      .sort((a, b) => b.days - a.days)
  },

  releaseReservation(claimId, adminId) {
    const claim = claimsService.findById(claimId)
    if (!claim || claim.status !== 'active') fail('La reserva ya no está activa.')
    claimsService.update(claimId, { status: 'cancelled', cancelledBy: adminId, closedAt: now() })
    const listing = listingsService.findById(claim.listingId)
    if (listing?.status === 'reservado') listingsService.update(listing.id, { status: 'disponible' })
  },
}
