import { BadgeCheck, Check, Clock, Plus, Store } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { cx } from '@/utils/cx'
import styles from './AlbumPage.module.css'

export function AlbumSlot({ item, selected, selectionMode, onClick }) {
  return (
    <button
      type="button"
      className={cx(styles.slot, selected && styles.slotSelected, selectionMode && styles.slotSelecting)}
      onClick={() => onClick(item)}
      aria-pressed={selectionMode ? selected : undefined}
      aria-label={`${item.card.name}, ${item.card.setName}`}
    >
      <CardImage card={item.card} />
      <span className={styles.slotBadges}>
        {item.verification === 'verified' && (
          <span className={cx(styles.slotIcon, styles.slotVerified)} title="Verificada">
            <BadgeCheck size={14} />
          </span>
        )}
        {item.verification === 'pending' && (
          <span className={cx(styles.slotIcon, styles.slotPending)} title="En revisión">
            <Clock size={14} />
          </span>
        )}
        {item.openListing && (
          <span className={cx(styles.slotIcon, styles.slotPublished)} title="Publicada">
            <Store size={14} />
          </span>
        )}
      </span>
      {item.quantity > 1 && <span className={styles.slotQuantity}>x{item.quantity}</span>}
      {selectionMode && (
        <span className={cx(styles.slotCheck, selected && styles.slotCheckOn)}>
          {selected && <Check size={16} strokeWidth={3} />}
        </span>
      )}
    </button>
  )
}

export function EmptySlot({ onClick, disabled }) {
  return (
    <button type="button" className={styles.emptySlot} onClick={onClick} disabled={disabled} aria-label="Agregar carta">
      <Plus size={22} />
    </button>
  )
}
