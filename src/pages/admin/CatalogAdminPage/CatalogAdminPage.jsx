import { useState } from 'react'
import { BookOpen, EyeOff, Layers3, Library, Pencil, Plus, Search, SearchX, Trash2, TrendingUp } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button, Chip, ConfirmDialog, EmptyState, Input, Select, StatCard } from '@/components/ui'
import { CARD_TYPES } from '@/data/constants'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import { cardsService } from '@/services/cards'
import { catalogAdminService } from '@/services/catalogAdmin'
import { cx } from '@/utils/cx'
import { formatCompactPrice, formatPrice, pluralize } from '@/utils/format'
import { CardFormModal } from './CardFormModal'
import { PriceAdjustModal } from './PriceAdjustModal'
import styles from './CatalogAdminPage.module.css'

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Visibles' },
  { value: 'inactive', label: 'Ocultas' },
]

const SORT_OPTIONS = [
  { value: 'set', label: 'Expansión y número' },
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'usage', label: 'Más coleccionadas' },
]

export function CatalogAdminPage() {
  useDatabase()
  const toast = useToast()
  const [filters, setFilters] = useState({ query: '', setId: '', type: '', status: '', sort: 'set' })
  const [modal, setModal] = useState(null)

  const cards = catalogAdminService.list(filters)
  const stats = catalogAdminService.getStats()
  const sets = cardsService.getSets()
  const closeModal = () => setModal(null)

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSave(form) {
    if (modal.card) {
      catalogAdminService.update(modal.card.id, form)
      toast.success('Carta actualizada')
    } else {
      const created = catalogAdminService.create(form)
      toast.success(`${created.name} se agregó al catálogo`)
    }
    closeModal()
  }

  function toggleActive(card) {
    catalogAdminService.setActive(card.id, !card.active)
    toast.info(
      card.active ? `${card.name} quedó oculta` : `${card.name} vuelve a estar visible`,
      card.active ? 'Las copias que ya están en álbumes se mantienen.' : undefined,
    )
  }

  function handleDelete() {
    try {
      catalogAdminService.remove(modal.card.id)
      toast.success(`${modal.card.name} se eliminó del catálogo`)
    } catch (error) {
      toast.error('No se pudo eliminar', error.message)
    } finally {
      closeModal()
    }
  }

  function handleAdjust({ setId, percent }) {
    const updated = catalogAdminService.adjustPrices({ setId, percent })
    toast.success('Precios actualizados', `${pluralize(updated, 'carta ajustada', 'cartas ajustadas')} un ${percent}%.`)
    closeModal()
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Catálogo"
        subtitle="Las cartas que los coleccionistas pueden sumar a su álbum, con su precio de referencia."
        actions={
          <>
            <Button variant="outline" icon={TrendingUp} onClick={() => setModal({ type: 'prices' })}>
              Ajustar precios
            </Button>
            <Button icon={Plus} onClick={() => setModal({ type: 'form', card: null })}>
              Nueva carta
            </Button>
          </>
        }
      />

      <div className={styles.stats}>
        <StatCard icon={BookOpen} label="Cartas visibles" value={stats.active} hint={`${stats.total} en total`} />
        <StatCard icon={Layers3} label="Expansiones" value={stats.sets} />
        <StatCard icon={Library} tone="success" label="En álbumes" value={stats.inAlbums} hint="Cartas con al menos un dueño" />
        <StatCard icon={EyeOff} tone="gold" label="Ocultas" value={stats.inactive} hint={`Valor visible ${formatCompactPrice(stats.catalogValue)}`} />
      </div>

      <div className={styles.toolbar}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar por carta o expansión..."
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          aria-label="Buscar en el catálogo"
        />
        <Select
          options={sets.map((set) => ({ value: set.id, label: set.name }))}
          placeholder="Todas las expansiones"
          value={filters.setId}
          onChange={(event) => updateFilter('setId', event.target.value)}
          aria-label="Expansión"
        />
        <Select
          options={CARD_TYPES}
          placeholder="Todos los tipos"
          value={filters.type}
          onChange={(event) => updateFilter('type', event.target.value)}
          aria-label="Tipo"
        />
        <Select options={SORT_OPTIONS} value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Ordenar" />
      </div>
      <div className={styles.chips}>
        {STATUS_FILTERS.map((option) => (
          <Chip key={option.value} selected={filters.status === option.value} onClick={() => updateFilter('status', option.value)}>
            {option.label}
          </Chip>
        ))}
        <span className={styles.muted}>{pluralize(cards.length, 'carta', 'cartas')}</span>
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={SearchX} title="Sin resultados" description="Probá con otros filtros." />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Carta</th>
                <th scope="col">Tipo</th>
                <th scope="col">Rareza</th>
                <th scope="col" className={styles.numeric}>
                  Referencia
                </th>
                <th scope="col" className={styles.numeric}>
                  Coleccionistas
                </th>
                <th scope="col" className={styles.numeric}>
                  Publicaciones
                </th>
                <th scope="col">Visible</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className={cx(!card.active && styles.rowInactive)}>
                  <td>
                    <div className={styles.cardCell}>
                      <span className={styles.thumb}>
                        <CardImage card={card} />
                      </span>
                      <div>
                        <strong>{card.name}</strong>
                        <span>
                          {card.setName} · {card.number}/{card.setTotal}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{card.type}</td>
                  <td>{card.rarity}</td>
                  <td className={styles.numeric}>{formatPrice(card.referencePrice)}</td>
                  <td className={styles.numeric}>
                    {card.usage.owners}
                    {card.usage.copies > card.usage.owners && <span className={styles.muted}> ({card.usage.copies} copias)</span>}
                  </td>
                  <td className={styles.numeric}>{card.usage.listings}</td>
                  <td>
                    <label className={styles.switch} title={card.active ? 'Ocultar del catálogo' : 'Mostrar en el catálogo'}>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={card.active}
                        onChange={() => toggleActive(card)}
                        aria-label={`${card.name} visible en el catálogo`}
                      />
                      <span aria-hidden />
                    </label>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.iconAction} onClick={() => setModal({ type: 'form', card })} aria-label={`Editar ${card.name}`} title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={cx(styles.iconAction, styles.iconDanger)}
                        onClick={() => setModal({ type: 'delete', card })}
                        disabled={card.usage.references > 0}
                        aria-label={`Eliminar ${card.name}`}
                        title={card.usage.references > 0 ? 'Está en álbumes o publicaciones: ocultala en su lugar' : 'Eliminar'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.type === 'form' && <CardFormModal key={modal.card?.id ?? 'new'} card={modal.card} onClose={closeModal} onSubmit={handleSave} />}
      {modal?.type === 'prices' && <PriceAdjustModal onClose={closeModal} onSubmit={handleAdjust} />}
      <ConfirmDialog
        open={modal?.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleDelete}
        title={`¿Eliminar ${modal?.card?.name ?? ''}?`}
        message="Se quita del catálogo de forma definitiva. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
