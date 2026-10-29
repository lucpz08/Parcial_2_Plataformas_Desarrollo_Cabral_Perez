import { createRepository } from './repository'
import { reviewsService } from './reviews'

const repository = createRepository('users', 'u')

function normalize(value) {
  return value.trim().toLowerCase()
}

export const usersService = {
  ...repository,

  findByEmail(email) {
    return repository.all().find((user) => normalize(user.email) === normalize(email)) ?? null
  },

  findByUsername(username) {
    return repository.all().find((user) => normalize(user.username) === normalize(username)) ?? null
  },

  getRating(userId) {
    const received = reviewsService.where((review) => review.revieweeId === userId)
    if (received.length === 0) return { average: 0, count: 0 }
    const total = received.reduce((sum, review) => sum + review.rating, 0)
    return { average: total / received.length, count: received.length }
  },

  toPublic(user) {
    if (!user) return null
    const { password: _password, ...publicUser } = user
    return { ...publicUser, rating: usersService.getRating(user.id) }
  },
}
