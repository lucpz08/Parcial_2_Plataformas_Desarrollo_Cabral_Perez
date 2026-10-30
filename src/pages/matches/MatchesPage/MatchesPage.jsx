import { Link } from 'react-router'
import { ArrowRight, BadgeCheck, CircleAlert, HandCoins, Search, Sparkles, Tag } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { getListingPriceLabel } from '@/components/listings/listingPrice'
import { Avatar, Badge, Button, EmptyState, StarRating } from '@/components/ui'
import { CONDITION_LABELS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { matchesService } from '@/services/matches'
import { formatPrice, formatRelative, pluralize } from '@/utils/format'
import styles from './MatchesPage.module.css'

function CardHeader({ card, children }) {
  return (
    <header className={styles.cardHeader}>
      <span className={styles.thumb}>
        <CardImage card={card} />
      </span>
      <div>
        <h3>{card.name}</h3>
        <span>
          {card.setName} · {card.number}/{card.setTotal}
        </span>
        {children}
      </div>
    </header>
  )
}

function PersonRow({ listing, right, to }) {
  return (
    <li>
      <Link to={to} className={styles.row}>
        <Avatar name={listing.seller.displayName} src={listing.seller.avatarUrl} size={34} />
        <div className={styles.rowText}>
          <strong>{listing.seller.displayName}</strong>
          <span>
            <StarRating value={listing.seller.rating.average} size={11} />
            {listing.province ?? 'Sin provincia'} · {formatRelative(listing.createdAt)}
          </span>
        </div>
        {right}
        <ArrowRight size={16} className={styles.rowArrow} />
      </Link>
    </li>
  )
}

function BudgetBadge({ offer }) {
  if (offer.intent === 'cambiar') return <Badge tone="success">Para cambio</Badge>
  if (offer.withinBudget === true) {
    return (
      <Badge tone="success" icon={BadgeCheck}>
        En tu presupuesto
      </Badge>
    )
  }
  if (offer.withinBudget === false) {
    return (
      <Badge tone="warning" icon={CircleAlert}>
        Arriba de tu presupuesto
      </Badge>
    )
  }
  return null
}

export function MatchesPage() {
  useDatabase()
  const { user } = useAuth()
  const wanted = matchesService.getWantedMatches(user.id)
  const demand = matchesService.getDemandMatches(user.id)

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Mi colección"
        title="Coincidencias"
        subtitle="Cruzamos lo que buscás con lo que se publica, y lo que tenés con lo que otros buscan."
      />

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>
            <Search size={18} />
          </span>
          <div>
            <h2>Cartas que buscás y ya están publicadas</h2>
            <p>{pluralize(wanted.length, 'búsqueda con ofertas', 'búsquedas con ofertas')}</p>
          </div>
        </header>

        {wanted.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sin coincidencias por ahora"
            description="Publicá qué cartas buscás y te avisamos cuando alguien las publique."
            action={
              <Button as={Link} to="/publicar" icon={Search}>
                Publicar una búsqueda
              </Button>
            }
          />
        ) : (
          <div className={styles.grid}>
            {wanted.map(({ wanted: request, card, offers }) => (
              <article key={request.id} className={styles.card}>
                <CardHeader card={card}>
                  <span className={styles.budget}>
                    Tu presupuesto: <strong>{request.price != null ? formatPrice(request.price) : 'A convenir'}</strong>
                  </span>
                </CardHeader>
                <ul className={styles.rows}>
                  {offers.map((offer) => (
                    <PersonRow
                      key={offer.id}
                      listing={offer}
                      to={`/explorar/${offer.id}`}
                      right={
                        <div className={styles.rowRight}>
                          <strong>{getListingPriceLabel(offer).main}</strong>
                          <BudgetBadge offer={offer} />
                        </div>
                      }
                    />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>
            <HandCoins size={18} />
          </span>
          <div>
            <h2>Cartas tuyas que otros buscan</h2>
            <p>{pluralize(demand.length, 'carta con demanda', 'cartas con demanda')}</p>
          </div>
        </header>

        {demand.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="Nadie busca tus cartas todavía"
            description="Cuando alguien publique que busca una carta de tu álbum, aparece acá."
          />
        ) : (
          <div className={styles.grid}>
            {demand.map(({ item, card, requests }) => (
              <article key={item.id} className={styles.card}>
                <CardHeader card={card}>
                  <span className={styles.budget}>
                    Tenés {item.quantity} · {CONDITION_LABELS[item.condition]}
                    {item.openListing && ' · ya publicada'}
                  </span>
                </CardHeader>
                <ul className={styles.rows}>
                  {requests.map((request) => (
                    <PersonRow
                      key={request.id}
                      listing={request}
                      to={`/explorar/${request.id}`}
                      right={
                        <div className={styles.rowRight}>
                          <span className={styles.rowLabel}>Paga hasta</span>
                          <strong>{request.price != null ? formatPrice(request.price) : 'A convenir'}</strong>
                        </div>
                      }
                    />
                  ))}
                </ul>
                {!item.openListing && (
                  <Button as={Link} to={`/publicar?items=${item.id}`} variant="outline" size="sm" icon={Tag}>
                    Publicarla en venta
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
