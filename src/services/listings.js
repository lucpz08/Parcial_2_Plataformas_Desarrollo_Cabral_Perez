import { createRepository } from './repository'
import { cardsService } from './cards'
import { collectionService } from './collection'
import { usersService } from './users'
import { LISTING_MAX_DESCRIPTION, LISTING_MAX_PRICE } from '@/data/constants'

const repository = createRepository('listings', 'l')

const OPEN_STATUSES = ['disponible', 'reservado']

const byRecent = (a, b) => b.createdAt.localeCompare(a.createdAt)

const SORTERS = {
  recent: byRecent,
  price_asc: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || byRecent(a, b),
  price_desc: (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity) || byRecent(a, b),
}

function withRelations(listing) {
  return {
    ...listing,
    card: cardsService.findById(listing.cardId),
    collectionItem: listing.collectionItemId ? collectionService.findById(listing.collectionItemId) : null,
    seller: usersService.toPublic(usersService.findById(listing.userId)),
  }
}

function fail(message) {
  throw new Error(message)
}

function normalizeFields({ intent, price, description = '', province = null }) {
  const text = description.trim()
  if (text.length > LISTING_MAX_DESCRIPTION) fail(`La descripción admite hasta ${LISTING_MAX_DESCRIPTION} caracteres.`)
  const value = intent === 'cambiar' || price === '' || price == null ? null : Number(price)
  if (value != null && (!Number.isInteger(value) || value <= 0 || value > LISTING_MAX_PRICE)) fail('Ingresá un precio válido.')
  if (intent === 'vender' && value == null) fail('Las cartas en venta necesitan un precio.')
  return { intent, price: value, description: text, province: province || null }
}

export const listingsService = {
  ...repository,

  withRelations,

  getDetailed(id) {
    const listing = repository.findById(id)
    return listing ? withRelations(listing) : null
  },

  search({
    query = '',
    intent = '',
    province = '',
    condition = '',
    status = 'disponible',
    minPrice = null,
    maxPrice = null,
    verifiedOnly = false,
    sort = 'recent',
  } = {}) {
    const text = query.trim().toLowerCase()
    const filtersByPrice = minPrice != null || maxPrice != null

    return repository
      .all()
      .map(withRelations)
      .filter(
        (listing) =>
          listing.card &&
          listing.seller?.status === 'activo' &&
          (!status || listing.status === status) &&
          (!intent || listing.intent === intent) &&
          (!province || listing.province === province) &&
          (!condition || listing.collectionItem?.condition === condition) &&
          (!verifiedOnly || listing.collectionItem?.verification === 'verified') &&
          (!filtersByPrice || listing.price != null) &&
          (minPrice == null || listing.price >= minPrice) &&
          (maxPrice == null || listing.price <= maxPrice) &&
          (!text || listing.card.name.toLowerCase().includes(text) || listing.card.setName.toLowerCase().includes(text)),
      )
      .sort(SORTERS[sort] ?? SORTERS.recent)
  },

  getRelated(listing, limit = 4) {
    const available = listingsService.search().filter((other) => other.id !== listing.id)
    return {
      sameCard: available.filter((other) => other.cardId === listing.cardId).slice(0, limit),
      sameSeller: available.filter((other) => other.userId === listing.userId).slice(0, limit),
    }
  },

  publishFromCollection({ userId, entries, intent, description, province }) {
    if (!['vender', 'cambiar'].includes(intent)) fail('Desde el álbum solo podés vender o cambiar cartas.')
    if (entries.length === 0) fail('Elegí al menos una carta para publicar.')

    const prepared = entries.map(({ collectionItemId, price }) => {
      const item = collectionService.findById(collectionItemId)
      if (!item || item.userId !== userId) fail('Solo podés publicar cartas de tu álbum.')
      if (collectionService.getOpenListing(item.id)) fail('Una de las cartas ya tiene una publicación activa.')
      return { item, fields: normalizeFields({ intent, price, description, province }) }
    })

    return prepared.map(({ item, fields }) =>
      repository.create({
        userId,
        cardId: item.cardId,
        collectionItemId: item.id,
        currency: 'ARS',
        status: 'disponible',
        ...fields,
        updatedAt: new Date().toISOString(),
      }),
    )
  },

  createWanted({ userId, cardId, price, description, province }) {
    const card = cardsService.findById(cardId)
    if (!card || !card.active) fail('Esa carta no está disponible en el catálogo.')
    if (listingsService.hasOpenWanted(userId, cardId)) fail('Ya tenés una publicación activa buscando esta carta.')

    return repository.create({
      userId,
      cardId,
      collectionItemId: null,
      currency: 'ARS',
      status: 'disponible',
      ...normalizeFields({ intent: 'busco', price, description, province }),
      updatedAt: new Date().toISOString(),
    })
  },

  hasOpenWanted(userId, cardId) {
    return repository
      .all()
      .some(
        (listing) =>
          listing.userId === userId &&
          listing.cardId === cardId &&
          listing.intent === 'busco' &&
          OPEN_STATUSES.includes(listing.status),
      )
  },

  edit(id, userId, changes) {
    const listing = repository.findById(id)
    if (!listing) fail('La publicación ya no existe.')
    if (listing.userId !== userId) fail('Solo podés editar tus publicaciones.')
    if (listing.status !== 'disponible') fail('Solo se pueden editar publicaciones disponibles.')
    const allowed = listing.collectionItemId ? ['vender', 'cambiar'] : ['busco']
    if (!allowed.includes(changes.intent)) fail('Ese tipo de publicación no aplica a esta carta.')
    return repository.update(id, normalizeFields(changes))
  },

  close(id, userId) {
    const listing = repository.findById(id)
    if (!listing) throw new Error('La publicación ya no existe.')
    if (listing.userId !== userId) throw new Error('Solo podés dar de baja tus publicaciones.')
    if (listing.status !== 'disponible') throw new Error('Solo se pueden dar de baja publicaciones disponibles.')
    return repository.update(id, { status: 'cancelado' })
  },

  getByUser(userId) {
    return repository
      .where((listing) => listing.userId === userId)
      .map(withRelations)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
}
