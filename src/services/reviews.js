import { createRepository } from './repository'

const repository = createRepository('reviews', 'r')

export const reviewsService = {
  ...repository,

  getForUser(userId) {
    return repository
      .where((review) => review.revieweeId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
}
