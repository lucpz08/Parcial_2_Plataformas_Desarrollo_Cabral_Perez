import { useState } from 'react'
import { Link } from 'react-router'
import { BadgeCheck, CheckCircle2, ImageOff, PartyPopper, ShieldX } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { Avatar, Button, EmptyState } from '@/components/ui'
import { CONDITION_LABELS, LANGUAGE_LABELS } from '@/data/constants'
import { useToast } from '@/hooks/useToast'
import { moderationService } from '@/services/moderation'
import { formatPrice, formatRelative } from '@/utils/format'
import { ReasonModal } from './ReasonModal'
import styles from './ModerationPage.module.css'

const CHECKLIST = [
  'La edición, el número y el idioma coinciden con el catálogo',
  'El estado declarado coincide con las fotos',
  'No hay signos de réplica (borde, holo, tipografía)',
]

const REJECT_REASONS = [
  'Las fotos no permiten ver el estado de la carta. Subí fotos con buena luz, frente y dorso.',
  'El estado real es peor que el declarado. Corregí la condición y volvé a solicitar.',
  'La carta presenta signos de réplica.',
]

function VerificationItem({ item, adminId, onReject }) {
  const toast = useToast()
  const [checked, setChecked] = useState([])
  const isOwn = item.userId === adminId
  const ready = checked.length === CHECKLIST.length

  function toggle(index) {
    setChecked((current) => (current.includes(index) ? current.filter((value) => value !== index) : [...current, index]))
  }

  function approve() {
    try {
      moderationService.approveVerification(item.id, adminId)
      toast.success(`${item.card.name} verificada`, `${item.owner.displayName} ya ve el sello en su álbum.`)
    } catch (error) {
      toast.error('No se pudo verificar', error.message)
    }
  }

  return (
    <article className={styles.verification}>
      <div className={styles.verificationMedia}>
        <div className={styles.verificationImage}>
          <CardImage card={item.card} size="large" />
          <span>Referencia del catálogo</span>
        </div>
        <div className={styles.verificationPhoto}>
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={`Foto de ${item.owner.displayName}`} />
          ) : (
            <>
              <ImageOff size={24} />
              <span>Sin foto del usuario</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.verificationBody}>
        <header>
          <div>
            <h3>{item.card.name}</h3>
            <span>
              {item.card.setName} · {item.card.number}/{item.card.setTotal} · Ref. {formatPrice(item.card.referencePrice)}
            </span>
          </div>
          <VerificationBadge status="pending" />
        </header>

        <dl className={styles.facts}>
          <div>
            <dt>Estado declarado</dt>
            <dd>{CONDITION_LABELS[item.condition]}</dd>
          </div>
          <div>
            <dt>Idioma</dt>
            <dd>{LANGUAGE_LABELS[item.language]}</dd>
          </div>
          <div>
            <dt>Cantidad</dt>
            <dd>{item.quantity}</dd>
          </div>
          <div>
            <dt>Solicitada</dt>
            <dd>{formatRelative(item.requestedAt)}</dd>
          </div>
        </dl>

        <Link to={`/usuarios/${item.owner.id}`} className={styles.owner}>
          <Avatar name={item.owner.displayName} src={item.owner.avatarUrl} size={28} />
          <span>{item.owner.displayName}</span>
        </Link>
        {item.notes && <p className={styles.notes}>“{item.notes}”</p>}

        <fieldset className={styles.checklist}>
          <legend>Checklist de revisión</legend>
          {CHECKLIST.map((label, index) => (
            <label key={label}>
              <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} disabled={isOwn} />
              {label}
            </label>
          ))}
        </fieldset>

        <div className={styles.verificationActions}>
          <Button variant="ghost" icon={ShieldX} onClick={() => onReject(item)} disabled={isOwn}>
            Rechazar
          </Button>
          <Button
            variant="secondary"
            icon={BadgeCheck}
            onClick={approve}
            disabled={!ready || isOwn}
            title={isOwn ? 'No podés verificar tus propias cartas' : ready ? undefined : 'Completá el checklist para aprobar'}
          >
            Aprobar
          </Button>
        </div>
      </div>
    </article>
  )
}

export function VerificationQueue({ adminId }) {
  const toast = useToast()
  const [rejecting, setRejecting] = useState(null)
  const queue = moderationService.getVerificationQueue()
  const resolved = moderationService.getResolvedVerifications()

  function reject(note) {
    moderationService.rejectVerification(rejecting.id, adminId, note)
    toast.info(`Rechazaste la verificación de ${rejecting.card.name}`, 'El usuario ve el motivo en su álbum.')
    setRejecting(null)
  }

  return (
    <div className={styles.tabPanel}>
      {queue.length === 0 ? (
        <EmptyState icon={PartyPopper} title="¡Cola al día!" description="No hay cartas esperando verificación." />
      ) : (
        <div className={styles.verificationList}>
          {queue.map((item) => (
            <VerificationItem key={item.id} item={item} adminId={adminId} onReject={setRejecting} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <section className={styles.history}>
          <h2>Resueltas recientemente</h2>
          <ul>
            {resolved.map((item) => (
              <li key={item.id}>
                <CheckCircle2 size={16} className={item.verification === 'verified' ? styles.ok : styles.ko} />
                <span>
                  <strong>{item.card?.name}</strong> de {item.owner?.displayName ?? 'usuario eliminado'}
                  {item.verificationNote && <em> · {item.verificationNote}</em>}
                </span>
                <VerificationBadge status={item.verification} />
                <time>
                  {formatRelative(item.verifiedAt)} · {item.reviewer?.displayName ?? 'Admin'}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rejecting && (
        <ReasonModal
          title={`Rechazar ${rejecting.card.name}`}
          description={`De ${rejecting.owner.displayName}. Va a poder corregir y volver a solicitar.`}
          label="Motivo del rechazo"
          quickReasons={REJECT_REASONS}
          confirmLabel="Rechazar verificación"
          icon={ShieldX}
          onClose={() => setRejecting(null)}
          onConfirm={reject}
        />
      )}
    </div>
  )
}
