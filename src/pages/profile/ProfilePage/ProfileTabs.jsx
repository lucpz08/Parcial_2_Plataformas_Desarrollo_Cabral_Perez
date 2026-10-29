import { useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Library, MessageCircle, MessageSquareQuote, PackageOpen, Ticket } from 'lucide-react'
import { CardImage, CardTile } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { ListingCard } from '@/components/listings/ListingCard/ListingCard'
import { getListingPriceLabel } from '@/components/listings/listingPrice'
import { Avatar, Badge, Button, Chip, EmptyState, StarRating } from '@/components/ui'
import { CLAIM_STATUSES, CONDITION_LABELS } from '@/data/constants'
import { chatsService } from '@/services/chats'
import { profilesService } from '@/services/profiles'
import { formatDate, formatRelative, pluralize } from '@/utils/format'
import styles from './ProfilePage.module.css'

const CLAIM_TONES = { active: 'warning', completed: 'success', cancelled: 'neutral' }

export function ListingsTab({ activeListings, pastListings, isOwn, firstName }) {
  const [view, setView] = useState('active')
  const listings = view === 'active' ? activeListings : pastListings

  return (
    <div className={styles.tabPanel}>
      {isOwn && (
        <div className={styles.segmented}>
          <Chip selected={view === 'active'} onClick={() => setView('active')}>
            Activas ({activeListings.length})
          </Chip>
          <Chip selected={view === 'past'} onClick={() => setView('past')}>
            Historial ({pastListings.length})
          </Chip>
        </div>
      )}
      {listings.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={view === 'active' ? 'Sin publicaciones activas' : 'Sin historial todavía'}
          description={
            isOwn
              ? view === 'active'
                ? 'Publicá cartas de tu álbum para venderlas o cambiarlas.'
                : 'Acá vas a ver las publicaciones completadas o dadas de baja.'
              : `${firstName} no tiene publicaciones activas en este momento.`
          }
          action={
            isOwn &&
            view === 'active' && (
              <Button as={Link} to="/publicar">
                Publicar una carta
              </Button>
            )
          }
        />
      ) : (
        <div className={styles.listingGrid}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isOwn={isOwn} showStatus />
          ))}
        </div>
      )}
    </div>
  )
}

export function ReviewsTab({ reviews, rating, firstName, isOwn }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="Sin reseñas todavía"
        description={
          isOwn
            ? 'Cuando completes una compra, venta o cambio, la otra persona va a poder dejarte una reseña.'
            : `${firstName} todavía no recibió reseñas.`
        }
      />
    )
  }

  const distribution = profilesService.getRatingDistribution(reviews)

  return (
    <div className={styles.reviews}>
      <aside className={styles.ratingSummary}>
        <strong>{rating.average.toFixed(1)}</strong>
        <StarRating value={rating.average} size={20} />
        <span>{pluralize(rating.count, 'reseña', 'reseñas')}</span>
        <ul className={styles.distribution}>
          {distribution.map(({ stars, count }) => (
            <li key={stars}>
              <span>{stars}★</span>
              <span className={styles.bar}>
                <span style={{ width: `${(count / reviews.length) * 100}%` }} />
              </span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </aside>

      <ul className={styles.reviewList}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <header>
              <Avatar name={review.reviewer?.displayName ?? 'Usuario'} src={review.reviewer?.avatarUrl} size={36} />
              <div>
                {review.reviewer ? (
                  <Link to={`/usuarios/${review.reviewer.id}`}>{review.reviewer.displayName}</Link>
                ) : (
                  <strong>Usuario eliminado</strong>
                )}
                <span>
                  <StarRating value={review.rating} size={12} />
                  {formatRelative(review.createdAt)}
                </span>
              </div>
            </header>
            {review.comment && <p>{review.comment}</p>}
            {review.tags?.length > 0 && (
              <ul className={styles.reviewTags}>
                {review.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            {review.card && (
              <span className={styles.reviewCard}>
                {review.revieweeRole === 'seller' ? 'Como vendedor' : 'Como comprador'} · {review.card.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CollectionTab({ collection, isOwn, firstName }) {
  if (collection.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="Álbum vacío"
        description={isOwn ? 'Agregá cartas desde el catálogo para armar tu colección.' : `${firstName} todavía no cargó cartas.`}
        action={
          isOwn && (
            <Button as={Link} to="/album/catalogo" icon={BookOpen}>
              Ir al catálogo
            </Button>
          )
        }
      />
    )
  }

  return (
    <div className={styles.tabPanel}>
      {isOwn && (
        <p className={styles.tabHint}>
          Así ven tu colección los demás. Para organizarla, entrá a <Link to="/album">Mi álbum</Link>.
        </p>
      )}
      <div className={styles.collectionGrid}>
        {collection.map((item) => (
          <CardTile
            key={item.id}
            card={item.card}
            badges={
              <>
                {item.quantity > 1 && <Badge tone="primary" variant="solid">×{item.quantity}</Badge>}
                {item.verification === 'verified' && <VerificationBadge status="verified" compact />}
              </>
            }
          >
            <span className={styles.collectionCondition}>{CONDITION_LABELS[item.condition]}</span>
          </CardTile>
        ))}
      </div>
    </div>
  )
}

export function ClaimsTab({ userId }) {
  const claims = profilesService.getClaimsMadeBy(userId)

  if (claims.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="No reservaste cartas todavía"
        description="Cuando reserves una carta en Explorar, vas a poder seguirla desde acá."
        action={
          <Button as={Link} to="/explorar">
            Explorar publicaciones
          </Button>
        }
      />
    )
  }

  return (
    <ul className={styles.claims}>
      {claims.map((claim) => {
        const { listing } = claim
        const conversation = chatsService.findBetween(userId, listing.userId, listing.id)
        return (
          <li key={claim.id} className={styles.claim}>
            <Link to={`/explorar/${listing.id}`} className={styles.claimThumb}>
              <CardImage card={listing.card} />
            </Link>
            <div className={styles.claimBody}>
              <Link to={`/explorar/${listing.id}`} className={styles.claimTitle}>
                {listing.card.name}
              </Link>
              <span>
                {listing.seller?.displayName} · {getListingPriceLabel(listing).main}
              </span>
              <span>Reservada el {formatDate(claim.createdAt)}</span>
            </div>
            <Badge tone={CLAIM_TONES[claim.status]} dot>
              {CLAIM_STATUSES[claim.status]}
            </Badge>
            {conversation && (
              <Button as={Link} to={`/chats/${conversation.id}`} variant="ghost" size="sm" icon={MessageCircle}>
                Chat
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
