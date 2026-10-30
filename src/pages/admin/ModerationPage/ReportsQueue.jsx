import { useState } from 'react'
import { Link } from 'react-router'
import { Ban, Check, ExternalLink, ShieldCheck } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { IntentBadge, ListingStatusBadge } from '@/components/listings/ListingBadges'
import { getListingPriceLabel } from '@/components/listings/listingPrice'
import { Avatar, Badge, Button, EmptyState } from '@/components/ui'
import { REPORT_REASON_LABELS } from '@/data/constants'
import { useToast } from '@/hooks/useToast'
import { moderationService } from '@/services/moderation'
import { formatRelative, pluralize } from '@/utils/format'
import { ReasonModal } from './ReasonModal'
import styles from './ModerationPage.module.css'

const TAKE_DOWN_REASONS = [
  'La carta publicada es una réplica.',
  'Las fotos o la descripción no corresponden a la carta real.',
  'El precio es abusivo respecto del mercado.',
  'Publicación duplicada o spam.',
]

export function ListingSummary({ listing }) {
  const price = getListingPriceLabel(listing)
  return (
    <div className={styles.listingSummary}>
      <Link to={`/explorar/${listing.id}`} className={styles.listingThumb}>
        <CardImage card={listing.card} />
      </Link>
      <div>
        <Link to={`/explorar/${listing.id}`} className={styles.listingTitle}>
          {listing.card.name}
          <ExternalLink size={13} />
        </Link>
        <span className={styles.listingMeta}>
          <IntentBadge intent={listing.intent} variant="soft" />
          <ListingStatusBadge status={listing.status} />
          <strong>{price.main}</strong>
        </span>
        <span className={styles.listingSeller}>
          {listing.seller?.displayName ?? 'Usuario eliminado'} · {listing.province ?? 'Sin provincia'}
        </span>
      </div>
    </div>
  )
}

export function TakeDownModal({ listing, adminId, onClose }) {
  const toast = useToast()

  function confirm(reason) {
    const { resolvedReports, cancelledClaim } = moderationService.takeDownListing(listing.id, adminId, reason)
    const extra = [
      resolvedReports > 0 && pluralize(resolvedReports, 'denuncia resuelta', 'denuncias resueltas'),
      cancelledClaim && 'se canceló la reserva activa',
    ]
      .filter(Boolean)
      .join(' · ')
    toast.success('Publicación dada de baja', extra || undefined)
    onClose()
  }

  return (
    <ReasonModal
      title={`Dar de baja ${listing.card.name}`}
      description={`Publicada por ${listing.seller?.displayName ?? 'usuario eliminado'}.`}
      warning="Deja de verse en Explorar, se cancela la reserva activa si la hay y se resuelven sus denuncias."
      label="Motivo de la baja"
      quickReasons={TAKE_DOWN_REASONS}
      confirmLabel="Dar de baja"
      icon={Ban}
      onClose={onClose}
      onConfirm={confirm}
    />
  )
}

export function ReportsQueue({ adminId }) {
  const toast = useToast()
  const [takingDown, setTakingDown] = useState(null)
  const queue = moderationService.getReportQueue()

  function dismiss(listing) {
    try {
      const count = moderationService.dismissReports(listing.id, adminId)
      toast.info(`Descartaste ${pluralize(count, 'denuncia', 'denuncias')}`, 'La publicación sigue activa.')
    } catch (error) {
      toast.error('No se pudo descartar', error.message)
    }
  }

  if (queue.length === 0) {
    return <EmptyState icon={ShieldCheck} title="Sin denuncias pendientes" description="La comunidad no reportó publicaciones." />
  }

  return (
    <div className={styles.tabPanel}>
      {queue.map(({ listing, reports }) => (
        <article key={listing.id} className={styles.reportGroup}>
          <header>
            <ListingSummary listing={listing} />
            <Badge tone="danger" variant="solid">
              {pluralize(reports.length, 'denuncia', 'denuncias')}
            </Badge>
          </header>

          <ul className={styles.reportList}>
            {reports.map((report) => (
              <li key={report.id}>
                <Avatar name={report.reporter?.displayName ?? 'Usuario eliminado'} src={report.reporter?.avatarUrl} size={28} />
                <div>
                  <span className={styles.reportHead}>
                    <strong>{REPORT_REASON_LABELS[report.reason]}</strong>
                    <span>
                      {report.reporter?.displayName ?? 'Usuario eliminado'} · {formatRelative(report.createdAt)}
                    </span>
                  </span>
                  {report.details && <p>{report.details}</p>}
                </div>
              </li>
            ))}
          </ul>

          <footer className={styles.groupActions}>
            <Button variant="ghost" icon={Check} onClick={() => dismiss(listing)}>
              Descartar denuncias
            </Button>
            <Button variant="danger" icon={Ban} onClick={() => setTakingDown(listing)}>
              Dar de baja
            </Button>
          </footer>
        </article>
      ))}

      {takingDown && <TakeDownModal listing={takingDown} adminId={adminId} onClose={() => setTakingDown(null)} />}
    </div>
  )
}
