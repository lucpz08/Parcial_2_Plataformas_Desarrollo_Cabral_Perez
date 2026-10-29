import { CONDITION_LABELS } from '@/data/constants'
import { formatPrice } from '@/utils/format'
import { AlbumSlot } from './AlbumSlot'
import styles from './AlbumPage.module.css'

export function GridView({ items, selectedIds, selectionMode, onItemClick }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article key={item.id} className={styles.gridItem}>
          <AlbumSlot
            item={item}
            selected={selectedIds.has(item.id)}
            selectionMode={selectionMode}
            onClick={onItemClick}
          />
          <div className={styles.gridInfo}>
            <strong>{item.card.name}</strong>
            <span>
              {item.card.setName} · {CONDITION_LABELS[item.condition]}
            </span>
            <span className={styles.gridPrice}>{formatPrice(item.card.referencePrice)}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
