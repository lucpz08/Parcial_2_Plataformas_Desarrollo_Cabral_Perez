import { Link } from 'react-router'
import { ExternalLink, ShieldCheck, Store, Trash2 } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { Alert, Button, Modal } from '@/components/ui'
import { CONDITION_LABELS, LANGUAGE_LABELS } from '@/data/constants'
import { formatDate, formatPrice } from '@/utils/format'
import styles from './AlbumPage.module.css'

const VERIFICATION_MESSAGES = {
  none: 'Pedí la verificación para que los compradores confíen más en tu carta.',
  pending: 'El equipo de Riolup está revisando esta carta.',
  verified: 'El equipo de Riolup confirmó que esta carta es auténtica.',
  rejected: 'La verificación fue rechazada. Podés volver a solicitarla.',
}

export function CollectionItemModal({ item, onClose, onPublish, onDelete, onRequestVerification }) {
  if (!item) return null
  const canRequestVerification = item.verification === 'none' || item.verification === 'rejected'

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={item.card.name}
      description={`${item.card.setName} · ${item.card.number}/${item.card.setTotal} · ${item.card.rarity}`}
    >
      <div className={styles.detail}>
        <div className={styles.detailImage}>
          <CardImage card={item.card} size="large" />
        </div>

        <div className={styles.detailInfo}>
          <dl className={styles.detailList}>
            <div>
              <dt>Cantidad</dt>
              <dd>{item.quantity}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{CONDITION_LABELS[item.condition]}</dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>{LANGUAGE_LABELS[item.language]}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{item.card.type}</dd>
            </div>
            <div>
              <dt>Precio de referencia</dt>
              <dd>{formatPrice(item.card.referencePrice)}</dd>
            </div>
            <div>
              <dt>Agregada</dt>
              <dd>{formatDate(item.createdAt)}</dd>
            </div>
          </dl>

          {item.notes && <p className={styles.detailNotes}>“{item.notes}”</p>}

          <div className={styles.detailVerification}>
            <VerificationBadge status={item.verification} />
            <p>{VERIFICATION_MESSAGES[item.verification]}</p>
            {item.verification === 'rejected' && item.verificationNote && (
              <p>
                <strong>Motivo:</strong> {item.verificationNote}
              </p>
            )}
            {canRequestVerification && (
              <Button variant="secondary" size="sm" icon={ShieldCheck} onClick={() => onRequestVerification(item)}>
                Solicitar verificación
              </Button>
            )}
          </div>

          {item.openListing && (
            <Alert tone="info" title="Esta carta está publicada">
              <Link to={`/explorar/${item.openListing.id}`} onClick={onClose}>
                Ver publicación <ExternalLink size={13} />
              </Link>
            </Alert>
          )}

          <div className={styles.detailActions}>
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(item)} disabled={Boolean(item.openListing)}>
              Eliminar
            </Button>
            <Button icon={Store} onClick={() => onPublish([item.id])} disabled={Boolean(item.openListing)} fullWidth>
              Publicar esta carta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
