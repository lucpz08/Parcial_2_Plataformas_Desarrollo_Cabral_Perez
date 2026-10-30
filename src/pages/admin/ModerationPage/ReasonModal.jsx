import { useState } from 'react'
import { Alert, Button, Field, Modal, Textarea } from '@/components/ui'
import styles from './ModerationPage.module.css'

export function ReasonModal({ title, description, warning, label, quickReasons = [], confirmLabel, icon, onClose, onConfirm }) {
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
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" icon={icon} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.reasonForm}>
        {warning && <Alert tone="warning">{warning}</Alert>}
        <Field label={label} hint="Lo ve el usuario afectado." error={error} required>
          <Textarea
            rows={3}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError('')
            }}
          />
        </Field>
        {quickReasons.length > 0 && (
          <div className={styles.quickReasons}>
            {quickReasons.map((quick) => (
              <button key={quick} type="button" onClick={() => setReason(quick)}>
                {quick}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
