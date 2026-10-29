import { AlertTriangle } from 'lucide-react'
import { Button } from '../Button/Button'
import { Modal } from '../Modal/Modal'
import styles from './ConfirmDialog.module.css'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.content}>
        <span className={danger ? styles.iconDanger : styles.icon}>
          <AlertTriangle size={26} />
        </span>
        <h2 className={styles.title}>{title}</h2>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </Modal>
  )
}
