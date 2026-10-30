import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Alert, Button, Field, Modal, Textarea } from '@/components/ui'
import { REPORT_REASONS } from '@/data/constants'
import { useToast } from '@/hooks/useToast'
import { moderationService } from '@/services/moderation'
import { cx } from '@/utils/cx'
import styles from './ListingDetailPage.module.css'

export function ReportModal({ listing, userId, onClose }) {
  const toast = useToast()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setServerError('')
    try {
      moderationService.report({ listingId: listing.id, reporterId: userId, reason, details })
      toast.success('Gracias por avisarnos', 'El equipo de moderación va a revisar la publicación.')
      onClose()
    } catch (error) {
      if (error.field) setErrors({ [error.field]: error.message })
      else setServerError(error.message)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Denunciar publicación"
      description={`${listing.card.name} de ${listing.seller.displayName}. La denuncia es anónima para quien publicó.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="report-form" variant="danger" icon={Flag}>
            Enviar denuncia
          </Button>
        </>
      }
    >
      <form id="report-form" className={styles.reportForm} onSubmit={handleSubmit} noValidate>
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <fieldset className={styles.reportReasons}>
          <legend>¿Qué pasa con esta publicación?</legend>
          {REPORT_REASONS.map((option) => (
            <label key={option.value} className={cx(styles.reportReason, reason === option.value && styles.reportReasonActive)}>
              <input
                type="radio"
                name="reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => {
                  setReason(option.value)
                  setErrors({})
                }}
              />
              {option.label}
            </label>
          ))}
          {errors.reason && <span className={styles.reportError}>{errors.reason}</span>}
        </fieldset>
        <Field label="Detalles" hint={reason === 'other' ? 'Obligatorio para "Otro motivo".' : 'Opcional, máximo 300 caracteres.'} error={errors.details}>
          <Textarea
            rows={3}
            value={details}
            onChange={(event) => {
              setDetails(event.target.value)
              setErrors({})
            }}
          />
        </Field>
      </form>
    </Modal>
  )
}
