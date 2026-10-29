import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Library, Plus, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button, ConfirmDialog, EmptyState } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useToast } from '@/hooks/useToast'
import { cardsService } from '@/services/cards'
import { collectionService } from '@/services/collection'
import { pluralize } from '@/utils/format'
import { AlbumStats } from './AlbumStats'
import { AlbumToolbar } from './AlbumToolbar'
import { BinderView } from './BinderView'
import { CollectionItemModal } from './CollectionItemModal'
import { GridView } from './GridView'
import { SelectionBar } from './SelectionBar'
import { applyFilters, hasActiveFilters, INITIAL_FILTERS } from './albumFilters'
import styles from './AlbumPage.module.css'

export function AlbumPage() {
  const { user } = useAuth()
  useDatabase()
  const navigate = useNavigate()
  const toast = useToast()

  const [view, setView] = usePersistentState('album-view', 'binder')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [detailId, setDetailId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const items = collectionService.getByUser(user.id)
  const stats = collectionService.getStats(user.id)
  const sets = cardsService.getSets()
  const visibleItems = applyFilters(items, filters)
  const detailItem = items.find((item) => item.id === detailId) ?? null

  const counts = {
    all: items.length,
    verified: items.filter((item) => item.verification === 'verified').length,
    pending: items.filter((item) => item.verification === 'pending').length,
    none: items.filter((item) => item.verification === 'none').length,
  }

  function exitSelection() {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  function handleItemClick(item) {
    if (!selectionMode) {
      setDetailId(item.id)
      return
    }
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  function publish(ids) {
    const publishable = ids.filter((id) => !items.find((item) => item.id === id)?.openListing)
    if (publishable.length === 0) {
      toast.error('Nada para publicar', 'Las cartas seleccionadas ya están publicadas.')
      return
    }
    navigate(`/publicar?items=${publishable.join(',')}`)
  }

  function confirmDelete() {
    const { removed, blocked } = collectionService.removeMany(pendingDelete)
    setPendingDelete(null)
    setDetailId(null)
    exitSelection()
    if (removed > 0) toast.success(`${pluralize(removed, 'carta eliminada', 'cartas eliminadas')} del álbum`)
    if (blocked > 0) {
      toast.error(
        `${pluralize(blocked, 'carta no se pudo', 'cartas no se pudieron')} eliminar`,
        'Tienen una publicación activa. Cancelala primero.',
      )
    }
  }

  function handleRequestVerification(item) {
    collectionService.requestVerification(item.id)
    toast.success('Verificación solicitada', 'Te avisaremos cuando el equipo de Riolup la revise.')
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Colección"
        title="Mi álbum"
        subtitle="Todas tus cartas en un solo lugar. Publicalas para vender o cambiar."
        actions={
          <Button as={Link} to="/album/catalogo" icon={Plus}>
            Agregar cartas
          </Button>
        }
      />

      <AlbumStats stats={stats} />

      {items.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Tu álbum está vacío"
          description="Buscá tus cartas en el catálogo de Riolup y agregalas a tu colección para empezar a publicarlas."
          action={
            <Button as={Link} to="/album/catalogo" icon={Plus}>
              Explorar el catálogo
            </Button>
          }
        />
      ) : (
        <>
          <AlbumToolbar
            filters={filters}
            onChange={setFilters}
            sets={sets}
            counts={counts}
            view={view}
            onViewChange={setView}
            selectionMode={selectionMode}
            onToggleSelection={() => (selectionMode ? exitSelection() : setSelectionMode(true))}
          />

          {visibleItems.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No hay cartas que coincidan"
              description="Probá con otros filtros o buscá por otro nombre."
              action={
                <Button variant="outline" onClick={() => setFilters({ ...INITIAL_FILTERS, sort: filters.sort })}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : view === 'binder' ? (
            <BinderView
              items={visibleItems}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onItemClick={handleItemClick}
              onEmptyClick={() => navigate('/album/catalogo')}
            />
          ) : (
            <GridView
              items={visibleItems}
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onItemClick={handleItemClick}
            />
          )}

          {hasActiveFilters(filters) && visibleItems.length > 0 && (
            <p className={styles.resultsHint}>
              Mostrando {visibleItems.length} de {items.length} cartas
            </p>
          )}
        </>
      )}

      {selectionMode && (
        <SelectionBar
          count={selectedIds.size}
          onCancel={exitSelection}
          onSelectAll={() => setSelectedIds(new Set(visibleItems.map((item) => item.id)))}
          onDelete={() => setPendingDelete([...selectedIds])}
          onPublish={() => publish([...selectedIds])}
        />
      )}

      <CollectionItemModal
        item={detailItem}
        onClose={() => setDetailId(null)}
        onPublish={publish}
        onDelete={(item) => setPendingDelete([item.id])}
        onRequestVerification={handleRequestVerification}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={`¿Eliminar ${pendingDelete?.length === 1 ? 'esta carta' : `${pendingDelete?.length} cartas`}?`}
        message="Se van a quitar de tu álbum. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
