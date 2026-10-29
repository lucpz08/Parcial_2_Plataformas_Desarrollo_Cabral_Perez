import { createRepository } from './repository'

const repository = createRepository('claims', 'cl')

export const claimsService = {
  ...repository,

  getActiveForListing(listingId) {
    return repository.all().find((claim) => claim.listingId === listingId && claim.status === 'active') ?? null
  },

  getByClaimant(userId) {
    return repository.where((claim) => claim.claimantId === userId)
  },
}
