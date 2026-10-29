import { ArrowLeftRight, Search, Tag, TrendingDown } from 'lucide-react'
import { cx } from '@/utils/cx'
import { formatPrice } from '@/utils/format'
import styles from './ListingDetailPage.module.css'

function getComparison(listing, referencePrice) {
  if (listing.intent !== 'vender' || listing.price == null || !referencePrice) return null
  const diff = Math.round(((listing.price - referencePrice) / referencePrice) * 100)
  if (Math.abs(diff) < 3) return { tone: 'even', text: 'En línea con el precio de referencia' }
  return diff < 0
    ? { tone: 'below', text: `${Math.abs(diff)}% debajo del precio de referencia` }
    : { tone: 'above', text: `${diff}% arriba del precio de referencia` }
}

export function PriceComparison({ listing, referencePrice }) {
  const comparison = getComparison(listing, referencePrice)
  if (!comparison) return null
  return <span className={cx(styles.comparison, styles[comparison.tone])}>{comparison.text}</span>
}

export function MarketInsight({ card, summary }) {
  const items = [
    { icon: TrendingDown, label: 'Precio de referencia', value: formatPrice(card.referencePrice) },
    { icon: Tag, label: 'Menor precio publicado', value: summary.lowestPrice != null ? formatPrice(summary.lowestPrice) : '—' },
    { icon: Tag, label: 'En venta', value: summary.forSale },
    { icon: ArrowLeftRight, label: 'Para cambio', value: summary.forTrade },
    { icon: Search, label: 'La buscan', value: summary.wanted },
  ]

  return (
    <section className={styles.market} aria-label="Mercado de esta carta">
      <h2>Mercado de esta carta</h2>
      <dl className={styles.marketGrid}>
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className={styles.marketItem}>
            <dt>
              <Icon size={14} />
              {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
