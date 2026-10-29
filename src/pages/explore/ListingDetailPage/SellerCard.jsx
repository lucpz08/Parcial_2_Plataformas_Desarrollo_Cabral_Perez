import { Link } from 'react-router'
import { CalendarDays, ChevronRight, MapPin, Package } from 'lucide-react'
import { Avatar, StarRating } from '@/components/ui'
import { formatDate, pluralize } from '@/utils/format'
import styles from './ListingDetailPage.module.css'

export function SellerCard({ seller, activeListings, label }) {
  return (
    <Link to={`/usuarios/${seller.id}`} className={styles.seller}>
      <span className={styles.sellerLabel}>{label}</span>
      <div className={styles.sellerMain}>
        <Avatar name={seller.displayName} src={seller.avatarUrl} size={52} />
        <div className={styles.sellerText}>
          <strong>{seller.displayName}</strong>
          <span>@{seller.username}</span>
          <StarRating value={seller.rating.average} count={seller.rating.count} size={13} showValue />
        </div>
        <ChevronRight size={20} className={styles.sellerArrow} />
      </div>
      <ul className={styles.sellerMeta}>
        <li>
          <MapPin size={14} />
          {[seller.city, seller.province].filter(Boolean).join(', ') || 'Sin ubicación'}
        </li>
        <li>
          <CalendarDays size={14} />
          Miembro desde {formatDate(seller.createdAt)}
        </li>
        <li>
          <Package size={14} />
          {pluralize(activeListings, 'publicación activa', 'publicaciones activas')}
        </li>
      </ul>
    </Link>
  )
}
