import { Store, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { pluralize } from '@/utils/format'
import styles from './AlbumPage.module.css'

export function SelectionBar({ count, onCancel, onDelete, onPublish, onSelectAll }) {
  return (
    <div className={styles.selectionBar} role="toolbar" aria-label="Acciones sobre la selección">
      <button type="button" className={styles.selectionClose} onClick={onCancel} aria-label="Cancelar selección">
        <X size={18} />
      </button>
      <div className={styles.selectionInfo}>
        <strong>{pluralize(count, 'carta seleccionada', 'cartas seleccionadas')}</strong>
        <button type="button" onClick={onSelectAll}>
          Seleccionar todas
        </button>
      </div>
      <Button variant="danger" icon={Trash2} onClick={onDelete} disabled={count === 0}>
        Eliminar
      </Button>
      <Button variant="gold" icon={Store} onClick={onPublish} disabled={count === 0}>
        Publicar
      </Button>
    </div>
  )
}
