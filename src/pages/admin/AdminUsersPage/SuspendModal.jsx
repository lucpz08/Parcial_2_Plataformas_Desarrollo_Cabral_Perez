import { useState } from 'react'
import { ShieldOff } from 'lucide-react'
import { Alert, Avatar, Button, Field, Modal, Textarea } from '@/components/ui'
import styles from './AdminUsersPage.module.css'

const QUICK_REASONS = [
  'Publicó cartas falsas o réplicas.',
  'No respetó acuerdos de pago o envío reiteradas veces.',
  'Trato agresivo con otros coleccionistas.',
]

export function SuspendModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function handleConfirm() {
    try {
      onConfirm(reason)
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Suspender cuenta"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" icon={ShieldOff} onClick={handleConfirm}>
            Suspender
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.suspendUser}>
          <Avatar name={user.displayName} src={user.avatarUrl} size={40} />
          <div>
            <strong>{user.displayName}</strong>
            <span>@{user.username}</span>
          </div>
        </div>
        <Alert tone="warning">
          No va a poder ingresar, sus publicaciones dejan de verse y se cancelan sus reservas activas. Podés
          reactivarla cuando quieras.
        </Alert>
        <Field label="Motivo" hint="Queda registrado y lo ven los administradores." error={error} required>
          <Textarea
            rows={3}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError('')
            }}
          />
        </Field>
        <div className={styles.quickReasons}>
          {QUICK_REASONS.map((quick) => (
            <button key={quick} type="button" onClick={() => setReason(quick)}>
              {quick}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
