import { cardsService } from './cards'
import { collectionService } from './collection'
import { listingsService } from './listings'
import { getTable, setTable } from './storage'
import { CARD_RARITIES, CARD_TYPES } from '@/data/constants'
import { now } from '@/utils/id'

const IMAGE_BASE = 'https://images.pokemontcg.io'
const SET_ID_PATTERN = /^[a-z0-9]{2,12}$/
const NUMBER_PATTERN = /^[0-9]{1,4}[a-z]?$/i
const MAX_REFERENCE_PRICE = 100000000

const SORTERS = {
  set: (a, b) => a.setName.localeCompare(b.setName) || Number.parseInt(a.number, 10) - Number.parseInt(b.number, 10),
  name: (a, b) => a.name.localeCompare(b.name),
  price_desc: (a, b) => b.referencePrice - a.referencePrice,
  usage: (a, b) => b.usage.owners - a.usage.owners || b.usage.listings - a.usage.listings,
}

function fail(message, field) {
  throw Object.assign(new Error(message), field ? { field } : {})
}

function isValidUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function getUsage(cardId) {
  const items = collectionService.where((item) => item.cardId === cardId)
  const listings = listingsService.where((listing) => listing.cardId === cardId)
  return {
    owners: new Set(items.map((item) => item.userId)).size,
    copies: items.reduce((sum, item) => sum + item.quantity, 0),
    listings: listings.filter((listing) => ['disponible', 'reservado'].includes(listing.status)).length,
    references: items.length + listings.length,
  }
}

export const catalogAdminService = {
  buildImageUrls(setId, number) {
    const set = setId.trim().toLowerCase()
    const code = number.trim()
    return {
      imageSmall: `${IMAGE_BASE}/${set}/${code}.png`,
      imageLarge: `${IMAGE_BASE}/${set}/${code}_hires.png`,
    }
  },

  list({ query = '', setId = '', type = '', status = '', sort = 'set' } = {}) {
    const text = query.trim().toLowerCase()
    return cardsService
      .search({ query: text, setId, type, includeInactive: true })
      .filter((card) => !status || (status === 'active' ? card.active : !card.active))
      .map((card) => ({ ...card, usage: getUsage(card.id) }))
      .sort(SORTERS[sort] ?? SORTERS.set)
  },

  getStats() {
    const cards = cardsService.all()
    const owned = new Set(collectionService.all().map((item) => item.cardId))
    return {
      total: cards.length,
      active: cards.filter((card) => card.active).length,
      inactive: cards.filter((card) => !card.active).length,
      sets: cardsService.getSets().length,
      inAlbums: cards.filter((card) => owned.has(card.id)).length,
      catalogValue: cards.filter((card) => card.active).reduce((sum, card) => sum + card.referencePrice, 0),
    }
  },

  validate(data, cardId = null) {
    const errors = {}
    const setId = (data.setId ?? '').trim().toLowerCase()
    const number = (data.number ?? '').trim()
    const price = Number(data.referencePrice)
    const setTotal = Number(data.setTotal)

    if ((data.name ?? '').trim().length < 2) errors.name = 'Ingresá el nombre de la carta.'
    if (!SET_ID_PATTERN.test(setId)) errors.setId = 'Usá de 2 a 12 letras minúsculas o números (ej: base1, sv3pt5).'
    if ((data.setName ?? '').trim().length < 2) errors.setName = 'Ingresá el nombre de la expansión.'
    if (!Number.isInteger(setTotal) || setTotal < 1 || setTotal > 999) errors.setTotal = 'Entre 1 y 999.'
    if (!NUMBER_PATTERN.test(number)) errors.number = 'Número inválido (ej: 4, 215, 25a).'
    if (!CARD_TYPES.includes(data.type)) errors.type = 'Elegí un tipo.'
    if (!CARD_RARITIES.includes(data.rarity)) errors.rarity = 'Elegí una rareza.'
    if (!Number.isInteger(price) || price <= 0 || price > MAX_REFERENCE_PRICE) {
      errors.referencePrice = 'Ingresá un precio entero mayor a 0.'
    }
    if (data.imageSmall && !isValidUrl(data.imageSmall)) errors.imageSmall = 'URL inválida.'
    if (data.imageLarge && !isValidUrl(data.imageLarge)) errors.imageLarge = 'URL inválida.'

    if (!cardId && !errors.setId && !errors.number && cardsService.findById(`${setId}-${number}`)) {
      errors.number = 'Ya existe una carta con ese número en esa expansión.'
    }
    const existingSet = cardsService.getSets().find((set) => set.id === setId)
    if (!errors.setId && existingSet && existingSet.name !== (data.setName ?? '').trim()) {
      errors.setName = `La expansión ${setId} ya existe como "${existingSet.name}".`
    }
    return errors
  },

  create(data) {
    const [field, message] = Object.entries(catalogAdminService.validate(data))[0] ?? []
    if (field) fail(message, field)
    const setId = data.setId.trim().toLowerCase()
    const number = data.number.trim()
    const card = {
      id: `${setId}-${number}`,
      name: data.name.trim(),
      setId,
      setName: data.setName.trim(),
      setTotal: Number(data.setTotal),
      number,
      type: data.type,
      rarity: data.rarity,
      referencePrice: Number(data.referencePrice),
      imageSmall: data.imageSmall?.trim() || null,
      imageLarge: data.imageLarge?.trim() || null,
      active: data.active !== false,
      createdAt: now(),
    }
    setTable('cards', [...getTable('cards'), card])
    return card
  },

  update(id, data) {
    const card = cardsService.findById(id)
    if (!card) fail('La carta ya no existe.')
    const merged = { ...data, setId: card.setId, number: card.number, setName: card.setName, setTotal: card.setTotal }
    const [field, message] = Object.entries(catalogAdminService.validate(merged, id))[0] ?? []
    if (field) fail(message, field)
    return cardsService.update(id, {
      name: data.name.trim(),
      type: data.type,
      rarity: data.rarity,
      referencePrice: Number(data.referencePrice),
      imageSmall: data.imageSmall?.trim() || null,
      imageLarge: data.imageLarge?.trim() || null,
      active: data.active !== false,
    })
  },

  setActive(id, active) {
    const card = cardsService.findById(id)
    if (!card) fail('La carta ya no existe.')
    return cardsService.update(id, { active })
  },

  remove(id) {
    const card = cardsService.findById(id)
    if (!card) fail('La carta ya no existe.')
    if (getUsage(id).references > 0) {
      fail('Está en álbumes o publicaciones. Desactivala para que no se pueda agregar más.')
    }
    cardsService.remove(id)
  },

  adjustedPrice(price, percent) {
    return Math.max(1000, Math.round((price * (1 + percent / 100)) / 1000) * 1000)
  },

  adjustPrices({ setId = '', percent }) {
    const value = Number(percent)
    if (!Number.isFinite(value) || value === 0 || value < -90 || value > 500) {
      fail('Ingresá un porcentaje entre -90 y 500 (distinto de 0).', 'percent')
    }
    let updated = 0
    const rows = getTable('cards').map((card) => {
      if (setId && card.setId !== setId) return card
      updated += 1
      return {
        ...card,
        referencePrice: catalogAdminService.adjustedPrice(card.referencePrice, value),
        updatedAt: now(),
      }
    })
    if (updated === 0) fail('No hay cartas en esa expansión.')
    setTable('cards', rows)
    return updated
  },
}
