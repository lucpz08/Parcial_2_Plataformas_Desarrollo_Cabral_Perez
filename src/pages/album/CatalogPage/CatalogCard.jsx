import { Library, Plus, Store } from 'lucide-react'
import { CardTile } from '@/components/cards/CardTile/CardTile'
import { Badge } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import styles from './CatalogPage.module.css'

export function CatalogCard({ card, ownedQuantity, market, onAdd }) {
  return (
    <CardTile
      card={card}
      onClick={() => onAdd(card)}
      badges={ownedQuantity > 0 && <Badge tone="success" icon={Library}>Tenés {ownedQuantity}</Badge>}
    >
      <div className={styles.cardFooter}>
        <span className={styles.cardPrice}>{formatPrice(card.referencePrice)}</span>
        <span className={styles.cardAdd} aria-hidden>
          <Plus size={16} />
        </span>
      </div>
      {market.forSale > 0 ? (
        <span className={styles.market}>
          <Store size={13} />
          {market.forSale} a la venta desde {formatPrice(market.lowestPrice)}
        </span>
      ) : (
        <span className={styles.marketEmpty}>Sin publicaciones a la venta</span>
      )}
    </CardTile>
  )
}
