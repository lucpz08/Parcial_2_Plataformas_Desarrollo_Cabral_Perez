import { Link } from 'react-router'
import { CheckCircle2, Compass, Library, Plus } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard/ListingCard'
import { Button } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listingsService } from '@/services/listings'
import styles from './PublishPage.module.css'

export function PublishSuccess({ listingIds, onPublishMore }) {
  useDocumentTitle('Publicación creada')
  const listings = listingIds.map((id) => listingsService.getDetailed(id)).filter(Boolean)
  const single = listings.length === 1

  return (
    <div className={styles.success}>
      <span className={styles.successIcon}>
        <CheckCircle2 size={40} />
      </span>
      <h1>{single ? '¡Publicación creada!' : `¡Publicaste ${listings.length} cartas!`}</h1>
      <p>Ya {single ? 'aparece' : 'aparecen'} en Explorar. Te vamos a avisar por chat cuando alguien quiera reservar.</p>

      <div className={styles.successActions}>
        {single ? (
          <Button as={Link} to={`/explorar/${listings[0].id}`} icon={Compass}>
            Ver publicación
          </Button>
        ) : (
          <Button as={Link} to="/explorar" icon={Compass}>
            Ver en Explorar
          </Button>
        )}
        <Button variant="outline" icon={Plus} onClick={onPublishMore}>
          Publicar otra
        </Button>
        <Button as={Link} to="/album" variant="ghost" icon={Library}>
          Volver al álbum
        </Button>
      </div>

      <div className={styles.successGrid}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isOwn />
        ))}
      </div>
    </div>
  )
}
