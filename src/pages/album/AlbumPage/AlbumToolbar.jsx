import { BookOpen, CheckSquare, LayoutGrid, Search, X } from 'lucide-react'
import { Button, Input, Select, Tabs } from '@/components/ui'
import { CONDITIONS } from '@/data/constants'
import { cx } from '@/utils/cx'
import { hasActiveFilters, INITIAL_FILTERS, SORT_OPTIONS } from './albumFilters'
import styles from './AlbumPage.module.css'

export function AlbumToolbar({ filters, onChange, sets, counts, view, onViewChange, selectionMode, onToggleSelection }) {
  function update(name, value) {
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarRow}>
        <Tabs
          value={filters.verification}
          onChange={(value) => update('verification', value)}
          tabs={[
            { value: 'all', label: 'Todas', count: counts.all },
            { value: 'verified', label: 'Verificadas', count: counts.verified },
            { value: 'pending', label: 'En revisión', count: counts.pending },
            { value: 'none', label: 'Sin verificar', count: counts.none },
          ]}
        />

        <div className={styles.toolbarActions}>
          <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            icon={CheckSquare}
            onClick={onToggleSelection}
          >
            {selectionMode ? 'Terminar selección' : 'Seleccionar'}
          </Button>
          <div className={styles.viewToggle} role="group" aria-label="Vista del álbum">
            <button
              type="button"
              className={cx(view === 'binder' && styles.viewActive)}
              onClick={() => onViewChange('binder')}
              aria-pressed={view === 'binder'}
              title="Vista carpeta"
            >
              <BookOpen size={18} />
            </button>
            <button
              type="button"
              className={cx(view === 'grid' && styles.viewActive)}
              onClick={() => onViewChange('grid')}
              aria-pressed={view === 'grid'}
              title="Vista grilla"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar en mi álbum..."
          value={filters.query}
          onChange={(event) => update('query', event.target.value)}
          aria-label="Buscar en mi álbum"
          className={styles.searchFilter}
        />
        <Select
          options={sets.map((set) => ({ value: set.id, label: set.name }))}
          placeholder="Todas las expansiones"
          value={filters.setId}
          onChange={(event) => update('setId', event.target.value)}
          aria-label="Filtrar por expansión"
        />
        <Select
          options={CONDITIONS}
          placeholder="Cualquier estado"
          value={filters.condition}
          onChange={(event) => update('condition', event.target.value)}
          aria-label="Filtrar por estado"
        />
        <Select
          options={SORT_OPTIONS}
          value={filters.sort}
          onChange={(event) => update('sort', event.target.value)}
          aria-label="Ordenar"
        />
        {hasActiveFilters(filters) && (
          <Button variant="ghost" icon={X} onClick={() => onChange({ ...INITIAL_FILTERS, sort: filters.sort })}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
