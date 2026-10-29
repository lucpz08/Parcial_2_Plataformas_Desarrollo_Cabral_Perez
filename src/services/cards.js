import { createRepository } from './repository'

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

  getSets() {
    const sets = new Map()
    repository.all().forEach((card) => {
      if (!sets.has(card.setId)) sets.set(card.setId, { id: card.setId, name: card.setName, total: card.setTotal })
    })
    return [...sets.values()]
  },
}
