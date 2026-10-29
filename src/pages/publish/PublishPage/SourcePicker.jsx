import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BookOpen, Check, Library, Search } from 'lucide-react'
import { CardTile } from '@/components/cards/CardTile/CardTile'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge, Button, EmptyState, Input, Tabs } from '@/components/ui'
import { CONDITION_LABELS } from '@/data/constants'
import { cardsService } from '@/services/cards'
import { collectionService } from '@/services/collection'
import { listingsService } from '@/services/listings'
import { pluralize } from '@/utils/format'
import styles from './PublishPage.module.css'

function AlbumSource({ user, onContinue }) {
  const [selectedIds, setSelectedIds] = useState([])
  const items = collectionService.getByUser(user.id).filter((item) => item.card)
  const available = items.filter((item) => !item.openListing)

  function toggle(id) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((other) => other !== id) : [...current, id]))
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="Tu álbum está vacío"
        description="Agregá cartas desde el catálogo para poder publicarlas."
        action={
          <Button as={Link} to="/album/catalogo" icon={BookOpen}>
            Ir al catálogo
          </Button>
        }
      />
    )
  }

  return (
    <>
      <div className={styles.pickerToolbar}>
        <span>
          {pluralize(available.length, 'carta disponible', 'cartas disponibles')} para publicar · Elegí una o varias
        </span>
        {available.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(selectedIds.length === available.length ? [] : available.map((item) => item.id))}
          >
            {selectedIds.length === available.length ? 'Quitar selección' : 'Seleccionar todas'}
          </Button>
        )}
      </div>

      <div className={styles.pickerGrid}>
        {items.map((item) => {
          const selected = selectedIds.includes(item.id)
          if (item.openListing) {
            return (
              <div key={item.id} className={styles.pickerDisabled}>
                <CardTile card={item.card} badges={<Badge tone="neutral">Ya publicada</Badge>} />
              </div>
            )
          }
          return (
            <CardTile
              key={item.id}
              card={item.card}
              selected={selected}
              onClick={() => toggle(item.id)}
              badges={
                selected ? (
                  <Badge tone="primary" variant="solid" icon={Check}>
                    Elegida
                  </Badge>
                ) : (
                  <Badge tone="neutral">{CONDITION_LABELS[item.condition]}</Badge>
                )
              }
            />
          )
        })}
      </div>

      <div className={styles.pickerBar} data-visible={selectedIds.length > 0 || undefined}>
        <strong>{pluralize(selectedIds.length, 'carta elegida', 'cartas elegidas')}</strong>
        <Button iconRight={ArrowRight} onClick={() => onContinue(selectedIds)} disabled={selectedIds.length === 0}>
          Continuar
        </Button>
      </div>
    </>
  )
}

function CatalogSource({ user, onSelect }) {
  const [query, setQuery] = useState('')
  const cards = cardsService.search({ query })

  return (
    <>
      <div className={styles.pickerToolbar}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar en el catálogo..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar carta"
          className={styles.pickerSearch}
        />
        <span>{pluralize(cards.length, 'carta', 'cartas')}</span>
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Probá con otro nombre o expansión." />
      ) : (
        <div className={styles.pickerGrid}>
          {cards.map((card) =>
            listingsService.hasOpenWanted(user.id, card.id) ? (
              <div key={card.id} className={styles.pickerDisabled}>
                <CardTile card={card} badges={<Badge tone="gold">Ya la buscás</Badge>} />
              </div>
            ) : (
              <CardTile key={card.id} card={card} onClick={() => onSelect(card.id)} />
            ),
          )}
        </div>
      )}
    </>
  )
}

export function SourcePicker({ user, onSelectItems, onSelectCard }) {
  const [source, setSource] = useState('album')

  return (
    <>
      <PageHeader
        eyebrow="Mercado"
        title="Publicar"
        subtitle="Vendé o cambiá cartas de tu álbum, o contale a la comunidad qué carta estás buscando."
      />
      <Tabs
        tabs={[
          { value: 'album', label: 'Desde mi álbum' },
          { value: 'catalogo', label: 'Busco una carta' },
        ]}
        value={source}
        onChange={setSource}
      />
      {source === 'album' ? (
        <AlbumSource user={user} onContinue={onSelectItems} />
      ) : (
        <CatalogSource user={user} onSelect={onSelectCard} />
      )}
    </>
  )
}
