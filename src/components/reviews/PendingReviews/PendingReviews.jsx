import { useState } from 'react'
import { Link } from 'react-router'
import { Star } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Avatar, Button } from '@/components/ui'
import { feedbackService } from '@/services/feedback'
import { formatRelative, pluralize } from '@/utils/format'
import { ReviewModal } from '../ReviewModal/ReviewModal'
import styles from './PendingReviews.module.css'

export function PendingReviews({ userId }) {
  const [reviewingClaimId, setReviewingClaimId] = useState(null)
  const pending = feedbackService.getPendingForUser(userId)
  const reviewing = reviewingClaimId ? feedbackService.getForClaim(reviewingClaimId, userId) : null

  if (pending.length === 0 && !reviewing) return null

  return (
    <section className={styles.pending} aria-label="Reseñas pendientes">
      <header>
        <span className={styles.icon}>
          <Star size={18} />
        </span>
        <div>
          <h2>{pluralize(pending.length, 'reseña pendiente', 'reseñas pendientes')}</h2>
          <p>Calificá a las personas con las que completaste una transacción.</p>
        </div>
      </header>

      <ul>
        {pending.map((item) => (
          <li key={item.claim.id} className={styles.item}>
            <Link to={`/explorar/${item.listing.id}`} className={styles.thumb}>
              <CardImage card={item.listing.card} />
            </Link>
            <Avatar name={item.counterpart.displayName} src={item.counterpart.avatarUrl} size={36} />
            <div className={styles.text}>
              <strong>{item.counterpart.displayName}</strong>
              <span>
                {item.role === 'buyer' ? 'Le compraste' : 'Le vendiste'} {item.listing.card.name} ·{' '}
                {formatRelative(item.claim.closedAt ?? item.claim.createdAt)}
              </span>
            </div>
            <Button size="sm" variant="gold" onClick={() => setReviewingClaimId(item.claim.id)}>
              Calificar
            </Button>
          </li>
        ))}
      </ul>

      <ReviewModal
        context={reviewing?.myReview ? null : reviewing}
        userId={userId}
        onClose={() => setReviewingClaimId(null)}
      />
    </section>
  )
}
