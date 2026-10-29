import { formatPrice } from '@/utils/format'

export function getListingPriceLabel(listing) {
  if (listing.intent === 'cambiar') return { main: 'Para cambio', detail: 'Acepta ofertas de cartas' }
  if (listing.intent === 'busco') {
    return listing.price != null
      ? { main: formatPrice(listing.price), detail: 'Paga hasta' }
      : { main: 'A convenir', detail: 'Busca esta carta' }
  }
  return { main: formatPrice(listing.price), detail: 'Precio' }
}
