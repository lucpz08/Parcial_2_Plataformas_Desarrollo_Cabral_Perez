import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '@/utils/cx'
import { AlbumSlot, EmptySlot } from './AlbumSlot'
import styles from './AlbumPage.module.css'

const SLOTS_PER_PAGE = 9

function buildPages(items) {
  const pagesNeeded = Math.floor(items.length / SLOTS_PER_PAGE) + 1
  const totalPages = pagesNeeded % 2 === 0 ? pagesNeeded : pagesNeeded + 1
  return Array.from({ length: totalPages }, (_, pageIndex) =>
    Array.from({ length: SLOTS_PER_PAGE }, (_, slotIndex) => items[pageIndex * SLOTS_PER_PAGE + slotIndex] ?? null),
  )
}

export function BinderView({ items, selectedIds, selectionMode, onItemClick, onEmptyClick }) {
  const [spread, setSpread] = useState(0)
  const pages = buildPages(items)
  const totalSpreads = pages.length / 2
  const currentSpread = Math.min(spread, totalSpreads - 1)
  const visiblePages = pages.slice(currentSpread * 2, currentSpread * 2 + 2)

  return (
    <div className={styles.binder}>
      <div className={styles.binderSpread} key={currentSpread}>
        {visiblePages.map((slots, offset) => {
          const pageNumber = currentSpread * 2 + offset + 1
          return (
            <div key={pageNumber} className={cx(styles.binderPage, offset === 0 ? styles.binderLeft : styles.binderRight)}>
              <div className={styles.binderGrid}>
                {slots.map((item, index) =>
                  item ? (
                    <AlbumSlot
                      key={item.id}
                      item={item}
                      selected={selectedIds.has(item.id)}
                      selectionMode={selectionMode}
                      onClick={onItemClick}
                    />
                  ) : (
                    <EmptySlot key={`empty-${index}`} onClick={onEmptyClick} disabled={selectionMode} />
                  ),
                )}
              </div>
              <span className={styles.pageNumber}>{pageNumber}</span>
            </div>
          )
        })}
        <div className={styles.binderRings} aria-hidden>
          {[0, 1, 2].map((ring) => (
            <span key={ring} />
          ))}
        </div>
      </div>

      {totalSpreads > 1 && (
        <div className={styles.binderNav}>
          <button
            type="button"
            onClick={() => setSpread(currentSpread - 1)}
            disabled={currentSpread === 0}
            aria-label="Páginas anteriores"
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.binderDots}>
            {Array.from({ length: totalSpreads }, (_, index) => (
              <button
                key={index}
                type="button"
                className={cx(index === currentSpread && styles.dotActive)}
                onClick={() => setSpread(index)}
                aria-label={`Ir a las páginas ${index * 2 + 1} y ${index * 2 + 2}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSpread(currentSpread + 1)}
            disabled={currentSpread === totalSpreads - 1}
            aria-label="Páginas siguientes"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
