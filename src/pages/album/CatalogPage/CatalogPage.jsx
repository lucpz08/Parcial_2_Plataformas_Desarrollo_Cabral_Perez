import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Search, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button, Chip, EmptyState, Input, Select } from '@/components/ui'
import { CARD_TYPES } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import { cardsService } from '@/services/cards'
import { collectionService } from '@/services/collection'
import { pluralize } from '@/utils/format'
import { AddToAlbumModal } from './AddToAlbumModal'
import { CatalogCard } from './CatalogCard'
import styles from './CatalogPage.module.css'

export function CatalogPage() {
  const { user } = useAuth()
  useDatabase()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [setId, setSetId] = useState('')
  const [type, setType] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)

  const sets = cardsService.getSets()
  const cards = cardsService.search({ query, setId, type })
  const ownedByCard = collectionService.getByUser(user.id).reduce((totals, item) => {
    totals[item.cardId] = (totals[item.cardId] ?? 0) + item.quantity
    return totals
  }, {})

  function handleAdded(card, { item, merged }) {
    setSelectedCard(null)
    toast.success(
      merged ? 'Cantidad actualizada' : 'Carta agregada al álbum',
      merged
        ? `Ahora tenés ${item.quantity} ${card.name} en ese estado.`
        : `${card.name} ya forma parte de tu colección.`,
    )
  }

  function clearFilters() {
    setQuery('')
    setSetId('')
    setType('')
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Colección"
        title="Catálogo de cartas"
        subtitle="Buscá tus cartas y sumalas a tu álbum. El catálogo lo mantiene el equipo de Riolup."
        actions={
          <Button as={Link} to="/album" variant="outline" icon={ArrowLeft}>
            Volver al álbum
          </Button>
        }
      />

      <div className={styles.filters}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscá por nombre o expansión..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar en el catálogo"
          autoFocus
        />
        <Select
          options={CARD_TYPES}
          placeholder="Todos los tipos"
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filtrar por tipo"
        />
      </div>

      <div className={styles.sets} role="group" aria-label="Filtrar por expansión">
        <Chip selected={!setId} onClick={() => setSetId('')}>
          Todas
        </Chip>
        {sets.map((set) => (
          <Chip key={set.id} selected={setId === set.id} onClick={() => setSetId(setId === set.id ? '' : set.id)}>
            {set.name}
          </Chip>
        ))}
      </div>

      <p className={styles.count}>{pluralize(cards.length, 'carta encontrada', 'cartas encontradas')}</p>

      {cards.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No encontramos esa carta"
          description="Probá con otro nombre o quitá los filtros. Si la carta no está en el catálogo, el equipo de Riolup puede sumarla."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {cards.map((card) => (
            <CatalogCard
              key={card.id}
              card={card}
              ownedQuantity={ownedByCard[card.id] ?? 0}
              market={cardsService.getMarketSummary(card.id)}
              onAdd={setSelectedCard}
            />
          ))}
        </div>
      )}

      <AddToAlbumModal
        key={selectedCard?.id}
        card={selectedCard}
        userId={user.id}
        onClose={() => setSelectedCard(null)}
        onAdded={handleAdded}
      />
    </div>
  )
}
