import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Maximize2, PackageX } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { IntentBadge, ListingStatusBadge } from '@/components/listings/ListingBadges'
import { ListingCard } from '@/components/listings/ListingCard/ListingCard'
import { getListingPriceLabel } from '@/components/listings/listingPrice'
import { Button, EmptyState, Modal } from '@/components/ui'
import { CONDITION_LABELS, LANGUAGE_LABELS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cardsService } from '@/services/cards'
import { claimsService } from '@/services/claims'
import { listingsService } from '@/services/listings'
import { usersService } from '@/services/users'
import { cx } from '@/utils/cx'
import { formatDate, formatRelative } from '@/utils/format'
import { ListingActions } from './ListingActions'
import { getViewerRole } from './claimCopy'
import { MarketInsight, PriceComparison } from './MarketInsight'
import { SellerCard } from './SellerCard'
import styles from './ListingDetailPage.module.css'

const SELLER_LABELS = { vender: 'Vende', cambiar: 'Ofrece', busco: 'La busca' }

function BackLink() {
  return (
    <Link to="/explorar" className={styles.back}>
      <ArrowLeft size={16} />
      Volver a Explorar
    </Link>
  )
}

function RelatedListings({ title, listings, userId }) {
  if (listings.length === 0) return null
  return (
    <section className={styles.related}>
      <h2>{title}</h2>
      <div className={styles.relatedGrid}>
        {listings.map((other) => (
          <ListingCard key={other.id} listing={other} isOwn={other.userId === userId} />
        ))}
      </div>
    </section>
  )
}

export function ListingDetailPage() {
  const { listingId } = useParams()
  useDatabase()
  const { user, isAdmin } = useAuth()
  const [zoomed, setZoomed] = useState(false)

  const listing = listingsService.getDetailed(listingId)
  const visible = Boolean(listing?.card) && (listing.seller?.status === 'activo' || listing.userId === user?.id || isAdmin)
  useDocumentTitle(visible ? listing.card.name : 'Publicación no encontrada')

  if (!visible) {
    return (
      <div className={styles.page}>
        <BackLink />
        <EmptyState
          icon={PackageX}
          title="Publicación no encontrada"
          description="Puede que se haya eliminado o que el enlace no sea correcto."
          action={
            <Button as={Link} to="/explorar">
              Ver publicaciones
            </Button>
          }
        />
      </div>
    )
  }

  const { card, seller, collectionItem } = listing
  const activeClaim = claimsService.getActiveForListing(listing.id)
  const claimant = activeClaim ? usersService.toPublic(usersService.findById(activeClaim.claimantId)) : null
  const lastClaim = claimsService.getLastForListing(listing.id)
  const role = getViewerRole(listing, activeClaim, user)
  const price = getListingPriceLabel(listing)
  const market = cardsService.getMarketSummary(card.id)
  const related = listingsService.getRelated(listing)
  const sellerActiveCount = listingsService.search().filter((other) => other.userId === seller.id).length

  const details = [
    collectionItem && { label: 'Estado', value: CONDITION_LABELS[collectionItem.condition] },
    collectionItem && { label: 'Idioma', value: LANGUAGE_LABELS[collectionItem.language] },
    { label: 'Rareza', value: card.rarity },
    { label: 'Tipo', value: card.type },
    { label: 'Provincia', value: listing.province ?? 'Sin provincia' },
    { label: 'Publicada', value: formatDate(listing.createdAt), title: formatRelative(listing.createdAt) },
  ].filter(Boolean)

  return (
    <div className={styles.page}>
      <BackLink />

      <div className={styles.layout}>
        <div className={styles.media}>
          <button
            type="button"
            className={cx(styles.artwork, styles[listing.intent])}
            onClick={() => setZoomed(true)}
            aria-label={`Ampliar imagen de ${card.name}`}
          >
            <CardImage card={card} size="large" className={styles.artworkImage} />
            <span className={styles.zoomHint}>
              <Maximize2 size={14} />
              Ampliar
            </span>
          </button>
          {collectionItem && (
            <div className={styles.verification}>
              <VerificationBadge status={collectionItem.verification} />
              <span>
                {collectionItem.verification === 'verified'
                  ? 'Riolup revisó las fotos y confirmó el estado de esta carta.'
                  : 'El estado lo declara quien publica. Pedí fotos por chat si tenés dudas.'}
              </span>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.badges}>
            <IntentBadge intent={listing.intent} />
            <ListingStatusBadge status={listing.status} />
            {role === 'owner' && <span className={styles.ownTag}>Tu publicación</span>}
          </div>

          <header className={styles.heading}>
            <h1>{card.name}</h1>
            <p>
              {card.setName} · {card.number}/{card.setTotal}
            </p>
          </header>

          <div className={cx(styles.price, styles[listing.intent])}>
            <span>{price.detail}</span>
            <strong>{price.main}</strong>
            <PriceComparison listing={listing} referencePrice={card.referencePrice} />
          </div>

          <dl className={styles.details}>
            {details.map(({ label, value, title }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd title={title}>{value}</dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <blockquote className={styles.description}>
              <p>{listing.description}</p>
              <cite>— {seller.displayName}</cite>
            </blockquote>
          )}

          <ListingActions
            listing={listing}
            activeClaim={activeClaim}
            claimant={claimant}
            lastClaim={lastClaim}
            role={role}
            user={user}
          />

          <SellerCard seller={seller} activeListings={sellerActiveCount} label={SELLER_LABELS[listing.intent]} />
        </div>
      </div>

      <MarketInsight card={card} summary={market} />
      <RelatedListings title={`Otras publicaciones de ${card.name}`} listings={related.sameCard} userId={user?.id} />
      <RelatedListings title={`Más de ${seller.displayName}`} listings={related.sameSeller} userId={user?.id} />

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        title={card.name}
        description={`${card.setName} · ${card.number}/${card.setTotal}`}
      >
        <div className={styles.zoom}>
          <CardImage card={card} size="large" />
        </div>
      </Modal>
    </div>
  )
}
