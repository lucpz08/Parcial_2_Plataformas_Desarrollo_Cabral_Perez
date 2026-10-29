import { Link } from 'react-router'
import { BadgeCheck, MapPin } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Avatar, StarRating } from '@/components/ui'
import { CONDITION_LABELS } from '@/data/constants'
import { cx } from '@/utils/cx'
import { formatRelative } from '@/utils/format'
import { IntentBadge, ListingStatusBadge } from '../ListingBadges'
import { getListingPriceLabel } from '../listingPrice'
import styles from './ListingCard.module.css'

export function ListingCard({ listing, isOwn = false, showStatus = false }) {
  const { card, seller, collectionItem } = listing
  const price = getListingPriceLabel(listing)
  const verified = collectionItem?.verification === 'verified'

  return (
    <Link to={`/explorar/${listing.id}`} className={cx(styles.card, styles[listing.intent])}>
      <div className={styles.media}>
        <CardImage card={card} />
        <div className={styles.mediaBadges}>
          <IntentBadge intent={listing.intent} />
          {showStatus && listing.status !== 'disponible' && <ListingStatusBadge status={listing.status} />}
        </div>
        {verified && (
          <span className={styles.verified} title="Carta verificada por Riolup">
            <BadgeCheck size={16} />
          </span>
        )}
        {isOwn && <span className={styles.own}>Tu publicación</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div className={styles.title}>
            <strong>{card.name}</strong>
            <span>
              {card.setName} · {card.number}/{card.setTotal}
            </span>
          </div>
          {collectionItem && <span className={styles.condition}>{CONDITION_LABELS[collectionItem.condition]}</span>}
        </div>

        <div className={styles.price}>
          <span>{price.detail}</span>
          <strong>{price.main}</strong>
        </div>

        <div className={styles.footer}>
          <Avatar name={seller.displayName} src={seller.avatarUrl} size={28} />
          <div className={styles.seller}>
            <span className={styles.sellerName}>{seller.displayName}</span>
            <StarRating value={seller.rating.average} size={11} />
          </div>
          <div className={styles.meta}>
            <span>
              <MapPin size={12} />
              {listing.province ?? 'Sin provincia'}
            </span>
            <span>{formatRelative(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
