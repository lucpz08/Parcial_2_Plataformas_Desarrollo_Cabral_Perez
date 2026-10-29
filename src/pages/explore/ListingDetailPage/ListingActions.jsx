import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CheckCircle2, LogIn, MessageCircle, Pencil, Trash2, Unlock, XCircle } from 'lucide-react'
import { ReviewModal } from '@/components/reviews/ReviewModal/ReviewModal'
import { ReviewPrompt } from '@/components/reviews/ReviewPrompt/ReviewPrompt'
import { Alert, Avatar, Button, ConfirmDialog, StarRating } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { chatsService } from '@/services/chats'
import { claimsService } from '@/services/claims'
import { feedbackService } from '@/services/feedback'
import { listingsService } from '@/services/listings'
import { formatDate, formatRelative } from '@/utils/format'
import { CLAIM_COPY } from './claimCopy'
import styles from './ListingDetailPage.module.css'

export function ListingActions({ listing, activeClaim, claimant, lastClaim, role, user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const copy = CLAIM_COPY[listing.intent]
  const sellerName = listing.seller.displayName

  function run(action, successMessage) {
    try {
      action()
      toast.success(successMessage)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPending(null)
    }
  }

  function openChat(peerId, claimId = null) {
    const conversation = chatsService.getOrCreate({ userId: user.id, peerId, listingId: listing.id, claimId })
    navigate(`/chats/${conversation.id}`)
  }

  const dialogs = {
    claim: {
      title: copy.title,
      message: copy.message(sellerName),
      confirmLabel: copy.label,
      onConfirm: () => run(() => claimsService.claim(listing.id, user.id), copy.success),
    },
    cancelClaim: {
      title: '¿Cancelar tu reserva?',
      message: 'La carta vuelve a quedar disponible para otros coleccionistas.',
      confirmLabel: 'Cancelar reserva',
      danger: true,
      onConfirm: () => run(() => claimsService.cancel(activeClaim.id, user.id), 'Cancelaste la reserva.'),
    },
    release: {
      title: '¿Liberar la reserva?',
      message: `${claimant?.displayName} pierde la reserva y la carta vuelve a estar disponible en Explorar.`,
      confirmLabel: 'Liberar reserva',
      danger: true,
      onConfirm: () => run(() => claimsService.cancel(activeClaim.id, user.id), 'La publicación volvió a estar disponible.'),
    },
    complete: {
      title: '¿Marcar como completada?',
      message: 'Confirmá solo si ya se concretó el pago o el intercambio. La publicación se cierra definitivamente.',
      confirmLabel: 'Marcar completada',
      onConfirm: () => {
        run(() => claimsService.complete(activeClaim.id, user.id), '¡Transacción completada!')
        setReviewOpen(true)
      },
    },
    close: {
      title: '¿Dar de baja la publicación?',
      message: 'Deja de mostrarse en Explorar. La carta sigue en tu álbum.',
      confirmLabel: 'Dar de baja',
      danger: true,
      onConfirm: () => run(() => listingsService.close(listing.id, user.id), 'Publicación dada de baja.'),
    },
  }

  function renderClosed() {
    if (listing.status === 'completado') {
      return (
        <>
          <Alert tone="success" title="Transacción completada">
            {lastClaim?.closedAt ? `Se concretó el ${formatDate(lastClaim.closedAt)}.` : 'Esta publicación ya se concretó.'}
          </Alert>
          <ReviewPrompt context={reviewContext} onReview={() => setReviewOpen(true)} />
        </>
      )
    }
    return (
      <Alert tone="warning" title="Publicación dada de baja">
        {role === 'owner' ? 'Ya no se muestra en Explorar.' : 'Esta carta ya no está disponible.'}
      </Alert>
    )
  }

  function renderGuest() {
    return (
      <>
        <Button as={Link} to="/login" state={{ from: location.pathname }} size="lg" icon={LogIn} fullWidth>
          Ingresá para {listing.intent === 'busco' ? 'ofrecer tu carta' : 'reservar'}
        </Button>
        <p className={styles.actionsHint}>
          ¿No tenés cuenta? <Link to="/registro">Creala gratis</Link> en un minuto.
        </p>
      </>
    )
  }

  function renderOwner() {
    if (listing.status === 'reservado' && activeClaim) {
      return (
        <>
          <div className={styles.claimant}>
            <Avatar name={claimant?.displayName} src={claimant?.avatarUrl} size={44} />
            <div className={styles.claimantText}>
              <span className={styles.claimantLabel}>Reservada {formatRelative(activeClaim.createdAt)} por</span>
              <Link to={`/usuarios/${claimant?.id}`} className={styles.claimantName}>
                {claimant?.displayName}
              </Link>
              <StarRating value={claimant?.rating.average ?? 0} count={claimant?.rating.count} size={12} showValue />
            </div>
          </div>
          <div className={styles.actionsRow}>
            <Button icon={CheckCircle2} variant="secondary" onClick={() => setPending('complete')}>
              Marcar completada
            </Button>
            <Button variant="outline" icon={MessageCircle} onClick={() => openChat(activeClaim.claimantId, activeClaim.id)}>
              Ir al chat
            </Button>
          </div>
          <Button variant="ghost" size="sm" icon={Unlock} onClick={() => setPending('release')}>
            Liberar reserva
          </Button>
        </>
      )
    }

    return (
      <>
        <Alert tone="info" title="Esta es tu publicación">
          Cuando alguien la reserve vas a ver acá sus datos y el acceso al chat.
        </Alert>
        <div className={styles.actionsRow}>
          <Button as={Link} to={`/publicar?editar=${listing.id}`} variant="outline" icon={Pencil}>
            Editar
          </Button>
          <Button variant="ghost" icon={Trash2} onClick={() => setPending('close')}>
            Dar de baja
          </Button>
        </div>
      </>
    )
  }

  function renderClaimant() {
    return (
      <>
        <Alert tone="success" title="La reservaste vos">
          Coordiná con {sellerName} por chat. Si no se concreta, podés cancelar la reserva.
        </Alert>
        <div className={styles.actionsRow}>
          <Button icon={MessageCircle} onClick={() => openChat(listing.userId, activeClaim.id)}>
            Ir al chat
          </Button>
          <Button variant="ghost" icon={XCircle} onClick={() => setPending('cancelClaim')}>
            Cancelar reserva
          </Button>
        </div>
      </>
    )
  }

  function renderVisitor() {
    if (listing.status === 'reservado') {
      return (
        <>
          <Alert tone="warning" title="Reservada por otro coleccionista">
            Si la reserva se cancela, vuelve a estar disponible.
          </Alert>
          <Button variant="outline" icon={MessageCircle} onClick={() => openChat(listing.userId)}>
            Consultar a {sellerName}
          </Button>
        </>
      )
    }

    return (
      <>
        <Button size="lg" variant={listing.intent === 'busco' ? 'gold' : 'primary'} fullWidth onClick={() => setPending('claim')}>
          {copy.label}
        </Button>
        <Button variant="outline" icon={MessageCircle} fullWidth onClick={() => openChat(listing.userId)}>
          Consultar por chat
        </Button>
        <p className={styles.actionsHint}>La primera persona en reservar se queda con la carta.</p>
      </>
    )
  }

  const isClosed = listing.status === 'completado' || listing.status === 'cancelado'
  const renderers = { guest: renderGuest, owner: renderOwner, claimant: renderClaimant, visitor: renderVisitor }
  const dialog = pending ? dialogs[pending] : null
  const reviewContext = user && lastClaim ? feedbackService.getForClaim(lastClaim.id, user.id) : null

  return (
    <section className={styles.actions} aria-label="Acciones">
      {isClosed ? renderClosed() : renderers[role]()}
      <ConfirmDialog open={Boolean(dialog)} onClose={() => setPending(null)} {...dialog} />
      <ReviewModal
        context={reviewOpen && reviewContext && !reviewContext.myReview ? reviewContext : null}
        userId={user?.id}
        onClose={() => setReviewOpen(false)}
      />
    </section>
  )
}
