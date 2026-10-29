import { LISTING_MAX_DESCRIPTION, LISTING_MAX_PRICE } from '@/data/constants'

export const PRICE_COPY = {
  vender: { label: 'Precio de venta', hint: 'Obligatorio' },
  busco: { label: 'Pagás hasta', hint: 'Opcional: dejalo vacío si es a convenir' },
}

function validatePrice(raw, intent) {
  const text = String(raw ?? '').trim()
  if (text === '') return intent === 'vender' ? 'Ingresá un precio.' : null
  const value = Number(text)
  if (!Number.isInteger(value) || value <= 0) return 'Usá un número entero mayor a 0.'
  if (value > LISTING_MAX_PRICE) return 'El precio es demasiado alto.'
  return null
}

export function validateListingForm(values, entries) {
  const prices = {}
  if (values.intent !== 'cambiar') {
    entries.forEach(({ key }) => {
      const error = validatePrice(values.prices[key], values.intent)
      if (error) prices[key] = error
    })
  }
  const description =
    values.description.trim().length > LISTING_MAX_DESCRIPTION ? `Máximo ${LISTING_MAX_DESCRIPTION} caracteres.` : null

  return { prices, description, valid: Object.keys(prices).length === 0 && !description }
}

export function buildPreviewListing({ entry, values, seller }) {
  const raw = String(values.prices[entry.key] ?? '').trim()
  const price = values.intent === 'cambiar' || raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw)

  return {
    id: 'preview',
    intent: values.intent,
    price: values.intent === 'vender' && price == null ? 0 : price,
    description: values.description,
    province: values.province || null,
    createdAt: new Date().toISOString(),
    card: entry.card,
    collectionItem: entry.collectionItem,
    seller,
  }
}
