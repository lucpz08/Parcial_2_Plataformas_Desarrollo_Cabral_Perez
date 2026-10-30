import { useState } from 'react'
import { Link } from 'react-router'
import { Clock, Hourglass, Unlock } from 'lucide-react'
import { Avatar, Badge, Button, ConfirmDialog, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { moderationService } from '@/services/moderation'
import { formatDate } from '@/utils/format'
import { ListingSummary } from './ReportsQueue'
import styles from './ModerationPage.module.css'

export function StaleReservations({ adminId }) {
  const toast = useToast()
  const [releasing, setReleasing] = useState(null)
  const reservations = moderationService.getStaleReservations()

  function release() {
    try {
      moderationService.releaseReservation(releasing.id, adminId)
      toast.success('Reserva liberada', `${releasing.listing.card.name} vuelve a estar disponible.`)
    } catch (error) {
      toast.error('No se pudo liberar', error.message)
    } finally {
      setReleasing(null)
    }
  }

  if (reservations.length === 0) {
    return (
      <EmptyState icon={Hourglass} title="Sin reservas demoradas" description="Todas las reservas activas tienen menos de 7 días." />
    )
  }

  return (
    <div className={styles.tabPanel}>
      <p className={styles.hint}>
        Reservas activas hace más de 7 días. Si la transacción no avanza, liberala para que otro coleccionista pueda
        reservar la carta.
      </p>
      <ul className={styles.reviewList}>
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            <ListingSummary listing={reservation.listing} />
            <Link to={`/usuarios/${reservation.claimant?.id}`} className={styles.owner}>
              <Avatar name={reservation.claimant?.displayName ?? 'Usuario eliminado'} src={reservation.claimant?.avatarUrl} size={28} />
              <span>
                Reservó {reservation.claimant?.displayName ?? 'usuario eliminado'}
                <em>el {formatDate(reservation.createdAt)}</em>
              </span>
            </Link>
            <Badge tone="warning" icon={Clock}>
              {reservation.days} días
            </Badge>
            <Button variant="ghost" size="sm" icon={Unlock} onClick={() => setReleasing(reservation)}>
              Liberar
            </Button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(releasing)}
        onClose={() => setReleasing(null)}
        onConfirm={release}
        title="¿Liberar la reserva?"
        message={
          releasing
            ? `${releasing.claimant?.displayName ?? 'El usuario'} pierde la reserva de ${releasing.listing.card.name} y la carta vuelve a Explorar.`
            : ''
        }
        confirmLabel="Liberar reserva"
        danger
      />
    </div>
  )
}
