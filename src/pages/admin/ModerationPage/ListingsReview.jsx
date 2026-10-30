import { useState } from 'react'
import { Ban, Flag, PackageSearch, Search } from 'lucide-react'
import { Badge, Button, Chip, EmptyState, Input } from '@/components/ui'
import { formatRelative } from '@/utils/format'
import { moderationService } from '@/services/moderation'
import { ListingSummary, TakeDownModal } from './ReportsQueue'
import styles from './ModerationPage.module.css'

const FLAG_TONES = { price: 'warning', reports: 'danger', seller: 'neutral' }

export function ListingsReview({ adminId }) {
  const [query, setQuery] = useState('')
  const [onlyFlagged, setOnlyFlagged] = useState(true)
  const [takingDown, setTakingDown] = useState(null)
  const listings = moderationService.getListingsForReview({ query, onlyFlagged })

  return (
    <div className={styles.tabPanel}>
      <div className={styles.reviewToolbar}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar por carta o vendedor..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar publicaciones"
        />
        <Chip selected={onlyFlagged} icon={Flag} onClick={() => setOnlyFlagged((value) => !value)}>
          Solo con alertas
        </Chip>
      </div>
      <p className={styles.hint}>
        Se marca el precio cuando supera 1,8 veces o queda por debajo del 40% del precio de referencia del catálogo.
      </p>

      {listings.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={onlyFlagged ? 'Ninguna publicación con alertas' : 'Sin resultados'}
          description={onlyFlagged ? 'Desactivá el filtro para revisar todas las publicaciones activas.' : 'Probá con otra búsqueda.'}
        />
      ) : (
        <ul className={styles.reviewList}>
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingSummary listing={listing} />
              <div className={styles.flags}>
                {listing.flags.map((flag) => (
                  <Badge key={flag.key} tone={FLAG_TONES[flag.key]} icon={Flag}>
                    {flag.label}
                    {flag.ratio && ` (×${flag.ratio.toFixed(1)})`}
                  </Badge>
                ))}
              </div>
              <time>{formatRelative(listing.createdAt)}</time>
              <Button variant="ghost" size="sm" icon={Ban} onClick={() => setTakingDown(listing)}>
                Dar de baja
              </Button>
            </li>
          ))}
        </ul>
      )}

      {takingDown && <TakeDownModal listing={takingDown} adminId={adminId} onClose={() => setTakingDown(null)} />}
    </div>
  )
}
