import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { IntentBadge, ListingStatusBadge } from '@/components/listings/ListingBadges'
import { getListingPriceLabel } from '@/components/listings/listingPrice'
import styles from './ChatsPage.module.css'

export function ListingContext({ listing, userId }) {
  if (!listing?.card) return null
  const price = getListingPriceLabel(listing)

  return (
    <Link to={`/explorar/${listing.id}`} className={styles.context}>
      <span className={styles.contextThumb}>
        <CardImage card={listing.card} />
      </span>
      <div className={styles.contextBody}>
        <span className={styles.contextLabel}>
          {listing.userId === userId ? 'Tu publicación' : `Publicación de ${listing.seller?.displayName}`}
        </span>
        <strong>{listing.card.name}</strong>
        <span className={styles.contextMeta}>
          <IntentBadge intent={listing.intent} variant="soft" />
          <ListingStatusBadge status={listing.status} />
          <span>{price.main}</span>
        </span>
      </div>
      <ChevronRight size={18} className={styles.contextArrow} />
    </Link>
  )
}
