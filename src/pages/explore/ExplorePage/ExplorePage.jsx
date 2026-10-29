import { useSearchParams } from 'react-router'
import { PackageSearch, Search, X } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard/ListingCard'
import { Button, EmptyState, Input, Select } from '@/components/ui'
import { CONDITION_LABELS, INTENTS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cardsService } from '@/services/cards'
import { listingsService } from '@/services/listings'
import { formatPrice, pluralize } from '@/utils/format'
import { ExploreHero } from './ExploreHero'
import { FiltersPanel } from './FiltersPanel'
import { countActiveFilters, FILTER_KEYS, readFilters, SORT_OPTIONS, toSearchOptions } from './exploreFilters'
import styles from './ExplorePage.module.css'

const FEATURED_CARDS = ['sv3pt5-199', 'swsh7-215', 'base1-4']

function describeChip(key, filters) {
  switch (key) {
    case 'intent':
      return INTENTS.find((intent) => intent.value === filters.intent)?.label
    case 'condition':
      return CONDITION_LABELS[filters.condition]
    case 'min':
      return `Desde ${formatPrice(Number(filters.min))}`
    case 'max':
      return `Hasta ${formatPrice(Number(filters.max))}`
    case 'verified':
      return 'Verificadas'
    default:
      return filters[key]
  }
}

export function ExplorePage() {
  useDocumentTitle('Explorar')
  useDatabase()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)

  const listings = listingsService.search(toSearchOptions(filters))
  const allAvailable = listingsService.search()
  const stats = {
    listings: allAvailable.length,
    sellers: new Set(allAvailable.map((listing) => listing.userId)).size,
    provinces: new Set(allAvailable.map((listing) => listing.province).filter(Boolean)).size,
  }
  const featuredCards = FEATURED_CARDS.map((id) => cardsService.findById(id)).filter(Boolean)
  const activeCount = countActiveFilters(filters)
  const chipKeys = ['intent', 'province', 'condition', 'min', 'max', 'verified'].filter((key) => filters[key])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === false || value === 'recent') next.delete(key)
    else next.set(key, value === true ? '1' : value)
    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams)
    FILTER_KEYS.filter((key) => key !== 'q' && key !== 'sort').forEach((key) => next.delete(key))
    setSearchParams(next, { replace: true })
  }

  return (
    <div className={styles.page}>
      <ExploreHero user={user} stats={stats} featuredCards={featuredCards} />

      <div className={styles.layout}>
        <FiltersPanel
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
          activeCount={activeCount}
          userProvince={user?.province}
        />

        <section className={styles.results} aria-label="Publicaciones">
          <div className={styles.resultsHeader}>
            <Input
              icon={Search}
              type="search"
              placeholder="Buscar por carta o expansión..."
              value={filters.q}
              onChange={(event) => updateFilter('q', event.target.value)}
              aria-label="Buscar publicaciones"
              className={styles.resultsSearch}
            />
            <Select
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              aria-label="Ordenar publicaciones"
            />
          </div>

          <div className={styles.resultsMeta}>
            <span>
              {pluralize(listings.length, 'publicación', 'publicaciones')}
              {filters.q && (
                <>
                  {' '}
                  para <strong>“{filters.q}”</strong>
                </>
              )}
            </span>
            {chipKeys.map((key) => (
              <button key={key} type="button" className={styles.activeChip} onClick={() => updateFilter(key, '')}>
                {describeChip(key, filters)}
                <X size={13} />
              </button>
            ))}
          </div>

          {listings.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No encontramos publicaciones"
              description="Probá con otra búsqueda o quitá algunos filtros. ¡También podés publicar que buscás esa carta!"
              action={
                <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
                  Ver todas las publicaciones
                </Button>
              }
            />
          ) : (
            <div className={styles.grid}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} isOwn={listing.userId === user?.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
