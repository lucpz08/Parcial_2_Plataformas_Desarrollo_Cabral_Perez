export const INITIAL_FILTERS = {
  query: '',
  setId: '',
  condition: '',
  verification: 'all',
  sort: 'recent',
}

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'value', label: 'Mayor valor' },
  { value: 'set', label: 'Por expansión' },
]

const SORTERS = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  name: (a, b) => a.card.name.localeCompare(b.card.name),
  value: (a, b) => b.card.referencePrice * b.quantity - a.card.referencePrice * a.quantity,
  set: (a, b) => a.card.setName.localeCompare(b.card.setName) || Number(a.card.number) - Number(b.card.number),
}

export function applyFilters(items, filters) {
  const text = filters.query.trim().toLowerCase()
  return items
    .filter(
      (item) =>
        item.card &&
        (!text || item.card.name.toLowerCase().includes(text)) &&
        (!filters.setId || item.card.setId === filters.setId) &&
        (!filters.condition || item.condition === filters.condition) &&
        (filters.verification === 'all' || item.verification === filters.verification),
    )
    .sort(SORTERS[filters.sort])
}

export function hasActiveFilters(filters) {
  return Boolean(filters.query || filters.setId || filters.condition || filters.verification !== 'all')
}
